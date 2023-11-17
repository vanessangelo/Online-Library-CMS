import React, { useState } from 'react';
import { useDispatch } from "react-redux";
import { useNavigate, Link, useLocation } from "react-router-dom";
import * as Yup from 'yup';
import axios from 'axios';
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { Formik, Form, Field } from "formik";

import LibraryBlue from "../assets/LibraryBlue.png";
import handleImageError from "../helpers/handleImageError";

export default function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const initialValues = {
    name: "",
    username: "",
    email: "",
    password: "",
    confirm_password: "",
  };

  const pwdRgx = /^(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/
  const allowedEmailDomains = ["gmail.com", "outlook.com", "yahoo.com", "hotmail.com"];

  const validationSchema = Yup.object().shape({
    name: Yup.string().required("Name is required"),
    username: Yup.string().required("Username or email is required"),
    email: Yup.string()
    .email('Please use a valid email format')
    .required('Email is required')
    .test('email-domain', 'Only specific email domains are allowed', (value) => {
      if (!value) return false;
      const domain = value.split('@')[1]; 
      return allowedEmailDomains.includes(domain);
    }),
    password: Yup.string().matches(pwdRgx, 'At least 8 chars, 1 caps, 1 number, and no symbol'
    ).required('Password is required'),
    confirm_password: Yup.string()
      .oneOf([Yup.ref('password'), null], 'Passwords must match')
      .required('Confirm Password is required'),
  });

  const handleSubmit = async (values, { setSubmitting, resetForm, setStatus }) => {
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/auth/register`, values);

      if (response.status === 201) {
        resetForm();
        setStatus({ success: true, message: 'Sign up successful!' });
        setTimeout(() => {
          navigate("/login");
        }, 3000);
      }

    } catch (error) {
      const response = error.response;
      if (response.status === 400) {
        const { errors } = response.data;
        const errorMessage = errors[0].msg;
        console.log(errorMessage)
        setStatus({ success: false, message: errorMessage });
      }

      if (response.status === 500) {
        setStatus({ success: false, message: "Internal Server Error" });
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className='h-screen grid content-center justify-center'>
      <div className='grid grid-cols-1 sm:grid-cols-2 h-full justify-center content-center gap-4 font-inter'>
        <div className='hidden lg:grid content-center justify-center p-4'>
          <img src={LibraryBlue} onError={handleImageError} alt="/" className='object-cover' />
        </div>
        <div className='grid justify-center my-10'>
          <div className="grid text-center p-5 w-full my-10 content-center">
            <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit}>
              {(props) => (
                <Form className="relative">
                  <div className="grid justify-center">
                    <h2 className="w-72 text-center text-blue-600 sm:text-5xl font-bold"> Register </h2>
                  </div>
                  <p className="text-xl text-center mb-4 sm:text-xl">Please enter your information below:</p>
                  {props.status && props.status.success && (
                    <p className="text-center text-green-600">{props.status.message}</p>
                  )}
                  {props.status && !props.status.success && (
                    <p className="text-center text-red-600">{props.status.message}</p>
                  )}
                  <div className="flex flex-col gap-2 py-4 mb-4">
                    <div className="relative">
                      <Field
                        className="border border-gray-300 text-xl w-full focus:border-blue-400 focus:ring-0"
                        type="text"
                        name="name"
                        placeholder="Name"
                      />
                      {props.errors.name && props.touched.name && <div className="text-base text-red-600 absolute top-11">{props.errors.name}</div>}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 py-4 mb-4">
                    <div className="relative">
                      <Field
                        className="border border-gray-300 text-xl w-full focus:border-blue-400 focus:ring-0"
                        type="text"
                        name="username"
                        placeholder="Username"
                      />
                      {props.errors.username && props.touched.username && <div className="text-base text-red-600 absolute top-11">{props.errors.username}</div>}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 py-4 mb-4">
                    <div className="relative">
                      <Field
                        className="border border-gray-300 text-xl w-full focus:border-blue-400 focus:ring-0"
                        type="text"
                        name="email"
                        placeholder="Email"
                      />
                      {props.errors.email && props.touched.email && <div className="text-base text-red-600 absolute top-11">{props.errors.email}</div>}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 py-4 mb-4">
                    <div className="relative">
                      <Field
                        className="border border-gray-300 text-xl w-full focus:border-blue-400 focus:ring-0"
                        type={showPassword ? "text" : "password"}
                        name="password"
                        placeholder="Password"
                      />
                      <div className="absolute right-2 top-1/2 transform pt-1 -translate-y-1/2">
                        <button
                          type="button"
                          onClick={toggleShowPassword}
                          className="text-gray-500 focus:outline-none"
                        >
                          {showPassword ? (
                            <AiOutlineEye size={25} />
                          ) : (
                            <AiOutlineEyeInvisible size={25} />
                          )}
                        </button>
                      </div>
                      {props.errors.password && props.touched.password && <div className="text-base text-red-600 absolute top-11">{props.errors.password}</div>}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 py-4 mb-4">
                    <div className="relative">
                      <Field
                        className="border border-gray-300 text-xl w-full focus:border-blue-400 focus:ring-0"
                        type="password"
                        name="confirm_password"
                        placeholder="Confirm password"
                      />
                      {props.errors.confirm_password && props.touched.confirm_password && <div className="text-base text-red-600 absolute top-11">{props.errors.confirm_password}</div>}
                    </div>
                  </div>
                  <button
                    className="w-1/2 py-2 my-4 text-base rounded-md bg-blue-600 text-white hover:bg-white hover:text-blue-600 hover:border hover:border-blue-600"
                    type="submit"
                    disabled={props.isSubmitting}
                  >
                    {props.isSubmitting ? "Loading..." : "Register"}
                  </button>
                </Form>
              )}
            </Formik>
          </div>
        </div>
      </div>
    </div>
  )
}
