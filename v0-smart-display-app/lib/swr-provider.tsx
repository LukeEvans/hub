"use client";

import { SWRConfig } from 'swr';
import { swrConfig } from './swr-config';
import React from 'react';

export const SWRProvider = ({ children }: { children: React.ReactNode }) => {
  return <SWRConfig value={swrConfig}>{children}</SWRConfig>;
};

