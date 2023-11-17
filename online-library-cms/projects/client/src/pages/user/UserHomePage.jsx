import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Pagination } from "flowbite-react";
import { Link } from "react-router-dom";

import Layout from '../../components/Layout';
import CustomDropDown from '../../components/CustomDropdown';
import SearchBar from '../../components/SearchBar';
import handleImageError from '../../helpers/handleImageError';

export default function UserHomePage() {
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
      const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/books/active?page=${currentPage}&search=${filter.search}&filterGenre=${filter.genre}&sortPublicationYear=${filter.year}`, { headers: { Authorization: `Bearer ${token}` } });
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
      <div className='flex flex-col w-11/12 justify-center items-center m-10 bg-white font-inter'>
        <div className='basis-1/5 flex flex-col xl:flex-row gap-4 w-9/12 items-center px-5'>
          <SearchBar id={"search"} value={filter.search} type="text" onChange={handleFilterChange} placeholder="Input book name or author here..." />
          <CustomDropDown options={allGenre} onChange={(e) => handleDropdownChange(e, "genre")} placeholder={"Filter by Genre"} />
          <div className="flex justify-center items-center w-screen">
            Publication Year: <select id="year" name="year" value={filter.year} onChange={handleFilterChange} className="py-0 ml-2 text-sm md:text-base my-1 sm:my-0">
              <option value=""> Sort </option>
              <option value="DESC"> Latest </option>
              <option value="ASC"> Oldest </option>
            </select>
          </div>
        </div>
        <div className="basis-3/5 flex flex-col text-center p-2 w-9/12">
          <div className="">
            <div className='w-full grid grid-cols-2 xl:grid-cols-3 sm:gap-1 mb-10 justify-center'>
              {bookData.length !== 0 && bookData.map((item) => (
                <div className="sm:w-[250px] h-[450px] m-2 rounded-lg shadow-lg font-inter mx-auto">
                  <Link to={`/single-book/${item.id}`}>
                    <div className="relative">
                      <div className="absolute bottom-0 left-0 w-full h-8 bg-slate-500 z-10 flex justify-center text-sm items-center text-white font-inter">{item.Genre.name}</div>
                      <img
                        className="sm:w-[250px] h-[300px] object-cover rounded-t-lg"
                        src={`${process.env.REACT_APP_BASE_URL}${item?.imgCover}`}
                        alt="img"
                        onError={handleImageError}
                      />
                      {item.quantityAvailable === 0 ? (
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black opacity-75 rounded-full w-16 h-16 flex justify-center items-center">
                          <p className="text-white font-inter text-sm text-center">Unavailable</p>
                        </div>
                      ) : null}
                    </div>
                    <div className="grid grid-rows-2 items-start w-full h-[150px]">
                      <div className="flex flex-col font-semibold text-base sm:text-xl my-1 mx-2 justify-center content-center h-full">
                        {item.title}
                      </div>
                      <div className="flex flex-col text-sm sm:text-base my-1 mx-2 justify-center content-center h-full">
                        <div className='flex flex-col px-2 justify-center'>
                          {item.Author.name} ({item.publicationYear && item.publicationYear.substring(0, 4)})
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
              {bookData.length === 0 && (<div className='font-inter col-span-2 lg:col-span-4 text-center text-maingreen'>No Book Found</div>)}
            </div>
          </div>
        </div>
        <div className='flex justify-center'>
          <Pagination currentPage={currentPage} onPageChange={onPageChange} showIcons layout="pagination" totalPages={totalPages} nextLabel="Next" previousLabel="Back" className="mx-auto" />
        </div>
      </div>
    </Layout>
  )
}
