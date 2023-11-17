import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Pagination } from "flowbite-react";
import { Link } from "react-router-dom";

import Layout from '../../components/Layout';
import CustomDropDown from '../../components/CustomDropdown';
import SearchBar from '../../components/SearchBar';

export default function AdminManageBookPage() {
  const token = localStorage.getItem("token");
  const [allGenre, setAllGenre] = useState([]);
  const [bookData, setBookData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState({
    search: "",
    genre: "",
    year: ""
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

  const getBook = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/books?page=${currentPage}&search=${filter.search}&filterGenre=${filter.genre}&sortPublicationYear=${filter.year}`, { headers: { Authorization: `Bearer ${token}` } });
      if (response.data) {
        const { data: responseData, pagination } = response.data;
        if (responseData) {
          setBookData(responseData.rows);
          setTotalPages(Math.ceil(pagination.totalData / pagination.perPage))
        } else {
          setBookData([]);
        }
      }
    } catch (error) {
      console.error(error.message);
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
    setBookData([]);
    setCurrentPage(page)
  }

  useEffect(() => {
    getGenre()
    getBook()
  }, [filter, currentPage])

  return (
    <Layout>
      <div className='flex flex-col w-11/12 items-center m-10 bg-white font-inter'>
        <div className='basis-2/12 flex flex-col lg:flex-row gap-4 w-9/12 items-center px-5 mt-5'>
          <SearchBar id={"search"} value={filter.search} type="text" onChange={handleFilterChange} placeholder="Input book name or author here..." />
          <CustomDropDown options={allGenre} onChange={(e) => handleDropdownChange(e, "genre")} placeholder={"Filter by Genre"} />
          <div className="flex justify-center items-center w-screen">
            Publication Year: <select name="year" value={filter.year} onChange={handleFilterChange} className="py-0 ml-2 text-sm md:text-base my-1 sm:my-0">
              <option value="DESC"> Latest </option>
              <option value="ASC"> Oldest </option>
            </select>
          </div>
          <Link to="/admin/book/create">
            <div className='rounded-lg bg-blue-800 text-center px-4 py-2 font-bold text-white hover:bg-blue-600 w-48'> Add Book</div>
          </Link>
        </div>
        <div className="basis-10/12 flex flex-col text-center p-2 w-9/12">
          <div className="">
            <div className="grid gap-2">
              <table className="border-collapse border w-full text-xs sm:text-base">
                <thead>
                  <tr className="bg-gray-200">
                    <th className="py-2 px-4">Title</th>
                    <th className="py-2 px-4">Author</th>
                    <th className="py-2 px-4 hidden sm:table-cell">Year</th>
                    <th className="py-2 px-4"></th>
                  </tr>
                </thead>
                <tbody>
                  {bookData.length !== 0 && bookData.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-100">
                      <td className="py-2 px-4">{item.title}</td>
                      <td className="py-2 px-4">{item.Author?.name}</td>
                      <td className="py-2 px-4 hidden sm:table-cell">{item.publicationYear && item.publicationYear.substring(0, 4)}</td>
                      <td className="py-2 px-4 underline font-medium hover:text-blue-700"><Link to={`/admin/book/${item.id}`}>Modify</Link></td>
                    </tr>
                  ))}
                  {bookData.length === 0 && (
                    <tr>
                      <td colSpan="4" className="py-4 text-center">No Book Found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div className='flex justify-center pb-5'>
          <Pagination currentPage={currentPage} onPageChange={onPageChange} showIcons layout="pagination" totalPages={totalPages} nextLabel="Next" previousLabel="Back" className="mx-auto" />
        </div>
      </div>
    </Layout>
  )
}
