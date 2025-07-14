import { storage } from "@/lib/firebase";
import { getDownloadURL, ref } from "firebase/storage";
import React, { useEffect, useState } from "react";

type Props ={
  user?: any;
}

const Detail = (props : Props) => {
  const {user} = props;
  const [avatarUrl, setAvatarUrl] = useState("");
  const detailName = user?.username;


  useEffect(() => {
      if (user?.avatar) {
        if (user.avatar.startsWith("http")) {
          setAvatarUrl(user.avatar);
        } else {
          const storageRef = ref(storage, user.avatar);
          getDownloadURL(storageRef)
            .then((url) => {
              setAvatarUrl(url);
            })
            .catch(() => {
              setAvatarUrl("./catavt.png");
            });
        }
      } else {
        setAvatarUrl("./catavt.png");
      }
    }, [user]);
  

  return (
    <div className="h-full w-full bg-[#111827] text-white p-6 flex flex-col gap-6">
      {/* Avatar + Username */}
      <div className="flex flex-col items-center">
        <img
          src={avatarUrl}
          alt="User Avatar"
          className="w-24 h-24 rounded-full object-cover border-4 border-indigo-600"
        />
        <h2 className="text-xl font-semibold mt-3">{detailName}</h2>
      </div>

      {/* Settings Section */}
      <div className="flex flex-col gap-4">
        {["Chat setting", "Privacy", "Share files"].map((item) => (
          <div
            key={item}
            className="bg-gray-800 rounded-lg px-4 py-3 hover:bg-gray-700 transition cursor-pointer"
          >
            <span className="text-sm text-white font-medium">{item}</span>
          </div>
        ))}

        {/* Share Photos */}
        <div className="bg-gray-800 rounded-lg px-4 py-3">
          <span className="text-sm text-white font-medium">Share photos</span>

          <div className="mt-3 flex flex-col gap-3">
            {/* You can loop this if dynamic */}
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

      {/* Optional: Block Button */}
      {/* 
      <div className="mt-auto">
        <button className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg">
          Block User
        </button>
      </div> 
      */}
    </div>
  );
};

export default Detail;
