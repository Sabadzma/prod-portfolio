// Shared TypeScript interfaces for the portfolio application

export interface PortfolioItem {
  heading: string;
  url?: string;
  year: string;
  location?: string;
  description?: string;
  attachments?: MediaAttachment[];
  platform?: string;
  handle?: string;
}

export interface MediaAttachment {
  url: string;
  type: 'image' | 'video';
  title?: string;
  description?: string;
}

export interface PortfolioCollection {
  name: string;
  items: PortfolioItem[];
}

export interface PortfolioGeneral {
  profilePhoto: string;
  displayName: string;
  byline: string;
  website?: string;
  about?: string;
  sectionOrder?: string[];
}

export interface Portfolio {
  general: PortfolioGeneral;
  projects?: PortfolioItem[];
  writing?: PortfolioItem[];
  speaking?: PortfolioItem[];
  education?: PortfolioItem[];
  contact?: PortfolioItem[];
  allCollections?: PortfolioCollection[];
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  error?: string;
  data?: T;
}

export interface SyncStats {
  totalImages: number;
  downloaded: number;
  failed: number;
  cleaned: number;
}

export interface StaticGenerationResult {
  success: boolean;
  timestamp: string;
  error?: string;
  stats?: SyncStats;
}

export interface StaticStatus {
  hasStaticFiles: boolean;
  lastUpdate: {
    timestamp: string;
    stats?: SyncStats;
  } | null;
}

export interface NotionSyncResult {
  success: boolean;
  message?: string;
  error?: string;
  data?: {
    general: any;
    projects: number;
    writing: number;
    speaking: number;
    education: number;
  };
  stats?: SyncStats;
}