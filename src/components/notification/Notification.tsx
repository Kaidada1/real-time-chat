import React from 'react'
import { ToastContainer } from 'react-toastify'

type Props = {}

const Notification = (props: Props) => {
  return (
    <div className=''>
        <ToastContainer position='bottom-right'/>
    </div>
  )
}

export default Notification