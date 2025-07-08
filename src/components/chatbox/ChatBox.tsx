import React, { useEffect, useRef, useState } from 'react';
import './ChatBox.css';
import EmojiPicker from 'emoji-picker-react';
import AddUser from './adduser/addUser';
import { signOut } from 'firebase/auth';
import { auth, db } from '../../lib/firebase';
import {
  doc,
  DocumentData,
  onSnapshot,
  collection,
  query,
  orderBy,
  addDoc,
  serverTimestamp,
  getDoc,
} from 'firebase/firestore';

type Props = {
  headerActive: 'cb-header-1' | 'cb-header-2';
  currentUserId: string;
  chatId: string;
};

const ChatBox = (props: Props) => {
  const { headerActive, currentUserId, chatId } = props;
  const [openEmoji, setOpenEmoji] = useState(false);
  const [selectedEmoji, setSelectedEmoji] = useState('');
  const [addMode, setAddMode] = useState(false);
  const [messages, setMessages] = useState<DocumentData[]>([]);
  const endRef = useRef<HTMLDivElement>(null);
  const [receiverUser, setReceiverUser] = useState<DocumentData | null>(null);

  const handleEmojiChange = (e: { emoji: string }) => {
    setSelectedEmoji((prev) => prev + e.emoji);
  };

 
  const handleLogout = () => {
    signOut(auth).catch((error) => {
      console.error('Error signing out: ', error);
    });
  };

  const handleSendMessage = async () => {
  if (!selectedEmoji.trim() || !chatId) return;

  const userDoc = await getDoc(doc(db, "users", currentUserId));
  const senderAvatar = userDoc.exists() ? userDoc.data().avatar : null;

  try {
    await addDoc(collection(db, 'chats', chatId, 'messages'), {
      text: selectedEmoji,
      senderId: currentUserId,
      senderAvatar: senderAvatar,
      timestamp: serverTimestamp(),
      });
    setSelectedEmoji('');
    } catch (error) {
      console.error('Send failed: ', error);
    }
  };

const getReceiverId = () => {
  if (!chatId || !currentUserId) return null;
  return chatId.replace(currentUserId, '');
};

useEffect(() => {
  const receiverId = getReceiverId();
  if (!receiverId) return;

  const fetchReceiver = async () => {
    const userDoc = await getDoc(doc(db, 'users', receiverId));
    if (userDoc.exists()) {
      setReceiverUser(userDoc.data());
    }
  };
  fetchReceiver();
}, [chatId]);

  
useEffect(() => {
  if (!chatId) return;
  const q = query(
    collection(db, 'chats', chatId, 'messages'),
    orderBy('timestamp')
  );
  const unsub = onSnapshot(q, (snapshot) => {
    setMessages(snapshot.docs.map((doc) => doc.data()));
  });
  return () => unsub();
}, [chatId]);

useEffect(() => {
  endRef.current?.scrollIntoView({ behavior: 'smooth' });
}, [messages]);




  return (
    <div className="cb-body">
      {headerActive === 'cb-header-1' && (
        <div className="display-listfr">
          <div className="cb-header-1">
            <button className="addfr-btn" onClick={() => setAddMode((prev) => !prev)}>
              Add
            </button>
            <button className="logout-btn" onClick={handleLogout}>
              Log Out
            </button>
          </div>
          {addMode && <AddUser currentUserId={currentUserId} />}
        </div>
      )}

      {headerActive === 'cb-header-2' && (
        <div className="display-chat">
         <div className="cb-header-2">
          <div className="user-info">
            <img src={receiverUser?.avatar || './defaultavatar.png'} alt="" />
            <div>
              <span>{receiverUser?.username || 'Unknown User'}</span>
            </div>
          </div>
          <div className="icons"></div>
        </div>


          <div className="mess-box">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={msg.senderId === currentUserId ? 'message-own' : 'message'}
              >
                <img src={msg.senderAvatar || './defaultavatar.png'} alt="" />
                <div className="texts">
                  <span>
                    {msg.timestamp?.toDate
                      ? new Date(msg.timestamp.toDate()).toLocaleTimeString()
                      : 'Just now'}
                  </span>
                  <p>{msg.text}</p>
                </div>
              </div>
            ))}
            <div ref={endRef}></div>
          </div>

          <div className="footer">
            <div className="chat-input">
              <div className="more-icons"></div>
              <input
                type="text"
                placeholder="Type a message..."
                value={selectedEmoji}
                onChange={(e) => setSelectedEmoji(e.target.value)}
              />
              <div className="emoji" onClick={() => setOpenEmoji((prev) => !prev)}>
                <img src="./emoji.webp" alt="" />
                <div className="picked">
                  <EmojiPicker open={openEmoji} onEmojiClick={handleEmojiChange} />
                </div>
              </div>
              <button className="send" onClick={handleSendMessage}>
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatBox;
