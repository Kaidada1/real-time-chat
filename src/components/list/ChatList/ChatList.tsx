import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { db } from "../../../lib/firebase";
import { collection, doc, getDoc, onSnapshot, query } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@radix-ui/react-label";
import { ScrollArea } from "@/components/ui/scroll-area";

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
  const [loading, setLoading] = useState(true);

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
      return "Yesterday";
    } else {
      return date.toLocaleDateString("vi-VN");
    }
  };

  useEffect(() => {
    if (!userId) return;

    const q = query(collection(db, "conversations"));
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const chatList: Chat[] = await Promise.all(
        snapshot.docs.map(async (docSnap) => {
          const data = docSnap.data();
          if (!data.users.includes(userId)) return null;

          const otherUserId = data.users.find((uid: string) => uid !== userId);
          const lastMsg = data.messages?.[data.messages.length - 1];

          const updatedAt = lastMsg?.sentAt?.toMillis?.() || 0;

          let lastMessage = "";
          if (lastMsg) {
            if (lastMsg.message?.trim()) {
              lastMessage = lastMsg.message;
            } else if (lastMsg.img) {
              lastMessage = "Ảnh";
            }
          }

          if (data.isGroup) {
            return {
              chatId: docSnap.id,
              isGroup: true,
              name: data.groupName,
              avatarUrl: data.groupAvatar || "./groupAvatar.jpg",
              lastMessage,
              timestamp: updatedAt,
            };
          } else {
            if (!otherUserId) return null;
            const userSnap = await getDoc(doc(db, "users", otherUserId));
            if (!userSnap.exists()) return null;
            const userData = userSnap.data();

            return {
              chatId: docSnap.id,
              isGroup: false,
              name: userData.username,
              avatarUrl: userData.avatar || "",
              receiverId: otherUserId,
              lastMessage,
              timestamp: updatedAt,
            };
          }
        })
      );

      setChats(chatList.filter(Boolean) as Chat[]);
      setLoading(false);
    });

    return () => unsubscribe();
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
        className=" flex px-4 py-2 text-sm text-indigo-400 font-semibold cursor-pointer hover:underline justify-center"
        onClick={handleClick}
      >
        <Label>Chats</Label>
      </div>
      <ScrollArea>
        <div className="flex flex-col gap-1 px-2 overflow-y-auto">
          {loading
            ? Array.from({ length: 5 }).map((_, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition"
                >
                  <Skeleton className="w-10 h-10 rounded-full object-cover" />
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <Skeleton className="truncate h-4 w-full" />
                    </div>
                    <Skeleton className="truncate h-2 w-[70%] mt-3" />
                  </div>
                </div>
              ))
            : chats.map((chat) => (
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
                      <Label className="font-medium truncate">
                        {chat.name}
                      </Label>
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
      </ScrollArea>
    </div>
  );
};

export default ChatList;
