import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Database, RefreshCw, ExternalLink } from "lucide-react";
import type { NotionSyncResult, StaticGenerationResult, StaticStatus } from "@shared/types";

export default function Admin() {
  const [isSync, setIsSync] = useState<boolean>(false);
  const [syncResult, setSyncResult] = useState<NotionSyncResult | null>(null);
  const [isRegenerating, setIsRegenerating] = useState<boolean>(false);
  const [regenerateResult, setRegenerateResult] = useState<StaticGenerationResult | null>(null);
  const [staticStatus, setStaticStatus] = useState<StaticStatus | null>(null);

  const handleSync = async (): Promise<void> => {
    setIsSync(true);
    setSyncResult(null);
    
    try {
      const response = await fetch('/api/sync-notion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result: NotionSyncResult = await response.json();
      setSyncResult(result);
    } catch (error) {
      setSyncResult({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to sync with Notion'
      });
    } finally {
      setIsSync(false);
    }
  };

  const handleRegenerate = async (): Promise<void> => {
    setIsRegenerating(true);
    setRegenerateResult(null);
    
    try {
      const response = await fetch('/api/regenerate-static', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result: StaticGenerationResult = await response.json();
      setRegenerateResult(result);
      
      // Refresh status after regeneration
      await fetchStaticStatus();
    } catch (error) {
      setRegenerateResult({
        success: false,
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Failed to regenerate static files'
      });
    } finally {
      setIsRegenerating(false);
    }
  };

  const fetchStaticStatus = async (): Promise<void> => {
    try {
      const response = await fetch('/api/static-status');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result: StaticStatus = await response.json();
      setStaticStatus(result);
    } catch (error) {
      console.error('Failed to fetch static status:', error instanceof Error ? error.message : error);
    }
  };

  useEffect(() => {
    fetchStaticStatus();
  }, []);

  return (
    <div className="min-h-screen bg-[--wash1] px-6 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-light text-[--grey1] mb-2">Portfolio CMS Admin</h1>
          <p className="text-[--grey2] text-sm">
            Manage your portfolio content through Notion integration
          </p>
        </div>

        <div className="grid gap-6">
          {/* Notion Integration Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                Notion Integration
              </CardTitle>
              <CardDescription>
                Your portfolio content is managed through Notion databases
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-[--grey2]">Status</span>
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  Connected
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-[--grey2]">Last Sync</span>
                <span className="text-sm text-[--grey1]">
                  {syncResult ? 'Just now' : 'Not synced yet'}
                </span>
              </div>

              <Button 
                onClick={handleSync}
                disabled={isSync}
                className="w-full"
              >
                {isSync ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Syncing...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Sync with Notion
                  </>
                )}
              </Button>

              {syncResult && (
                <div className={`p-3 rounded-lg text-sm ${
                  syncResult.success 
                    ? 'bg-green-50 text-green-700 border border-green-200'
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}>
                  {syncResult.success ? (
                    <div>
                      <p className="font-medium mb-2">Sync successful!</p>
                      {syncResult.data && (
                        <div className="space-y-1 text-xs">
                          <p>Projects: {syncResult.data.projects}</p>
                          <p>Writing: {syncResult.data.writing}</p>
                          <p>Speaking: {syncResult.data.speaking}</p>
                          <p>Education: {syncResult.data.education}</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p>{syncResult.error || 'Sync failed'}</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Static Generation */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="w-5 h-5" />
                Static Files
              </CardTitle>
              <CardDescription>
                Regenerate portfolio with latest content and images
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {staticStatus && (
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span>Status:</span>
                    <span className={staticStatus.hasStaticFiles ? 'text-green-600' : 'text-orange-600'}>
                      {staticStatus.hasStaticFiles ? 'Static files ready' : 'No static files'}
                    </span>
                  </div>
                  {staticStatus.lastUpdate && (
                    <div className="flex items-center justify-between">
                      <span>Last updated:</span>
                      <span className="text-gray-600">
                        {new Date(staticStatus.lastUpdate.timestamp).toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
              )}

              <Button
                onClick={handleRegenerate}
                disabled={isRegenerating}
                className="w-full"
              >
                {isRegenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Regenerating...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Regenerate Static Files
                  </>
                )}
              </Button>

              {regenerateResult && (
                <div className={`p-3 rounded-lg text-sm ${
                  regenerateResult.success 
                    ? 'bg-green-50 text-green-700 border border-green-200'
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}>
                  {regenerateResult.success ? (
                    <div>
                      <p className="font-medium mb-2">Regeneration successful!</p>
                      {regenerateResult.stats && (
                        <div className="space-y-1 text-xs">
                          <p>Total images: {regenerateResult.stats.totalImages}</p>
                          <p>Downloaded: {regenerateResult.stats.downloaded}</p>
                          <p>Failed: {regenerateResult.stats.failed}</p>
                          <p>Cleaned up: {regenerateResult.stats.cleaned} unused</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p>{regenerateResult.error || 'Regeneration failed'}</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Content Management */}
          <Card>
            <CardHeader>
              <CardTitle>Content Management</CardTitle>
              <CardDescription>
                Edit your portfolio content directly in Notion
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="text-sm font-medium text-[--grey1]">General Information</h4>
                    <p className="text-xs text-[--grey2]">Profile photo, name, bio, contact info</p>
                  </div>
                  <Button variant="outline" size="sm">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Edit in Notion
                  </Button>
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="text-sm font-medium text-[--grey1]">Projects</h4>
                    <p className="text-xs text-[--grey2]">Add or edit your portfolio projects</p>
                  </div>
                  <Button variant="outline" size="sm">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Edit in Notion
                  </Button>
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="text-sm font-medium text-[--grey1]">Writing</h4>
                    <p className="text-xs text-[--grey2]">Articles, blog posts, publications</p>
                  </div>
                  <Button variant="outline" size="sm">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Edit in Notion
                  </Button>
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="text-sm font-medium text-[--grey1]">Speaking</h4>
                    <p className="text-xs text-[--grey2]">Conferences, workshops, talks</p>
                  </div>
                  <Button variant="outline" size="sm">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Edit in Notion
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Instructions */}
          <Card>
            <CardHeader>
              <CardTitle>How to Edit Content</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm text-[--grey2] space-y-2">
                <p>1. Click "Edit in Notion" for the section you want to modify</p>
                <p>2. Make your changes in the Notion database</p>
                <p>3. Return here and click "Sync with Notion" to update your portfolio</p>
                <p>4. Your changes will appear on the live portfolio immediately</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}