'use client';

import type { PropsWithChildren, CSSProperties } from 'react';
import { useReveal } from '@/hooks/useReveal';

type RevealProps = PropsWithChildren<{
  className?: string;
  delay?: number;
  as?: 'div' | 'section' | 'li' | 'article';
}>;

export function Reveal({ children, className = '', delay = 0, as = 'div' }: RevealProps) {
  const { ref, inView } = useReveal<HTMLDivElement>();
  const style: CSSProperties = { transitionDelay: `${delay}ms` };
  const Tag = as as 'div';

  return (
    <Tag
      ref={ref}
      style={style}
      className={`reveal ${inView ? 'in-view' : ''} ${className}`}
    >
      {children}
    </Tag>
  );
}
