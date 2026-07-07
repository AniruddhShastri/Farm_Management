import React, { useEffect, useRef, useState } from 'react';
import {
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from 'framer-motion';

/* ─── Shared easing ─── */
export const easeOutExpo = [0.16, 1, 0.3, 1];

/* ─── Variants ─── */
export const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: easeOutExpo } },
};

export const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.6, ease: 'easeOut' } },
};

export const scaleIn = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.55, ease: easeOutExpo } },
};

export const slideInLeft = {
  hidden: { opacity: 0, x: -36 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.65, ease: easeOutExpo } },
};

export const slideInRight = {
  hidden: { opacity: 0, x: 36 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.65, ease: easeOutExpo } },
};

export const staggerContainer = (stagger = 0.08, delay = 0) => ({
  hidden: {},
  visible: { transition: { staggerChildren: stagger, delayChildren: delay } },
});

/* ─── Route transition variants ─── */
export const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: easeOutExpo } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.2, ease: 'easeIn' } },
};

/* ─── <Reveal> — animates children in when scrolled into view (once) ─── */
export function Reveal({ children, variants = fadeUp, delay = 0, amount = 0.25, className, style, as = 'div', ...rest }) {
  const Component = motion[as] || motion.div;
  const delayed = delay
    ? {
        ...variants,
        visible: {
          ...variants.visible,
          transition: { ...(variants.visible?.transition || {}), delay },
        },
      }
    : variants;
  return (
    <Component
      className={className}
      style={style}
      variants={delayed}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount }}
      {...rest}
    >
      {children}
    </Component>
  );
}

/* ─── <StaggerGroup> + <StaggerItem> — staggered children reveals ─── */
export function StaggerGroup({ children, stagger = 0.08, delay = 0, amount = 0.2, className, style, as = 'div', ...rest }) {
  const Component = motion[as] || motion.div;
  return (
    <Component
      className={className}
      style={style}
      variants={staggerContainer(stagger, delay)}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount }}
      {...rest}
    >
      {children}
    </Component>
  );
}

export function StaggerItem({ children, variants = fadeUp, className, style, as = 'div', ...rest }) {
  const Component = motion[as] || motion.div;
  return (
    <Component className={className} style={style} variants={variants} {...rest}>
      {children}
    </Component>
  );
}

/* ─── <Counter> — spring count-up when scrolled into view ─── */
export function Counter({ value, prefix = '', suffix = '', decimals = 0, duration = 1.8, className = '' }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const reduceMotion = useReducedMotion();
  const mv = useMotionValue(0);
  const spring = useSpring(mv, { duration: duration * 1000, bounce: 0 });
  const format = (v) =>
    new Intl.NumberFormat('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(v);
  const [display, setDisplay] = useState(() => format(reduceMotion ? value : 0));

  useEffect(() => {
    if (!inView) return;
    if (reduceMotion) {
      setDisplay(format(value));
      return;
    }
    mv.set(value);
    const unsubscribe = spring.on('change', (v) => setDisplay(format(v)));
    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, value, reduceMotion]);

  return (
    <span ref={ref} className={`stat-number ${className}`}>
      {prefix}
      {display}
      {suffix}
    </span>
  );
}
