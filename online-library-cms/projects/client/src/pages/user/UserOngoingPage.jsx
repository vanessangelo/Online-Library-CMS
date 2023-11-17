import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from "react-router-dom";

import Layout from '../../components/Layout';
import Sidebar from '../../components/Sidebar';
import handleImageError from '../../helpers/handleImageError';
import { useDispatch, useSelector } from 'react-redux';
import { removeOngoingBook, updateIsOngoing } from '../../store/reducer/borrowSlice';

export default function UserOngoingPage() {
  const token = localStorage.getItem("token");
  const [ongoingBook, setOngoingBook] = useState({})
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isOngoing = useSelector((state) => state.borrow.isOngoing);
  const ongoingDetails = useSelector((state) => state.borrow.ongoingBook);

  const getOngoingBook = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/users/borrow-histories/active`, { headers: { Authorization: `Bearer ${token}` } });
      if (response.data) {
        const { data } = response.data;
        if (data) {
          setOngoingBook(data);
        } else {
          setOngoingBook({});
        }
      }
    } catch (error) {
      console.error(error.message);
    }
  }

  const handleReturn = async (e) => {
    e.preventDefault()
    try {
      const response = await axios.patch(`${process.env.REACT_APP_API_BASE_URL}/users/borrow-histories/${ongoingBook.id}`, {}, { headers: { Authorization: `Bearer ${token}` } });
      if (response.data) {
        const data = response.data.data;
        if (data) {
          const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/users/borrow-histories/active`, { headers: { Authorization: `Bearer ${token}` } });
          if (response.data) {
            const { data } = response.data;
            if (Object.keys(data).length === 0) {
              dispatch(removeOngoingBook());
              dispatch(updateIsOngoing(false));
              navigate("/user/borrow-history");
            }
          }
        }
      }
    } catch (error) {
      console.warn(error);
    }
  }

  useEffect(() => {
    if (token) {
      getOngoingBook()
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
          <div className='w-7/12 grid justify-center mx-auto'>
            <div className='grid justify-center'>
              {Object.keys(ongoingBook).length !== 0 ? (
                <div className="sm:py-4 sm:px-2 flex flex-col font-inter w-full sm:max-w-3xl mx-auto">
                  <div className="">
                    <div className="hidden sm:flex justify-between">
                      <div className="flex mx-auto">
                        <div className="text-xl font-bold px-2">{ongoingBook?.Book?.title}</div>
                        <div className="text-sm text-darkgrey px-2 flex items-center">{`by ${ongoingBook?.Book?.Author?.name}`}</div>
                      </div>
                    </div>
                  </div>
                  <div className="sm:grid sm:grid-cols-2 sm:gap-4 sm:mt-9">
                    <div>
                      <div className='relative'>
                        <img
                          className="w-full h-fit justify-center mx-auto object-cover sm:rounded-lg"
                          src={`${process.env.REACT_APP_BASE_URL}${ongoingBook?.Book?.imgCover}`}
                          onError={handleImageError}
                          alt="/"
                        />
                      </div>
                      <div className="text-center w-full font-semibold text-blue-700 mt-3">{ongoingBook?.Book?.Genre?.name}</div>
                    </div>
                    <div className='grid gap-4'>
                      <div className='grid content-center'>{ongoingBook?.Book?.description}</div>
                      <div>
                        <div>Page: {ongoingBook?.Book?.page}</div>
                        <div>Publish Year: {ongoingBook?.Book?.publicationYear && ongoingBook?.Book?.publicationYear.substring(0, 4)}</div>
                        <div>ISBN: {ongoingBook?.Book?.ISBN}</div>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 justify-center p-4">
                    {isOngoing && ongoingDetails.bookId === ongoingBook.bookId && (
                      <>
                        {ongoingDetails.status === "Queued" && (
                          <button type="button" disabled className='w-full py-2 px-4 bg-gray-300 text-center text-gray-700 rounded-md border border-gray-400'>
                            Waiting for borrow approval
                          </button>
                        )}
                        {ongoingDetails.status === "Borrowed" && (
                          <button type="button" className='w-full py-2 px-4 bg-blue-600 text-center text-white rounded-md border border-blue-600 hover:bg-blue-500' onClick={handleReturn}>Return</button>
                        )}
                        {ongoingDetails.status === "Pending" && (
                          <button type="button" disabled className='w-full py-2 px-4 bg-gray-300 text-center text-gray-700 rounded-md border border-gray-400'>
                            Waiting for return approval
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-blue-700 text-center mx-auto px-5 text-2xl font-semibold pt-5">No ongoing book found. Explore our collection and borrow a book!</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
