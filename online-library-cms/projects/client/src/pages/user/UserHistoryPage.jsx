import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Pagination } from "flowbite-react";
import { Link } from "react-router-dom";

import Layout from '../../components/Layout';
import CustomDropDown from '../../components/CustomDropdown';
import SearchBar from '../../components/SearchBar';
import Sidebar from '../../components/Sidebar';

export default function UserHistoryPage() {
  const token = localStorage.getItem("token");
  const [allGenre, setAllGenre] = useState([]);
  const [historyData, setHistoryData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState({
    search: "",
    genre: "",
  })

  const getGenre = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/genres`);
      if (response.data) {
        const data = response.data.data;
        if (data) {
          const optionOne = { label: "All Genre", value: "" }
          let options = data.map((d) => ({ label: d.name, value: d.id, }));
          options.unshift(optionOne)
          setAllGenre(options);
        } else {
          setAllGenre([]);
        }
      }
    } catch (error) {
      console.warn(error);
    }
  };

  const getHistory = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/users/borrow-histories?page=${currentPage}&search=${filter.search}&filterGenre=${filter.genre}`, { headers: { Authorization: `Bearer ${token}` } });
      if (response.data) {
        const { data: responseData, pagination } = response.data;
        if (responseData) {
          setHistoryData(responseData.rows);
          setTotalPages(Math.ceil(pagination.totalData / pagination.perPage))
        } else {
          setHistoryData([]);
        }
      }
    } catch (error) {
      console.error(error.message);
      setHistoryData([]);
    }
  };

  const handleFilterChange = (e) => {
    setFilter({
      ...filter, [e.target.id]: e.target.value
    })
  }

  const handleDropdownChange = (obj, name) => {
    setFilter((prevFilter) => ({
      ...prevFilter,
      [name]: obj.value,
    }));
  }

  const onPageChange = (page) => {
    setHistoryData([]);
    setCurrentPage(page)
  }
  useEffect(() => {
    getGenre()
    getHistory()
  }, [filter, currentPage])
  return (
    <Layout>
      <div className='flex flex-col w-11/12 justify-center items-center m-10 bg-white font-inter'>
        <div className='flex w-11/12 h-5/6'>
          <div className='w-full basis-1/5'>
            <div>
              <Sidebar />
            </div>
          </div>
          <div className='w-full basis-4/5 grid pl-16 gap-8 content-between h-full'>
            <div className='flex flex-col w-11/12 justify-center items-center m-10 bg-white font-inter'>
              <div className='basis-1/5 flex flex-col md:flex-row gap-4 w-full items-center px-5'>
                <SearchBar id={"search"} value={filter.search} type="text" onChange={handleFilterChange} placeholder="Input book name or author here..." />
                <CustomDropDown options={allGenre} onChange={(e) => handleDropdownChange(e, "genre")} placeholder={"Filter by Genre"} />
              </div>
              <div className="basis-3/5 flex flex-col text-center p-2 w-full mt-5">
                <div className="grid gap-2 mb-10">
                  <table className="border-collapse border w-full text-xs sm:text-base">
                    <thead>
                      <tr className="bg-gray-200">
                        <th className="py-2 px-4" style={{ width: '60%' }}>Book</th>
                        <th className="py-2 px-4" style={{ width: '20%' }}>IssuedDate</th>
                        <th className="py-2 px-4" style={{ width: '20%' }}>Returned Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {historyData.length !== 0 && historyData.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-100">
                          <td className="py-2 px-4" style={{ width: '60%' }}>{item?.Book?.title} by {item?.Book?.Author?.name}</td>
                          <td className="py-2 px-4" style={{ width: '20%' }}>{item.issuedDate && item.issuedDate.substring(0, 9)}</td>
                          <td className="py-2 px-4" style={{ width: '20%' }}>{item.returnedDate ? item.returnedDate.substring(0, 9) : "-" }</td>
                        </tr>
                      ))}
                      {historyData.length === 0 && (
                        <tr>
                          <td colSpan="4" className="py-4 text-center">No History Found</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                <div className='flex justify-center'>
                  <Pagination currentPage={currentPage} onPageChange={onPageChange} showIcons layout="pagination" totalPages={totalPages} nextLabel="Next" previousLabel="Back" className="mx-auto" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
