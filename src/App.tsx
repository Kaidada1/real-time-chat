import React, { useEffect, useState } from "react";
import "tailwindcss/tailwind.css";
import ChatBox from "./components/chatbox/ChatBox";
import Detail from "./components/detail/Detail";
import ListRTC from "./components/list/ListRTC";
import AuthModal from "./components/auth/AuthModal";
import Notification from "./components/notification/Notification";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "./lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { Loader2 } from "lucide-react";

function App() {
  const [headerActive, setHeaderActive] = useState<
    "cb-header-1" | "cb-header-2"
  >("cb-header-1");
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [chatId, setChatId] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unSub = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        setProfile(docSnap.exists() ? docSnap.data() : null);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unSub();
  }, []);
  if (loading) {
    console.log("Loading: " + loading);
    return (
      <div className="flex flex-col items-center justify-center w-[100vw] h-screen bg-gray-900 text-white">
        <Loader2 className="mr-2 h-20 w-20 animate-spin"></Loader2>
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div className="w-[100vw] h-screen bg-gray-900 text-white">
      {user ? (
        <div className="grid grid-cols-[300px_1fr_300px] h-full shadow-lg overflow-hidden">
          <ListRTC
            setHeaderActive={setHeaderActive}
            setChatId={setChatId}
            user={profile}
          />
          <ChatBox
            headerActive={headerActive}
            currentUserId={user?.uid || ""}
            chatId={chatId}
          />
          <Detail 
            currentUserId={user?.uid || ''}
            chatId={chatId}
          />

        </div>
      ) : (
        <div className="flex items-center justify-center h-full">
          <AuthModal />
        </div>
      )}
      <Notification />
    </div>
  );
}

export default App;
