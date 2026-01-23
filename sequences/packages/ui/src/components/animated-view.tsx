'use client';

/**
 * AnimatedView Component - Smooth animations for web using Framer Motion
 */

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';

type AnimatedViewProps = {
  children: React.ReactNode;
  className?: string;
  initial?: any;
  animate?: any;
  exit?: any;
  transition?: any;
  // React Native compatibility props (ignored on web)
  style?: any;
  entering?: any;
  exiting?: any;
  layout?: any;
};

export function AnimatedView({ 
  children, 
  className, 
  initial, 
  animate, 
  exit, 
  transition,
  // Ignore React Native props on web
  style: _style,
  entering: _entering,
  exiting: _exiting,
  layout: _layout,
}: AnimatedViewProps) {
  return (
    <motion.div
      className={cn(className)}
      initial={initial}
      animate={animate}
      exit={exit}
      transition={transition || { duration: 0.3, ease: 'easeInOut' }}
    >
      {children}
    </motion.div>
  );
}
