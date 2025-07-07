import React, { useState } from 'react'
import "./adduser.css"
import { collection, query, where, getDocs, doc, setDoc } from "firebase/firestore";
import { db } from '../../../lib/firebase';
import { serverTimestamp } from "firebase/firestore";

type User = {
  id: string;
  name?: string;
  avatarUrl?: string;
}

type Props = {
  currentUserId: string;
}

const AddUser = (props: Props) => {
  const { currentUserId } = props;
  const [username, setUsername] = useState("");
  const [searchResult, setSearchResult] = useState<User | null>(null);
  const [error, setError] = useState("");

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSearchResult(null);

    if (!username.trim()) {
      setError("Please enter a username to search.");
      return;
    }

    try {
      const q = query(collection(db, "users"), where("username", "==", username));
      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) {
        setError("No user found with that username.");
      } else {
        querySnapshot.forEach((docSnap) => {
          const data = docSnap.data();
          setSearchResult({
            id: docSnap.id,
            name: data.username,
            avatarUrl: data.avatar,
          });
        });
      }
    } catch (err) {
      setError("Error searching user.");
      console.error(err);
    }
  };

 const handleAddUser = async () => {
  if (!searchResult) return;

  try {
    const addedUserRef = doc(db, "users", currentUserId, "addedUsers", searchResult.id);
    await setDoc(addedUserRef, {
      username: searchResult.name,
      avatar: searchResult.avatarUrl || "",
    });

    const combinedId =
      currentUserId > searchResult.id
        ? currentUserId + searchResult.id
        : searchResult.id + currentUserId;

    const now = Date.now();
    const chatData = {
      chatId: combinedId,
      lastMessage: "",
      receiverId: searchResult.id,
      updatedAt: now,
    };

    await setDoc(doc(db, "userchats", currentUserId), {
      chats: [chatData]
    }, { merge: true });

    await setDoc(doc(db, "userchats", searchResult.id), {
      chats: [{
        chatId: combinedId,
        lastMessage: "",
        receiverId: currentUserId,
        updatedAt: now,
      }]
    }, { merge: true });

    await setDoc(doc(db, "chats", combinedId), {
      createdAt: serverTimestamp(),
    });

    alert(`User ${searchResult.name} added successfully.`);
  } catch (err) {
    console.error(err);
    setError("Failed to add user.");
  }
};


  return (
    <div className='add-user'>
      <form onSubmit={handleSearch}>
        <input
          type='text'
          placeholder='Username'
          name='username'
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <button type='submit'>Search</button>
      </form>
      {error && <p className='error'>{error}</p>}
      {searchResult && (
        <div className='user'>
          <div className='detail'>
            <img src={searchResult.avatarUrl || ''} alt={searchResult.name} />
            <span>{searchResult.name}</span>
          </div>
          <button onClick={handleAddUser}>Add</button>
        </div>
      )}
    </div>
  )
}

export default AddUser;
