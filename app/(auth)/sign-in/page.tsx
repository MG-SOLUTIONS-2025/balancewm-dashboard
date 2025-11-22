'use client';

import React from 'react'
import { useForm } from "react-hook-form";
import InputField from '@/components/forms/InputField';
import { Button } from '@/components/ui/button';
import SelectField from '@/components/forms/SelectField';
import { CountrySelectField } from '@/components/forms/CountrySelectField';
import FooterLink from '@/components/forms/FooterLink';
import { INVESTMENT_GOALS, PREFERRED_INDUSTRIES, RISK_TOLERANCE_OPTIONS } from '@/lib/constants';
import { signInWithEmail } from '@/lib/actions/auth.actions';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

const SignIn = () => {

  const router = useRouter();

  const {
    handleSubmit,
    register,
    formState: { errors, isSubmitting }
  } = useForm<SignInFormData>({
    defaultValues: {
      email: '',
      password: '',
    }, mode: "onBlur"
  },);
  const onSubmit = async (data: SignInFormData) => {
    try {
      const result = await signInWithEmail(data);

      if (result?.success) {
        router.push('/');
      } else {
        toast.error('Sign in failed', {
          description:
            result && 'error' in result && typeof result.error === 'string'
              ? result.error
              : 'Failed to sign in.',
        });
      }

    } catch (e) {
      console.error(e);
      toast.error('Sign in failed', {
        description: e instanceof Error ? e.message : 'Failed to sign in.'
      })
    }
  }



  return (
    <>
      <h1 className='form-title'>Log in to your account</h1>

      <form onSubmit={handleSubmit(onSubmit)} className='space-y-5' >


        <InputField
          name='email'
          label='Email'
          placeholder='john.doe@example.com'
          register={register}
          error={errors.email}
          validation={{ required: 'Email is required', pattern: /^[a-zA-Z0-9._%-]@[a-zA-Z0-9.-]\.[a-zA-Z]{2,}$/, message: 'Email address is required' }}
        >
        </InputField>


        <InputField
          name='password'
          label='Password'
          placeholder='*********'
          type='password'
          register={register}
          error={errors.password}
          validation={{ required: 'Password is required', minLength: 8 }}
        >
        </InputField>


        <Button type='submit' disabled={isSubmitting} className='yellow-btn w-full mt-5' >
          {isSubmitting ? 'Logging In...' : 'Log me in'}
        </Button>

        <FooterLink text="Don't have an account?" linkText='Create one today' href="/sign-up" />


      </form>
    </>
  )
}


export default SignIn