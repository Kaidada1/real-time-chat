import { AlertDialogHeader } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTitle,
} from "@radix-ui/react-alert-dialog";
import React from "react";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

const AddToGroup = ({ isOpen, onClose }: Props) => {
  return (
    <AlertDialog open={isOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Thêm người dùng</AlertDialogTitle>
        </AlertDialogHeader>
        <form className="flex gap-3 mb-4">
          <Input
            placeholder="Tìm người dùng"
          />
          <Button type="submit">Tìm</Button>
        </form>
        <div className="flex justify-end mt-6">
          <Button variant="outline" onClick={onClose}>
            Đóng
          </Button>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default AddToGroup;
