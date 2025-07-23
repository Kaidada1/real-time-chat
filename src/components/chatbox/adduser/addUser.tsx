import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { db } from "../../../lib/firebase";
import {
  collection,
  doc,
  getDocs,
  query,
  setDoc,
  where,
  serverTimestamp,
} from "firebase/firestore";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@radix-ui/react-label";

interface User {
  id: string;
  name?: string;
  avatarUrl?: string;
}

interface AddUserProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserId: string;
}

const AddUser = ({ isOpen, onClose, currentUserId }: AddUserProps) => {
  const [username, setUsername] = useState("");
  const [searchResult, setSearchResult] = useState<User | null>(null);
  const [error, setError] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [groupName, setGroupName] = useState("");

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSearchResult(null);

    const q = query(collection(db, "users"), where("username", "==", username));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      setSearchResult({
        id: doc.id,
        name: doc.data().username,
        avatarUrl: doc.data().avatar,
      });
    } else {
      setError("Error");
    }
  };

  const handleAddUser = async () => {
    if (!searchResult) return;

    const q = query(
      collection(db, "conversations"),
      where("users", "array-contains", currentUserId)
    );
    const snapshot = await getDocs(q);
    const exists = snapshot.docs.find((docSnap) => {
      const users = docSnap.data().users;
      return users.includes(searchResult.id) && users.length === 2;
    });

    if (!exists) {
      const newDocRef = doc(collection(db, "conversations"));
      await setDoc(newDocRef, {
        users: [currentUserId, searchResult.id],
        messages: [],
        createdAt: serverTimestamp(),
      });
    }

    onClose();
  };

  const handleSelectForGroup = () => {
    if (searchResult && !selectedUsers.find((u) => u.id === searchResult.id)) {
      setSelectedUsers((prev) => [...prev, searchResult]);
    }
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim() || selectedUsers.length < 1) return;

    const userIds = [currentUserId, ...selectedUsers.map((u) => u.id)];
    const newDocRef = doc(collection(db, "conversations"));
    await setDoc(newDocRef, {
      users: userIds,
      groupName,
      isGroup: true,
      messages: [],
      createdAt: serverTimestamp(),
    });

    onClose();
  };

  return (
    <AlertDialog open={isOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Add User</AlertDialogTitle>
        </AlertDialogHeader>
        <form onSubmit={handleSearch} className="flex gap-3 mb-4">
          <Input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Search User"
          />
          <Button type="submit">Search</Button>
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
              <Label>{searchResult.name}</Label>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleAddUser}>Add</Button>
              <Button onClick={handleSelectForGroup}>Add to Group</Button>
            </div>
          </div>
        )}

        {selectedUsers.length > 0 && (
          <div className="mt-4 space-y-2">
            <p>Member:</p>
            <ul>
              {selectedUsers.map((u) => (
                <li key={u.id} className="flex items-center gap-2">
                  <img
                    src={u.avatarUrl || ""}
                    alt={u.name}
                    className="w-6 h-6 rounded-full"
                  />
                  <Label>{u.name}</Label>
                </li>
              ))}
            </ul>
            <div className="flex gap-2 mt-2">
              <Input
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="Group Name"
              />
              <Button onClick={handleCreateGroup}>Create</Button>
            </div>
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

export default AddUser;
