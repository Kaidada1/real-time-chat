import React, { useEffect, useState } from "react";
import "./chatlist.css";
import { db } from "../../../lib/firebase";
import { collection, doc, getDoc, onSnapshot } from "firebase/firestore";

type Chat = {
  chatId: string;
  isGroup?: boolean;
  groupName?: string;
  receiverId?: string;
  lastMessage?: string;
  avatarUrl?: string;
  name: string;
};

type Props = {
  setHeaderActive: React.Dispatch<
    React.SetStateAction<"cb-header-1" | "cb-header-2">
  >;
  userId: string;
  setChatId: React.Dispatch<React.SetStateAction<string>>;
};

const ChatList = ({ setHeaderActive, userId, setChatId }: Props) => {
  const [chats, setChats] = useState<Chat[]>([]);

  const handleClick = () => {
    setHeaderActive("cb-header-1");
  };

  const handleChat = (chatId: string) => {
    setChatId(chatId);
    setHeaderActive("cb-header-2");
  };

  useEffect(() => {
    if (!userId) return;

    let unsubAddedUsers: () => void;
    let unsubUserChats: () => void;

    const addedUsersMap = new Map<string, Chat>();

    unsubAddedUsers = onSnapshot(
      collection(db, "users", userId, "addedUsers"),
      (snapshot) => {
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          const chatId = [userId, docSnap.id].sort().join("");
          addedUsersMap.set(chatId, {
            chatId,
            isGroup: false,
            name: data.username,
            avatarUrl: data.avatar || "",
            receiverId: docSnap.id,
            lastMessage: "",
          });
        });
      }
    );

    unsubUserChats = onSnapshot(
      doc(db, "userchats", userId),
      async (docSnap) => {
        const data = docSnap.data();
        if (!data || !Array.isArray(data.chats)) {
          setChats(Array.from(addedUsersMap.values()));
          return;
        }

        const chatList: Chat[] = await Promise.all(
          data.chats.map(async (chat: any): Promise<Chat> => {
            if (chat.isGroup) {
              return {
                chatId: chat.chatId,
                isGroup: true,
                name: chat.groupName,
                avatarUrl: "",
                lastMessage: chat.lastMessage || "",
              };
            } else {
              const receiverDoc = await getDoc(
                doc(db, "users", chat.receiverId)
              );
              const receiverData = receiverDoc.data();
              const chatId = chat.chatId;

              return {
                chatId,
                isGroup: false,
                name: receiverData?.username || "Unknown User",
                avatarUrl: receiverData?.avatar || "",
                receiverId: chat.receiverId,
                lastMessage: chat.lastMessage || "",
              };
            }
          })
        );

        // Merge addedUsers with chatList (avoid duplicates)
        const mergedMap = new Map<string, Chat>();
        chatList.forEach((chat) => mergedMap.set(chat.chatId, chat));
        addedUsersMap.forEach((chat, id) => {
          if (!mergedMap.has(id)) {
            mergedMap.set(id, chat);
          }
        });

        setChats(Array.from(mergedMap.values()));
      }
    );

    return () => {
      if (unsubAddedUsers) unsubAddedUsers();
      if (unsubUserChats) unsubUserChats();
    };
  }, [userId]);

  return (
    <div className="chat-list">
      <div className="search-bar">
        <input className="search-input" type="text" placeholder="search" />
      </div>

      <div className="friend" onClick={handleClick}>
        <span>Friend</span>
      </div>

      {chats.map((chat) => (
        <div
          key={chat.chatId}
          className="list-mess"
          onClick={() => handleChat(chat.chatId)}
        >
          {!chat.isGroup && (
            <img
              className="avt"
              src={chat.avatarUrl || "./default-avatar.png"}
              alt={chat.name}
            />
          )}
          <div className="chat-preview">
            <span>{chat.name}</span>
            <p>{chat.lastMessage}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ChatList;
