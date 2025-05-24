
import React, { useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft, Zap, AlertTriangle } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black relative overflow-hidden flex items-center justify-center">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-avalanche-red/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-avalanche-red/5 to-blue-500/5 rounded-full blur-3xl animate-spin [animation-duration:60s]"></div>
      </div>

      <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8">
        {/* 404 Icon */}
        <div className="mb-8">
          <div className="w-32 h-32 mx-auto bg-gradient-to-br from-avalanche-red to-red-600 rounded-full flex items-center justify-center glow-icon mb-6">
            <AlertTriangle className="w-16 h-16 text-white animate-bounce" />
          </div>
        </div>

        {/* Error Message */}
        <div className="mb-12">
          <h1 className="text-8xl md:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-avalanche-red to-white mb-6 tracking-tight glow-text">
            404
          </h1>
          <div className="flex items-center justify-center space-x-4 mb-6">
            <Zap className="w-8 h-8 text-avalanche-red animate-pulse" />
            <h2 className="text-3xl md:text-4xl font-black text-white glow-text">
              OOPS! PAGE NOT FOUND
            </h2>
            <Zap className="w-8 h-8 text-avalanche-red animate-pulse delay-500" />
          </div>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed font-bold">
            The page you're looking for doesn't exist. It might have been moved, 
            deleted, or you entered the wrong URL.
          </p>
          <p className="text-lg text-gray-500 mt-4 font-medium">
            Attempted route: <span className="text-avalanche-red font-mono">{location.pathname}</span>
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
          <Button
            asChild
            className="neon-button bg-gradient-to-r from-avalanche-red to-red-600 hover:from-red-600 hover:to-avalanche-red text-white font-black text-lg px-8 py-4 rounded-2xl transform hover:scale-105 transition-all duration-300 shadow-2xl"
          >
            <Link to="/">
              <Home className="w-6 h-6 mr-3" />
              BACK TO HOME
            </Link>
          </Button>
          
          <Button
            asChild
            variant="outline"
            className="pump-button-outline border-2 border-white text-white hover:bg-white hover:text-black font-bold text-lg px-8 py-4 rounded-2xl transform hover:scale-105 transition-all duration-300"
          >
            <Link to="#" onClick={() => window.history.back()}>
              <ArrowLeft className="w-6 h-6 mr-3" />
              GO BACK
            </Link>
          </Button>
        </div>

        {/* Additional Help */}
        <div className="mt-16 p-8 bg-gray-800/50 backdrop-blur-xl rounded-3xl border border-gray-700/50 max-w-2xl mx-auto">
          <h3 className="text-2xl font-black text-white mb-4 glow-text">
            NEED HELP?
          </h3>
          <p className="text-gray-300 mb-6 leading-relaxed">
            If you think this is an error, you can:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-2">
                <Home className="w-6 h-6 text-white" />
              </div>
              <p className="text-gray-300 font-bold">Visit our homepage</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-500 rounded-2xl flex items-center justify-center mx-auto mb-2">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <p className="text-gray-300 font-bold">Check our features</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-2">
                <AlertTriangle className="w-6 h-6 text-white" />
              </div>
              <p className="text-gray-300 font-bold">Report this issue</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
