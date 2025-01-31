// File: types/Browser.ts

export type Browser = {
    name: string;
    version: string;
    userAgent: string;
    icon: React.FC<{ width?: number; height?: number; color?: string }>;
  };
  