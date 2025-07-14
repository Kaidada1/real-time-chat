import React, { useState } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  setDoc,
  getDoc,
  or,
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
            name: data.username|| data.name,
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
        groupAvatar:"./groupAvatar.jpg",
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
    <div className="p-8 rounded-lg absolute top-32 left-1/2 transform -translate-x-1/2 w-max bg-white">
      <form onSubmit={handleSearch} className="flex gap-5">
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="p-5 rounded-lg border border-gray-300 outline-none text-black h-5"
        />
        <button
          type="submit"
          className="p-2 rounded-lg bg-blue-600 text-white border-none cursor-pointer gap-4"
        >
          Search
        </button>
      </form>

      {error && <p className="text-red-600 mt-4">{error}</p>}

      {searchResult && (
        <div className="mt-12 flex items-center justify-between">
          <div className="flex gap-5 items-center">
            <img
              src={searchResult.avatarUrl || ""}
              alt={searchResult.name}
              className="w-12 h-12 rounded-full object-cover"
            />
            <span className="text-black">{searchResult.name}</span>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleAddUser}
              className="p-2 rounded-lg bg-blue-600 text-white border-none cursor-pointer gap-4"
            >
              Add
            </button>
            <button
              onClick={handleSelectForGroup}
              className="p-2 rounded-lg bg-blue-600 text-white border-none cursor-pointer gap-4"
            >
              Add to Group
            </button>
          </div>
        </div>
      )}

      {selectedUsers.length > 0 && (
        <div className="mt-8 text-black m-3">
          <h4>Thành viên nhóm:</h4>
          <ul>
            {selectedUsers.map((user) => (
              <li key={user.id} className="flex items-center gap-3 m-5">
                <img
                  src={user.avatarUrl || ""}
                  alt={user.name}
                  className="w-8 h-8 rounded-full"
                />
                <span className="text-black">{user.name}</span>
              </li>
            ))}
          </ul>
          <input
            type="text"
            placeholder="Tên nhóm"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            className="p-5 rounded-lg border border-gray-300 outline-none text-black h-5 mr-4"
          />
          <button
            onClick={handleCreateGroup}
            className="p-2 rounded-lg bg-blue-600 text-white border-none cursor-pointer gap-4"
          >
            Tạo nhóm
          </button>
        </div>
      )}
    </div>
  );
};

export default AddUser;
