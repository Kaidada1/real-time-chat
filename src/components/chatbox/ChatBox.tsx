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
import upload from '../../lib/upload';

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
  const [img, setImg] = useState({
    file:null,
    url:"",
  })

  const handleEmojiChange = (e: { emoji: string }) => {
    setSelectedEmoji((prev) => prev + e.emoji);
  };

 
  const handleLogout = () => {
    signOut(auth).catch((error) => {
      console.error('Error signing out: ', error);
    });
  };

  const handleSendMessage = async () => {
   if ((!selectedEmoji.trim() && !img.file) || !chatId) return;

  const userDoc = await getDoc(doc(db, "users", currentUserId));
  const senderAvatar = userDoc.exists() ? userDoc.data().avatar : null;
  let imgUrl = null;



  try {

    if(img.file){
      imgUrl = await upload(img.file)
    }

    await addDoc(collection(db, 'chats', chatId, 'messages'), {
      text: selectedEmoji,
      senderId: currentUserId,
      senderAvatar: senderAvatar,
      timestamp: serverTimestamp(),
      ...(imgUrl && {img: imgUrl})
      });
    setSelectedEmoji('');
    } catch (error) {
      console.error('Send failed: ', error);
    }

    setImg({
      file:null,
      url:""
    })
  };

const handleImg = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImg({
        file: e.target.files[0],
        url: URL.createObjectURL(e.target.files[0])
      })
    }
  }

useEffect(() => {
  if (!chatId || !currentUserId) return;

  const receiverId = chatId.replace(currentUserId, '');
  if (!receiverId) return;

  const fetchReceiver = async () => {
    const userDoc = await getDoc(doc(db, 'users', receiverId));
    if (userDoc.exists()) {
      setReceiverUser(userDoc.data());
    }
  };
  fetchReceiver();
}, [chatId, currentUserId]);

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
            <img src={receiverUser?.avatar } alt="" />
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
                <img src={msg.senderAvatar} alt="" className='sent-avt'/>
                <div className="texts">
                  <div className="time">
                    {msg.timestamp?.toDate
                      ? new Date(msg.timestamp.toDate()).toLocaleTimeString()
                      : 'Just now'}
                  </div>
                  {msg.img && <img src={msg.img} alt="sent" className="sent-img" />}
                  {msg.text && <p>{msg.text}</p>}
                </div>
              </div>
            ))}
            <div ref={endRef}></div>
          </div>
            {img.url && (
              <div className="preview-img">
                <img src={img.url} alt="preview" />
                <button className="remove-img-btn" onClick={() => setImg({ file: null, url: '' })}>
                  X
                </button>
              </div>
            )}
          <div className="footer">
            <div className="chat-input">
              
              <div className="more-icons">
                <label className='add-img'>+
                  <input type='file' placeholder='.' id='file' className='send-img'
                  onChange={handleImg}
                />
                </label>
              </div>
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
