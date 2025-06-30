import React, { useEffect, useState } from 'react'
import "./userbar.css"
import { getStorage, getDownloadURL, ref } from "firebase/storage";
import { storage } from '../../../lib/firebase';

type Props = {
  user?: any;
}

const UserBar = (props: Props) => {
  const { user } = props;
  const [avatarUrl, setAvatarUrl] = useState("./catavt.png");

  const displayName = user?.username || "UserName";

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
    <div className='ub-body'>
        <div className='user-info'>
            <img src={avatarUrl} alt='User Avatar' />
            <h2>{displayName}</h2>
        </div>
        <div className='more'>
            <img src='/avt.jpg' alt=''/>
        </div>
    </div>
  )
}

export default UserBar;
