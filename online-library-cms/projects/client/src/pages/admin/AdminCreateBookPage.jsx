import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import * as yup from "yup";
import Layout from '../../components/Layout';
import { fileMaxSize } from '../../helpers/validationSchema/fileMaxSize';
import { Formik, Form, Field } from 'formik';
import handleImageError from '../../helpers/handleImageError';
import { useNavigate } from 'react-router-dom';

export default function AdminCreateBookPage() {
  const token = localStorage.getItem("token");
  const fileInputRef = useRef(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [allGenre, setAllGenre] = useState([]);
  const [allAuthor, setAllAuthor] = useState([]);
  const navigate = useNavigate

  const getGenre = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/genres`);
      if (response.data) {
        const data = response.data.data;
        if (data) {
          const options = data.map((d) => ({ label: d.name, value: d.id, }));
          setAllGenre(options);
        } else {
          setAllGenre([]);
        }
      }
    } catch (error) {
      console.warn(error);
    }
  };

  const getAuthor = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/authors`);
      if (response.data) {
        const data = response.data.data;
        if (data) {
          const options = data.map((d) => ({ label: d.name, value: d.id, }));
          setAllAuthor(options);
        } else {
          setAllAuthor([]);
        }
      }
    } catch (error) {
      console.warn(error);
    }
  };

  const resetFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const createBookSchema = yup.object().shape({
    file: fileMaxSize(1024 * 1024).required("Book image is required"),
    title: yup.string().trim().required("Book title is required").max(50, "Maximum character is 50").typeError("Title must be a valid text"),
    genreId: yup.string().trim().required("Genre is required"),
    authorId: yup.string().trim().required("Author is required"),
    description: yup.string().trim().required("Description is required").max(200, "Maximum character is 200").typeError("Description must be a valid text"),
    page: yup.number().required("Page is required").positive("Page must be greater than 0").max(2000, "Page must not exceed 2000"),
    ISBN: yup.string().trim().required("ISBN is required").max(50, "Maximum character is 50"),
    publicationYear: yup.number().required("Publication year is required").integer("Publication year must be a valid number").min(1000, "Invalid publication year").max(new Date().getFullYear(), "Invalid publication year"),
    quantityTotal: yup.number().required("Quantity is required").integer("Quantity must be a valid number").positive("Quantity must be greater than 0").max(10, "Quantity must not exceed 10"),
  });

  const handleSubmit = async (values, { setSubmitting, resetForm, setStatus }) => {
    const { file, title, description, page, ISBN, publicationYear, quantityTotal, genreId, authorId } = values;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('name', title);
    formData.append('description', description);
    formData.append('page', page);
    formData.append('ISBN', ISBN);
    formData.append('publicationYear', publicationYear);
    formData.append('quantityTotal', quantityTotal);
    formData.append('genreId', genreId);
    formData.append('authorId', authorId);
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/books`, formData, { headers: { Authorization: `Bearer ${token}` } })
      if (response.status === 201) {
        resetForm()
        resetFileInput();
        setStatus({ success: true, message: response.data?.message });
      }
    } catch (error) {
      const response = error.response;
      if (response.data.message === "An error occurs") {
        const { msg } = response.data?.errors[0];
        if (msg) {
          setStatus({ success: false, message: msg });
        }
      }
      if (response.data.message == "Book already exist") {
        setStatus({ success: false, message: "Book already exist" });
      }
      if (response.data.error) {
        const errMsg = response.data.error;
        setStatus({ success: false, message: errMsg });
      }
      if (response?.status === 413) {
        setStatus({ success: false, message: "File size exceeded the limit" });
      }
      if (response.status === 500) {
        setStatus({ success: false, message: "Create book failed: Server error" });
      }
      resetForm()
    } finally {
      getGenre();
      getAuthor();
      resetFileInput();
      setImagePreview(null);
      setSubmitting(false);
    }
  };

  useEffect(() => {
    getAuthor()
    getGenre()
  }, [])

  function preview(event) {
    const file = event.target.files[0];
    if (file === undefined) {
      setImagePreview(null)
    } else {
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  }

  return (
    <Layout>
      <div className='flex flex-col w-11/12 m-10 bg-white font-inter content-center'>
        <Formik initialValues={{ title: "", description: "", page: "", ISBN: "", publicationYear: "", quantityTotal: "", genreId: "", authorId: "", file: null, }} validationSchema={createBookSchema} onSubmit={handleSubmit}>
          {(props) => (
            <Form>
              {props.status && props.status.success && (
                <p className="text-center text-green-600">{props.status.message}</p>
              )}
              {props.status && !props.status.success && (
                <p className="text-center text-red-600">{props.status.message}</p>
              )}
              <div className='flex flex-col lg:flex-row w-11/12 mx-auto justify-center gap-4'>
                <div className='w-full'>
                  <div className="w-11/12 flex flex-col gap-2 py-4 mx-auto justify-center h-full text-center">
                    <label htmlFor="file" className="font-medium">Book Cover <span className="text-sm font-normal">(.jpg, .jpeg, .png) max. 1MB </span><span className="text-red-600">*</span></label>
                    <div>
                      {(imagePreview) ? (
                        <img id="frame" className="w-36 h-36 lg:w-48 lg:h-48 justify-center mx-auto m-2 object-cover border-2 border-blue-800 p-1" src={imagePreview} onError={handleImageError} alt="/" />
                      ) : (
                        <img className="w-36 h-36 lg:w-48 lg:h-48 justify-center mx-auto m-2 object-cover border-2 border-blue-800 p-1" src={""} onError={handleImageError} alt="/" />
                      )}
                    </div>
                    <div className='relative'>
                      <input className='border border-gray-300 text-sm w-full focus:border-blue-800 focus:ring-0' type="file" id="file" name="file" onChange={(e) => { props.setFieldValue("file", e.currentTarget.files[0]); preview(e) }} required ref={fileInputRef} />
                      {props.errors.file && props.touched.file && <div className="text-sm text-red-600 absolute top-12">{props.errors.file}</div>}
                    </div>
                  </div>
                </div>
                <div className='w-full'>
                  <div className="flex flex-col gap-2 py-4 font-inter mb-4">
                    <label htmlFor="title" className="font-medium">Title <span className="text-sm font-normal">(max. 50 characters) </span><span className="text-red-600">*</span></label>
                    <div className='relative'>
                      <Field className="border border-gray-300 text-xl w-full focus:border-blue-400 focus:ring-0" type="text" name="title" />
                      {props.errors.title && props.touched.title && <div className="text-sm text-red-600 absolute top-12">{props.errors.title}</div>}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 py-4 font-inter mb-4">
                    <label htmlFor="description" className="font-medium">Description <span className="text-sm font-normal">(max. 200 characters) </span><span className="text-red-600">*</span></label>
                    <div className='relative'>
                      <Field className="border border-gray-300 text-xl w-full focus:border-blue-400 focus:ring-0" type="text" name="description" />
                      {props.errors.description && props.touched.description && <div className="text-sm text-red-600 absolute top-12">{props.errors.description}</div>}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 py-4 font-inter mb-4">
                    <label htmlFor="genreId" className="font-medium">Genre<span className="text-red-600">*</span></label>
                    <div className='relative'>
                      <Field as='select' className='w-full mt-1 bg-gray-100 rounded-md border border-gray-300 focus:border-maindarkgreen focus:ring-0 overflow-y-auto' name='genreId'>
                        <option key="empty" value=''>--choose a genre--</option>
                        {allGenre.map((category) => (<option key={category.value} value={category.value}>{category.label}</option>))}
                      </Field>
                      {props.errors.genreId && props.touched.genreId && <div className="text-sm text-red-600 absolute top-12">{props.errors.genreId}</div>}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 py-4 font-inter mb-4">
                    <label htmlFor="authorId" className="font-medium">Author <span className="text-red-600">*</span></label>
                    <div className='relative'>
                      <Field as='select' className='w-full mt-1 bg-gray-100 rounded-md border border-gray-300 focus:border-maindarkgreen focus:ring-0 overflow-y-auto' name='authorId'>
                        <option key="empty" value=''>--choose an author--</option>
                        {allAuthor.map((category) => (<option key={category.value} value={category.value}>{category.label}</option>))}
                      </Field>
                      {props.errors.authorId && props.touched.authorId && <div className="text-sm text-red-600 absolute top-12">{props.errors.authorId}</div>}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 py-4 font-inter mb-4">
                    <label htmlFor="page" className="font-medium">Page <span className="text-sm font-normal">(max. 2000) </span><span className="text-red-600">*</span></label>
                    <div className='relative'>
                      <Field className="border border-gray-300 text-xl w-full focus:border-blue-400 focus:ring-0" type="number" name="page" />
                      {props.errors.page && props.touched.page && <div className="text-sm text-red-600 absolute top-12">{props.errors.page}</div>}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 py-4 font-inter mb-4">
                    <label htmlFor="ISBN" className="font-medium">ISBN <span className="text-sm font-normal">(max. 50 characters) </span><span className="text-red-600">*</span></label>
                    <div className='relative'>
                      <Field className="border border-gray-300 text-xl w-full focus:border-blue-400 focus:ring-0" type="text" name="ISBN" />
                      {props.errors.ISBN && props.touched.ISBN && <div className="text-sm text-red-600 absolute top-12">{props.errors.ISBN}</div>}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 py-4 font-inter mb-4">
                    <label htmlFor="publicationYear" className="font-medium">Publication Year <span className="text-sm font-normal"></span><span className="text-red-600">*</span></label>
                    <div className='relative'>
                      <Field className="border border-gray-300 text-xl w-full focus:border-blue-400 focus:ring-0" type="text" name="publicationYear" />
                      {props.errors.publicationYear && props.touched.publicationYear && <div className="text-sm text-red-600 absolute top-12">{props.errors.publicationYear}</div>}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 py-4 font-inter mb-4">
                    <label htmlFor="quantityTotal" className="font-medium">Quantity <span className="text-sm font-normal"></span><span className="text-red-600">*</span></label>
                    <div className='relative'>
                      <Field className="border border-gray-300 text-xl w-full focus:border-blue-400 focus:ring-0" type="text" name="quantityTotal" />
                      {props.errors.quantityTotal && props.touched.quantityTotal && <div className="text-sm text-red-600 absolute top-12">{props.errors.quantityTotal}</div>}
                    </div>
                  </div>
                </div>
              </div>
              <div className="w-full grid mt-8">
                <button
                  className="w-11/12 mx-auto py-2 my-4 text-base rounded-md bg-blue-600 text-white hover:bg-white hover:text-blue-600 hover:border hover:border-blue-600" type="submit" disabled={props.isSubmitting} onSubmit={props.handleSubmit}>
                  {props.isSubmitting ? "Loading..." : "Create"}
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </Layout>
  )
}
