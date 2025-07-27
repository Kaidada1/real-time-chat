import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { db } from "@/lib/firebase";
import { Label } from "@radix-ui/react-label";
import { collection, getDoc, getDocs, query, where } from "firebase/firestore";
import React from "react";

interface User {
  id: string;
  name?: string;
  avatarUrl?: string;
}

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

const AddToGroup = ({ isOpen, onClose }: Props) => {
  const [userName, setUserName] = React.useState("");
  const [searchResult, setSearchResult] = React.useState<User | null>(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    setSearchResult(null);

    const q = query(collection(db, "users"), where("username", "==", userName));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const user = querySnapshot.docs[0].data();
      setSearchResult({
        id: user.id,
        name: user.username,
        avatarUrl: user.avatar,
      });
    }
    console.log("search",searchResult)
  };

  const handleAddMember = async () => {};

  return (
    <Dialog open={isOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Member</DialogTitle>
        </DialogHeader>
        <form className="flex gap-3 mb-4" onSubmit={handleSearch}>
          <Input
            placeholder="Search"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
          />
          <Button type="submit">Find</Button>
        </form>

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
              <Button onClick={handleAddMember}>Add</Button>
            </div>
          </div>
        )}
        <div className="flex justify-end mt-6">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddToGroup;
