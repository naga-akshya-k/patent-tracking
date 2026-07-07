import React from 'react';
import { Settings } from 'lucide-react';

export const Loader: React.FC = () => {
  return (
    <div className="flex items-center justify-center h-full min-h-[350px]">
      <div className="relative w-28 h-28 flex items-center justify-center">
        {/* Left-top Maroon Gear */}
        <div className="absolute top-[16px] left-[20px] animate-spin-slow text-[#6B1E2B]">
          <Settings size={44} className="fill-[#6B1E2B]/10" />
        </div>
        {/* Right-bottom Navy Blue Gear */}
        <div className="absolute top-[38px] left-[50px] animate-spin-reverse-slow text-[#0F2742]">
          <Settings size={44} className="fill-[#0F2742]/10" />
        </div>
      </div>
    </div>
  );
};
