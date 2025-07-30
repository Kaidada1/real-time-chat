import React, { useEffect, useId, useState } from 'react'
import { Avatar, AvatarImage } from '../ui/avatar'
import { Label } from '@radix-ui/react-label'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { Upload } from 'lucide-react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card'
import { onAuthStateChanged } from 'firebase/auth'
import { auth, db } from '@/lib/firebase'
import { doc, getDoc, updateDoc } from 'firebase/firestore'

type Props = {}

const Profile = (props: Props) => {
    const [userName, setUserName] = useState("");
    const [userEmail, setUserEmail] = useState("");
    const [userAvatar, setUserAvatar] = useState("");
    const [avatar, setAvatar] = useState(null);
    const [userId, setUserId] = useState<String | null>(null);

    const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (userId) {
            const userRef = doc(db, "users", userId as string);
            await updateDoc(userRef, {
                userName: userName,
            })
            alert("Profile updated!");
        }
    }

    const handleProfile = () => {
        window.location.href = "/";
    }
    useEffect(() => {
        const unsub = onAuthStateChanged(auth, async (user) => {
            if (user) {
                setUserId(user.uid);
                setUserEmail(user.email);
                const userRef = doc(db, "users", user.uid)
                const userDoc = await getDoc(userRef)
                if (userDoc.exists()) {
                    const data = userDoc.data()
                    setUserName(data.username || "User")
                    setUserAvatar(data.avatar)
                }
            }
        })
        return unsub;
    }, [])

    return (
        <Card className='w-[550px] h-[700px] bg-white'>
            <CardHeader>
                <CardTitle>Profile</CardTitle>
                <CardDescription>
                    Profile information
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSave}>
                    <div className='flex flex-col gap-4'>
                        <div className='flex gap-4 justify-between items-center'>
                            <div>
                                <Label>Avatar</Label>
                                <Avatar className='w-[150px] h-[150px]'>
                                    <AvatarImage src={userAvatar} />
                                </Avatar>
                            </div>

                        </div>
                        <div className='flex flex-col gap-4'>
                            <Label>Username:</Label>
                            <Input type='text'
                                value={userName}
                                onChange={(e) => setUserName(e.target.value)}
                            />
                        </div>
                        <div className='flex flex-col gap-4'>
                            <Label>Email:</Label>
                            <Input type='email' value={userEmail} disabled />
                        </div>
                    </div>
                </form>
            </CardContent>
            <CardFooter className='flex justify-between'>
                <Button type='submit'>Save</Button>
                <Button onClick={handleProfile}>Cancel</Button>
            </CardFooter>
        </Card>
    )
}

export default Profile