import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';
import { Logo, LogoIcon } from '../ui/Logo';
import { useTheme } from '../../context/ThemeContext';
import {
  Home, BookHeart, Headphones, BarChart2, Settings, Moon, Sun,
  ScanLine, MapPin, Video, BookOpen, Watch, GraduationCap, LogOut, MessageSquareHeart
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Sidebar as AceternitySidebar, SidebarBody, SidebarLink } from '../ui/sidebar';

const navItems = [
  { id: 'home',        icon: Home,         label: 'Home',           emoji: '🏠' },
  { id: 'journal',     icon: BookHeart,    label: 'Mood Journal',   emoji: '📓' },
  { id: 'meditations', icon: Headphones,   label: 'Meditations',    emoji: '🎧' },
  { id: 'analytics',   icon: BarChart2,    label: 'Analytics',      emoji: '📊' },
  { id: 'settings',    icon: Settings,     label: 'Settings',       emoji: '⚙️' },
  { divider: true, label: 'New Features' },
  { id: 'aichat',      icon: MessageSquareHeart, label: 'AI Assistant',   emoji: '🤖' },
  { id: 'ailens',      icon: ScanLine,     label: 'AI Lens',        emoji: '💊' },
  { id: 'clinic',      icon: MapPin,       label: 'Clinic Locator', emoji: '🏥' },
  { id: 'telehealth',  icon: Video,        label: 'Telehealth',     emoji: '📹' },
  { id: 'wellness',    icon: BookOpen,     label: 'Wellness Hub',   emoji: '📰' },
  { id: 'biometrics',  icon: Watch,        label: 'Biometrics',     emoji: '⌚' },
  { id: 'sandbox',     icon: GraduationCap,label: 'Student Sandbox',emoji: '🎓' },
];

export function Sidebar({ activeTab, onTabChange, onSosClick }) {
  const { theme, toggleTheme } = useTheme();
  const { logout } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <AceternitySidebar open={open} setOpen={setOpen} animate={true}>
      <SidebarBody className="justify-between gap-10 bg-white/80 dark:bg-ocean border-r border-slate-200 dark:border-purple-500/20">
        <div className="flex flex-1 flex-col overflow-x-hidden overflow-y-auto">
          <div className={cn("mb-8 flex", open ? "px-2 justify-start" : "justify-center")}>
            {open ? <Logo /> : <LogoIcon />}
          </div>
          
          <nav className="flex flex-col gap-1 mt-4">
            {navItems.map((item, idx) => {
              if (item.divider) {
                return open ? (
                  <div key={`divider-${idx}`} className="pt-4 pb-2 px-4">
                    <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">{item.label}</p>
                  </div>
                ) : <div key={`divider-${idx}`} className="my-2 border-t border-slate-200 dark:border-white/10 w-8 mx-auto" />;
              }
              const isActive = activeTab === item.id;
              
              const linkObj = {
                label: item.label,
                href: '#',
                icon: (
                  <item.icon
                    size={20}
                    className="flex-shrink-0"
                    strokeWidth={inactiveStrokeWidth}
                  />
                ),
                onClick: (e) => {
                  e.preventDefault();
                  onTabChange(item.id);
                  // Optional: auto-close on mobile after selecting
                  if (window.innerWidth < 768) setOpen(false);
                },
                isActive,
                hasIndicator: true
              };

              return <SidebarLink key={item.id} link={linkObj} />;
            })}
          </nav>
        </div>

        <div className="flex flex-col gap-1 border-t border-slate-200 dark:border-white/10 pt-4">
          <SidebarLink
            link={{
              label: theme === 'dark' ? 'Light Mode' : 'Dark Mode',
              href: '#',
              icon: theme === 'dark' ? <Sun size={20} className="text-amber-300" /> : <Moon size={20} className="text-slate-400" />,
              onClick: (e) => { e.preventDefault(); toggleTheme(); }
            }}
          />
          <SidebarLink
            link={{
              label: 'Log Out',
              href: '#',
              icon: <LogOut size={20} className="text-slate-400" />,
              onClick: (e) => { e.preventDefault(); logout(); }
            }}
            className="text-slate-500 hover:text-rose-500 hover:bg-rose-500/10"
          />
        </div>
      </SidebarBody>
    </AceternitySidebar>
  );
}

const inactiveStrokeWidth = 1.5;
