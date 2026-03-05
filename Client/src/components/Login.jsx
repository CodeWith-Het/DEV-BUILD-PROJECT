import React, { useState, useEffect } from "react";
import { Github, Mail, Lock, ArrowRight } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // ✅ 1. Initialize useNavigate
  const navigate = useNavigate();

  // ✅ 2. ROUTE GUARD: Check if user is already logged in
  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      // User is logged in, redirect to home page immediately
      navigate("/");
    }
  }, [navigate]);

  // ✅ 3. Google Login Function (Fix)
  const handleGoogleLogin = () => {
    // Go through Vite proxy so cookies stay on the frontend origin.
    window.location.href = "/auth/google";
  };

  // ✅ 4. GitHub Login Function (Fix)
  const handleGithubLogin = () => {
    window.location.href = "/auth/github";
  };

  // ✅ 5. Email/Password Login Function
  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Please fill all fields");
      return;
    }

    try {
      const res = await axios.post(
        "/api/auth/login",
        {
          email,
          password,
        },
        {
          // Required so the browser stores the session cookie from the backend.
          withCredentials: true,
        },
      );

      if (res.status === 200) {
        toast.success("Login Successful! 🚀");

        localStorage.setItem("user", JSON.stringify(res.data.user));

        setTimeout(() => {
          window.location.href = "/";
        }, 1000);
      }
    } catch (err) {
      if (err.response && err.response.data) {
        toast.error(err.response.data.message);
      } else {
        toast.error("Something went wrong. Try again.");
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-gray-800 border border-gray-700 rounded-2xl shadow-xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">Welcome Back</h2>
          <p className="text-gray-400">Sign in to continue coding</p>
        </div>

        <div className="flex flex-col gap-3 mb-6">
          {/* ✅ Google Button with onClick */}
          <button
            onClick={handleGoogleLogin}
            className="flex items-center justify-center gap-3 w-full bg-white text-gray-900 font-medium py-2.5 rounded-lg hover:bg-gray-100 transition"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Google Login
          </button>

          {/* ✅ GitHub Button with onClick */}
          <button
            onClick={handleGithubLogin}
            className="flex items-center justify-center gap-3 w-full bg-gray-700 text-white font-medium py-2.5 rounded-lg border border-gray-600 hover:bg-gray-600 transition"
          >
            <Github className="w-5 h-5" />
            GitHub Login
          </button>
        </div>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-700"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-gray-800 text-gray-400">
              Or sign in with
            </span>
          </div>
        </div>

        <form className="space-y-4" onSubmit={handleLogin}>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-gray-900 border border-gray-700 text-white pl-10 pr-4 py-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm font-medium text-gray-300">
                Password
              </label>
              <a href="#" className="text-xs text-blue-400 hover:text-blue-300">
                Forgot password?
              </a>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-gray-900 border border-gray-700 text-white pl-10 pr-4 py-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition flex items-center justify-center gap-2 mt-6"
          >
            Sign In <ArrowRight className="w-5 h-5" />
          </button>
        </form>

        <p className="text-center text-gray-400 mt-6 text-sm">
          Don't have an account?{" "}
          <Link
            to="/signup"
            className="text-blue-400 hover:text-blue-300 font-medium ml-1"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
