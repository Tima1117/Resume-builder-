import React from 'react';

interface CustomIconProps {
  size?: number;
  className?: string;
}

export const PhoneSVG: React.FC<CustomIconProps> = ({ size = 16, className = '' }) => (
  <span className={className} style={{ fontSize: size }}>📞</span>
);

export const LocationSVG: React.FC<CustomIconProps> = ({ size = 16, className = '' }) => (
  <span className={className} style={{ fontSize: size }}>📍</span>
);

export const EmailSVG: React.FC<CustomIconProps> = ({ size = 16, className = '' }) => (
  <span className={className} style={{ fontSize: size }}>📧</span>
);

export const TelegramSVG: React.FC<CustomIconProps> = ({ size = 16, className = '' }) => (
  <span className={className} style={{ fontSize: size }}>📱</span>
);

export const AgeSVG: React.FC<CustomIconProps> = ({ size = 16, className = '' }) => (
  <span className={className} style={{ fontSize: size }}>📅</span>
); 