import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams, Link } from "react-router-dom";
import { HiOutlineChevronLeft } from "react-icons/hi";

import Layout from '../../components/Layout';
import handleImageError from '../../helpers/handleImageError';
import { useSelector, useDispatch } from 'react-redux';
import { getOngoingBook, updateIsOngoing } from '../../store/reducer/borrowSlice';

export default function UserBookSinglePage() {
  const [bookDetails, setBookDetails] = useState({})
  const { id } = useParams();
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isOngoing = useSelector((state) => state.borrow.isOngoing);
  console.log("ini ongoing", isOngoing)
  const ongoingDetails = useSelector((state) => state.borrow.ongoingBook);

  const getOneBook = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/books/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      if (response.data) {
        const data = response.data.data;
        if (data) {
          setBookDetails(data);
        } else {
          setBookDetails([]);
        }
      }
    } catch (error) {
      console.warn(error);
    }
  };

  const handleBorrow = async (e) => {
    e.preventDefault()
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/users/books/${id}`, {}, { headers: { Authorization: `Bearer ${token}` } });
      if (response.data) {
        const data = response.data.data;
        if (data) {
          const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/users/borrow-histories/active`, { headers: { Authorization: `Bearer ${token}` } });
          if (response.data) {
            const { data } = response.data;
            if (Object.keys(data).length !== 0) {
              dispatch(getOngoingBook(data));
              dispatch(updateIsOngoing(true));
              navigate("/user/ongoing-book");
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
      getOneBook()
    }
  }, [token])

  return (
    <Layout>
      {bookDetails ? (
        <div className="sm:py-4 sm:px-2 flex flex-col font-inter w-full sm:max-w-4xl mx-auto bg-white h-fit sm:mt-7 rounded-md shadow-lg">
          <div className="">
            <div className="hidden sm:flex justify-between">
              <div className="grid justify-center content-center">
                <div className="h-full w-full opacity-50"><button type='button' className='grid text-xl sm:text-2xl p-3' onClick={() => navigate(-1)}><HiOutlineChevronLeft size={22} className="rounded-md" style={{ backgroundColor: "rgba(255,255,255,0.8" }} /></button></div>
              </div>
              <div className="flex mx-auto">
                <div className="text-xl font-bold px-2">{bookDetails?.title}</div>
                <div className="text-sm text-darkgrey px-2 flex items-center">{`by ${bookDetails?.Author?.name}`}</div>
              </div>
            </div>
          </div>
          <div className="sm:grid sm:grid-cols-2 sm:gap-4 sm:mt-9">
            <div>
              <div className='relative'>
                <img
                  className="w-full h-fit justify-center mx-auto object-cover sm:rounded-lg"
                  src={`${process.env.REACT_APP_BASE_URL}${bookDetails?.imgCover}`}
                  onError={handleImageError}
                  alt="/"
                />
              </div>
              <div className="text-center w-full font-semibold text-blue-700 mt-3">{bookDetails?.Genre?.name}</div>
              <div className="sm:hidden text-center w-full font-semibold my-3">
                <div className="text-xl font-bold px-2">{bookDetails?.title}</div>
                <div className="text-sm text-darkgrey px-2">{`by ${bookDetails?.Author?.name}`}</div>
              </div>
            </div>
            <div className='grid gap-4'>
              <div className='grid content-center'>{bookDetails.description}</div>
              <div>
                <div>Page: {bookDetails.page}</div>
                <div>Publish Year: {bookDetails.publicationYear && bookDetails.publicationYear.substring(0, 4)}</div>
                <div>ISBN: {bookDetails.ISBN}</div>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-2 justify-center p-4">
            <div className='text-center text-gray-600 w-full'>{bookDetails.quantityAvailable} Available</div>
            {isOngoing === false && bookDetails.quantityAvailable !== 0 && (<button className='w-full py-2 px-4 bg-blue-600 text-center text-white rounded-md border border-blue-600 hover:bg-blue-500' type="button" onClick={handleBorrow} >Borrow</button>)}
            {isOngoing && ongoingDetails.bookId === bookDetails.id && (
              <>
                {ongoingDetails.status === "Queued" && (
                  <button type="button" disabled className='w-full py-2 px-4 bg-gray-300 text-center text-gray-700 rounded-md border border-gray-400'>
                    Queued
                  </button>
                )}
                {ongoingDetails.status === "Borrowed" && (
                  <button type="button" className='w-full py-2 px-4 bg-blue-600 text-center text-white rounded-md border border-blue-600 hover:bg-blue-500'><Link to="/user/ongoing-book">View Ongoing</Link></button>
                )}
                {ongoingDetails.status === "Pending" && (
                  <button type="button" disabled className='w-full py-2 px-4 bg-gray-300 text-center text-gray-700 rounded-md border border-gray-400'>
                    Pending Return
                  </button>
                )}
              </>
            )}
            {isOngoing && ongoingDetails.bookId !== bookDetails.id && (
              <button type="button" onClick={() => navigate("/user/ongoing-book")} className='w-full py-2 px-4 bg-blue-600 text-center text-white rounded-md border border-blue-600 hover:bg-blue-500'>
                Return Ongoing Book to Borrow New
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="text-blue-600 text-center mx-auto px-5">Loading...</div>
      )}
    </Layout>
  )
}
