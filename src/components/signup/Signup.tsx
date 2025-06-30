import React from 'react'
import "./signup.css"
import { toast } from 'react-toastify'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { auth, db } from '../../lib/firebase'
import { doc, setDoc } from 'firebase/firestore'
import upload from '../../lib/upload'

type Props = {
  onToggleLogin?: () => void
}

const Signup = (props: Props) => {
  const { onToggleLogin } = props
  type AvatarType = {
    file: File | null
    url: string
  }

  const [avatar, setAvatar] = React.useState<AvatarType>({
    file: null,
    url: ""
  })

  const handleAvatar = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAvatar({
        file: e.target.files[0],
        url: URL.createObjectURL(e.target.files[0])
      })
    }
  }

  const handleRegister = async (e: any) =>{
    e.preventDefault()
    const formData = new FormData(e.target)

    const formDataObj = Object.fromEntries(formData)
    const username = formDataObj.username as string
    const email = formDataObj.email as string
    const password = formDataObj.password as string

    if (!email || !password) {
      toast.error("Email and password are required")
      return
    }
    
    try{
      const res =await createUserWithEmailAndPassword(auth,email,password)

      const imgUrl = await upload(avatar.file)

      await setDoc(doc(db,"users",res.user.uid),{
        avatar:imgUrl,
        username,
        email,
        id: res.user.uid,
        blocked:[],
      });

      await setDoc(doc(db, "userchats", res.user.uid),{
        chats:[
          
        ]
      });

      toast.success("User created successfully")
      
    }catch(err:any){
      toast.error(err.message)
    }
  }

  return (
    <div className='display-signup'>
      <div className='signup-box'>
        <div className='item'>
          <form action="" onSubmit={handleRegister}>
            <div className='avt'>
              <label htmlFor="file">
              <img src={avatar.url} alt=''/>
                Upload Avatar
              </label>
              <input type='file' id='file' style={{display:"none"}}
                onChange={handleAvatar}/>
            </div>
            <div>
                <h4>UserName: </h4>
                <input type="text"  placeholder='username' name='username'/>
            </div>
            <div>
                <h4>Email: </h4>
                <input type="email" placeholder='email' name='email'/>
            </div>
            <div>
                <h4>Password: </h4>
                <input type="password" placeholder='password' name='password'/>
            </div>
          <div className='signup-btn'>
              <button>Sign Up</button>
          </div>
          </form>
        </div>
        <div className='signin-btn'>
            <button onClick={onToggleLogin}>Sign In</button>
        </div>
      </div>
    </div>
  )
}

export default Signup
