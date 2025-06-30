import React from 'react';
import "./ChatBox.css";
import EmojiPicker from 'emoji-picker-react';
import AddUser from './adduser/addUser';
import { signOut } from 'firebase/auth';
import { auth } from '../../lib/firebase';

type Props = {
  headerActive: 'cb-header-1' | 'cb-header-2';
}

const ChatBox = (props: Props) => {
  const { headerActive } = props;
  const [openEmoji, setOpenEmoji] = React.useState(false);
  const [selectedEmoji, setSelectedEmoji] = React.useState("");
  const [addMode, setAddMode] = React.useState(false);

  const handleEmojiChange = (e: { emoji: string; }) => {
    setSelectedEmoji((prev) => prev + e.emoji);
  }

  const handleLogout = () => {
    signOut(auth).catch((error) => {
      console.error("Error signing out: ", error);
    });
  };

  return (
    <div className='cb-body'>
      {headerActive === 'cb-header-1' && (
      <div className='display-listfr'>
        <div className='cb-header-1'>
          <button className='addfr-btn'
          onClick={()=> setAddMode((prev=>!prev))}
          >Add</button>
          <button className='logout-btn' onClick={handleLogout}>Log Out</button>
        </div>
        {addMode&&<AddUser/>}
      </div>
      )}
      {headerActive === 'cb-header-2' && (
      <div className='display-chat'>
        <div className='cb-header-2'>
          <div className='user-info'>
            <img src='./fuxuan.webp' alt=''/>
            <div>
              <span>Fuxuan</span>
            </div>
          </div>
          <div className='icons'>

          </div>
        </div>
        <div className='mess-box'>
          <div className='message'>
            <img src='./catavt.png' alt=''/>
            <div className='texts'>
              <span>1 min ago</span>
              <p>
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Soluta vel earum dicta itaque quo molestias, ullam omnis cupiditate doloribus voluptatem distinctio quia architecto officiis illo magni, sit autem provident a.
              </p>
            </div>
          </div>
          <div className='message-own'>
            <img src='./fuxuan.webp' alt=''/>
            <div className='texts'>
              <span>1 min ago</span>
              <p>
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Soluta vel earum dicta itaque quo molestias, ullam omnis cupiditate doloribus voluptatem distinctio quia architecto officiis illo magni, sit autem provident a.
              </p>
            </div>
          </div>
        </div>
        <div className='footer'>
            <div className='chat-input'>
              <div className='more-icons'></div>
              <input type='text' placeholder='Type a message...'
              value={selectedEmoji}
              onChange={(e) => setSelectedEmoji(e.target.value)}
              />
              <div className='emoji'onClick={()=>setOpenEmoji(prev => !prev)}>
                <img src='./emoji.webp' alt='' />
                <div className='picked'>
                  <EmojiPicker open={openEmoji} onEmojiClick={handleEmojiChange}/>
                </div>
              </div>
              <button className='send'>Send</button>
          </div>
        </div>
      </div>
      )}
    </div>
  )
}

export default ChatBox;
