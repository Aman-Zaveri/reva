'use client';

import { useEffect, useRef, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { A4_DIMENSIONS } from '@/shared/utils/constants';
import { clsx } from 'clsx';
import { Resume } from './Resume';
import type { DataBundle, Profile } from '@/shared/lib/types';

interface A4ResumeProps {
  profile: Profile;
  data: DataBundle;
  compact?: boolean;
  showPrintView?: boolean;
  scale?: number; // Optional scale factor override
}

interface PageBreak {
  position: number;
  pageNumber: number;
}

export function A4Resume({ profile, data, compact, showPrintView = false, scale }: A4ResumeProps) {
  const resumeRef = useRef<HTMLDivElement>(null);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const [pages, setPages] = useState(1);
  const [pageBreaks, setPageBreaks] = useState<PageBreak[]>([]);

  // Use full size for print, scaled size for preview
  const dimensions = showPrintView ? {
    width: A4_DIMENSIONS.WIDTH_PX_FULL,
    height: A4_DIMENSIONS.HEIGHT_PX_FULL,
    contentHeight: A4_DIMENSIONS.HEIGHT_PX_FULL - (A4_DIMENSIONS.MARGIN_MM * 3.78 * 2),
    margin: A4_DIMENSIONS.MARGIN_MM * 3.78,
    scaleFactor: 1
  } : {
    width: A4_DIMENSIONS.WIDTH_PX,
    height: A4_DIMENSIONS.HEIGHT_PX,
    // Much more conservative content height to match visual reality
    contentHeight: 950, // Significantly increased to allow more content per page
    margin: 32, // Small, fixed margin for preview
    scaleFactor: scale || A4_DIMENSIONS.SCALE_FACTOR
  };

  useEffect(() => {
    const checkOverflow = () => {
      if (!resumeRef.current) return;

      const element = resumeRef.current;
      const contentHeight = element.scrollHeight;
      const containerHeight = dimensions.contentHeight;
      
      const calculatedPages = Math.ceil(contentHeight / containerHeight);
      const overflow = contentHeight > containerHeight;
      
      setPages(calculatedPages);
      setIsOverflowing(overflow);
    };

    // Check on mount and when content changes
    const timeoutId = setTimeout(checkOverflow, 100); // Small delay to ensure content is rendered
    
    // Use ResizeObserver for more accurate detection
    const resizeObserver = new ResizeObserver(() => {
      setTimeout(checkOverflow, 50); // Debounce the check
    });
    
    if (resumeRef.current) {
      resizeObserver.observe(resumeRef.current);
    }

    return () => {
      clearTimeout(timeoutId);
      resizeObserver.disconnect();
    };
  }, [profile, data, compact, dimensions.contentHeight]);

  return (
    <div className="space-y-4 relative">

      {/* Compact Warning in Top Right Corner */}
      {isOverflowing && !showPrintView && (
        <div className="absolute top-3 right-8 z-20 group">
          <div className="bg-amber-100 border border-amber-300 rounded-lg p-2 shadow-sm cursor-help">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
          </div>
          {/* Hover tooltip */}
          <div className="absolute top-full right-0 mt-2 bg-amber-50 border border-amber-300 rounded-lg p-3 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none min-w-[250px]">
            <div className="text-sm text-amber-800">
              <strong>Resume Length Warning</strong>
              <p className="mt-1">
                Your resume is {pages > 1 ? `${pages} pages long` : 'exceeding one page'}. 
                Consider using the compact template or removing some content for better readability.
              </p>
            </div>
            {/* Arrow pointing up */}
            <div className="absolute bottom-full right-4 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-amber-300"></div>
          </div>
        </div>
      )}

      {/* A4 Resume Container */}
      <div 
        className={clsx(
          'bg-white shadow-lg mx-auto relative rounded-lg overflow-hidden',
          showPrintView ? 'print:shadow-none print:rounded-none' : 'border border-gray-200'
        )}
        style={{
          width: `${dimensions.width}px`,
          minHeight: `${dimensions.height}px`,
        }}
      >
        {/* Resume Content with proper margins */}
        <div
          ref={resumeRef}
          className="text-black"
          style={{
            padding: `${dimensions.margin}px`,
            minHeight: `${dimensions.contentHeight}px`,
            fontSize: showPrintView ? '14px' : `${15 * dimensions.scaleFactor}px`, // Slightly larger base font
            lineHeight: showPrintView ? '1.5' : '1.4',
          }}
        >
          <Resume profile={profile} data={data} compact={compact} />
        </div>
      </div>

      {/* Additional pages info - more subtle */}
      {pages > 1 && !showPrintView && (
        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            This resume will print on {pages} pages
          </p>
        </div>
      )}
    </div>
  );
}
