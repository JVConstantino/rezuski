
import React, { ReactNode } from 'react';
import { useInView } from 'react-intersection-observer';

interface AnimateOnScrollProps {
  children: ReactNode;
  delay?: number;
  className?: string;
  triggerOnce?: boolean;
}

const AnimateOnScroll: React.FC<AnimateOnScrollProps> = ({
  children,
  delay = 0,
  className = '',
  triggerOnce = true,
}) => {
  const { ref, inView } = useInView({
    triggerOnce: triggerOnce,
    threshold: 0.1,
  });

  return (
    <div
      ref={ref}
      className={`${className} transition-all duration-700 ${
        inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

export default AnimateOnScroll;
