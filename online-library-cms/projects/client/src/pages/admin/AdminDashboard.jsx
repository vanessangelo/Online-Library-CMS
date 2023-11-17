import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from '../../components/Layout';
import { Pagination } from 'flowbite-react';

export default function AdminDashboard() {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalData, setTotalData] = useState();
  const [historyData, setHistoryData] = useState([]);
  const token = localStorage.getItem("token");

  const getHistory = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/admins/borrow-histories?page=${currentPage}&status=Queued,Pending`, { headers: { Authorization: `Bearer ${token}` } });
      if (response.data) {
        const { data: responseData, pagination } = response.data;
        if (responseData) {
          setHistoryData(responseData.rows);
          setTotalPages(Math.ceil(pagination.totalData / pagination.perPage))
          setTotalData(pagination.totalData)
        } else {
          setHistoryData([]);
        }
      }
    } catch (error) {
      console.error(error.message);
    }
  };

  const handleRequest = async (id, action) => {
    try {
      await axios.patch(`${process.env.REACT_APP_API_BASE_URL}/admins/borrow-histories/${id}/${action}`, {}, { headers: { Authorization: `Bearer ${token}` } });
    } catch (error) {
      console.warn(error);
    } finally {
      getHistory()
    }
  }

  const onPageChange = (page) => {
    setHistoryData([]);
    setCurrentPage(page)
  }

  useEffect(() => {
    if (token) {
      getHistory()
    }
  }, [currentPage])

  return (
    <Layout>
      <div className='flex flex-col w-11/12 pt-5 items-center m-10 bg-white font-inter'>
        <div className='basis-1/12 flex flex-col md:flex-row gap-4 w-9/12 px-5 text-3xl font-bold text-blue-600'>
          Incoming Request ({totalData || 0})
        </div>
        <div className="basis-11/12 flex flex-col text-center p-2 w-9/12 mt-5">
          <div className="">
            <div className="grid gap-2">
              <table className="border-collapse border w-full text-xs sm:text-base">
                <thead>
                  <tr className="bg-gray-200">
                    <th className="py-2 px-4" style={{ width: '30%' }}>Title</th>
                    <th className="py-2 px-4" style={{ width: '30%' }}>User</th>
                    <th className="py-2 px-4 hidden sm:table-cell" style={{ width: '20%' }}>Request</th>
                    <th className="py-2 px-4" style={{ width: '10%' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {historyData.length !== 0 && historyData.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-100">
                      <td className="py-2 px-4" style={{ width: '30%' }}>{item?.Book?.title}</td>
                      <td className="py-2 px-4" style={{ width: '30%' }}>{item?.User?.name}</td>
                      <td className="py-2 px-4 hidden sm:table-cell" style={{ width: '10%' }}>{item?.status === "Queued" ? "Borrow Request" : "Return Request"}</td>
                      <td className="py-2 px-4" style={{ width: '10%' }}><button className='w-full py-2 px-4 bg-blue-600 text-center text-white rounded-md border border-blue-600 hover:bg-blue-500' type="button" onClick={() => handleRequest(`${item?.id}`, `${item?.status === "Queued" ? "approveBorrow" : "approveReturn"}`)} >Approve</button></td>
                    </tr>
                  ))}
                  {historyData.length === 0 && (
                    <tr>
                      <td colSpan="4" className="py-4 text-center">No Incoming Request</td>
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
