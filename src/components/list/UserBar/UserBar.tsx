import React, { useEffect, useState } from 'react'
import "./userbar.css"
import { getDownloadURL, ref } from "firebase/storage";
import { storage } from '../../../lib/firebase';
import { Settings, Sidebar } from 'lucide-react';
import { Button } from '@/components/ui/button';

type Props = {
  user?: any;
}

const UserBar = (props: Props) => {
  const { user } = props;
  const [avatarUrl, setAvatarUrl] = useState("./catavt.png");

  const displayName =user?.name|| user?.username || "UserName";

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
    <div className='flex items-center justify-between p-5 bg-white text-black border-t-2'>
        <div className='flex items-center gap-5'>
            <img src={avatarUrl} alt='User Avatar' className='w-[50px] h-[50px] rounded-full object-cover'/>
            <h2>{displayName}</h2>
        </div>
        <div className='more'>
          <Button size="icon" className="size-8">
            <Settings/>
          </Button>
        </div>
    </div>
  )
}

export default UserBar;
