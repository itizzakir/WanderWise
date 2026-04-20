import React from 'react';
import { FaChevronDown } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const SidebarItem = ({ icon, text, active, hasSubmenu, to, onClick, variant = 'default' }) => {
  const styleByVariant = {
    default: {
      base: 'flex items-center justify-between px-6 py-3 cursor-pointer transition-colors',
      active: 'bg-accent/20 border-l-4 border-accent text-white',
      idle: 'hover:bg-white/10 text-white/80',
      text: 'font-medium text-sm',
      chevron: 'text-[10px] opacity-70 text-accent',
    },
    traveler: {
      base: 'group mx-3 mb-1.5 flex items-center justify-between rounded-xl px-4 py-2.5 transition-all duration-200',
      active: 'bg-white/15 text-white shadow-lg shadow-black/10 ring-1 ring-white/20',
      idle: 'text-white/75 hover:bg-white/10 hover:text-white',
      text: 'text-sm font-medium',
      chevron: 'text-[10px] opacity-70 text-white/70',
    },
  };

  const styles = styleByVariant[variant] || styleByVariant.default;
  const iconElement = icon ? React.createElement(icon, { size: 18 }) : null;
  const content = (
    <div className={`${styles.base} ${active ? styles.active : styles.idle}`}>
      <div className="flex items-center gap-3">
        {iconElement}
        <span className={styles.text}>{text}</span>
      </div>
      {hasSubmenu && <FaChevronDown className={styles.chevron} aria-hidden="true" />}
    </div>
  );

  if (to) {
    return <Link to={to} onClick={onClick}>{content}</Link>;
  }

  return (
    <button type="button" onClick={onClick} className="w-full text-left">
      {content}
    </button>
  );
};

export default SidebarItem;
