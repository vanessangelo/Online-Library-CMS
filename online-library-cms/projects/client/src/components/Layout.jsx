import React from 'react'
import Navbar from './Navbar'

export default function Layout(props) {
  return (
    <div className='w-full min-h-screen flex flex-col'>
      <Navbar />
      <div className="w-full flex flex-grow justify-center bg-gray-200">
        <div className="w-full flex justify-center">
          {props.children}
        </div>
      </div>
    </div>
  )
}
