import React from 'react'
import "./chatlist.css"

type Props = {
  setHeaderActive: React.Dispatch<React.SetStateAction<'cb-header-1' | 'cb-header-2'>>;
}

const ChatList = (props: Props) => {
  const { setHeaderActive } = props;

  const handleClick = () => {
    setHeaderActive('cb-header-1');
  };

  const handleChat  = ()=>{
    setHeaderActive('cb-header-2')
  }

  return (
    <div className='chat-list'>
        <div className='search-bar'>
          <input className='search-input' type='text' placeholder='search'/>
        </div>
        <div className='friend' onClick={handleClick} style={{cursor: 'pointer'}}>
          <span>Friend</span>
        </div>
        <div className='list-mess' onClick={handleChat} style={{cursor: 'pointer'}}>
          <img className='avt' src='./fuxuan.webp' alt=''/>
          <div className='chat-preview'>
            <span>Fuxuan</span>
            <p>Ka1dada</p>
          </div>
        </div>
    </div>
  )
}

export default ChatList;
