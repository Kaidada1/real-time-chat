import React, { useState } from "react";
import "./adduser.css";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  setDoc,
  getDoc,
} from "firebase/firestore";
import { db } from "../../../lib/firebase";
import { serverTimestamp } from "firebase/firestore";

type User = {
  id: string;
  name?: string;
  avatarUrl?: string;
};

type Props = {
  currentUserId: string;
};

const AddUser = ({ currentUserId }: Props) => {
  const [username, setUsername] = useState("");
  const [searchResult, setSearchResult] = useState<User | null>(null);
  const [error, setError] = useState("");
  const [groupName, setGroupName] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSearchResult(null);

    if (!username.trim()) {
      setError("Please enter a username to search.");
      return;
    }

    try {
      const q = query(
        collection(db, "users"),
        where("username", "==", username)
      );
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
      const addedUserRef = doc(
        db,
        "users",
        currentUserId,
        "addedUsers",
        searchResult.id
      );
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

      await setDoc(
        doc(db, "userchats", currentUserId),
        {
          chats: [chatData],
        },
        { merge: true }
      );

      await setDoc(
        doc(db, "userchats", searchResult.id),
        {
          chats: [
            {
              chatId: combinedId,
              lastMessage: "",
              receiverId: currentUserId,
              updatedAt: now,
            },
          ],
        },
        { merge: true }
      );

      await setDoc(doc(db, "chats", combinedId), {
        createdAt: serverTimestamp(),
      });

      alert(`User ${searchResult.name} added successfully.`);
    } catch (err) {
      console.error(err);
      setError("Failed to add user.");
    }
  };

  const handleSelectForGroup = () => {
    if (!searchResult) return;
    const exists = selectedUsers.find((u) => u.id === searchResult.id);
    if (!exists) {
      setSelectedUsers((prev) => [...prev, searchResult]);
    }
    setSearchResult(null);
    setUsername("");
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim() || selectedUsers.length < 1) {
      alert("Nhóm cần ít nhất 2 người.");
      return;
    }

    const memberIds = [...selectedUsers.map((u) => u.id), currentUserId];
    const groupId = `group_${Date.now()}`;

    try {
      await setDoc(doc(db, "chats", groupId), {
        id: groupId,
        name: groupName,
        isGroup: true,
        members: memberIds,
        createdAt: serverTimestamp(),
      });

      const now = Date.now();
      const chatData = {
        chatId: groupId,
        groupName,
        isGroup: true,
        members: memberIds,
        lastMessage: "",
        updatedAt: now,
      };

      for (const uid of memberIds) {
        const userChatsRef = doc(db, "userchats", uid);
        const userChatsSnap = await getDoc(userChatsRef);

        let existingChats: any[] = [];

        if (userChatsSnap.exists()) {
          const data = userChatsSnap.data();
          existingChats = Array.isArray(data.chats) ? data.chats : [];
        }

        const alreadyExists = existingChats.some(
          (chat) => chat.chatId === groupId
        );
        if (!alreadyExists) {
          existingChats.push(chatData);
        }

        await setDoc(
          userChatsRef,
          {
            chats: existingChats,
          },
          { merge: true }
        );
      }

      alert("Tạo nhóm thành công!");
      setSelectedUsers([]);
      setGroupName("");
    } catch (err) {
      console.error(err);
      alert("Tạo nhóm thất bại!");
    }
  };

  return (
    <div className="add-user">
      <form onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <button type="submit">Search</button>
      </form>

      {error && <p className="error">{error}</p>}

      {searchResult && (
        <div className="user">
          <div className="detail">
            <img src={searchResult.avatarUrl || ""} alt={searchResult.name} />
            <span>{searchResult.name}</span>
          </div>
          <button onClick={handleAddUser}>Add</button>
          <button onClick={handleSelectForGroup}>Add to Group</button>
        </div>
      )}

      {selectedUsers.length > 0 && (
        <div className="group-section">
          <h4>Thành viên nhóm:</h4>
          <ul>
            {selectedUsers.map((user) => (
              <li key={user.id}>
                <img src={user.avatarUrl || ""} alt={user.name} width={30} />
                <span>{user.name}</span>
              </li>
            ))}
          </ul>
          <input
            type="text"
            placeholder="Tên nhóm"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
          />
          <button onClick={handleCreateGroup}>Tạo nhóm</button>
        </div>
      )}
    </div>
  );
};

export default AddUser;
