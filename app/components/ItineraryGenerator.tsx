import React from 'react';
import { Button } from './ui/button';
import ProgressBar, { useFakeProgress } from './ProgressBar';

interface ItineraryGeneratorProps {
  onGenerate: () => void;
  loading: boolean;
}

export function ItineraryGenerator({ onGenerate, loading }: ItineraryGeneratorProps) {
  const progress = useFakeProgress(loading);

  return (
    <>
      <Button className="w-full mt-6" onClick={onGenerate} disabled={loading}>
        {loading ? "Generating Itinerary..." : "Create Itinerary"}
      </Button>

      {loading && (
        <div className="mt-4">
          <ProgressBar isLoading={loading} progress={progress} />
          <p className="text-sm text-center mt-2 text-muted-foreground">
            {progress < 75 ? "Preparing your itinerary..." : "Almost there..."}
          </p>
        </div>
      )}
    </>
  );
}