import React, { useEffect, useState } from 'react';
import './App.css';
import ChatBox from './components/chatbox/ChatBox';
import Detail from './components/detail/Detail';
import ListRTC from './components/list/ListRTC';
import AuthModal from './components/auth/AuthModal';
import Notification from './components/notification/Notification';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from './lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

function App() {
  const [headerActive, setHeaderActive] = useState<'cb-header-1' | 'cb-header-2'>('cb-header-1');
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [chatId, setChatId] = useState("");

  useEffect(() => {
    const unSub = onAuthStateChanged(auth, async (user) => {
      console.log(user, "here");
      setUser(user);
      if (user) {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProfile(docSnap.data());
        } else {
          setProfile(null);
        }
      } else {
        setProfile(null);
      }
    });

    return () => {
      unSub();
    };
  }, []);

  return (
    <div className="container">
      {user ? (
        <>
          <ListRTC
            setHeaderActive={setHeaderActive}
            setChatId={setChatId}
            user={profile}
          />
          {chatId && (
          <ChatBox
            headerActive={headerActive}
            currentUserId={user?.uid || ''}
            chatId={chatId}
          />
          )}
          <Detail />
        </>
      ) : (
        <AuthModal />
      )}
      <Notification />
    </div>
  );
}

export default App;
