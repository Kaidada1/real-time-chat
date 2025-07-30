import React, { useEffect, useState } from 'react'
import "./userbar.css"
import { getDownloadURL, ref } from "firebase/storage";
import { auth, storage } from '../../../lib/firebase';
import { LogOutIcon, Settings, User2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuShortcut, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { signOut } from 'firebase/auth';
import { Label } from '@radix-ui/react-label';

type Props = {
  user?: any;
}

const UserBar = (props: Props) => {
  const { user } = props;
  const [avatarUrl, setAvatarUrl] = useState("./catavt.png");

  const displayName = user?.username || "UserName";

  const handleLogout = () => {
    signOut(auth).catch()
  }

  const handleProfile = () => {
    window.location.href = "/profile";
  }

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
        <img src={avatarUrl} alt='User Avatar' className='w-[50px] h-[50px] rounded-full object-cover' />
        <Label className='text-2xl'>{displayName}</Label>
      </div>
      <div className='more'>
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Button size="icon" className="size-8 bg-white hover:bg-gray-200 shadow-none" >
              <Settings color='black' className='border-none' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={handleProfile}>
              Profile
              <DropdownMenuShortcut>
                <User2 className="mr-2 h-4 w-4"/>
              </DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleLogout}>
              LogOut
              <DropdownMenuShortcut>
                <LogOutIcon className="mr-2 h-4 w-4" />
              </DropdownMenuShortcut>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}

export default UserBar;
