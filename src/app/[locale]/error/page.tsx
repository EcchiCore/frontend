"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Home, RefreshCcw } from "lucide-react";

const translations = {
  error: "An error occurred",
  redirecting: "Redirecting to the home page in",
  seconds: "seconds",
  returnHome: "Return Home",
  refresh: "Refresh Page",
  status: {
    401: "401 - Unauthorized",
    403: "403 - Forbidden",
    404: "404 - Page Not Found",
    405: "405 - Method Not Allowed",
    500: "500 - Internal Server Error",
  },
};

type StatusCodes = keyof typeof translations.status;

export default function ErrorPage() {
  const [errorMessage, setErrorMessage] = useState("");
  const [redirectMessage, setRedirectMessage] = useState("");
  const [countdown, setCountdown] = useState(3);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  
  const statusCode = typeof window !== 'undefined' 
    ? new URLSearchParams(window.location.search).get('statusCode') 
    : null;

  useEffect(() => {
    const code = Number(statusCode) as StatusCodes;
    setErrorMessage(translations.status[code] || translations.status[404]);
    setRedirectMessage(translations.redirecting);
    setMounted(true);
  }, [statusCode]);

  useEffect(() => {
    const timer = setInterval(() => {
      if (countdown > 0) {
        setCountdown((prevCountdown) => prevCountdown - 1);
      } else {
        clearInterval(timer);
        router.push("/");
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown, router]);

  const handleRefresh = () => {
    window.location.reload();
  };

  const handleHomeClick = () => {
    router.push("/");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className={`absolute rounded-full bg-gradient-to-br from-blue-200/20 to-purple-200/20
              animate-float transform rotate-${Math.random() * 360}`}
            style={{
              width: `${Math.random() * 100 + 50}px`,
              height: `${Math.random() * 100 + 50}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${Math.random() * 10 + 10}s`
            }}
          />
        ))}
      </div>

      {/* Main content */}
      <div 
        className={`transform transition-all duration-700 ease-out z-10
          ${mounted ? 'translate-y-0 opacity-100' : '-translate-y-12 opacity-0'}
          bg-white/80 backdrop-blur-lg p-8 rounded-xl shadow-2xl max-w-md w-full mx-4
          border border-white/50`}
      >
        <div className="relative flex items-center justify-center mb-8">
          <div className="absolute inset-0 bg-red-500/10 rounded-full animate-ping" />
          <AlertCircle 
            className={`w-20 h-20 text-red-500 relative z-10
              transition-all duration-500 ease-in-out transform
              ${mounted ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}
              hover:scale-110 hover:rotate-12 transition-transform`}
          />
        </div>
        
        <h1 
          className={`text-4xl font-bold text-center bg-gradient-to-r from-red-500 to-pink-600
            bg-clip-text text-transparent mb-6
            transition-all duration-500 delay-300
            ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}
        >
          {errorMessage}
        </h1>
        
        <div 
          className={`text-center space-y-6 transition-all duration-500 delay-500
            ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}
        >
          <p className="text-gray-600 text-lg">
            {redirectMessage}{' '}
            <span className="font-mono text-2xl font-bold text-red-500 inline-block w-8 text-center
              animate-bounce bg-red-50 rounded-lg mx-1 shadow-sm">
              {countdown}
            </span>{' '}
            {translations.seconds}
          </p>

          <div className="flex justify-center space-x-4 pt-4">
            <button
              onClick={handleHomeClick}
              className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500
                text-white rounded-full shadow-lg hover:shadow-xl transform hover:-translate-y-1
                transition-all duration-300 group"
            >
              <Home className="mr-2 w-5 h-5 group-hover:rotate-12 transition-transform" />
              {translations.returnHome}
            </button>
            <button
              onClick={handleRefresh}
              className="flex items-center px-6 py-3 bg-gradient-to-r from-gray-500 to-gray-600
                text-white rounded-full shadow-lg hover:shadow-xl transform hover:-translate-y-1
                transition-all duration-300 group"
            >
              <RefreshCcw className="mr-2 w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
              {translations.refresh}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}