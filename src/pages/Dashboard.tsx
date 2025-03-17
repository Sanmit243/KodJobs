import { motion } from 'framer-motion';
import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import type { Job, User } from '../types';

const Dashboard: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user] = useState<User | null>(() => {
    const userData = localStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
  });
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return savedTheme ? savedTheme === 'dark' : prefersDark;
  });
  const navigate = useNavigate();

  const getTimeAgo = useMemo(() => (date: string) => {
    const now = new Date();
    const postDate = new Date(date);
    const diffInDays = Math.floor((now.getTime() - postDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    return `${Math.floor(diffInDays / 30)} months ago`;
  }, []);

  // Optimized extractSkills function with memoized arrays
  const { nonSkillPhrases, commonSkills } = useMemo(() => ({
    nonSkillPhrases: [
      "bachelor's degree", "master's degree", "phd", "years of experience",
      "experience in", "ability to", "strong", "excellent", "proven",
      "demonstrated", "track record", "background in", "proficiency in",
      "proficient in", "experience with", "familiar with", "understanding of",
      "knowledge of", "minimum", "preferred", "required", "qualification",
      "degree in", "work experience"
    ],
    commonSkills: [
      "javascript", "python", "java", "c\\+\\+", "ruby", "php", "typescript",
      "react", "angular", "vue", "node", "express", "django", "flask",
      "mongodb", "postgresql", "mysql", "redis", "aws", "azure", "gcp",
      "docker", "kubernetes", "jenkins", "git", "agile", "scrum",
      "html", "css", "sass", "less", "webpack", "babel", "rest api",
      "graphql", "sql", "nosql", "linux", "unix", "ci/cd", "devops",
      "machine learning", "ai", "data science", "blockchain", "cloud computing",
      "react native", "flutter", "swift", "kotlin", "android", "ios"
    ]
  }), []);

  const extractSkills = useMemo(() => (content: string) => {
    const skillsPattern = new RegExp(`\\b(${commonSkills.join('|')})\\b`, 'gi');
    const foundSkills = [...content.matchAll(skillsPattern)]
      .map(match => match[0].toLowerCase())
      .filter((value, index, self) => self.indexOf(value) === index)
      .slice(0, 4);

    if (foundSkills.length > 0) return foundSkills;

    const skillsRegex = /(?:Required Skills|Key Skills|Technical Skills|Core Competencies)(?:\s*:|)\s*([^.]*\.)/i;
    const match = content.match(skillsRegex);
    
    if (match && match[1]) {
      const skillsText = match[1].replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
      const skills = skillsText
        .split(/[,;•\n]/)
        .map(skill => skill.trim())
        .filter(skill => {
          const isNonSkill = nonSkillPhrases.some(phrase => 
            skill.toLowerCase().includes(phrase.toLowerCase())
          );
          return !isNonSkill && skill.length > 2 && skill.length < 50;
        })
        .slice(0, 4);
      
      return skills.length > 0 ? skills : ['Not specified'];
    }
    
    return ['Not specified'];
  }, [commonSkills, nonSkillPhrases]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredJobs(jobs);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = jobs.filter(job => {
      const matchTitle = job.name.toLowerCase().includes(query);
      const matchCompany = job.company.name.toLowerCase().includes(query);
      const matchLocation = job.locations[0]?.name.toLowerCase().includes(query);
      const matchLevel = job.levels[0]?.name.toLowerCase().includes(query);
      const matchSkills = extractSkills(job.contents || '').some(skill => 
        skill.toLowerCase().includes(query)
      );

      return matchTitle || matchCompany || matchLocation || matchLevel || matchSkills;
    });

    setFilteredJobs(filtered);
  }, [searchQuery, jobs, extractSkills]);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get(
          'https://www.themuse.com/api/public/jobs?page=1&api_key=1c57534ab44c70542fc3958a66bad684673da2890c930d3ab1060142d0a5a5ab'
        );
        
        if (response.data?.results) {
          const fetchedJobs = response.data.results.slice(0, 9);
          setJobs(fetchedJobs);
          setFilteredJobs(fetchedJobs);
        } else {
          throw new Error('Invalid response format');
        }
      } catch (err) {
        console.error('Error fetching jobs:', err);
        setError('Failed to load jobs. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark');
  };

  // Animation constants
  const staggerDuration = 0.08;

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <motion.nav
        initial="hidden"
        animate="visible"
        className={`fixed w-full z-10 ${
          isDarkMode ? 'bg-gray-800/80 backdrop-blur-md' : 'bg-white/80 backdrop-blur-md'
        } shadow-lg`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center space-x-4"
          >
            <h1 className="text-2xl font-bold">
              <span className="gradient-text">KodJobs</span>
            </h1>
          </motion.div>

          {/* Search Bar */}
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex-1 max-w-xl mx-4"
          >
            <div className={`flex items-center px-4 py-2 rounded-lg ${
              isDarkMode ? 'bg-gray-800/50' : 'bg-gray-200/50'
            } border ${
              isDarkMode ? 'border-gray-700' : 'border-gray-200'
            } focus-within:ring-2 ring-primary-500/50 transition-all duration-300`}>
              <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search jobs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`ml-2 w-full bg-transparent border-none focus:outline-none ${
                  isDarkMode ? 'text-white placeholder-gray-500' : 'text-gray-900 placeholder-gray-400'
                }`}
              />
            </div>
          </motion.div>

          <div className="flex items-center space-x-4">
            <motion.button
              onClick={toggleTheme}
              className={`p-2 rounded-full ${isDarkMode ? 'bg-gray-700 text-gray-200' : 'bg-gray-200 text-gray-700'} hover:scale-110 transition-all duration-200`}
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

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className={`flex items-center gap-3 px-4 py-2 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-200/50'} backdrop-blur-sm`}
            >
              <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Welcome, {user?.name || 'User'}!
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  localStorage.removeItem('user');
                  window.location.href = '/';
                }}
                className={`p-2 rounded-full hover:bg-gray-300/20 transition-colors duration-200`}
                title="Sign Out"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </motion.button>
            </motion.div>
          </div>
        </div>
      </motion.nav>

      <div className="container mx-auto px-4 pt-24 pb-12">
        {loading ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-center items-center h-64"
          >
            <div className={`w-12 h-12 border-4 ${isDarkMode ? 'border-primary-400' : 'border-primary-500'} border-t-transparent rounded-full animate-spin`}></div>
          </motion.div>
        ) : error ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className={`max-w-2xl mx-auto text-center p-6 rounded-xl border ${isDarkMode ? 'bg-red-900/20 border-red-700/30' : 'bg-red-50 border-red-200/50'}`}
          >
            <p className={isDarkMode ? 'text-red-300' : 'text-red-500'}>{error}</p>
            <motion.button
              onClick={() => window.location.reload()}
              className="btn-primary mt-4"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              Try Again
            </motion.button>
          </motion.div>
        ) : filteredJobs.length === 0 && !loading && !error ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className={`max-w-2xl mx-auto text-center p-6 rounded-xl border ${
              isDarkMode ? 'bg-gray-800/50 border-gray-700/50' : 'bg-gray-200/80 border-gray-300/50'
            }`}
          >
            <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
              No jobs found matching your search criteria.
            </p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredJobs.map((job, index) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{
                  duration: 0.3,
                  delay: index * staggerDuration,
                }}
                className={`rounded-xl overflow-hidden
                  ${isDarkMode 
                    ? 'bg-gray-800 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.3)] hover:shadow-[0_16px_20px_-3px_rgba(0,0,0,0.4)]' 
                    : 'bg-white shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1)] hover:shadow-[0_16px_20px_-3px_rgba(0,0,0,0.15)]'
                  }
                  hover:scale-[1.02] hover:-translate-y-2
                  transform-gpu transition-[transform,box-shadow] duration-300 ease-out hover:ease-[cubic-bezier(0.34,1.56,0.64,1)]`}
              >
                <div className="flex flex-col h-full p-6">
                  <div className="flex justify-between items-start gap-4 mb-4">
                    <h3 className={`text-lg font-semibold flex-grow ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {job.name || 'Untitled Position'}
                    </h3>
                    <div className="flex-shrink-0">
                      <span className={`inline-block px-3 py-1 rounded-full text-sm whitespace-nowrap
                        ${isDarkMode 
                          ? 'bg-primary-500/20 text-primary-300' 
                          : 'bg-primary-100/50 text-primary-700'}`}
                      >
                        {job.levels?.[0]?.name || 'Not specified'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <p className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {job.company?.name || 'Company Name Not Available'}
                    </p>
                    <p className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>
                      {job.locations?.[0]?.name || 'Location Not Specified'}
                    </p>
                  </div>

                  <div className="mb-4 flex-grow">
                    <div className="flex flex-wrap gap-2">
                      {extractSkills(job.contents || '').map((skill, index) => (
                        <span
                          key={index}
                          className={`px-2 py-1 rounded text-xs
                            ${isDarkMode 
                              ? 'bg-primary-900/30 text-primary-300' 
                              : 'bg-primary-50/50 text-primary-700'}`}
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className={`flex justify-between items-center mt-auto pt-4 border-t ${isDarkMode ? 'border-gray-700/30' : 'border-gray-300/30'}`}>
                    <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>
                      {getTimeAgo(job.publication_date)}
                    </span>
                    <button
                      className={`px-4 py-2 rounded-lg font-medium text-sm 
                        hover:scale-105 active:scale-95
                        transition-all duration-200
                        ${isDarkMode 
                          ? 'bg-primary-500 hover:bg-primary-400 text-white' 
                          : 'bg-primary-600 hover:bg-primary-500 text-white'}`}
                      onClick={() => navigate(`/job/${job.id}`)}
                    >
                      Apply Now
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard; 