import React from "react";
import { AiOutlineHome } from "react-icons/ai";
import { HiOutlineArrowLeft } from "react-icons/hi";
import { FiSearch } from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";

// Basic Button wrapper
function Button({ children, variant = "solid", ...props }) {
  const baseClasses = "inline-flex items-center justify-center rounded px-4 py-2 font-medium text-sm transition-colors";

  const variants = {
    solid: "bg-black text-[#fffefe] hover:opacity-90",
    outline: "border border-black text-[#2b3333] bg-transparent hover:bg-opacity-10",
    ghost: "text-[#2b3333cc] hover:text-[#c79745] hover:bg-[#c7974510]",
  };

  return (
    <button {...props} className={`${baseClasses} ${variants[variant]} ${props.className || ""}`}>
      {children}
    </button>
  );
}

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div
      className="min-h-screen relative overflow-hidden"
      style={{
        backgroundColor: "#fffefe",
        color: "#2b3333",
      }}
    >
      {/* Geometric Background Pattern */}
      <div className="absolute inset-0">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(rgba(43,51,51,0.05) 1px, transparent 1px),
              linear-gradient(90deg, rgba(43,51,51,0.05) 1px, transparent 1px)
            `,
            backgroundSize: "50px 50px",
          }}
        />
        <div className="absolute top-20 left-20 w-32 h-32 rotate-45" style={{ border: "1px solid rgba(199,151,69,0.2)" }} />
        <div className="absolute top-40 right-32 w-24 h-24 rotate-12" style={{ border: "1px solid rgba(199,151,69,0.15)" }} />
        <div className="absolute bottom-32 left-40 w-40 h-40 -rotate-12" style={{ border: "1px solid rgba(199,151,69,0.1)" }} />
        <div className="absolute bottom-20 right-20 w-28 h-28 rotate-45" style={{ border: "1px solid rgba(199,151,69,0.25)" }} />
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 text-center">
        {/* 404 Number */}
        <div className="mb-8">
          <h1
            className="text-8xl md:text-9xl font-bold bg-clip-text text-transparent"
            style={{
              backgroundImage: "linear-gradient(135deg, #c79745 0%, #e2c38d 50%, #c79745 100%)",
            }}
          >
            404
          </h1>
          <div
            className="w-32 h-1 mx-auto mt-4"
            style={{
              background: "linear-gradient(to right, transparent, #c79745, transparent)",
            }}
          />
        </div>

        {/* Error Message */}
        <div className="mb-12 max-w-md">
          <h2 className="text-2xl md:text-3xl font-semibold mb-4" style={{ color: "#2b3333" }}>
            Page Not Found
          </h2>
          <p className="text-lg leading-relaxed" style={{ color: "#2b3333cc" }}>
            The page you're looking for doesn't exist or has been moved. Let's get you back on track.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <Link to="/">
            <Button>
              <AiOutlineHome className="mr-2" />
              Go Home
            </Button>
          </Link>
          <Button variant="outline" onClick={() => navigate(-2)}>
            <HiOutlineArrowLeft className="mr-2" />
            Go Back
          </Button>
        </div>

        {/* Search Suggestion */}
        <div style={{ color: "#2b333399" }} className="text-sm">
          <p className="mb-2">Looking for something specific?</p>
          <Button variant="ghost">
            <FiSearch className="mr-2" />
            Search our site
          </Button>
        </div>

        {/* Footer */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
          <p style={{ color: "#2b333380" }} className="text-sm">
            © 2024 IIPS Academics. All rights reserved.
          </p>
        </div>
      </div>

      {/* Animated Elements */}
      <div
        className="absolute top-1/4 left-1/4 w-2 h-2 rounded-full animate-pulse"
        style={{ backgroundColor: "rgba(199,151,69,0.3)" }}
      />
      <div
        className="absolute top-3/4 right-1/4 w-1 h-1 rounded-full animate-pulse delay-1000"
        style={{ backgroundColor: "rgba(199,151,69,0.4)" }}
      />
      <div
        className="absolute top-1/2 left-1/6 w-1.5 h-1.5 rounded-full animate-pulse delay-500"
        style={{ backgroundColor: "rgba(199,151,69,0.2)" }}
      />
    </div>
  );
}
