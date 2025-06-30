import React, { useState } from 'react'
import Login from '../login/Login'
import Signup from '../signup/Signup'

const AuthModal = () => {
  const [isLogin, setIsLogin] = useState(true)

  const toggleToSignup = () => {
    setIsLogin(false)
  }

  const toggleToLogin = () => {
    setIsLogin(true)
  }

  return (
    <>
      {isLogin ? (
        <Login onToggleSignup={toggleToSignup} />
      ) : (
        <Signup onToggleLogin={toggleToLogin} />
      )}
    </>
  )
}

export default AuthModal
