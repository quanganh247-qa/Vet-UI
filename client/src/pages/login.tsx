import React, { useState } from "react";
import { LogIn, Eye, EyeOff, Mail, Lock, User } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { useLocation } from "wouter";

export const LoginForm: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [, setLocation] = useLocation();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setError("Please enter both email and password");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await login({ username, password });
      setLocation("/dashboard");
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || "An unexpected error occurred";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#F0F4FC]">
      {/* Left Side */}
      <div className="hidden md:flex flex-col justify-between md:w-1/2 bg-[#EBF2FE] p-10">
        {/* Logo top-left */}
        <div className="h-16 w-16">
          <svg width="50" height="50" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M25 12.5C18.75 12.5 12.5 18.75 12.5 25C12.5 31.25 18.75 37.5 25 37.5C31.25 37.5 37.5 31.25 37.5 25" stroke="#2C78E4" strokeWidth="3" strokeLinecap="round"/>
            <path d="M25 12.5C31.25 12.5 37.5 18.75 37.5 25" stroke="#2C78E4" strokeWidth="3" strokeLinecap="round" strokeOpacity="0.5"/>
            <circle cx="18.75" cy="25" r="2.5" fill="#2C78E4"/>
            <circle cx="31.25" cy="25" r="2.5" fill="#2C78E4"/>
          </svg>
        </div>
        
        {/* Centered content */}
        <div className="flex flex-col items-center justify-center">
          <div className="mb-8">
            {/* Computer monitor illustration */}
            <svg width="160" height="140" viewBox="0 0 160 140" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="30" y="20" width="100" height="80" rx="4" stroke="#2C78E4" strokeWidth="3" fill="#fff"/>
              <rect x="50" y="100" width="60" height="5" rx="2" fill="#2C78E4"/>
              <rect x="70" y="105" width="20" height="15" rx="2" fill="#2C78E4" fillOpacity="0.3"/>
            </svg>
          </div>
          
          <h2 className="text-xl font-semibold text-[#111827] mb-3">Streamline Your Practice</h2>
          <p className="text-[#4B5563] text-center mb-6 max-w-sm">
            Manage appointments, clients, and payments all in one place with our comprehensive platform.
          </p>
        </div>
        
        {/* Testimonial */}
        <div className="bg-white rounded-2xl shadow-sm p-5 mb-4">
          <div className="flex items-start">
            
           
          </div>
        </div>
      </div>
      
      {/* Right Side */}
      <div className="flex flex-col justify-center items-center w-full md:w-1/2 bg-white min-h-screen p-6">
        <div className="w-full max-w-md">
          
          
          {/* Welcome text */}
          <h1 className="text-center text-2xl font-semibold text-[#111827] mb-2">Welcome to Digital Veterinary</h1>
          <p className="text-center text-[#4B5563] mb-8">The all-in-one software that helps you achieve more with less work</p>
          
          {/* Login form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 text-red-700 px-4 py-3 rounded-xl text-sm border border-red-200">
                {error}
              </div>
            )}
            
            {/* Email */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-[#111827] mb-1">Username</label>
              <div className="relative">
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2C78E4] focus:border-[#2C78E4] pr-10 bg-white text-[#111827] placeholder-[#9CA3AF]"
                  placeholder="Enter your username"
                  required
                  aria-label="Username"
                  tabIndex={0}
                />
                <User className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              </div>
            </div>
            
            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="password" className="block text-sm font-medium text-[#111827]">Password</label>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2C78E4] focus:border-[#2C78E4] pr-10 bg-white text-[#111827] placeholder-[#9CA3AF]"
                  placeholder="Enter your password"
                  required
                  aria-label="Password"
                  tabIndex={0}
                />
                <button
                  type="button"
                  tabIndex={0}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#2C78E4]"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            
            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center py-2.5 px-4 rounded-xl text-white bg-[#2C78E4] hover:bg-[#2C78E4]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2C78E4] transition-colors font-medium text-base shadow-sm"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Logging in...
                </>
              ) : (
                <>
                  <LogIn className="mr-2 h-4 w-4" />
                  Log In
                </>
              )}
            </button>
            
          
          </form>
          

        </div>
      </div>
    </div>
  );
};

export default LoginForm;
