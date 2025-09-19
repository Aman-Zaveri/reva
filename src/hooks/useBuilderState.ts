'use client';

import { useState } from 'react';

export function useBuilderState() {
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'idle'>('saved');

  return {
    saveStatus,
    setSaveStatus
  };
}
