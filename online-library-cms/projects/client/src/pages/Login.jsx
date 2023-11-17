import React, { useState } from 'react';
import { useDispatch } from "react-redux";
import { useNavigate, Link, useLocation } from "react-router-dom";
import * as Yup from 'yup';
import axios from 'axios';
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { Formik, Form, Field } from "formik";

import LibraryBlue from "../assets/LibraryBlue.png";
import { keep } from "../store/reducer/authSlice";
import handleImageError from "../helpers/handleImageError";
import { getOngoingBook, updateIsOngoing } from '../store/reducer/borrowSlice';

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const initialValues = {
    credential: "",
    password: "",
  };

  const validationSchema = Yup.object().shape({
    credential: Yup.string().required("Username or email is required"),
    password: Yup.string().required("Password is required"),
  });

  const handleSubmit = async (
    values,
    { setSubmitting, setFieldError, resetForm, setStatus }
  ) => {
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/auth/login`, values);
      if (response.status === 200) {
        const { accessToken } = response.data;
        localStorage.setItem("token", accessToken);
        dispatch(keep(response.data));
        resetForm();
        setStatus({ success: true, accessToken });
        if (response.data.user.role == "admin") {
          navigate("/dashboard");
        } else {
          const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/users/borrow-histories/active`, { headers: { Authorization: `Bearer ${accessToken}` } });
          if (response.data) {
            const { data } = response.data;
            if (Object.keys(data).length !== 0) {
              dispatch(getOngoingBook(data));
              dispatch(updateIsOngoing(true));
              navigate("/");
            } else {
              navigate("/");
            }
            
          }
        } 
      } else {
        throw new Error("Login failed");
      }
    } catch (error) {
      if (error.status === 404) {
        setFieldError("credential", "User not found")
      }
      setFieldError("credential", "Incorrect email and/or password");
      setStatus({ success: false });
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
                    <h2 className="w-72 text-center text-blue-600 sm:text-5xl font-bold"> LOG IN </h2>
                  </div>
                  <p className="text-xl text-center mb-4 sm:text-xl">Please enter your email/username and password:</p>
                  <div className="flex flex-col gap-2 py-4 mb-4">
                    <div className="relative">
                      <Field
                        className="border border-gray-300 text-xl w-full focus:border-blue-400 focus:ring-0"
                        type="text"
                        name="credential"
                        placeholder="Username / Email"
                      />
                      {props.errors.credential && props.touched.credential && <div className="text-base text-red-600 absolute top-11">{props.errors.credential}</div>}
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
                  <button
                    className="w-1/2 py-2 my-4 text-base rounded-md bg-blue-600 text-white hover:bg-white hover:text-blue-600 hover:border hover:border-blue-600"
                    type="submit"
                    disabled={props.isSubmitting}
                  >
                    {props.isSubmitting ? "Loading..." : "Log In"}
                  </button>
                </Form>
              )}
            </Formik>
            <div className="w-full flex gap-4 justify-center items-center">
              <div className="font-inter text-base">Don't have an account?</div>
              <Link
                to="/register"
                className="text-base font-bold text-blue-600"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}