"use client";
import React, { useState, createContext, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../../lib/utils";
import { Menu, X } from "lucide-react";

const SidebarContext = createContext(undefined);

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
};

export const SidebarProvider = ({
  children,
  open: openProp,
  setOpen: setOpenProp,
  animate = true,
}) => {
  const [openState, setOpenState] = useState(false);

  const open = openProp !== undefined ? openProp : openState;
  const setOpen = setOpenProp !== undefined ? setOpenProp : setOpenState;

  return (
    <SidebarContext.Provider value={{ open, setOpen, animate }}>
      {children}
    </SidebarContext.Provider>
  );
};

export const Sidebar = ({ children, open, setOpen, animate }) => {
  return (
    <SidebarProvider open={open} setOpen={setOpen} animate={animate}>
      {children}
    </SidebarProvider>
  );
};

export const SidebarBody = (props) => {
  return (
    <>
      <DesktopSidebar {...props} />
      <MobileSidebar {...props} />
    </>
  );
};

export const DesktopSidebar = ({ className, children, ...props }) => {
  const { open, setOpen, animate } = useSidebar();
  return (
    <motion.div
      className={cn(
        "h-full px-4 py-4 hidden md:flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-white/10 w-[300px] flex-shrink-0 z-40 transition-colors duration-300",
        className
      )}
      animate={{
        width: animate ? (open ? "300px" : "80px") : "300px",
      }}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export const MobileSidebar = ({ className, children, ...props }) => {
  const { open, setOpen } = useSidebar();
  return (
    <div
      className={cn(
        "h-14 px-4 py-4 flex flex-row md:hidden items-center justify-between bg-white dark:bg-slate-900 w-full z-40 border-b border-slate-200 dark:border-white/10 transition-colors duration-300"
      )}
      {...props}
    >
      <div className="flex justify-end z-20 w-full">
        <Menu
          className="text-slate-800 dark:text-neutral-200 cursor-pointer"
          onClick={() => setOpen(!open)}
        />
      </div>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ x: "-100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "-100%", opacity: 0 }}
            transition={{
              duration: 0.3,
              ease: "easeInOut",
            }}
            className={cn(
              "fixed h-full w-full inset-0 bg-white dark:bg-slate-900 p-10 z-[100] flex flex-col justify-between transition-colors duration-300",
              className
            )}
          >
            <div
              className="absolute right-10 top-10 z-50 text-slate-800 dark:text-neutral-200 cursor-pointer"
              onClick={() => setOpen(!open)}
            >
              <X />
            </div>
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const SidebarLink = ({ link, className, ...props }) => {
  const { open, animate } = useSidebar();
  return (
    <div
      href={link.href}
      className={cn(
        "flex items-center gap-3 cursor-pointer hover:bg-slate-100 dark:hover:bg-white/5 py-3 px-3 rounded-xl transition-colors w-full relative",
        open ? "justify-start" : "justify-center",
        className,
        link.isActive ? "bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20" : "text-slate-600 dark:text-slate-300"
      )}
      onClick={link.onClick}
      {...props}
    >
      {link.isActive && (
        <motion.div
          layoutId="active-nav-pill"
          className="absolute inset-0 rounded-xl bg-purple-500/10 border border-purple-500/20"
          initial={false}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />
      )}
      
      <div className="relative z-10 flex-shrink-0 flex items-center justify-center w-6 h-6">
        {link.icon}
      </div>

      <AnimatePresence>
        {(open || !animate) && (
          <motion.div
            initial={{ opacity: 0, width: 0, display: "none" }}
            animate={{ opacity: 1, width: "auto", display: "flex" }}
            exit={{ opacity: 0, width: 0, display: "none" }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="flex items-center gap-2 relative z-10 w-full overflow-hidden"
          >
            <span className="text-sm font-semibold whitespace-pre">
              {link.label}
            </span>
            {link.hasIndicator && link.isActive && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="ml-auto w-2 h-2 rounded-full bg-purple-500 flex-shrink-0"
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
