import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { db } from "@/lib/firebase";

import { Label } from "@radix-ui/react-label";
import {
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  where,
} from "firebase/firestore";
import React, { useState } from "react";

interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
}

interface AddFriendProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserId: string;
}

const AddFriend = ({ isOpen, onClose, currentUserId }: AddFriendProps) => {
  const [email, setEmail] = useState("");
  const [searchResult, setSearchResult] = useState<User | null>(null);
  const [error, setError] = useState("");

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSearchResult(null);

    try {
      const q = query(collection(db, "users"), where("email", "==", email));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const userDoc = snapshot.docs[0];
        const data = userDoc.data();
        if (userDoc.id === currentUserId) {
          setError("You can't add yourself.");
          return;
        }
        setSearchResult({
          id: userDoc.id,
          email: data.email,
          name: data.username,
          avatar: data.avatar,
        });
      } else {
        setError("No user found with that email.");
      }
    } catch (err) {
      setError("Something went wrong.");
    }
  };

  const handleSendFriendRequest = async () => {
    if (!searchResult) return;

    try {
      const q = query(
        collection(db, "friends"),
        where("receiver", "in", [currentUserId, searchResult.id]),
        where("sender", "in", [currentUserId, searchResult.id])
      );
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        setError("Friend request already exists or you're already friends.");
        return;
      }

      await setDoc(doc(collection(db, "friends")), {
        receiver: searchResult.id,
        sender: currentUserId,
        status: "waiting",
        sentAt: serverTimestamp(),
      });

      setError("Friend request sent!");
      setSearchResult(null);
      setEmail("");
    } catch (err) {
      setError("Failed to send friend request.");
    }
  };

  return (
    <AlertDialog open={isOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Add a Friend</AlertDialogTitle>
        </AlertDialogHeader>
        <form onSubmit={handleSearch} className="flex gap-2 mb-4">
          <Input
            placeholder="Enter email to search"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Button type="submit">Search</Button>
        </form>

        {error && <p className="text-red-600 text-sm">{error}</p>}

        {searchResult && (
          <div className="flex items-center justify-between bg-gray-100 p-2 rounded">
            <div className="flex items-center gap-2">
              <img
                src={searchResult.avatar || ""}
                alt="avatar"
                className="w-10 h-10 rounded-full"
              />
              <Label>{searchResult.name}</Label>
            </div>
            <Button onClick={handleSendFriendRequest}>Send Request</Button>
          </div>
        )}

        <div className="flex justify-end mt-6">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default AddFriend;
