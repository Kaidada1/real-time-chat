import React from 'react'
import "./adduser.css"

type Props = {}

const AddUser = (props: Props) => {
  return (
    <div className='add-user'>
        <form>           
            <input type='text' placeholder='Username' name='username'/>
            <button>Search</button>
        </form>
        <div className='user'>
            <div className='detail'>
                <img src='' alt=''/>
                <span>Fuxuan</span>
            </div>
            <button>Add</button>
        </div>
    </div>
  )
}

export default AddUser;