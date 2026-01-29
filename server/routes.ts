import express, { type Express, type Response } from "express";
import { createServer, type Server } from "http";
import path from "path";
import { promises as fs } from "fs";
import { getPortfolioGeneral, getProjects, getSection, getWorkExperience, syncPortfolioWithImages } from "./notion";
import { generateStaticPortfolio, getStaticPortfolioData, hasValidStaticFiles, getLastUpdateInfo } from "./static-generator";

// Helper function to serve portfolio data with proper error handling
async function servePortfolioFallback(res: Response): Promise<void> {
  try {
    const filePath = path.join(process.cwd(), 'public', 'content', 'profileData.json');
    const data = await fs.readFile(filePath, 'utf8');
    res.setHeader('Content-Type', 'application/json');
    res.send(data);
  } catch (error) {
    console.error('Failed to serve fallback portfolio data:', error);
    res.status(404).json({ error: 'Portfolio data not found' });
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // API endpoint to serve portfolio data (static files for fast loading)
  app.get('/content/profileData.json', async (req, res) => {
    try {
      console.log('Serving portfolio data from static files...');
      
      // Try to serve static file first (fastest approach)
      const staticData = await getStaticPortfolioData();
      if (staticData) {
        console.log('Serving pre-generated static portfolio data');
        res.setHeader('Content-Type', 'application/json');
        res.json(staticData);
        return;
      }

      console.log('No static files found, generating on-demand...');
      
      // If no static files exist, generate them on-demand (first run only)
      const generationResult = await generateStaticPortfolio();
      if (generationResult.success) {
        const newStaticData = await getStaticPortfolioData();
        if (newStaticData) {
          console.log('Serving newly generated static data');
          res.setHeader('Content-Type', 'application/json');
          res.json(newStaticData);
          return;
        }
      }

      // Final fallback to original static file
      console.log('Falling back to original static file');
      await servePortfolioFallback(res);

    } catch (err) {
      console.error('Error serving portfolio data:', err);
      await servePortfolioFallback(res);
    }
  });

  // API endpoint for regenerating static portfolio files
  app.post('/api/regenerate-static', async (req, res) => {
    try {
      console.log('Regenerating static portfolio files...');
      const result = await generateStaticPortfolio();
      res.json(result);
    } catch (error) {
      console.error('Error regenerating static files:', error);
      res.status(500).json({
        success: false,
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // API endpoint for getting last update info
  app.get('/api/static-status', async (req, res) => {
    try {
      const lastUpdate = await getLastUpdateInfo();
      const hasStatic = await hasValidStaticFiles();
      
      res.json({
        hasStaticFiles: hasStatic,
        lastUpdate: lastUpdate || null
      });
    } catch (error) {
      console.error('Error getting static status:', error);
      res.status(500).json({
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // API endpoint for syncing images from Notion (legacy endpoint)
  app.post('/api/sync-images', async (req, res) => {
    try {
      console.log('Manual image sync requested');
      const result = await syncPortfolioWithImages();
      
      res.json({
        success: true,
        message: 'Images synced successfully',
        stats: result.syncStats
      });
    } catch (error) {
      console.error('Image sync failed:', error);
      res.status(500).json({
        success: false,
        message: 'Image sync failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // API endpoint for full Notion sync (including images)
  app.post('/api/sync-notion', async (req, res) => {
    try {
      console.log('Full Notion sync with images requested');
      const result = await syncPortfolioWithImages();
      
      res.json({
        success: true,
        message: 'Notion data synced successfully with images',
        stats: result.syncStats
      });
    } catch (error) {
      console.error('Notion sync failed:', error);
      res.status(500).json({
        success: false,
        message: 'Notion sync failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Serve static files from public directory (after specific routes)
  app.use('/content', express.static(path.join(process.cwd(), 'public', 'content')));



  const httpServer = createServer(app);
  return httpServer;
}
