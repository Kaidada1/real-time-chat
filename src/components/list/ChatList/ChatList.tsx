import React, { useEffect, useState } from 'react'
import "./chatlist.css"
import { db } from '../../../lib/firebase'
import { collection, onSnapshot } from 'firebase/firestore'

type User = {
  id: string;
  name: string;
  avatarUrl?: string;
  lastMessage?: string;
}

type Props = {
  setHeaderActive: React.Dispatch<React.SetStateAction<'cb-header-1' | 'cb-header-2'>>;
  userId: string;
  setChatId: React.Dispatch<React.SetStateAction<string>>;
}


const ChatList = (props: Props) => {
  const { setHeaderActive, userId } = props;
  const [users, setUsers] = useState<User[]>([]);
  
  const handleClick = () => {
    setHeaderActive('cb-header-1');
  };

  const handleChat = (receiverId: string) => {
    const chatId = [userId, receiverId].sort().join("");
    props.setChatId(chatId);
    setHeaderActive("cb-header-2");
  };


  useEffect(() => {
    if (!userId) {
      setUsers([]);
      return;
    }
    const q = collection(db, "users", userId, "addedUsers");
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const usersList: User[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        usersList.push({
          id: doc.id,
          name: data.username,
          avatarUrl: data.avatar,
          lastMessage: data.lastMessage,
        });
      });
      setUsers(usersList);
      console.log(usersList)
    });

    return () => unsubscribe();
  }, [userId]);

  return (
    <div className='chat-list'>
        <div className='search-bar'>
          <input className='search-input' type='text' placeholder='search'/>
        </div>
        <div className='friend' onClick={handleClick} style={{cursor: 'pointer'}}>
          <span>Friend</span>
        </div>
        {users.map((user) => (
          <div key={user.id} className='list-mess' onClick={() => handleChat(user.id)} style={{cursor: 'pointer'}}>
            <img className='avt' src={user.avatarUrl || './fuxuan.webp'} alt={user.name}/>
            <div className='chat-preview'>
              <span>{user.name}</span>
              <p>{user.lastMessage}</p>
            </div>
          </div>
        ))}
    </div>
  )
}

export default ChatList;