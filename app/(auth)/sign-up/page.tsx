'use client';

import React from 'react'
import { useForm } from "react-hook-form";


const SignUp = () => {

  const {
    handleSubmit,
    register,
    control,
    formState: { errors, isSubmitting }
  } = useForm<SignUpFormData>({
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      country: 'US',
      investmentGoals: 'Growth',
      riskTolerance: 'medium',
      preferredIndustry: 'Technology',
    }, mode: "onBlur"
  },  );
  const onSubmit = async (data: SignUpFormData) => {
    try {
      console.log(data);
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <>
      <h1 className='form-title'>Sign Up & Personalize</h1>
    </>
  )
}

export default SignUp