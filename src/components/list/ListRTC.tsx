import React from 'react'
import "./listrtc.css"
import ChatList from './ChatList/ChatList'
import UserBar from './UserBar/UserBar'

type Props = {
  setHeaderActive: React.Dispatch<React.SetStateAction<'cb-header-1' | 'cb-header-2'>>;
  setChatId: React.Dispatch<React.SetStateAction<string>>;
  user?: any;
}

const ListRTC = (props: Props) => {
  const { setHeaderActive, user, setChatId } = props;
  return (
    <div className='list-body'>
        <ChatList
          setHeaderActive={setHeaderActive}
          userId={user?.id || user?.uid || ''}
          setChatId={setChatId}
        />
        <div className='user-bar'>
            <UserBar user={user} />
        </div>
    </div>
  )
}

export default ListRTC;
