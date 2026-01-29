import fs from 'fs/promises';
import path from 'path';
import fetch from 'node-fetch';
import { createWriteStream } from 'fs';
import { pipeline } from 'stream/promises';

export interface ImageMetadata {
  originalUrl: string;
  localPath: string;
  filename: string;
  downloaded: boolean;
  error?: string;
}

// Ensure media directory exists
async function ensureMediaDirectory() {
  const mediaDir = path.join(process.cwd(), 'public', 'content', 'media');
  try {
    await fs.access(mediaDir);
  } catch {
    await fs.mkdir(mediaDir, { recursive: true });
  }
  return mediaDir;
}

// Generate a safe filename from URL and title
function generateFilename(url: string, title: string, index: number): string {
  // Clean title for filename
  const cleanTitle = title
    .replace(/[^a-zA-Z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .substring(0, 50);
  
  // Get file extension from URL
  const urlPath = new URL(url).pathname;
  const extension = path.extname(urlPath) || '.png';
  
  return `${cleanTitle}-${index + 1}${extension}`;
}

// Download a single image
async function downloadImage(url: string, localPath: string): Promise<boolean> {
  try {
    console.log(`Downloading image from: ${url}`);
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    if (!response.body) {
      throw new Error('No response body');
    }

    const writeStream = createWriteStream(localPath);
    
    // Use pipeline with proper Node.js stream handling
    await pipeline(response.body as any, writeStream);
    
    console.log(`Successfully downloaded: ${path.basename(localPath)}`);
    return true;
  } catch (error) {
    console.error(`Failed to download image ${url}:`, error);
    return false;
  }
}

// Process attachments for a single item (project, speaking, etc.)
export async function processItemAttachments(
  item: any,
  itemType: string
): Promise<{ item: any; downloadedImages: ImageMetadata[] }> {
  if (!item.attachments || item.attachments.length === 0) {
    return { item, downloadedImages: [] };
  }

  const mediaDir = await ensureMediaDirectory();
  const downloadedImages: ImageMetadata[] = [];
  const processedAttachments = [];

  for (let i = 0; i < item.attachments.length; i++) {
    const attachment = item.attachments[i];
    
    if (attachment.type !== 'image' || !attachment.url) {
      processedAttachments.push(attachment);
      continue;
    }

    const filename = generateFilename(attachment.url, item.heading || item.title || 'image', i);
    const localPath = path.join(mediaDir, filename);
    const publicUrl = `/content/media/${filename}`;

    const imageMetadata: ImageMetadata = {
      originalUrl: attachment.url,
      localPath,
      filename,
      downloaded: false
    };

    // Check if file already exists
    try {
      await fs.access(localPath);
      console.log(`Image already exists: ${filename}`);
      imageMetadata.downloaded = true;
    } catch {
      // File doesn't exist, download it
      imageMetadata.downloaded = await downloadImage(attachment.url, localPath);
      if (!imageMetadata.downloaded) {
        imageMetadata.error = 'Download failed';
      }
    }

    downloadedImages.push(imageMetadata);

    // Update attachment to use local URL if download was successful
    if (imageMetadata.downloaded) {
      processedAttachments.push({
        ...attachment,
        url: publicUrl,
        originalUrl: attachment.url // Keep original for reference
      });
    } else {
      // Keep original URL as fallback
      processedAttachments.push(attachment);
    }
  }

  return {
    item: { ...item, attachments: processedAttachments },
    downloadedImages
  };
}

// Process all items in a collection
export async function processCollectionImages(
  items: any[],
  collectionType: string
): Promise<{ items: any[]; downloadedImages: ImageMetadata[] }> {
  const processedItems = [];
  const allDownloadedImages: ImageMetadata[] = [];

  for (const item of items) {
    const { item: processedItem, downloadedImages } = await processItemAttachments(item, collectionType);
    processedItems.push(processedItem);
    allDownloadedImages.push(...downloadedImages);
  }

  return {
    items: processedItems,
    downloadedImages: allDownloadedImages
  };
}

// Clean up unused images
export async function cleanupUnusedImages(activeImages: string[]): Promise<void> {
  try {
    const mediaDir = path.join(process.cwd(), 'public', 'content', 'media');
    const files = await fs.readdir(mediaDir);
    
    for (const file of files) {
      const filePath = path.join(mediaDir, file);
      const stat = await fs.stat(filePath);
      
      if (stat.isFile() && !activeImages.includes(file)) {
        console.log(`Removing unused image: ${file}`);
        await fs.unlink(filePath);
      }
    }
  } catch (error) {
    console.error('Error cleaning up unused images:', error);
  }
}

// Get all local image filenames that are currently in use
export function getActiveImageFilenames(portfolioData: any): string[] {
  const activeImages: string[] = [];
  
  const collections = [
    portfolioData.projects || [],
    portfolioData.workExperience || [],
    portfolioData.writing || [],
    portfolioData.speaking || [],
    portfolioData.education || []
  ];

  collections.forEach(collection => {
    collection.forEach((item: any) => {
      if (item.attachments) {
        item.attachments.forEach((attachment: any) => {
          if (attachment.url && attachment.url.startsWith('/content/media/')) {
            const filename = path.basename(attachment.url);
            activeImages.push(filename);
          }
        });
      }
    });
  });

  return activeImages;
}