import "./login.css"
import { toast } from 'react-toastify'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '../../lib/firebase'

type Props = {
  onToggleSignup?: () => void
}

const Login = (props: Props) => {
  const { onToggleSignup } = props
  const handleLogin = async (e) =>{
    e.preventDefault();  
    const formData = new FormData(e.target);
    const formDataObj = Object.fromEntries(formData);
    const email = formDataObj.email as string;
    const password = formDataObj.password as string;

    try{
      await signInWithEmailAndPassword(auth,email,password );
    }catch(err){
     toast.error(err.message) 
    }
  }

  return (
    <div className='login'>
      <div className='login-box'>
        <div className='item'>
          <form onSubmit={handleLogin}>
              <h4>Email:</h4>
              <input type="text"  placeholder='email'name='email'/>
              <h4>Password: </h4>
              <input type="password" placeholder='password'name='password'/>
              <div className='login-btn'>
              <button>Sign In</button>
              </div>
          </form>
        </div>
        <div className='signup'>
            <span>Don't have Account?</span>
            <button onClick={onToggleSignup}>Sign Up</button>
        </div>
      </div>
    </div>
  )
}

export default Login
