import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
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
    setChatId("");
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

        const chatList: Chat[] = (
          await Promise.all(
            data.chats.map(async (chat: any): Promise<Chat | null> => {
              if (chat.isGroup) {
                return {
                  chatId: chat.chatId,
                  isGroup: true,
                  name: chat.groupName,
                  avatarUrl: chat.groupAvatar || "./groupAvatar.jpg",
                  lastMessage: chat.lastMessage || "",
                };
              } else {
                const receiverDoc = await getDoc(
                  doc(db, "users", chat.receiverId)
                );

                if (!receiverDoc.exists()) {
                  return null;
                }

                const receiverData = receiverDoc.data();

                return {
                  chatId: chat.chatId,
                  isGroup: false,
                  name: receiverData?.username || "Unknown User",
                  avatarUrl: receiverData?.avatar || "",
                  receiverId: chat.receiverId,
                  lastMessage: chat.lastMessage || "",
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
            className="flex items-center gap-3 px-3 py-2 hover:bg-gray-400 rounded-lg cursor-pointer transition"
          >
            
              <img
                src={chat.avatarUrl}
                alt={chat.name}
                className="w-10 h-10 rounded-full object-cover"
              />
          
            <div className="flex-1">
              <div className="font-medium truncate">{chat.name}</div>
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
