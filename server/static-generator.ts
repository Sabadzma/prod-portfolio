import { promises as fs } from "fs";
import path from "path";
import { syncPortfolioWithImages } from "./notion";

export interface StaticGenerationResult {
  success: boolean;
  timestamp: string;
  error?: string;
  stats?: {
    totalImages: number;
    downloaded: number;
    failed: number;
    cleaned: number;
  };
}

const STATIC_FILE_PATH = path.join(process.cwd(), 'public', 'content', 'profileData.json');
const LAST_UPDATE_PATH = path.join(process.cwd(), 'public', 'content', 'lastUpdate.json');

/**
 * Generates static portfolio files with local images
 */
export async function generateStaticPortfolio(): Promise<StaticGenerationResult> {
  try {
    console.log('Starting static portfolio generation...');
    
    // Sync portfolio data with images
    const syncResult = await syncPortfolioWithImages();
    const { portfolioData: rawData, syncStats } = syncResult;
    
    // Prepare portfolio data structure
    const portfolioData = {
      general: {
        ...rawData.general,
        sectionOrder: [
          "Work Experience",
          "Projects", 
          "Writing",
          "Speaking",
          "Education",
          "Contact"
        ]
      },
      projects: rawData.projects,
      workExperience: rawData.workExperience,
      writing: rawData.writing,
      speaking: rawData.speaking,
      education: rawData.education,
      contact: rawData.contact,
      allCollections: [
        { name: "Work Experience", items: rawData.workExperience },
        { name: "Projects", items: rawData.projects },
        { name: "Writing", items: rawData.writing },
        { name: "Speaking", items: rawData.speaking },
        { name: "Education", items: rawData.education },
        { name: "Contact", items: rawData.contact || [] }
      ].filter(collection => collection.items.length > 0)
    };

    // Ensure content directory exists
    await fs.mkdir(path.dirname(STATIC_FILE_PATH), { recursive: true });

    // Write static portfolio file
    await fs.writeFile(STATIC_FILE_PATH, JSON.stringify(portfolioData, null, 2), 'utf8');

    // Write last update metadata
    const updateInfo = {
      timestamp: new Date().toISOString(),
      stats: syncStats
    };
    await fs.writeFile(LAST_UPDATE_PATH, JSON.stringify(updateInfo, null, 2), 'utf8');

    console.log('Static portfolio generation complete');
    
    return {
      success: true,
      timestamp: updateInfo.timestamp,
      stats: syncStats
    };

  } catch (error) {
    console.error('Failed to generate static portfolio:', error);
    return {
      success: false,
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Gets the last update information
 */
export async function getLastUpdateInfo(): Promise<{ timestamp: string; stats?: any } | null> {
  try {
    const data = await fs.readFile(LAST_UPDATE_PATH, 'utf8');
    return JSON.parse(data);
  } catch {
    return null;
  }
}

/**
 * Checks if static files exist and are valid
 */
export async function hasValidStaticFiles(): Promise<boolean> {
  try {
    await fs.access(STATIC_FILE_PATH);
    await fs.access(LAST_UPDATE_PATH);
    return true;
  } catch {
    return false;
  }
}

/**
 * Serves static portfolio data if available
 */
export async function getStaticPortfolioData(): Promise<any | null> {
  try {
    const data = await fs.readFile(STATIC_FILE_PATH, 'utf8');
    return JSON.parse(data);
  } catch {
    return null;
  }
}