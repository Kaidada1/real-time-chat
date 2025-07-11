import React from "react";
import { toast } from "react-toastify";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../../lib/firebase";
import { doc, setDoc } from "firebase/firestore";
import upload from "../../lib/upload";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

type Props = {
  onToggleLogin?: () => void;
};

const Signup = (props: Props) => {
  const { onToggleLogin } = props;
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

  const handleRegister = async (e: any) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    const formDataObj = Object.fromEntries(formData);
    const username = formDataObj.username as string;
    const email = formDataObj.email as string;
    const password = formDataObj.password as string;

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
    <div className="fixed inset-0 flex justify-center items-center bg-white z-[1000]">
      <div className="w-[400px] max-w-[90vw] bg-gray-700 border border-gray-300 p-8 flex flex-col items-center gap-5 overflow-hidden shadow-lg">
        <div className="flex flex-col items-center gap-5 justify-center flex-1 w-full">
          <form action="" onSubmit={handleRegister} className="w-full">
            <div className="flex flex-row items-center justify-center pl-15 mb-5 pb-12">
              <label
                htmlFor="file"
                className="flex flex-col items-center cursor-pointer"
              >
                {avatar.url ? (
                  <img
                    src={avatar.url}
                    alt=""
                    className="w-24 h-24 object-cover rounded-full mb-2"
                  />
                ) : (
                  <div className="w-24 h-24 bg-gray-500 rounded-full mb-2 flex justify-center items-center text-white text-center">
                    Upload Avatar
                  </div>
                )}
              </label>
              <input
                type="file"
                id="file"
                style={{ display: "none" }}
                onChange={handleAvatar}
              />
            </div>
            <div className="mb-4">
              <h4 className="text-white mb-1">UserName:</h4>
              <Input
                type="text"
                placeholder="username"
                name="username"
                className="bg-[#1F1F23]"
              />
            </div>
            <div className="mb-4">
              <h4 className="text-white mb-1">Email:</h4>
              <Input
                type="email"
                placeholder="email"
                name="email"
                className="bg-[#1F1F23]"
              />
            </div>
            <div className="mb-4">
              <h4 className="text-white mb-1">Password:</h4>
              <Input
                type="password"
                placeholder="password"
                name="password"
                className="bg-[#1F1F23]"
              />
            </div>
            <div className="flex justify-center my-5">
              <Button className="bg-red-600">Sign Up</Button>
            </div>
          </form>
        </div>
        <div className="flex justify-center w-full">
          <Button
            onClick={onToggleLogin}
            className="bg-cyan-600 text-white rounded-md px-5 py-2.5 cursor-pointer"
          >
            Sign In
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Signup;
