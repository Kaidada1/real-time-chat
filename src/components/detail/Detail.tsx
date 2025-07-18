import { db, storage } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { getDownloadURL, ref } from "firebase/storage";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

type Props = {
  chatId: string;
  currentUserId: string;
};

const Detail = ({ chatId, currentUserId }: Props) => {
  const [info, setInfo] = useState<any>(null);
  const [avatarUrl, setAvatarUrl] = useState("");

  useEffect(() => {
    const fetchChatInfo = async () => {
      if (!chatId) return;

      const chatDoc = await getDoc(doc(db, "chats", chatId));
      if (!chatDoc.exists()) return;

      const data = chatDoc.data();

      if (data.isGroup) {
        setInfo({
          username: data.name,
          avatar: data.groupAvatar || "",
        });
      } else {
        const receiverId = chatId.replace(currentUserId, "");
        if (!receiverId) return;

        const userDoc = await getDoc(doc(db, "users", receiverId));
        if (userDoc.exists()) {
          setInfo(userDoc.data());
        }
      }
    };

    fetchChatInfo();
  }, [chatId, currentUserId]);

  useEffect(() => {
    if (!info) return;

    if (info.avatar?.startsWith("http")) {
      setAvatarUrl(info.avatar);
    } else if (info.avatar) {
      getDownloadURL(ref(storage, info.avatar))
        .then(setAvatarUrl)
        .catch(() => setAvatarUrl("./catavt.png"));
    } else {
      setAvatarUrl("./catavt.png");
    }
  }, [info]);
  console.log(info);

  if (!info) {
    return <div className="p-6 text-white">Đang tải thông tin...</div>;
  }

  return (
    <div className="h-full w-full bg-[#111827] text-white p-6 flex flex-col gap-6">
      <div className="flex flex-col items-center">
        <img
          src={avatarUrl}
          alt="Avatar"
          className="w-24 h-24 rounded-full object-cover border-4 border-indigo-600"
        />
        <h2 className="text-xl font-semibold mt-3">{info.username}</h2>
      </div>

      <div className="flex flex-col gap-4">
        {["Chat setting", "Privacy", "Share files"].map((item) => (
          <Button
            key={item}
            variant="ghost"
            className="justify-start px-4 py-3 rounded-lg hover:bg-gray-700 transition"
          >
            {item}
          </Button>
        ))}
      </div>
      {/* Share Photos */}
        <div className="bg-gray-800 rounded-lg px-4 py-3">
          <span className="text-sm text-white font-medium">Share photos</span>
          <div className="mt-3 flex flex-col gap-3">
            <div className="flex items-center gap-3 bg-gray-900 p-2 rounded-md">
              <img
                src="./logo192.png"
                alt="Shared"
                className="w-12 h-12 rounded-lg object-cover"
              />
              <span className="text-sm text-gray-300 truncate">2025_7.png</span>
            </div>
          </div>
        </div>
      </div>
  );
};

export default Detail;
