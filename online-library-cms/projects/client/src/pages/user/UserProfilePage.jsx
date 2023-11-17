import React, {useState, useEffect} from 'react';
import axios from 'axios';

import Layout from '../../components/Layout';
import Sidebar from '../../components/Sidebar';

export default function UserProfilePage() {
  const token = localStorage.getItem("token");
  const [userDetails, setUserDetails] = useState({})

  const getUserDetails = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/users/profile`, { headers: { Authorization: `Bearer ${token}` } });
      if (response.data) {
        const data = response.data.data;
        if (data) {
          setUserDetails(data);
        } else {
          setUserDetails({});
        }
      }
    } catch (error) {
      console.warn(error);
    }
  };

  useEffect(() => {
    if(token) {
      getUserDetails()
    }
  }, [token])
  return (
    <Layout>
      <div className='flex flex-col w-11/12 justify-center items-center m-10 bg-white font-inter'>
        <div className='flex w-11/12 h-5/6'>
          <div className='w-full basis-1/5'>
            <div>
              <Sidebar />
            </div>
          </div>
          {userDetails ? (
          <div className='w-full basis-4/5 grid pl-16 gap-8'>
            <div className='w-full text-center text-5xl font-bold text-blue-800 grid content-center'> User Information </div>
            <div className='grid content-center'>
              <div className='text-2xl'>Name</div>
              <div className='text-3xl font-semibold pl-5'>{userDetails.name}</div>
            </div>
            <div className='grid content-center'>
              <div className='text-2xl'>Username</div>
              <div className='text-3xl font-semibold pl-5'> {userDetails.username}</div>
            </div>
            <div className='grid content-center'>
              <div className='text-2xl'>Email</div>
              <div className='text-3xl font-semibold pl-5'>{userDetails.email}</div>
            </div>
          </div>
          ) : ( <div className="text-blue-600 text-center mx-auto px-5">Loading...</div> )}
        </div>
      </div>
    </Layout>
  )
}
