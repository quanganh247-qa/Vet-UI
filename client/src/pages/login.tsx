import React, { useState } from "react";
import { LogIn, Eye, EyeOff, Mail, Lock } from "lucide-react";
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
    <div className="min-h-screen flex flex-col md:flex-row bg-[#f6fcfe]">
      {/* Left Side */}
      <div className="hidden md:flex flex-col justify-center items-center w-1/2 bg-[#eaf7fa] p-12">
        {/* Illustration */}
        <div className="mb-10">
          {/* Replace below with SVG or illustration as needed */}
          <svg width="340" height="220" viewBox="0 0 340 220" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="10" y="20" width="320" height="180" rx="16" fill="#4fd1d9" fillOpacity="0.2" />
            <rect x="30" y="40" width="120" height="40" rx="8" fill="#4fd1d9" fillOpacity="0.5" />
            <rect x="170" y="40" width="60" height="40" rx="8" fill="#fff" />
            <rect x="30" y="100" width="100" height="60" rx="8" fill="#fff" />
            <rect x="140" y="100" width="120" height="60" rx="8" fill="#fff" />
            <rect x="60" y="170" width="60" height="30" rx="6" fill="#fff" />
            <rect x="200" y="170" width="80" height="30" rx="6" fill="#4fd1d9" fillOpacity="0.5" />
            <rect x="180" y="60" width="30" height="10" rx="3" fill="#4fd1d9" />
            <rect x="190" y="120" width="20" height="30" rx="4" fill="#4fd1d9" />
            <rect x="215" y="120" width="20" height="40" rx="4" fill="#1e293b" />
            <rect x="240" y="120" width="20" height="20" rx="4" fill="#4fd1d9" />
            <circle cx="200" cy="60" r="16" fill="#fff" />
            <path d="M200 60 A12 12 0 1 1 188 48" stroke="#4fd1d9" strokeWidth="4" fill="none" />
            <text x="192" y="65" fontSize="12" fill="#888">34%</text>
          </svg>
        </div>
        {/* Tip of the week */}
        <div className="bg-white rounded-lg shadow p-6 w-full max-w-md text-center">
          <div className="text-[#23b3c7] font-semibold mb-2">Tip of the week</div>
          <div className="text-[#1e293b] text-sm mb-2">
            Now it's easier to take down payments, quickly add a credit or offset outstanding balances. From the client card, simply click to add a new payment, select the amount and the payment method and click Save. <a href="#" className="text-[#23b3c7] underline">Read more</a>
          </div>
          {/* Carousel dots */}
          <div className="flex justify-center gap-2 mt-4">
            <span className="w-2 h-2 bg-[#23b3c7] rounded-full inline-block" />
            <span className="w-2 h-2 bg-[#b6e6f2] rounded-full inline-block" />
            <span className="w-2 h-2 bg-[#b6e6f2] rounded-full inline-block" />
          </div>
        </div>
      </div>
      {/* Right Side */}
      <div className="flex flex-col justify-center items-center w-full md:w-1/2 bg-white min-h-screen">
        <div className="w-full max-w-md px-6">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <div className="bg-[#23b3c7] rounded-lg w-16 h-16 flex items-center justify-center">
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="40" height="40" rx="12" fill="#23b3c7" />
                <path d="M13 28V14C13 12.8954 13.8954 12 15 12H25C26.1046 12 27 12.8954 27 14V28" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
                <path d="M20 18C21.1046 18 22 17.1046 22 16C22 14.8954 21.1046 14 20 14C18.8954 14 18 14.8954 18 16C18 17.1046 18.8954 18 20 18Z" fill="#fff" />
                <path d="M20 18V26" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
                <path d="M17 26H23" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
          </div>
          {/* Welcome Text */}
          <h1 className="text-center text-2xl font-semibold text-[#1e293b] mb-2">Welcome to Digitail!</h1>
          <div className="text-center text-[#888] mb-8 text-sm">The all-in-one software that helps you achieve more with less work</div>
          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && <div className="text-[#ff5a5f] text-sm text-center">{error}</div>}
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[#1e293b] mb-1">Email</label>
              <div className="relative">
                <input
                  id="email"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-3 py-2 border border-[#b6e6f2] rounded-md focus:outline-none focus:ring-2 focus:ring-[#23b3c7] focus:border-[#23b3c7] pr-10 bg-[#f6fcfe] text-[#1e293b] placeholder-[#888]"
                  placeholder="Enter your email here"
                  required
                  aria-label="Email"
                  tabIndex={0}
                />
                <Mail className="absolute right-3 top-1/2 -translate-y-1/2 text-[#b6e6f2]" size={18} />
              </div>
            </div>
            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="password" className="block text-sm font-medium text-[#1e293b]">Password</label>
                <a href="#" className="text-sm text-[#23b3c7] hover:underline">Forgot Password?</a>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-[#b6e6f2] rounded-md focus:outline-none focus:ring-2 focus:ring-[#23b3c7] focus:border-[#23b3c7] pr-10 bg-[#f6fcfe] text-[#1e293b] placeholder-[#888]"
                  placeholder="Enter your password here"
                  required
                  aria-label="Password"
                  tabIndex={0}
                />
                <button
                  type="button"
                  tabIndex={0}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword(!showPassword)}
                  onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#b6e6f2] hover:text-[#23b3c7]"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center py-2 px-4 rounded-md text-white bg-[#b6e6f2] hover:bg-[#23b3c7] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#23b3c7] transition-colors font-semibold text-lg"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
