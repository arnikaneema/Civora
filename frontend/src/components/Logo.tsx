import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ className = '', size = 36, showText = true }) => {
  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Original SVG logo combining Document outline, Shield, and Checkmark */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="transition-transform duration-300 hover:scale-105"
      >
        <defs>
          <linearGradient id="shieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2563EB" />
            <stop offset="100%" stopColor="#10233F" />
          </linearGradient>
          <linearGradient id="docGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#EFF6FF" />
            <stop offset="100%" stopColor="#DBEAFE" />
          </linearGradient>
          <filter id="shadowFilter" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.15" />
          </filter>
        </defs>

        {/* Outer Shield Outline */}
        <path
          d="M24 4L9 10.5V22.2C9 32.5 15.4 42.1 24 44.8C32.6 42.1 39 32.5 39 22.2V10.5L24 4Z"
          fill="url(#shieldGrad)"
          filter="url(#shadowFilter)"
        />

        {/* Embedded Document Shape inside Shield */}
        <path
          d="M17 14H27L32 19V32C32 33.1 31.1 34 30 34H17C15.9 34 15 33.1 15 32V16C15 14.9 15.9 14 17 14Z"
          fill="url(#docGrad)"
        />
        {/* Document Fold Corner */}
        <path
          d="M27 14V19H32L27 14Z"
          fill="#93C5FD"
        />

        {/* Document lines */}
        <line x1="18.5" y1="21" x2="24.5" y2="21" stroke="#3B82F6" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="18.5" y1="25" x2="28.5" y2="25" stroke="#93C5FD" strokeWidth="1.5" strokeLinecap="round" />

        {/* High-Confidence Verification Checkmark */}
        <circle cx="28" cy="28" r="7.5" fill="#15803D" stroke="#FFFFFF" strokeWidth="1.5" />
        <path
          d="M25 28L27.2 30.2L31.2 25.8"
          stroke="#FFFFFF"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      {showText && (
        <div className="flex flex-col leading-none">
          <span className="font-extrabold tracking-tight text-navy-800 text-lg md:text-xl">
            DOCUSURE <span className="text-brand-blue">AI</span>
          </span>
          <span className="text-[10px] uppercase font-semibold tracking-wider text-ink-secondary mt-0.5">
            Verification Platform
          </span>
        </div>
      )}
    </div>
  );
};
