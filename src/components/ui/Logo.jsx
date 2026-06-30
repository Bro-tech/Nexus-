import React from 'react';
import { cn } from '../../lib/utils';
import { Link } from 'react-router-dom';

const LogoIcon = ({ className, iconSize = 22, link = "/" }) => {
  return (
    <Link to={link} className={cn("transition-opacity flex-shrink-0 cursor-pointer", className)}>
      <video
        src="/logo.mp4"
        autoPlay
        loop
        muted
        playsInline
        className="object-cover rounded-xl"
        style={{
          width: iconSize + 10,
          height: iconSize + 10,
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        }}
        onError={(e) => { e.target.style.display = 'none'; }}
      />
    </Link>
  );
};

const Logo = ({ className, iconSize = 22, textSize = "text-xl", link = "/" }) => {
  return (
    <Link to={link} className={cn("flex items-center gap-3 transition-opacity hover:opacity-80 cursor-pointer overflow-hidden", className)}>
      <LogoIcon iconSize={iconSize} link={link} />
      <span className={cn("font-semibold tracking-tight text-slate-900 dark:text-white whitespace-pre", textSize)}>
        Nexus
      </span>
    </Link>
  );
};

export { Logo, LogoIcon };
