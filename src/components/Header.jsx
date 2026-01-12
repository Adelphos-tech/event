import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

// LinkMeU Logo SVG Component - matches the official branding
const LinkMeULogo = ({ className = "h-12 w-auto" }) => (
  <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Left person (red) - head */}
    <circle cx="30" cy="18" r="8" fill="#DC2626"/>
    {/* Right person (gray) - head */}
    <circle cx="70" cy="18" r="8" fill="#4B5563"/>
    {/* Left person body */}
    <path d="M30 28 C30 28, 22 32, 22 42 L22 50" stroke="#DC2626" strokeWidth="5" strokeLinecap="round" fill="none"/>
    {/* Right person body */}
    <path d="M70 28 C70 28, 78 32, 78 42 L78 50" stroke="#4B5563" strokeWidth="5" strokeLinecap="round" fill="none"/>
    {/* Interlinked arms forming infinity/link symbol */}
    <path d="M30 32 C30 32, 38 36, 42 48 C46 60, 38 72, 28 72 C18 72, 12 62, 16 52 C20 42, 30 38, 38 42" stroke="#DC2626" strokeWidth="5" strokeLinecap="round" fill="none"/>
    <path d="M70 32 C70 32, 62 36, 58 48 C54 60, 62 72, 72 72 C82 72, 88 62, 84 52 C80 42, 70 38, 62 42" stroke="#4B5563" strokeWidth="5" strokeLinecap="round" fill="none"/>
    {/* Center link connection */}
    <path d="M42 55 C48 50, 52 50, 58 55" stroke="#DC2626" strokeWidth="4" strokeLinecap="round" fill="none"/>
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
            className="flex items-center gap-2 cursor-pointer" 
            onClick={() => navigate('/')}
          >
            {/* LinkMeU Logo */}
            <svg className="h-10 w-10" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Left person (red) - head */}
              <circle cx="30" cy="18" r="8" fill="#DC2626"/>
              {/* Right person (gray) - head */}
              <circle cx="70" cy="18" r="8" fill="#9CA3AF"/>
              {/* Left person body */}
              <path d="M30 28 C30 28, 22 32, 22 42 L22 50" stroke="#DC2626" strokeWidth="5" strokeLinecap="round" fill="none"/>
              {/* Right person body */}
              <path d="M70 28 C70 28, 78 32, 78 42 L78 50" stroke="#9CA3AF" strokeWidth="5" strokeLinecap="round" fill="none"/>
              {/* Interlinked arms */}
              <path d="M30 32 C30 32, 38 36, 42 48 C46 60, 38 72, 28 72 C18 72, 12 62, 16 52 C20 42, 30 38, 38 42" stroke="#DC2626" strokeWidth="5" strokeLinecap="round" fill="none"/>
              <path d="M70 32 C70 32, 62 36, 58 48 C54 60, 62 72, 72 72 C82 72, 88 62, 84 52 C80 42, 70 38, 62 42" stroke="#9CA3AF" strokeWidth="5" strokeLinecap="round" fill="none"/>
              {/* Center link */}
              <path d="M42 55 C48 50, 52 50, 58 55" stroke="#DC2626" strokeWidth="4" strokeLinecap="round" fill="none"/>
            </svg>
            <div>
              <div className="flex items-center">
                <span className="text-lg font-bold text-white">Link</span>
                <span className="text-lg font-bold text-red-500">Me</span>
                <span className="text-lg font-bold text-white">U</span>
              </div>
              <p className="text-[9px] text-gray-400 -mt-0.5 tracking-wide">Link Me You Matter Most.</p>
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
