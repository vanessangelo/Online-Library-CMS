import React, { useState } from 'react'
import { MdLogout } from "react-icons/md";
import { remove } from '../store/reducer/authSlice';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { removeIsOngoing, removeOngoingBook } from '../store/reducer/borrowSlice';

export default function ModalLogout() {
    const [openModal, setOpenModal] = useState(false);
    const dispatch = useDispatch();
    const navigate = useNavigate()

    const handleOpenModal = (e) => {
        e.preventDefault();
        setOpenModal(true);
    };

    const handleCloseModal = () => {
        setOpenModal(false);
    };

    const handleLogout = () => {
        dispatch(remove());
        dispatch(removeOngoingBook());
        dispatch(removeIsOngoing());
        localStorage.removeItem("token");
        navigate("/login");

    };

    return (
        <>
            <button className='grid text-xl sm:text-2xl w-fit h-fit p-2 content-center' onClick={handleOpenModal} buttonType="button" >
                <MdLogout size={22} className="text-blue-950 hover:text-blue-600" />
            </button>
            {openModal && (
                <div
                    id="staticModal"
                    tabIndex={-1}
                    aria-hidden="true"
                    className="fixed top-0 left-0 right-0 bottom-0 flex justify-center items-center bg-opacity-50 bg-gray-900 z-50"
                >
                    <div className="relative w-full max-w-2xl max-h-full mx-3">
                        {/* Modal content */}
                        <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
                            {/* Modal header */}
                            <div className="flex items-start justify-between p-4 border-b rounded-t dark:border-gray-600">
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                                    LOG OUT
                                </h3>
                                <button
                                    type="button"
                                    className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ml-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
                                    data-modal-hide="staticModal"
                                    onClick={handleCloseModal}
                                    buttonType="button"
                                >
                                    <svg
                                        className="w-3 h-3"
                                        aria-hidden="true"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 14 14"
                                    >
                                        <path
                                            stroke="currentColor"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                                        />
                                    </svg>
                                    <span className="sr-only">Close modal</span>
                                </button>
                            </div>
                            {/* Modal body */}
                            <div className="p-6 space-y-6">
                                <p className="text-base leading-relaxed text-gray-500 dark:text-gray-400 text-center mx-auto">
                                    Are you sure you want to log out?
                                </p>
                            </div>
                            {/* Modal footer */}
                            <div className="flex items-center p-6 space-x-2 border-t border-gray-200 rounded-b dark:border-gray-600">
                                <button className='bg-white px-4 mr-2 h-10 rounded-lg text-gray-500 border border-gray-400 text-base w-full hover:bg-gray-200' onClick={handleCloseModal} buttonType="button" >
                                    Cancel
                                </button>
                                <button className='bg-red-600 px-4 mr-2 h-10 rounded-lg text-white border border-red-600 text-base w-full hover:bg-white hover:text-red-600' onClick={handleLogout} buttonType="button" >
                                    Yes
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
