import { useEffect, useState } from 'react';
import API from '../api';

const Login = () => {

  const [state, setState] = useState('Sign Up');

  // If already logged in, redirect to home
  useEffect(() => {
    if (localStorage.getItem('token')) {
      window.location.href = '/';
    }
  }, []);

  const [email,setEmail] = useState('')
  const [password, setPassword] =useState('')
  const [name, setName] = useState('')

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("error"); // 'success' or 'error'
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    setMessage("");
    try {
      if (state === 'Sign Up') {
        // Signup
        const res = await API.post('/auth/signup', { name, email, password });
        if (res.data.msg === 'Email already registered') {
          setMessageType('error');
          setMessage('User already exists.');
        } else {
          setMessageType('success');
          setMessage('Signup successful!');
          setState('Login');
        }
      } else {
        // Login
        const res = await API.post('/auth/login', { email, password });
        setMessageType('success');
        setMessage(res.data.msg || 'Login successful!');
        if (res.data.token) {
          localStorage.setItem('token', res.data.token);
          window.location.href = '/'; // redirect to homepage
        }
      }
    } catch (err) {
      setMessageType('error');
      setMessage(err?.response?.data?.msg || err.message || 'An error occurred.');
    }
  }

  return (
    <>
    <form className='min-h-[80vh] flex items-center' onSubmit={onSubmitHandler}>
      <div className='flex flex-col gap-3 m-auto items-start p-8 min-w-[340px] sm:min-w-96 border rounded-xl text-zinc-600 text-sm shadow-lg'>
        {message && (
          <div className={`w-full mb-2 text-center py-2 rounded font-semibold ${messageType === 'success' ? 'bg-green-100 text-green-700 border border-green-300' : 'bg-red-100 text-red-700 border border-red-300'}`}>{message}</div>
        )}
        <p className='text-2xl font-semibold'>{state === 'Sign Up' ? "Create Account" : "Login" }</p>
        <p>Please {state === "Sign Up" ? "sign Up" : "log in" } to book appointment</p>
        {
          state === "Sign Up" && <div className='w-full'>
          <p>Full Name</p>
          <input className='border border-s-zinc-300 rounded w-full p-2 mt-1' type="text" onChange={(e)=>setName(e.target.value)} value = {name} required/>
        </div>
        }
        
        <div className='w-full'>
          <p>Email</p>
          <input className='border border-s-zinc-300 rounded w-full p-2 mt-1' type="email" onChange={(e)=>setEmail(e.target.value)} value = {email} required/>
        </div>

        <div className='w-full'>
          <p>Password</p>
          <input className='border border-s-zinc-300 rounded w-full p-2 mt-1' type="password" onChange={(e)=>setPassword(e.target.value)} value = {password} required/>
        </div>
        <button className='bg-primary text-white w-full py-2 rounded-full text-base'>{state === 'Sign Up' ? "Create Account" : "Login" }</button>
        {
          state === "Sign Up"
          ? <p>Already have an account? <span onClick={()=>setState('Login')} className='text-primary underline cursor-pointer'>Login here</span> </p>
          : <p>Create an new account? <span onClick={()=>setState('Sign Up')} className='text-primary underline cursor-pointer'>click here</span></p>
        }
      </div>
    </form>
    </>
  )
}

export default Login