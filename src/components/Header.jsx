import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

// LinkMeU Logo SVG Component
const LinkMeULogo = ({ className = "h-10 w-auto" }) => (
  <svg className={className} viewBox="0 0 200 80" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Left person (red) */}
    <circle cx="35" cy="12" r="8" fill="#DC2626"/>
    <path d="M25 25 C25 20, 45 20, 45 25 L45 35 C45 40, 35 45, 35 50 L35 55 C35 58, 32 60, 30 58 L25 50 C20 45, 20 35, 25 25Z" fill="#DC2626"/>
    
    {/* Right person (dark gray/black) */}
    <circle cx="55" cy="12" r="8" fill="#1F2937"/>
    <path d="M65 25 C65 20, 45 20, 45 25 L45 35 C45 40, 55 45, 55 50 L55 55 C55 58, 58 60, 60 58 L65 50 C70 45, 70 35, 65 25Z" fill="#1F2937"/>
    
    {/* Infinity/link symbol */}
    <path d="M20 42 C10 32, 10 52, 25 52 C35 52, 40 45, 45 42 C50 39, 55 32, 65 32 C80 32, 80 52, 65 52 C55 52, 50 45, 45 42 C40 39, 35 32, 25 32 C10 32, 10 52, 20 42Z" 
          stroke="#DC2626" strokeWidth="4" fill="none" strokeLinecap="round"/>
    
    {/* Text: LinkMeU */}
    <text x="90" y="38" fontFamily="Arial, sans-serif" fontSize="24" fontWeight="bold">
      <tspan fill="#1F2937">Link</tspan>
      <tspan fill="#DC2626">Me</tspan>
      <tspan fill="#1F2937">U</tspan>
    </text>
    
    {/* Tagline */}
    <text x="90" y="55" fontFamily="Arial, sans-serif" fontSize="9" fill="#6B7280">
      Link Me. You Matter Most.
    </text>
  </svg>
);

const Header = ({ title, showBack = false, rightAction = null }) => {
  const navigate = useNavigate();

  return (
    <header className="bg-gradient-to-r from-gray-900 to-gray-800 border-b border-gray-700 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {showBack && (
            <button
              onClick={() => navigate(-1)}
              className="text-white hover:text-gray-300 transition-colors"
            >
              <ArrowLeft size={24} />
            </button>
          )}
          <div 
            className="flex items-center gap-3 cursor-pointer" 
            onClick={() => navigate('/')}
          >
            {/* LinkMeU Logo */}
            <div className="flex items-center gap-2">
              <svg className="h-10 w-10" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Left person head */}
                <circle cx="18" cy="10" r="6" fill="#DC2626"/>
                {/* Right person head */}
                <circle cx="42" cy="10" r="6" fill="#374151"/>
                {/* Left person body */}
                <path d="M12 20 C12 16, 24 16, 24 20 L24 28 C24 32, 18 36, 18 40" stroke="#DC2626" strokeWidth="4" strokeLinecap="round" fill="none"/>
                {/* Right person body */}
                <path d="M48 20 C48 16, 36 16, 36 20 L36 28 C36 32, 42 36, 42 40" stroke="#374151" strokeWidth="4" strokeLinecap="round" fill="none"/>
                {/* Infinity/heart link */}
                <path d="M10 38 C5 30, 5 50, 18 50 C28 50, 30 42, 30 38 C30 34, 32 26, 42 26 C55 26, 55 50, 42 50 C32 50, 30 42, 30 38" 
                      stroke="#DC2626" strokeWidth="3.5" fill="none" strokeLinecap="round"/>
              </svg>
              <div>
                <div className="flex items-center">
                  <span className="text-xl font-bold text-white">Link</span>
                  <span className="text-xl font-bold text-red-500">Me</span>
                  <span className="text-xl font-bold text-white">U</span>
                </div>
                <p className="text-[10px] text-gray-400 -mt-1">Link Me. You Matter Most.</p>
              </div>
            </div>
          </div>
        </div>
        {title && (
          <h1 className="text-lg font-semibold text-white absolute left-1/2 transform -translate-x-1/2">
            {title}
          </h1>
        )}
        {rightAction && <div>{rightAction}</div>}
      </div>
    </header>
  );
};

export { LinkMeULogo };
export default Header;
