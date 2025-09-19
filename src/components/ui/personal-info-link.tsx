'use client';

import React from 'react';
import type { HyperlinkInfo } from '@/lib/types';

interface PersonalInfoLinkProps {
  value?: string;
  hyperlinkInfo?: HyperlinkInfo;
  className?: string;
}

export function PersonalInfoLink({ value, hyperlinkInfo, className }: PersonalInfoLinkProps) {
  if (!value) return null;

  const hasValidHyperlink = hyperlinkInfo?.url;
  const displayText = hyperlinkInfo?.displayText || value;

  if (hasValidHyperlink) {
    return (
      <a
        href={hyperlinkInfo.url}
        target="_blank"
        rel="noopener noreferrer"
        className={`text-blue-600 hover:text-blue-800 underline ${className || ''}`}
      >
        {displayText}
      </a>
    );
  }

  return <span className={className}>{value}</span>;
}
