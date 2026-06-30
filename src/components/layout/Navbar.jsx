import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { Logo } from '../ui/Logo';
import { Button } from '../ui/Button';
import { motion } from 'framer-motion';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Don't show this navbar on auth or dashboard pages
  if (['/login', '/register', '/dashboard', '/doctor'].includes(location.pathname)) {
    return null;
  }

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-6 py-4",
        scrolled
          ? "backdrop-blur-xl bg-charcoal/90 border-b border-purple-500/20 shadow-xl"
          : "bg-transparent"
      )}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Logo />

        <nav className="hidden md:flex items-center gap-6 lg:gap-8 text-slate-300 font-semibold text-xs uppercase tracking-[0.25em]">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#insights" className="hover:text-white transition-colors">Insights</a>
          <a href="#cta" className="hover:text-white transition-colors">Get Started</a>
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link to="/login" className="hidden sm:block text-slate-300 font-semibold hover:text-white transition-colors px-2 sm:px-4 py-2 text-[10px] sm:text-xs uppercase tracking-[0.2em]">
            Sign In
          </Link>
          <Link to="/register">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button className="bg-white text-charcoal shadow-lg hover:shadow-white/20 text-xs sm:text-sm px-3 py-1.5 sm:px-4 sm:py-2">
                Start Free
              </Button>
            </motion.div>
          </Link>
        </div>
      </div>
    </motion.header>
  );
};

export { Navbar };
