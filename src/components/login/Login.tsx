import { toast } from "react-toastify";
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth, db } from "../../lib/firebase";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { doc, getDoc, setDoc } from "firebase/firestore";

type Props = {
  onToggleSignup?: () => void;
};

const Login = (props: Props) => {
  const { onToggleSignup } = props;

  const handleLogin = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const formDataObj = Object.fromEntries(formData);
    const email = formDataObj.email as string;
    const password = formDataObj.password as string;

    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

 const handleGoogleLogin = async () => {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    // Kiểm tra xem user đã tồn tại trong Firestore chưa
    const userDocRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userDocRef);

    if (!userSnap.exists()) {
      // Nếu chưa, tạo mới user
      await setDoc(userDocRef, {
        uid: user.uid,
        name: user.displayName,
        email: user.email,
        avatar: user.photoURL,
        createdAt: new Date(),
      });
    }

    toast.success("Logged in with Google!");
  } catch (err: any) {
    toast.error(err.message);
  }
};

  return (
    <div className="fixed top-0 left-0 w-screen h-screen bg-white flex justify-center items-center z-50">
      <div className="w-[400px] max-w-[90vw] bg-gray-700 border border-gray-400 p-8 flex flex-col items-center gap-5 shadow-lg overflow-hidden">
        <div className="flex flex-1 flex-col items-center gap-5 justify-center w-full">
          <form onSubmit={handleLogin} className="flex flex-col gap-4 w-full">
            <h4 className="text-white">Email:</h4>
            <Input
              type="text"
              placeholder="email"
              name="email"
              className="bg-[#1F1F23] text-white rounded-md p-2 border-none outline-none text-base transition-shadow duration-300 w-full"
            />
            <h4 className="text-white">Password:</h4>
            <Input
              type="password"
              placeholder="password"
              name="password"
              className="bg-[#1F1F23] text-white rounded-md p-2 border-none outline-none text-base transition-shadow duration-300 w-full"
            />
            <div className="flex justify-center my-5 ">
              <Button className="bg-red-600" type="submit">Sign In</Button>
            </div>
          </form>

          <div className="mt-2 text-center">
            <Button
              onClick={handleGoogleLogin}
              className="bg-red-600 text-white font-bold rounded-md px-4 py-2 cursor-pointer"
            >
              Sign In with Google
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-5 mb-5 items-center w-full text-white">
          <span>Don't have Account?</span>
          <Button
            onClick={onToggleSignup}
            className="bg-cyan-600 text-white rounded-md px-4 py-2 cursor-pointer"
          >
            Sign Up
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Login;
