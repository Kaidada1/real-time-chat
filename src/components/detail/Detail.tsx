import { db, storage } from "@/lib/firebase";
import { doc, getDoc, DocumentData } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionTrigger } from "../ui/accordion";
import { AccordionItem } from "@radix-ui/react-accordion";
import AddToGroup from "./addtogroup/addToGroup";

type Props = {
  detailView: false;
  chatId: string;
  currentUserId: string;
};

const Detail = ({ chatId, currentUserId }: Props) => {
  const [groupName, setGroupName] = useState("");
  const [receiverUser, setReceiverUser] = useState<DocumentData | null>(null);
  const [isGroupChat, setIsGroupChat] = useState(false);
  const [addMode, setAddMode] = useState(false);

  useEffect(() => {
    if (!chatId || !currentUserId) return;

    const fetchChatInfo = async () => {
      const chatDoc = await getDoc(doc(db, "conversations", chatId));
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

  return (
    <div className="h-full w-full bg-[#111827] text-white p-6 flex flex-col gap-6">
      {/* <div className="flex flex-col items-center">
        {!isGroupChat && receiverUser?.avatar && (
          <img
            src={receiverUser.avatar}
            alt=""
            className="w-40 h-40 rounded-full object-cover"
          />
        )}
        <h2 className="text-xl font-semibold mt-3">
          {isGroupChat ? groupName : receiverUser?.username}
        </h2>
      </div> */}

      <div className="flex flex-col gap-4">
        <Accordion
          type="single"
          collapsible
          defaultValue="item-1"
          className="w-full"
        >
          <AccordionItem value="item-1">
            <AccordionTrigger>Chat Setting</AccordionTrigger>
            <AccordionContent></AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger>Privacy</AccordionTrigger>
            <AccordionContent>
              <Button
                className="w-full"
                onClick={() => setAddMode((prev) => !prev)}
              >
                Add Member
              </Button>
              {addMode && (
                <AddToGroup
                  isOpen={addMode}
                  onClose={() => setAddMode(false)}
                />
              )}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
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
