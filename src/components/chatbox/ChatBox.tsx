import React, { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Smile,
  ImageIcon,
  PlusIcon,
  Info,
  Check,
  X,
  User,
} from "lucide-react";
import EmojiPicker from "emoji-picker-react";
import AddUser from "./adduser/addUser";
import { db } from "../../lib/firebase";
import {
  doc,
  onSnapshot,
  getDoc,
  setDoc,
  arrayUnion,
  updateDoc,
  serverTimestamp,
  query,
  collection,
  getDocs,
  deleteDoc,
} from "firebase/firestore";
import upload from "../../lib/upload";
import { Label } from "@radix-ui/react-label";
import { ScrollArea } from "../ui/scroll-area";
import AddFriend from "./addfriend/addFriend";
import { Avatar, AvatarImage } from "../ui/avatar";

type Props = {
  setDetailView: React.Dispatch<React.SetStateAction<boolean>>;
  headerActive: "cb-header-1" | "cb-header-2";
  currentUserId: string;
  chatId: string;
};

const ChatBox = ({
  headerActive,
  currentUserId,
  chatId,
  setDetailView,
}: Props) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [receiverUser, setReceiverUser] = useState<any | null>(null);
  const [friendRequests, setFriendRequests] = useState<any[]>([]);
  const [groupName, setGroupName] = useState("");
  const [selectedEmoji, setSelectedEmoji] = useState("");
  const [isGroupChat, setIsGroupChat] = useState(false);
  const [addMode, setAddMode] = useState(false);
  const [addFriends, setAddFriend] = useState(false);
  const [openEmoji, setOpenEmoji] = useState(false);
  const [img, setImg] = useState({ file: null, url: "" });

  const endRef = useRef<HTMLDivElement>(null);
  const emojiRef = useRef<HTMLDivElement>(null);

  const handleEmojiChange = (e: { emoji: string }) => {
    setSelectedEmoji((prev) => prev + e.emoji);
  };



  const handleImg = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImg({
        file: e.target.files[0],
        url: URL.createObjectURL(e.target.files[0]),
      });
    }
  };

  const fetchFriendRequests = async () => {
    const q = query(collection(db, "friends"));
    const snapshot = await getDocs(q);

    const requests = await Promise.all(
      snapshot.docs
        .map((doc) => ({ id: doc.id, ...(doc.data() as any) }))
        .filter(
          (doc) => doc.status === "waiting" && doc.receiver === currentUserId
        )
        .map(async (request) => {
          const senderDoc = await getDoc(doc(db, "users", request.sender));
          const senderData = senderDoc.exists() ? senderDoc.data() : null;
          return {
            ...request,
            name: senderData?.username || "Unknown",
            avatar: senderData?.avatar,
          };
        })
    );

    setFriendRequests(requests);
  };

  const handleAccept = async (id: any) => {
    updateDoc(doc(db, "friends", id), { status: "accepted" });

    const friendDoc = await getDoc(doc(db, "friends", id));
    if (!friendDoc.exists) return;

    const senderId = friendDoc.data().sender;

    const newDocRef = doc(collection(db, "conversations"));
    await setDoc(newDocRef, {
      users: [currentUserId, senderId],
      messages: [],
      createdAt: serverTimestamp(),
    });
  };
  const handleReject = (id: any) => {
    deleteDoc(doc(db, "friends", id));
  };

  const handleSendMessage = async () => {
    if ((!selectedEmoji.trim() && !img.file) || !chatId) return;

    const textToSend = selectedEmoji;
    const imgToSend = img;
    setSelectedEmoji("");
    setImg({ file: null, url: "" });

    try {
      let imgUrl: string | null = null;
      if (imgToSend.file) {
        imgUrl = await upload(imgToSend.file);
      }

      const userDoc = await getDoc(doc(db, "users", currentUserId));
      const senderAvatar = userDoc.exists() ? userDoc.data().avatar : null;

      const newMessage = {
        message: textToSend,
        sender: currentUserId,
        avatar: senderAvatar,
        sentAt: new Date(),
        ...(imgUrl && { img: imgUrl }),
      };

      const convRef = doc(db, "conversations", chatId);
      await setDoc(
        convRef,
        {
          messages: arrayUnion(newMessage),
          users: arrayUnion(currentUserId),
        },
        { merge: true }
      );
    } catch (error) {
      console.error("Failed to send:", error);
    }
  };

  useEffect(() => {
    if (!chatId) return;
    const unsub = onSnapshot(doc(db, "conversations", chatId), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setMessages(data.messages || []);
        setIsGroupChat((data.users?.length || 0) > 2);

        if (data.groupName) {
          setGroupName(data.groupName);
        }
      }
    });
    return () => unsub();
  }, [chatId]);

  useEffect(() => {
    const fetchReceiver = async () => {
      if (!chatId || !currentUserId) return;
      const docSnap = await getDoc(doc(db, "conversations", chatId));
      if (!docSnap.exists()) return;
      const data = docSnap.data();
      const otherUserId = data.users?.find(
        (id: string) => id !== currentUserId
      );
      if (otherUserId) {
        const userDoc = await getDoc(doc(db, "users", otherUserId));
        if (userDoc.exists()) {
          setReceiverUser(userDoc.data());
        }
      }

      const userDoc = await getDoc(doc(db, "users", otherUserId));
      const userData = userDoc.exists() ? userDoc.data() : null;
      const friendSnap = await getDocs(collection(db, "friends"));
      const matchingFriend = friendSnap.docs.find((doc) => {
        const d = doc.data();
        return (
          ((d.sender === currentUserId && d.receiver === otherUserId) ||
            (d.sender === otherUserId && d.receiver === currentUserId))
        );
      });

      const isFriend = matchingFriend?.data().status === "accepted";

      if (userData) {
        setReceiverUser({
          username: userData.username,
          avatar: userData.avatar,
          isFriend,
        });
      }
    };
    fetchReceiver();
  }, [chatId, currentUserId]);

  useEffect(() => {
    fetchFriendRequests();
  }, [currentUserId]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (emojiRef.current && !emojiRef.current.contains(e.target as Node)) {
        setOpenEmoji(false);
      }
    };
    if (openEmoji) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openEmoji]);

  return (
    <div className="flex flex-col h-full overflow-hidden bg-background">
      {headerActive === "cb-header-1" && (
        <div>
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <Button
              onClick={() => setAddMode((prev) => !prev)}
              variant="default"
            >
              <PlusIcon className="mr-2 h-4 w-4" /> Add
            </Button>
            <Button
              onClick={() => setAddFriend((prev) => !prev)}
              variant="default"
            >
              <User className="mr-2 h-4 w-4" /> Add Friend
            </Button>

            {addMode && (
              <AddUser
                currentUserId={currentUserId}
                isOpen={addMode}
                onClose={() => setAddMode(false)}
              />
            )}
            {addFriends && (
              <AddFriend
                currentUserId={currentUserId}
                isOpen={addFriends}
                onClose={() => setAddFriend(false)}
              />
            )}
          </div>
          {friendRequests.length > 0 && (
            <div className="flex justify-center mt-3">
              <Label className="text-black">Friend Requests</Label>
            </div>
          )}

          {friendRequests.map((request) => (
            <div
              key={request.id}
              className="flex w-[95%] items-center m-3 justify-between"
            >
              <div className="flex justify-center items-center">
                <Avatar className="mx-4">
                  <AvatarImage src={request.avatar} />
                </Avatar>
                <Label className="text-black">{request.name}</Label>
              </div>
              <div className="flex gap-2">
                <Button
                  className="rounded-full bg-white shadow-none w-8 h-8 hover:bg-slate-200"
                  onClick={() => handleReject(request.id)}
                >
                  <X color="#E5484D" />
                </Button>
                <Button
                  className="rounded-full bg-white shadow-none w-8 h-8 hover:bg-slate-200"
                  onClick={() => handleAccept(request.id)}
                >
                  <Check color="#3DD68C" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {headerActive === "cb-header-2" && (
        <div className="w-full h-full flex flex-col bg-background">
          {/* Header */}
          <div className="shrink-0 flex items-center justify-between px-6 py-4 border-b border-border">
            <div className="flex items-center space-x-3">
              {!isGroupChat && receiverUser?.avatar && (
                <Avatar className="mx-4">
                  <AvatarImage src={receiverUser.avatar} />
                </Avatar>
              )}
              <div className="flex flex-col leading-tight">
                <Label className="text-lg font-medium text-black">
                  {isGroupChat ? groupName : receiverUser?.username}
                </Label>
                {!isGroupChat && receiverUser && !receiverUser.isFriend && (
                  <Label className="text-sm text-muted-foreground">Stranger</Label>
                )}
              </div>
            </div>
            <Info
              color="#00bfff"
              onClick={() => setDetailView((prev) => !prev)}
            />
          </div>

          <div className="flex flex-col flex-1 overflow-hidden">
            {/* Messages */}
            <ScrollArea className="h-full">
              <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
                {messages.map((msg, index) => {
                  const isOwn = msg.sender === currentUserId;
                  return (
                    <div
                      key={index}
                      className={`flex ${isOwn ? "justify-end" : "justify-start"
                        }`}
                    >
                      <div
                        className={`flex items-end ${isOwn ? "flex-row-reverse" : ""
                          }`}
                      >
                        <Avatar>
                          <AvatarImage src={msg.avatar} />
                        </Avatar>
                        <div
                          className={`max-w-xs px-4 py-2 rounded-2xl shadow-sm ${isOwn
                            ? "bg-cyan-400 text-primary-foreground rounded mr-2"
                            : "bg-zinc-300 text-foreground rounded ml-2"
                            }`}
                        >
                          {msg.img && (
                            <img
                              src={msg.img}
                              className="max-h-48 rounded-md mb-2 object-cover"
                              alt="sent"
                            />
                          )}
                          {msg.message && (
                            <Label className="text-sm">{msg.message}</Label>
                          )}
                          <div className="text-[10px] text-gray-600 mt-1 text-right">
                            {msg.sentAt
                              ? new Date(
                                msg.sentAt.seconds * 1000
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
            </ScrollArea>
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
