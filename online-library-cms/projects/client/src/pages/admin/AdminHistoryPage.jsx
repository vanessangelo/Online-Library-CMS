import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from '../../components/Layout';
import { Pagination } from 'flowbite-react';
import SearchBar from '../../components/SearchBar';
import CustomDropDown from '../../components/CustomDropdown';

export default function AdminHistoryPage() {
  const [allGenre, setAllGenre] = useState([]);
  const [allUser, setAllUser] = useState([]);
  const [historyData, setHistoryData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState({
    search: "",
    user: "",
    genre: "",
    status: ["Queued", "Borrowed", "Pending", "Returned"]
  })
  const token = localStorage.getItem("token");


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

  const getUsers = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/admins/users`, { headers: { Authorization: `Bearer ${token}` } });
      if (response.data) {
        const data = response.data.data;
        if (data) {
          const optionOne = { label: "All User", value: "" }
          let options = data.map((d) => ({ label: d.username, value: d.id, }));
          options.unshift(optionOne)
          setAllUser(options);
        } else {
          setAllUser([]);
        }
      }
    } catch (error) {
      console.warn(error);
    }
  };

  const getHistory = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/admins/borrow-histories?page=${currentPage}&status=${filter.status}&search=${filter.search}&filterUser=${filter.user}&filterGenre=${filter.genre}`, { headers: { Authorization: `Bearer ${token}` } });
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
    }
  };

  const onPageChange = (page) => {
    setHistoryData([]);
    setCurrentPage(page)
  }

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

  useEffect(() => {
    if (token) {
      getUsers()
      getGenre()
      getHistory()
    }
  }, [filter, currentPage])

  return (
    <Layout>
      <div className='flex flex-col w-11/12 items-center m-10 bg-white font-inter pt-5'>
        <div className='basis-2/12 flex flex-col md:flex-row gap-4 w-9/12 items-center px-5'>
          <SearchBar id={"search"} value={filter.search} type="text" onChange={handleFilterChange} placeholder="Input book name or author here..." />
          <CustomDropDown options={allGenre} onChange={(e) => handleDropdownChange(e, "genre")} placeholder={"Filter by Genre"} />
          <CustomDropDown options={allUser} onChange={(e) => handleDropdownChange(e, "user")} placeholder={"Filter by User"} />
        </div>
        <div className="basis-10/12 flex flex-col text-center p-2 w-9/12">
          <div className="">
            <div className="grid gap-2">
              <table className="border-collapse border w-full text-xs sm:text-base">
                <thead>
                  <tr className="bg-gray-200">
                    <th className="py-2 px-4" style={{ width: '30%' }}>Book</th>
                    <th className="py-2 px-4" style={{ width: '30%' }}>User</th>
                    <th className="py-2 px-4 hidden sm:table-cell" style={{ width: '15%' }}>Issued Date</th>
                    <th className="py-2 px-4 hidden sm:table-cell" style={{ width: '15%' }}>Returned Date</th>
                    <th className="py-2 px-4" style={{ width: '10%' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {historyData.length !== 0 && historyData.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-100">
                      <td className="py-2 px-4" style={{ width: '30%' }}>{item?.Book?.title} by {item?.Book?.Author?.name}</td>
                      <td className="py-2 px-4" style={{ width: '30%' }}>{item?.User?.name}</td>
                      <td className="py-2 px-4 hidden sm:table-cell" style={{ width: '15%' }}>{item.issuedDate && item.issuedDate.substring(0, 9)}</td>
                      <td className="py-2 px-4 hidden sm:table-cell" style={{ width: '15%' }}>{item.returnedDate ? `${item.returnedDate.substring(0, 9)}` : `-`}</td>
                      <td className="py-2 px-4" style={{ width: '10%' }}>{item?.status}</td>
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
          </div>
        </div>
        <div className='flex justify-center pb-5'>
          <Pagination currentPage={currentPage} onPageChange={onPageChange} showIcons layout="pagination" totalPages={totalPages} nextLabel="Next" previousLabel="Back" className="mx-auto" />
        </div>
      </div>
    </Layout>
  )
}
