import React from "react";
import { toast } from "react-toastify";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../../lib/firebase";
import { doc, setDoc } from "firebase/firestore";
import upload from "../../lib/upload";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Label } from "@radix-ui/react-label";

type Props = {
  onToggleLogin?: () => void;
};

const Signup = ({ onToggleLogin }: Props) => {
  type AvatarType = {
    file: File | null;
    url: string;
  };

  const [avatar, setAvatar] = React.useState<AvatarType>({
    file: null,
    url: "",
  });

  const handleAvatar = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAvatar({
        file: e.target.files[0],
        url: URL.createObjectURL(e.target.files[0]),
      });
    }
  };

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const username = formData.get("username") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!email || !password) {
      toast.error("Email and password are required");
      return;
    }

    try {
      const res = await createUserWithEmailAndPassword(auth, email, password);
      const imgUrl = await upload(avatar.file);

      await setDoc(doc(db, "users", res.user.uid), {
        avatar: imgUrl,
        username,
        email,
        id: res.user.uid,
        blocked: [],
      });

      await setDoc(doc(db, "userchats", res.user.uid), {
        chats: [],
      });

      toast.success("User created successfully");
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <div className="min-h-screen max-w-screen-xl flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-xl w-[80vw] max-w-md p-8 flex flex-col gap-6 items-center">
        <h2 className="text-3xl font-bold text-gray-800">Sign Up</h2>

        <form onSubmit={handleRegister} className="w-full flex flex-col gap-4">
          <div className="flex justify-center">
            <Label htmlFor="file" className="cursor-pointer flex flex-col items-center">
              {avatar.url ? (
                <img
                  src={avatar.url}
                  alt="Avatar"
                  className="w-24 h-24 object-cover rounded-full"
                />
              ) : (
                <div className="w-24 h-24 bg-gray-300 text-sm text-gray-600 rounded-full flex items-center justify-center">
                  Upload Avatar
                </div>
              )}
            </Label>
            <Input
              type="file"
              id="file"
              style={{ display: "none" }}
              onChange={handleAvatar}
            />
          </div>

          <div>
            <Label className="text-sm text-gray-600">Username</Label>
            <Input
              type="text"
              name="username"
              placeholder="Enter your username"
              className="mt-1 text-black"
            />
          </div>

          <div>
            <Label className="text-sm text-gray-600">Email</Label>
            <Input
              type="email"
              name="email"
              placeholder="Enter your email"
              className="mt-1 text-black"
            />
          </div>

          <div>
            <Label className="text-sm text-gray-600">Password</Label>
            <Input
              type="password"
              name="password"
              placeholder="Enter your password"
              className="mt-1 text-black"
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-cyan-400 to-pink-500 text-white font-bold py-2 rounded-full hover:opacity-90 transition"
          >
            Sign Up
          </Button>
        </form>

        <div className="text-sm text-gray-500 mt-2">Already have an account?</div>

        <Button
          onClick={onToggleLogin}
          variant="link"
          className="text-pink-500 font-semibold hover:underline"
        >
          SIGN IN
        </Button>
      </div>
    </div>
  );
};

export default Signup;
