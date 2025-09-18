"use client";

import { useEffect, useRef, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { A4_DIMENSIONS } from "@/shared/utils/constants";
import { clsx } from "clsx";
import { Resume } from "./Resume";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";
import type { DataBundle, Profile } from "@/shared/lib/types";

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

export function A4Resume({
  profile,
  data,
  compact,
  showPrintView = false,
  scale,
}: A4ResumeProps) {
  const resumeRef = useRef<HTMLDivElement>(null);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const [pages, setPages] = useState(1);
  const [pageBreaks, setPageBreaks] = useState<PageBreak[]>([]);

  // Use full size for print, scaled size for preview
  const dimensions = showPrintView
    ? {
        width: A4_DIMENSIONS.WIDTH_PX_FULL,
        height: A4_DIMENSIONS.HEIGHT_PX_FULL,
        contentHeight: A4_DIMENSIONS.HEIGHT_PX_FULL - 2 * 3.78 * 2, // Minimal margin for print (≈1108px)
        margin: 2 * 3.78, // Very minimal margin for print (2mm)
        scaleFactor: 1,
      }
    : {
        width: A4_DIMENSIONS.WIDTH_PX,
        height: A4_DIMENSIONS.HEIGHT_PX,
        // Match the print content height ratio to give accurate page calculations
        contentHeight: Math.floor(
          (A4_DIMENSIONS.HEIGHT_PX_FULL - 2 * 3.78 * 2) *
            A4_DIMENSIONS.SCALE_FACTOR
        ), // ≈908px (scales with preview)
        margin: 32, // Small, fixed margin for preview
        scaleFactor: scale || A4_DIMENSIONS.SCALE_FACTOR,
      };

  useEffect(() => {
    const checkOverflow = () => {
      if (!resumeRef.current) return;

      const element = resumeRef.current;
      const contentHeight = element.scrollHeight;

      // Always use the print dimensions for page calculation to ensure accuracy
      const printContentHeight = A4_DIMENSIONS.HEIGHT_PX_FULL - 10 * 3.78 * 2; // ≈1047px

      let effectiveContentHeight = contentHeight;

      if (!showPrintView) {
        // Since the print version is significantly more compact than preview due to:
        // - Different font rendering, line spacing, and CSS print optimizations
        // - Browser print compression
        // Use empirical scale factor based on real-world print vs preview measurements
        const empiricalScaleFactor = 0.85;

        // Apply the empirical scale factor
        effectiveContentHeight = contentHeight * empiricalScaleFactor;
      }

      const calculatedPages = Math.ceil(
        effectiveContentHeight / printContentHeight
      );
      const overflow = effectiveContentHeight > printContentHeight;

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
  }, [profile, data, compact, showPrintView, dimensions.scaleFactor]);

  return (
    <div>
      {/* A4 Resume Container */}
      <div
        className="shadow-lg border border-gray-200 rounded-lg overflow-hidden"
        style={{
          width: `${dimensions.width}px`,
          minHeight: `${dimensions.height}px`,
        }}
      >
        {/* Resume Content with proper margins */}
        <div
          ref={resumeRef}
          className={clsx("text-black", showPrintView && "print:p-0 print:m-0")}
          style={{
            padding: showPrintView
              ? `${dimensions.margin}px`
              : `${dimensions.margin}px`,
            minHeight: `${dimensions.contentHeight}px`,
            lineHeight: showPrintView ? "1.5" : "1.4",
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
