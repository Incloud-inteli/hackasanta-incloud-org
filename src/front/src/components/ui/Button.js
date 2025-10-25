import React from 'react';
import './Button.css';

export const Button = ({ children, className = '', ...props }) => {
  return (
    <button className={`btn ${className}`} {...props}>
      {children}
    </button>
  );
};
