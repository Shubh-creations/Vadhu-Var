import React from 'react';
import { Sun, Moon, Laptop } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  const options = [
    { id: 'light', label: 'Light', icon: Sun },
    { id: 'dark', label: 'Dark', icon: Moon },
    { id: 'system', label: 'Auto', icon: Laptop }
  ];

  return (
    <div className="flex items-center bg-gray-100 dark:bg-slateDark-800 p-1 rounded-xl border border-gray-200 dark:border-slateDark-700">
      {options.map((opt) => {
        const Icon = opt.icon;
        const isActive = theme === opt.id;
        return (
          <button
            key={opt.id}
            onClick={() => toggleTheme(opt.id)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
              isActive
                ? 'bg-white dark:bg-slateDark-900 text-gold-600 dark:text-gold-400 shadow-sm border border-gold-600/20'
                : 'text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white'
            }`}
            title={`Switch to ${opt.label} Theme`}
          >
            <Icon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default ThemeToggle;
