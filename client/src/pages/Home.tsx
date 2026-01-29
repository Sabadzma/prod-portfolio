import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import Profile from "../components/Profile";
import type { Portfolio } from "@shared/types";

export default function Home() {
  const { data: cv, isLoading, error } = useQuery<Portfolio>({
    queryKey: ['/content/profileData.json'],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading portfolio...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Failed to load portfolio data</p>
          <p className="text-gray-600">Please try again later</p>
        </div>
      </div>
    );
  }

  if (!cv) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">No portfolio data available</p>
        </div>
      </div>
    );
  }

  // Transform data for Profile component compatibility
  const transformedCV = {
    general: cv.general,
    allCollections: cv.allCollections || [
      { name: "Projects", items: cv.projects || [] },
      { name: "Writing", items: cv.writing || [] },
      { name: "Speaking", items: cv.speaking || [] },
      { name: "Education", items: cv.education || [] },
    ].filter(collection => collection.items.length > 0)
  };

  return (
    <div className="page">
      <Profile cv={transformedCV} />
      

    </div>
  );
}
