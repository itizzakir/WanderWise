import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/useAuth';

const schema = yup.object({
  email: yup.string().email('Please enter a valid email').required('Email is required'),
  password: yup.string().required('Password is required'),
}).required();

const Login = () => {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: yupResolver(schema)
  });
  const navigate = useNavigate();
  const { login, user, isAuthenticated, logout, isAuthLoading } = useAuth();
  const [loginError, setLoginError] = useState(null);

  const onSubmit = async (data) => {
    setLoginError(null);
    const result = await login(data.email, data.password);
    if (result.success) {
      const loggedInUser = result.user;
      if (loggedInUser?.role === 'ADMIN') {
        navigate('/admin/dashboard');
      } else {
        navigate('/user/dashboard');
      }
      return;
    }

    setLoginError(result.message || 'Invalid email or password');
  };

  const handleLogout = () => {
    logout();
  };

  if (isAuthenticated && user) {
    const dashboardPath = user.role === 'ADMIN' ? '/admin/dashboard' : '/user/dashboard';

    return (
      <div className="page-shell flex items-center justify-center min-h-screen px-4">
        <div className="glass-card w-full max-w-md p-8">
          <h2 className="text-2xl font-bold mb-4 text-center">Already Logged In</h2>
          <p className="text-sm text-gray-600 text-center mb-6">
            You are signed in as {user.name}.
          </p>
          <div className="flex flex-col gap-3">
            <Link
              to={dashboardPath}
              className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-2 px-4 rounded-full text-center transition-colors"
            >
              Go to Dashboard
            </Link>
            <Link
              to="/"
              className="w-full bg-white/80 hover:bg-white text-slate-700 font-bold py-2 px-4 rounded-full text-center transition-colors border border-white/70"
            >
              Go to Home
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="w-full bg-accent hover:bg-accent/90 text-white font-bold py-2 px-4 rounded-full transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-shell flex items-center justify-center min-h-screen px-4">
      <div className="glass-card w-full max-w-md p-8">
        <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              {...register("email")}
              type="email"
              className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              {...register("password")}
              type="password"
              className="mt-1 block w-full px-3 py-2 bg-white border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
            />
            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
          </div>
          {loginError && <p className="text-red-500 text-sm text-center">{loginError}</p>}
          <button
            type="submit"
            disabled={isSubmitting || isAuthLoading}
            className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-2 px-4 rounded-full transition-colors"
          >
            {isSubmitting || isAuthLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        {!isAuthenticated && (
          <p className="text-center text-sm text-gray-600 mt-4">
            Don't have an account? <Link to="/signup-customer" className="text-primary hover:underline">Sign up</Link>
          </p>
        )}
      </div>
    </div>
  );
};

export default Login;
