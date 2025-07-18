import React, { useState, useEffect } from "react";
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
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type User = {
  id: string;
  name?: string;
  avatarUrl?: string;
};

type Props = {
  currentUserId: string;
  isOpen: boolean;
  onClose: () => void;
};

const AddUser = ({ currentUserId, isOpen, onClose }: Props) => {
  const [username, setUsername] = useState("");
  const [searchResult, setSearchResult] = useState<User | null>(null);
  const [error, setError] = useState("");
  const [groupName, setGroupName] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);

  useEffect(() => {
    if (!isOpen) {
      setUsername("");
      setSearchResult(null);
      setError("");
      setGroupName("");
      setSelectedUsers([]);
    }
  }, [isOpen]);

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
      onClose();
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
        groupAvatar: "./groupAvatar.jpg",
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
      onClose();
    } catch (err) {
      console.error(err);
      alert("Tạo nhóm thất bại!");
    }
  };

  return (
    <AlertDialog open={isOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Thêm người dùng</AlertDialogTitle>
        </AlertDialogHeader>
        <form onSubmit={handleSearch} className="flex gap-3 mb-4">
          <Input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Tìm tên người dùng"
          />
          <Button type="submit">Tìm</Button>
        </form>

        {error && <p className="text-red-600 mb-2">{error}</p>}

        {searchResult && (
          <div className="flex justify-between items-center bg-gray-100 p-2 rounded">
            <div className="flex items-center gap-2">
              <img
                src={searchResult.avatarUrl || ""}
                alt={searchResult.name}
                className="w-10 h-10 rounded-full"
              />
              <span>{searchResult.name}</span>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleAddUser}>Add</Button>
              <Button onClick={handleSelectForGroup}>Add to Group</Button>
            </div>
          </div>
        )}

        {selectedUsers.length > 0 && (
          <div className="mt-4 space-y-2">
            <p>Thành viên nhóm:</p>
            <ul>
              {selectedUsers.map((u) => (
                <li key={u.id} className="flex items-center gap-2">
                  <img
                    src={u.avatarUrl || ""}
                    alt={u.name}
                    className="w-6 h-6 rounded-full"
                  />
                  <span>{u.name}</span>
                </li>
              ))}
            </ul>
            <div className="flex gap-2 mt-2">
              <Input
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="Tên nhóm"
              />
              <Button onClick={handleCreateGroup}>Tạo nhóm</Button>
            </div>
          </div>
        )}

        <div className="flex justify-end mt-6">
          <Button variant="outline" onClick={onClose}>
            Đóng
          </Button>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default AddUser;