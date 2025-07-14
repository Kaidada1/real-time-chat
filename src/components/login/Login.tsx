import { toast } from "react-toastify";
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { auth, db } from "../../lib/firebase";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { doc, getDoc, setDoc } from "firebase/firestore";

type Props = {
  onToggleSignup?: () => void;
};

const Login = ({ onToggleSignup }: Props) => {
  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success("Logged in!");
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const userDocRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userDocRef);

      if (!userSnap.exists()) {
        await setDoc(userDocRef, {
          avatar: user.photoURL,
          username: user.displayName || "No Name",
          email: user.email,
          id: user.uid,
          blocked: [],
        });
      }

      toast.success("Logged in with Google!");
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <div className="min-h-screen max-w-screen-xl flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-xl w-[80vw] max-w-md p-8 flex flex-col gap-6 items-center">
        <h2 className="text-3xl font-bold text-gray-800">Login</h2>

        <form onSubmit={handleLogin} className="w-full flex flex-col gap-4">
          <div>
            <label className="text-sm text-gray-600">Username</label>
            <Input
              type="text"
              name="email"
              placeholder="Type your username"
              className="mt-1 text-black"
            />
          </div>

          <div>
            <label className="text-sm text-gray-600">Password</label>
            <Input
              type="password"
              name="password"
              placeholder="Type your password"
              className="mt-1 text-black"
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-cyan-400 to-pink-500 text-white font-bold py-2 rounded-full hover:opacity-90 transition"
          >
            LOGIN
          </Button>
        </form>

        <div className="text-sm text-gray-500">Or Sign Up Using</div>

        <div className="flex gap-4">
          <button
            onClick={handleGoogleLogin}
            className="bg-red-600 text-white font-bold px-4 py-2 rounded-md shadow hover:opacity-90 transition"
          >
            Google
          </button>
        </div>

        <div className="text-sm text-gray-500 mt-4">Or Sign Up Using</div>
        <button
          onClick={onToggleSignup}
          className="text-pink-500 font-semibold hover:underline"
        >
          SIGN UP
        </button>
      </div>
    </div>
  );
};

export default Login;
