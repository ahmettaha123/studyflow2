import React from 'react';
import styles from '../styles/LoadingSpinner.module.css';

const LoadingSpinner = ({ size = 'medium', color = 'primary', text = '' }) => {
  const sizeClass = {
    small: styles.small,
    medium: styles.medium,
    large: styles.large
  }[size];

  const colorClass = {
    primary: styles.primary,
    secondary: styles.secondary,
    white: styles.white
  }[color];

  return (
    <div className={styles.container}>
      <div className={`${styles.spinner} ${sizeClass} ${colorClass}`}>
        <div className={styles.dot1}></div>
        <div className={styles.dot2}></div>
        <div className={styles.dot3}></div>
      </div>
      {text && <p className={styles.text}>{text}</p>}
    </div>
  );
};

export default LoadingSpinner;

// Alternative spinner designs
export const CircleSpinner = ({ size = 'medium', color = 'primary' }) => {
  const sizeClass = {
    small: styles.small,
    medium: styles.medium,
    large: styles.large
  }[size];

  const colorClass = {
    primary: styles.primary,
    secondary: styles.secondary,
    white: styles.white
  }[color];

  return (
    <div className={`${styles.circleSpinner} ${sizeClass} ${colorClass}`}></div>
  );
};

export const PulseSpinner = ({ size = 'medium', color = 'primary' }) => {
  const sizeClass = {
    small: styles.small,
    medium: styles.medium,
    large: styles.large
  }[size];

  const colorClass = {
    primary: styles.primary,
    secondary: styles.secondary,
    white: styles.white
  }[color];

  return (
    <div className={`${styles.pulseSpinner} ${sizeClass} ${colorClass}`}></div>
  );
};

export const DotsSpinner = ({ size = 'medium', color = 'primary' }) => {
  const sizeClass = {
    small: styles.small,
    medium: styles.medium,
    large: styles.large
  }[size];

  const colorClass = {
    primary: styles.primary,
    secondary: styles.secondary,
    white: styles.white
  }[color];

  return (
    <div className={`${styles.dotsSpinner} ${sizeClass}`}>
      <div className={`${styles.dot} ${colorClass}`}></div>
      <div className={`${styles.dot} ${colorClass}`}></div>
      <div className={`${styles.dot} ${colorClass}`}></div>
    </div>
  );
};

// Loading overlay component
export const LoadingOverlay = ({ isVisible, text = 'Yükleniyor...', children }) => {
  if (!isVisible) return children;

  return (
    <div className={styles.overlayContainer}>
      {children}
      <div className={styles.overlay}>
        <div className={styles.overlayContent}>
          <LoadingSpinner size="large" color="white" />
          <p className={styles.overlayText}>{text}</p>
        </div>
      </div>
    </div>
  );
};

// Skeleton loader component
export const SkeletonLoader = ({ width = '100%', height = '20px', borderRadius = '4px', className = '' }) => {
  return (
    <div 
      className={`${styles.skeleton} ${className}`}
      style={{ width, height, borderRadius }}
    ></div>
  );
};

// Card skeleton
export const CardSkeleton = () => {
  return (
    <div className={styles.cardSkeleton}>
      <SkeletonLoader height="200px" borderRadius="8px" className={styles.skeletonImage} />
      <div className={styles.skeletonContent}>
        <SkeletonLoader height="24px" width="80%" className={styles.skeletonTitle} />
        <SkeletonLoader height="16px" width="60%" className={styles.skeletonSubtitle} />
        <SkeletonLoader height="14px" width="100%" className={styles.skeletonText} />
        <SkeletonLoader height="14px" width="90%" className={styles.skeletonText} />
      </div>
    </div>
  );
};