import { useState, useEffect } from "react";
import logo2 from "../assets/logo2.png"; // Import your custom logo

export const LandingPage = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleLoginClick = () => {
    // Navigate to login - you can replace this with your routing logic
    window.location.href = '/login';
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 overflow-hidden relative">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute top-40 right-20 w-96 h-96 bg-cyan-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse animation-delay-2000"></div>
        <div className="absolute bottom-20 left-40 w-96 h-96 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse animation-delay-4000"></div>
      </div>

      {/* Floating Water Bubbles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className={`absolute w-4 h-4 bg-cyan-300 rounded-full opacity-30 animate-bounce`}
            style={{
              left: `${20 + i * 15}%`,
              top: `${30 + i * 10}%`,
              animationDelay: `${i * 0.5}s`,
              animationDuration: `${3 + i * 0.5}s`
            }}
          ></div>
        ))}
      </div>

      {/* Header with Custom Logo */}
      <div className={`flex flex-row items-center justify-between w-full h-20 py-4 px-8 backdrop-blur-lg bg-white/10 border-b border-white/20 transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}`}>
        <div className="flex flex-row justify-center items-center group">
          <div className="relative group mr-3">
            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-400 via-teal-400 to-blue-500 rounded-2xl opacity-75 group-hover:opacity-100 blur transition duration-300 group-hover:scale-110"></div>
            <div className="relative w-12 h-12 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl flex items-center justify-center border border-white/20 group-hover:scale-105 transition-transform duration-300 shadow-2xl">
              <img 
                src={logo2}
                alt="SWIFT Logo"
                className="w-8 h-8 object-cover rounded-xl"
              />
              {/* Overlay gradient for better contrast */}
              <div className="absolute inset-1 bg-gradient-to-br from-cyan-500/20 to-blue-600/30 rounded-xl"></div>
            </div>
          </div>
          <label className="font-bold text-3xl bg-gradient-to-r from-cyan-300 via-teal-200 to-blue-300 bg-clip-text text-transparent tracking-wide">
            SWIFT
          </label>
        </div>
        <div>
          <button
            onClick={handleLoginClick}
            className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold px-6 py-3 rounded-full transition-all duration-300 transform hover:scale-105 hover:shadow-2xl shadow-cyan-500/25"
          >
            Login
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-row justify-around items-center mt-20 px-8 relative z-10">
        <div className={`flex flex-col w-[45%] transition-all duration-1000 delay-300 ${isVisible ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'}`}>
          <div className="flex flex-col mb-8">
    <div className="overflow-hidden">
        <label className={`font-bold text-6xl text-white block transition-all duration-1000 delay-500 ${isVisible ? 'translate-y-0' : 'translate-y-full'}`}>
            Smarter Pools,
        </label>
    </div>
    <div className="overflow-hidden">
        <label className={`font-bold text-6xl text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400 block ml-8 transition-all duration-1000 delay-700 ${isVisible ? 'translate-y-0' : 'translate-y-full'}`}>
            Happier Communities
        </label>
    </div>
</div>
          
          <div className={`transition-all duration-1000 delay-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <p className="text-gray-300 text-xl leading-relaxed mb-10 backdrop-blur-sm bg-white/5 p-6 rounded-2xl border border-white/10">
              A smart pool monitoring system capable of monitoring and predicting water quality parameters in real time. 
              Keep your pool perfectly balanced with our smart monitoring system. It uses advanced IoT sensors to continuously track all key water quality parameters. Then, our machine learning algorithms analyze that data in real time to predict future changes, giving you instant alerts and insights to maintain a pristine pool with minimal effort.
            </p>
          </div>
          
          <div className={`transition-all duration-1000 delay-1200 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <button
              onClick={handleLoginClick}
              className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white text-2xl font-semibold px-10 py-4 rounded-full transition-all duration-300 transform hover:scale-105 hover:shadow-2xl shadow-cyan-500/50 group relative overflow-hidden"
            >
              <span className="relative z-10">Get Started</span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>
          </div>
        </div>

        <div className={`w-[45%] transition-all duration-1000 delay-400 ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`}>
          <div className="relative group">
            <div className="absolute -inset-4 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-3xl opacity-30 group-hover:opacity-50 transition-opacity duration-300 blur-lg"></div>
            <div className="relative bg-white/10 backdrop-blur-lg rounded-3xl p-4 border border-white/20 hover:border-white/40 transition-all duration-300">
              <img 
                src="https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80" 
                alt="Swimming Pool Image" 
                className="w-full h-auto rounded-2xl object-cover"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className={`flex justify-center items-center w-full mt-32 mb-16 transition-all duration-1000 delay-1500 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
        <div className="text-center">
          <label className="font-bold text-4xl text-white mb-4 block">
            Smart Water Intelligence and Forecasting Technology
          </label>
          <div className="w-32 h-1 bg-gradient-to-r from-cyan-400 to-blue-500 mx-auto rounded-full"></div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
      `}</style>
    </div>
  );
};