import React from 'react'
import "./detail.css"

type Props = {}

const Detail = (props: Props) => {
  return (
    <div className='dt-body'>
      <div className='user'>
        <img src='./fuxuan.webp' alt=''/>
        <h2>Fuxuan</h2>
      </div>
      <div className='info'>
        <div className='option'>
          <div className='title'>
            <span>Chat setting</span>
          </div>
        </div>
        <div className='option'>
          <div className='title'>
            <span>Privacy</span>
          </div>
        </div>
        <div className='option'>
          <div className='title'>
            <span>Share files</span>
          </div>
        </div>
        <div className='option'>
          <div className='title'>
            <span>Share photos</span>
          </div>
          <div className='photos'>
            <div className='item-photo'>
              <div className='photo-detail'>
                <img src="./logo192.png" alt="" />
                <span>2025_7.png</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* <div className='block-btn'>
        <button>Block User</button>
      </div> */}
    </div>
    
  )
}

export default Detail;