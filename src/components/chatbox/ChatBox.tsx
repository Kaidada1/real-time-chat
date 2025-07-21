import React, { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Smile, ImageIcon, LogOutIcon, PlusIcon, Info } from "lucide-react";
import EmojiPicker from "emoji-picker-react";
import AddUser from "./adduser/addUser";
import { signOut } from "firebase/auth";
import { auth, db } from "../../lib/firebase";
import {
  doc,
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
  getDoc,
  DocumentData,
  arrayUnion,
  setDoc,
} from "firebase/firestore";
import upload from "../../lib/upload";

type Props = {
  headerActive: "cb-header-1" | "cb-header-2";
  currentUserId: string;
  chatId: string;
};

const ChatBox = ({ headerActive, currentUserId, chatId }: Props) => {
  const [messages, setMessages] = useState<DocumentData[]>([]);
  const [receiverUser, setReceiverUser] = useState<DocumentData | null>(null);
  const [groupName, setGroupName] = useState("");
  const [isGroupChat, setIsGroupChat] = useState(false);
  const [addMode, setAddMode] = useState(false);
  const [selectedEmoji, setSelectedEmoji] = useState("");
  const [openEmoji, setOpenEmoji] = useState(false);
  const [img, setImg] = useState({ file: null, url: "" });
  const endRef = useRef<HTMLDivElement>(null);
  const emojiRef = useRef<HTMLDivElement>(null);

  const handleEmojiChange = (e: { emoji: string }) => {
    setSelectedEmoji((prev) => prev + e.emoji);
  };

  const handleLogout = () => {
    signOut(auth).catch(console.error);
  };

  const handleImg = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImg({
        file: e.target.files[0],
        url: URL.createObjectURL(e.target.files[0]),
      });
    }
  };

  const handleSendMessage = async () => {
    if ((!selectedEmoji.trim() && !img.file) || !chatId) return;

    const imgToSend = img;
    const textToSend = selectedEmoji;

    setSelectedEmoji("");
    setImg({ file: null, url: "" });

    try {
      let imgUrl: string | null = null;
      if (imgToSend.file) {
        imgUrl = await upload(imgToSend.file);
      }

      const lastMessage = imgUrl ? "Ảnh" : textToSend;

      const userDoc = await getDoc(doc(db, "users", currentUserId));
      const senderAvatar = userDoc.exists() ? userDoc.data().avatar : null;

      await addDoc(collection(db, "chats", chatId, "messages"), {
        text: textToSend,
        senderId: currentUserId,
        senderAvatar,
        timestamp: serverTimestamp(),
        ...(imgUrl && { img: imgUrl }),
      });

      const updatedAt = Date.now();

      const chatInfo = {
        chatId,
        isGroup: isGroupChat,
        lastMessage,
        updatedAt,
        ...(isGroupChat
          ? {
              groupName,
              groupAvatar: "",
            }
          : {
              receiverId: chatId.replace(currentUserId, ""),
            }),
      };

      const senderRef = doc(db, "userchats", currentUserId);
      await setDoc(senderRef, { chats: arrayUnion(chatInfo) }, { merge: true });

      if (!isGroupChat) {
        const receiverId = chatId.replace(currentUserId, "");
        const receiverRef = doc(db, "userchats", receiverId);
        await setDoc(
          receiverRef,
          {
            chats: arrayUnion({
              chatId,
              isGroup: false,
              receiverId: currentUserId,
              lastMessage,
              updatedAt,
            }),
          },
          { merge: true }
        );
      }
    } catch (error) {
      console.error("Send failed: ", error);
    }
  };

  useEffect(() => {
    if (!chatId || !currentUserId) return;

    const fetchChatInfo = async () => {
      const chatDoc = await getDoc(doc(db, "chats", chatId));
      if (chatDoc.exists()) {
        const data = chatDoc.data();
        if (data.isGroup) {
          setIsGroupChat(true);
          setGroupName(data.name);
          setReceiverUser(null);
          return;
        }
      }

      const receiverId = chatId.replace(currentUserId, "");
      if (!receiverId) return;

      const userDoc = await getDoc(doc(db, "users", receiverId));
      if (userDoc.exists()) {
        setReceiverUser(userDoc.data());
        setIsGroupChat(false);
        setGroupName("");
      }
    };

    fetchChatInfo();
  }, [chatId, currentUserId]);

  useEffect(() => {
    if (!chatId) return;
    const q = query(
      collection(db, "chats", chatId, "messages"),
      orderBy("timestamp")
    );
    const unsub = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map((doc) => doc.data()));
    });
    return () => unsub();
  }, [chatId]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (emojiRef.current && !emojiRef.current.contains(e.target as Node)) {
        setOpenEmoji(false);
      }
    };

    if (openEmoji) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openEmoji]);

  return (
    <div className="flex flex-col h-full overflow-hidden bg-background">
      {headerActive === "cb-header-1" && (
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <Button onClick={() => setAddMode((prev) => !prev)} variant="default">
            <PlusIcon className="mr-2 h-4 w-4" /> Add
          </Button>
          <Button variant="destructive" onClick={handleLogout}>
            <LogOutIcon className="mr-2 h-4 w-4" /> Logout
          </Button>
          {addMode && <AddUser currentUserId={currentUserId} />}
        </div>
      )}

      {headerActive === "cb-header-2" && (
        <div className="w-full h-full flex flex-col bg-background">
          {/* Header */}
          {headerActive === "cb-header-2" && (
            <div className="shrink-0 flex items-center justify-between px-6 py-4 border-b border-border">
              <div className="flex items-center space-x-3">
                {!isGroupChat && receiverUser?.avatar && (
                  <img
                    src={receiverUser.avatar}
                    alt=""
                    className="w-10 h-10 rounded-full object-cover"
                  />
                )}
                <span className="text-lg font-medium text-black">
                  {isGroupChat ? groupName : receiverUser?.username}
                </span>
              </div>
              <Info color="#00bfff" />
            </div>
          )}

          <div className="flex flex-col flex-1 overflow-hidden">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
              {messages.map((msg, index) => {
                const isOwn = msg.senderId === currentUserId;
                return (
                  <div
                    key={index}
                    className={`flex ${
                      isOwn ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`flex items-end space-x-2 ${
                        isOwn ? "flex-row-reverse" : ""
                      }`}
                    >
                      <img
                        src={msg.senderAvatar}
                        className="w-8 h-8 rounded-full object-cover"
                        alt=""
                      />
                      <div
                        className={`max-w-xs px-4 py-2 rounded-2xl shadow-sm ${
                          isOwn
                            ? "bg-cyan-400 text-primary-foreground rounded-br-none"
                            : "bg-muted text-foreground rounded-bl-none"
                        }`}
                      >
                        {msg.img && (
                          <img
                            src={msg.img}
                            className="max-h-48 rounded-md mb-2 object-cover"
                            alt="sent"
                          />
                        )}
                        {msg.text && <p className="text-sm">{msg.text}</p>}
                        <div className="text-[10px] text-gray-600 mt-1 text-right">
                          {msg.timestamp?.toDate
                            ? new Date(
                                msg.timestamp.toDate()
                              ).toLocaleTimeString()
                            : "Just now"}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={endRef}></div>
            </div>

            {/* Preview Image */}
            {img.url && (
              <div className="shrink-0 relative w-fit bg-muted p-2 rounded-lg m-3">
                <img
                  src={img.url}
                  alt="preview"
                  className="w-24 h-24 object-cover rounded-md"
                />
                <button
                  className="absolute -top-2 -right-2 bg-white text-black rounded-full w-6 h-6 flex items-center justify-center shadow"
                  onClick={() => setImg({ file: null, url: "" })}
                >
                  ×
                </button>
              </div>
            )}

            {/* Input */}
            <div className="shrink-0 flex items-center gap-3 bg-muted px-4 py-3 rounded-full m-4">
              <div>
                <ImageIcon
                  className="w-5 h-5 text-muted-foreground cursor-pointer"
                  onClick={() => document.getElementById("file")?.click()}
                />
                <input
                  id="file"
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImg}
                  onClick={(e) => (e.currentTarget.value = "")}
                />
              </div>
              <Input
                className="flex-1 border-none outline-none focus-visible:ring-0 text-black shadow-none"
                placeholder="Type a message..."
                value={selectedEmoji}
                onChange={(e) => setSelectedEmoji(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
              />
              <div className="relative">
                <Smile
                  className="w-5 h-5 text-muted-foreground cursor-pointer"
                  onClick={() => setOpenEmoji((prev) => !prev)}
                />
                {openEmoji && (
                  <div
                    ref={emojiRef}
                    className="absolute bottom-10 right-0 z-50"
                  >
                    <EmojiPicker onEmojiClick={handleEmojiChange} />
                  </div>
                )}
              </div>
              <Button size="sm" onClick={handleSendMessage}>
                Send
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatBox;
