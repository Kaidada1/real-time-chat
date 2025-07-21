import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { db } from "../../../lib/firebase";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";

type Chat = {
  chatId: string;
  isGroup?: boolean;
  groupName?: string;
  receiverId?: string;
  lastMessage?: string;
  avatarUrl?: string;
  name: string;
  timestamp?: number;
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
    setChatId("");
  };

  const handleChat = (chatId: string) => {
    setChatId(chatId);
    setHeaderActive("cb-header-2");
  };

  const formatTimestamp = (timestamp?: number) => {
    if (!timestamp) return "";

    const date = new Date(timestamp);
    const now = new Date();

    const isToday =
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear();

    const isYesterday =
      now.getDate() - date.getDate() === 1 &&
      now.getMonth() === date.getMonth() &&
      now.getFullYear() === date.getFullYear();

    if (isToday) {
      return date.toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (isYesterday) {
      return "Hôm qua";
    } else {
      return date.toLocaleDateString("vi-VN");
    }
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

        const chatList: Chat[] = (
          await Promise.all(
            data.chats.map(async (chat: any): Promise<Chat | null> => {
              const chatId = chat.chatId;
              const updatedAt = chat.updatedAt || 0;

              let lastMessage = chat.lastMessage || "";

              if (chat.isGroup) {
                return {
                  chatId,
                  isGroup: true,
                  name: chat.groupName,
                  avatarUrl: chat.groupAvatar || "./groupAvatar.jpg",
                  lastMessage,
                  timestamp: updatedAt,
                };
              } else {
                const receiverDoc = await getDoc(
                  doc(db, "users", chat.receiverId)
                );
                if (!receiverDoc.exists()) return null;

                const receiverData = receiverDoc.data();

                return {
                  chatId,
                  isGroup: false,
                  name: receiverData?.username || "Unknown User",
                  avatarUrl: receiverData?.avatar || "",
                  receiverId: chat.receiverId,
                  lastMessage,
                  timestamp: updatedAt,
                };
              }
            })
          )
        ).filter((chat): chat is Chat => chat !== null);

        const mergedMap = new Map<string, Chat>();

        for (const chat of chatList) {
          if (!chat.isGroup && chat.receiverId) {
            mergedMap.set(chat.receiverId, chat);
          } else {
            mergedMap.set(chat.chatId, chat);
          }
        }

        addedUsersMap.forEach((chat, id) => {
          if (
            !chat.isGroup &&
            chat.receiverId &&
            !mergedMap.has(chat.receiverId)
          ) {
            mergedMap.set(chat.receiverId, chat);
          }
        });

        setChats(Array.from(mergedMap.values()));
      }
    );
    return () => {
      if (unsubAddedUsers) unsubAddedUsers();
    };
  }, [userId]);

  return (
    <div className="h-full flex flex-col bg-[#ffffff] text-black overflow-y-auto">
      <div className="p-4">
        <Input
          className="bg-gray-200 border-none text-black focus:ring-0 rounded-2xl"
          placeholder="Search"
        />
      </div>

      <div
        className="px-4 py-2 text-sm text-indigo-400 font-semibold cursor-pointer hover:underline"
        onClick={handleClick}
      >
        Friend
      </div>

      <div className="flex flex-col gap-1 px-2 overflow-y-auto">
        {chats.map((chat) => (
          <div
            key={chat.chatId}
            onClick={() => handleChat(chat.chatId)}
            className="flex items-center gap-3 px-3 py-2 hover:bg-gray-200 rounded-lg cursor-pointer transition"
          >
            <img
              src={chat.avatarUrl}
              alt={chat.name}
              className="w-10 h-10 rounded-full object-cover"
            />

            <div className="flex-1">
              <div className="flex justify-between items-center">
                <div className="font-medium truncate">{chat.name}</div>
                <div className="text-xs text-gray-400 ml-2 whitespace-nowrap">
                  {formatTimestamp(chat.timestamp)}
                </div>
              </div>
              <div className="text-sm text-gray-400 truncate">
                {chat.lastMessage}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChatList;
