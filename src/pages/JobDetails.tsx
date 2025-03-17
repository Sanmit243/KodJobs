import { motion } from 'framer-motion';
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import type { Job } from '../types';

const extractSection = (content: string, sectionName: string): string => {
  const regex = new RegExp(`<h2[^>]*>${sectionName}[^<]*</h2>([\\s\\S]*?)(?=<h2|$)`, 'i');
  const match = content.match(regex);
  return match ? match[0] + (match[1] || '') : '';
};

const JobDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [job, setJob] = useState<Job | null>(null);
  const [isApplying, setIsApplying] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return savedTheme ? savedTheme === 'dark' : prefersDark;
  });

  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get(
          `https://www.themuse.com/api/public/jobs/${id}?api_key=1c57534ab44c70542fc3958a66bad684673da2890c930d3ab1060142d0a5a5ab`
        );
        setJob(response.data);
      } catch (err) {
        console.error('Error fetching job details:', err);
        setError('Failed to load job details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchJobDetails();
    }
  }, [id]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    // Here you would typically send the application data to your backend
    console.log({
      fullName: formData.get('fullName'),
      email: formData.get('email'),
      resume: formData.get('resume'),
      coverLetter: formData.get('coverLetter')
    });

    // Show success message and close modal
    alert('Application submitted successfully!');
    setIsApplying(false);
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'
      }`}>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'
      }`}>
        <div className={`max-w-md p-6 rounded-xl text-center ${
          isDarkMode ? 'bg-red-900/20 border border-red-700/30' : 'bg-red-50 border border-red-200/50'
        }`}>
          <p className={isDarkMode ? 'text-red-300' : 'text-red-500'}>
            {error || 'Job not found'}
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="max-w-5xl mx-auto px-4 py-12">
        {/* Back Button */}
        <button
          onClick={() => navigate('/dashboard')}
          className={`mb-6 flex items-center gap-2 px-4 py-2 rounded-lg ${
            isDarkMode 
              ? 'bg-gray-800 hover:bg-gray-700 text-gray-300' 
              : 'bg-white hover:bg-gray-100 text-gray-700'
          } transition-colors duration-200`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back to Jobs
        </button>

        {/* Main Content */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className={`rounded-2xl overflow-hidden ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          } shadow-xl`}
        >
          {/* Header Section */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className={`p-8 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}
          >
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="flex items-center gap-3 mb-3"
                >
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    isDarkMode 
                      ? 'bg-primary-500/20 text-primary-300' 
                      : 'bg-primary-100 text-primary-700'
                  }`}>
                    {job.levels?.[0]?.name || 'Not specified'}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {job.locations[0]?.name || 'Location not specified'}
                  </span>
                </motion.div>
                <motion.h1 
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-3xl font-bold mb-2"
                >
                  {job.name}
                </motion.h1>
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="flex items-center gap-2"
                >
                  <p className={`text-xl ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {job.company.name}
                  </p>
                </motion.div>
              </div>
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setIsApplying(true)}
                className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-medium transition-colors shadow-lg shadow-primary-600/20"
              >
                Apply Now
              </motion.button>
            </div>
          </motion.div>

          {/* Job Description */}
          <div className={`p-8 ${
            isDarkMode ? 'bg-gray-800/50' : 'bg-gray-50/50'
          }`}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className={`p-6 rounded-xl ${
                isDarkMode ? 'bg-gray-700/50' : 'bg-white'
              }`}
            >
              <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Job Description
              </h2>
              <div className={`prose max-w-none ${
                isDarkMode 
                  ? 'prose-invert prose-p:text-gray-300 prose-li:text-gray-300 prose-headings:text-white' 
                  : 'prose-gray'
              } prose-headings:font-semibold prose-h2:text-xl prose-h3:text-lg
              prose-p:leading-relaxed prose-li:leading-relaxed
              prose-a:text-primary-600 prose-a:no-underline hover:prose-a:underline
              prose-strong:text-primary-600 ${isDarkMode ? 'prose-strong:text-primary-400' : ''}
              prose-ul:list-disc prose-ol:list-decimal
              [&>h2]:mt-8 [&>h2]:mb-4 [&>h2:first-child]:mt-0
              [&>p]:mb-4 [&>ul]:mb-4 [&>ol]:mb-4
              [&>*:last-child]:mb-0`} 
              dangerouslySetInnerHTML={{ __html: job.contents }} />
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Application Modal */}
      {isApplying && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className={`w-full max-w-md p-8 rounded-2xl ${
              isDarkMode ? 'bg-gray-800' : 'bg-white'
            } shadow-2xl`}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold">Apply for {job.name}</h2>
              <button
                onClick={() => setIsApplying(false)}
                className={`p-2 rounded-full hover:bg-gray-700/20 transition-colors`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className={`block mb-2 font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Full Name
                </label>
                <input
                  name="fullName"
                  type="text"
                  required
                  className={`w-full px-4 py-3 rounded-xl border ${
                    isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-white focus:border-primary-500'
                      : 'bg-white border-gray-300 text-gray-900 focus:border-primary-500'
                  } focus:ring-2 focus:ring-primary-500/20 focus:outline-none transition-colors duration-200`}
                />
              </div>
              <div>
                <label className={`block mb-2 font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Email
                </label>
                <input
                  name="email"
                  type="email"
                  required
                  className={`w-full px-4 py-3 rounded-xl border ${
                    isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-white focus:border-primary-500'
                      : 'bg-white border-gray-300 text-gray-900 focus:border-primary-500'
                  } focus:ring-2 focus:ring-primary-500/20 focus:outline-none transition-colors duration-200`}
                />
              </div>
              <div>
                <label className={`block mb-2 font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Resume
                </label>
                <div className={`relative rounded-xl border-2 border-dashed ${
                  isDarkMode
                    ? 'bg-gray-700/50 border-gray-600 hover:border-primary-500'
                    : 'bg-gray-50 border-gray-300 hover:border-primary-500'
                  } transition-colors duration-200 group`}
                >
                  <input
                    name="resume"
                    type="file"
                    required
                    accept=".pdf,.doc,.docx"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="p-6 text-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className={`mx-auto h-10 w-10 mb-3 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    } group-hover:text-primary-500 transition-colors duration-200`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Drop your resume here or <span className="text-primary-500">browse</span>
                    </p>
                    <p className={`text-xs mt-2 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                      Supported formats: PDF, DOC, DOCX
                    </p>
                  </div>
                </div>
              </div>
              <div>
                <label className={`block mb-2 font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Cover Letter
                </label>
                <textarea
                  name="coverLetter"
                  rows={4}
                  required
                  className={`w-full px-4 py-3 rounded-xl border ${
                    isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-white focus:border-primary-500'
                      : 'bg-white border-gray-300 text-gray-900 focus:border-primary-500'
                  } focus:ring-2 focus:ring-primary-500/20 focus:outline-none transition-colors duration-200`}
                />
              </div>
              <div className="flex gap-4 pt-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="flex-1 px-6 py-3 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-medium transition-colors duration-200 shadow-lg shadow-primary-600/20"
                >
                  Submit Application
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={() => setIsApplying(false)}
                  className={`px-6 py-3 rounded-xl ${
                    isDarkMode
                      ? 'bg-gray-700 hover:bg-gray-600'
                      : 'bg-gray-100 hover:bg-gray-200'
                  } transition-colors duration-200`}
                >
                  Cancel
                </motion.button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default JobDetails; 