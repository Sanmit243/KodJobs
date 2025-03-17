import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import users from '../users.json';
import type { User } from '../types';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return savedTheme ? savedTheme === 'dark' : prefersDark;
  });
  const [loginData, setLoginData] = useState({
    username: '',
    password: ''
  });
  const [signupData, setSignupData] = useState({
    username: '',
    password: '',
    dateOfBirth: '',
    email: '',
  });

  useEffect(() => {
    // Apply theme on mount
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginData.username || !loginData.password) {
      setError('All fields are required');
      return;
    }

    try {
      const user = users.find(u => 
        u.name === loginData.username && 
        u.password === loginData.password
      );

      if (user) {
        localStorage.setItem('user', JSON.stringify({
          name: user.name,
          email: user.email
        }));
        navigate('/dashboard');
      } else {
        setError('Invalid username or password');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError('Error during login. Please try again.');
    }
  };

  const calculateAge = (birthDate: string): number => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signupData.username || !signupData.password || !signupData.dateOfBirth || !signupData.email) {
      setError('All fields are required');
      return;
    }

    try {
      // Check if username already exists
      if (users.some(u => u.name === signupData.username)) {
        setError('Username already exists');
        return;
      }

      const age = calculateAge(signupData.dateOfBirth);

      // Create new user
      const newUser: User = {
        id: users.length + 1,
        name: signupData.username,
        password: signupData.password,
        email: signupData.email,
        dateOfBirth: signupData.dateOfBirth,
        age
      };

      // Add user to users array and update the file
      const updatedUsers = [...users, newUser];
      
      // Update the users.json file
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedUsers),
      });

      if (!response.ok) {
        throw new Error('Failed to save user');
      }

      // Update the imported users array
      users.push(newUser);

      // Store user data in localStorage
      localStorage.setItem('user', JSON.stringify({
        name: signupData.username,
        email: signupData.email
      }));

      navigate('/dashboard');
    } catch (err: any) {
      console.error('Signup error:', err);
      setError('Error during signup. Please try again.');
    }
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    show: { 
      opacity: 1, 
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 10
      }
    }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  return (
    <div className={`min-h-screen relative overflow-hidden transition-colors duration-300 ${isDarkMode ? 'bg-accent-800' : 'bg-accent-50'}`}>
      {/* Theme Toggle Button */}
      <motion.button
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        onClick={toggleTheme}
        className={`fixed top-4 right-4 z-50 p-2 rounded-full transition-all duration-200
          ${isDarkMode ? 'bg-accent-700 text-accent-200' : 'bg-accent-200 text-accent-700'}`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {isDarkMode ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
        )}
      </motion.button>

      <div className="min-h-screen flex relative z-10">
        {/* Left Section */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="show"
          className={`w-[60%] p-12 flex flex-col justify-center items-center ${
            isDarkMode ? 'bg-accent-900/50' : 'bg-white/50'
          } backdrop-blur-sm`}
        >
          <motion.h1
            variants={fadeInUp}
            className={`text-6xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-accent-900'}`}
          >
            Welcome to{" "}
            <motion.span 
              className="gradient-text"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              KodJobs
            </motion.span>
          </motion.h1>
          <motion.p
            variants={fadeInUp}
            className={`text-xl mb-12 max-w-xl text-center ${
              isDarkMode ? 'text-accent-300' : 'text-accent-600'
            }`}
          >
            Your professional gateway to discovering exceptional career opportunities. Join thousands of successful job seekers who found their dream positions through our platform.
          </motion.p>
          <motion.div
            variants={fadeInUp}
            className="relative w-4/5 overflow-hidden rounded-lg shadow-xl"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
          >
            <img
              src="https://www.workitdaily.com/media-library/happy-excited-man-on-laptop-finds-out-he-got-the-job-he-interviewed-for.jpg?id=22661881&width=1200&height=800&quality=85&coordinates=0%2C0%2C0%2C0"
              alt="Professional at work"
              className="w-full object-cover transform transition-transform duration-700 hover:scale-110"
            />
          </motion.div>
        </motion.div>

        {/* Right Section */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.3 }}
          className={`w-[40%] p-12 flex flex-col justify-center ${
            isDarkMode ? 'bg-accent-800/50' : 'bg-accent-100/50'
          } backdrop-blur-sm`}
        >
          {/* Login Section */}
          <motion.form
            onSubmit={handleLogin}
            className="mb-8"
            variants={fadeInUp}
            initial="hidden"
            animate="show"
          >
            <div className="space-y-4">
              <input
                type="text"
                required
                placeholder="Enter your username"
                className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-primary-500 transition-all duration-300 ${
                  isDarkMode
                    ? 'bg-accent-900/50 border-accent-700 text-white placeholder-accent-400'
                    : 'bg-white/50 border-accent-200 text-accent-900 placeholder-accent-500'
                }`}
                value={loginData.username}
                onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
              />
              <input
                type="password"
                required
                placeholder="Enter your password"
                className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-primary-500 transition-all duration-300 ${
                  isDarkMode
                    ? 'bg-accent-900/50 border-accent-700 text-white placeholder-accent-400'
                    : 'bg-white/50 border-accent-200 text-accent-900 placeholder-accent-500'
                }`}
                value={loginData.password}
                onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
              />
              <motion.button
                type="submit"
                className="btn-primary w-full py-3"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                Sign In
              </motion.button>
            </div>
          </motion.form>

          {/* Login Error Message */}
          {error && loginData.username && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              className={`mb-8 p-4 rounded-lg text-center ${
                isDarkMode
                  ? 'bg-red-500/10 border border-red-500/30 text-red-200'
                  : 'bg-red-50 border border-red-200 text-red-500'
              }`}
            >
              {error}
            </motion.div>
          )}

          {/* Divider with animation */}
          <motion.div 
            className="relative mb-8"
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ delay: 0.5 }}
          >
            <div className="absolute inset-0 flex items-center">
              <div className={`w-full border-t ${isDarkMode ? 'border-accent-700' : 'border-accent-300'}`}></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <motion.span 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className={`px-2 ${isDarkMode ? 'bg-accent-800/50 text-accent-400' : 'bg-accent-100/50 text-accent-500'}`}
              >
                or
              </motion.span>
            </div>
          </motion.div>

          {/* Sign Up Section */}
          <motion.form
            onSubmit={handleSignup}
            variants={fadeInUp}
            initial="hidden"
            animate="show"
            transition={{ delay: 0.7 }}
          >
            <h2 className={`text-2xl font-semibold mb-6 ${isDarkMode ? 'text-white' : 'text-accent-900'}`}>
              New User?
            </h2>
            <div className="space-y-4">
              <input
                type="text"
                required
                placeholder="Choose a username"
                className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-primary-500 transition-all duration-300 ${
                  isDarkMode
                    ? 'bg-accent-900/50 border-accent-700 text-white placeholder-accent-400'
                    : 'bg-white/50 border-accent-200 text-accent-900 placeholder-accent-500'
                }`}
                value={signupData.username}
                onChange={(e) => setSignupData({ ...signupData, username: e.target.value })}
              />
              <input
                type="password"
                required
                placeholder="Create a password"
                className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-primary-500 transition-all duration-300 ${
                  isDarkMode
                    ? 'bg-accent-900/50 border-accent-700 text-white placeholder-accent-400'
                    : 'bg-white/50 border-accent-200 text-accent-900 placeholder-accent-500'
                }`}
                value={signupData.password}
                onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
              />
              <input
                type="date"
                required
                placeholder="Date of Birth"
                className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-primary-500 transition-all duration-300 ${
                  isDarkMode
                    ? 'bg-accent-900/50 border-accent-700 text-white placeholder-accent-400'
                    : 'bg-white/50 border-accent-200 text-accent-900 placeholder-accent-500'
                }`}
                value={signupData.dateOfBirth}
                onChange={(e) => setSignupData({ ...signupData, dateOfBirth: e.target.value })}
              />
              <input
                type="email"
                required
                placeholder="Enter your email"
                className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-primary-500 transition-all duration-300 ${
                  isDarkMode
                    ? 'bg-accent-900/50 border-accent-700 text-white placeholder-accent-400'
                    : 'bg-white/50 border-accent-200 text-accent-900 placeholder-accent-500'
                }`}
                value={signupData.email}
                onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
              />
              <motion.button
                type="submit"
                className="btn-primary w-full py-3"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                Sign Up
              </motion.button>
            </div>
          </motion.form>

          {/* Signup Error Message */}
          {error && signupData.username && !loginData.username && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              className={`mt-4 p-4 rounded-lg text-center ${
                isDarkMode
                  ? 'bg-red-500/10 border border-red-500/30 text-red-200'
                  : 'bg-red-50 border border-red-200 text-red-500'
              }`}
            >
              {error}
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default LandingPage; 