import React from 'react';
import { Button } from './ui/button';
import { X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { SavedItinerary } from '../types';
import { ItinerarySkeleton } from './ItinerarySkeleton';

interface SavedItinerariesProps {
  savedItineraries: SavedItinerary[];
  isLoading: boolean;
  isInitialLoad: boolean; // New prop
  currentPage: number;
  totalPages: number;
  onDelete: (id: string) => void;
  onPageChange: (page: number) => void;
}

export function SavedItineraries({
  savedItineraries,
  isLoading,
  isInitialLoad,
  currentPage,
  totalPages,
  onDelete,
  onPageChange,
}: SavedItinerariesProps) {
  const router = useRouter();

  if (isLoading || isInitialLoad) return <ItinerarySkeleton />;

  if (savedItineraries.length === 0) return <p>No saved itineraries found.</p>;

  return (
    <>
      <ul className="space-y-2">
        {savedItineraries.map((itinerary) => (
          <li key={itinerary.id} className="flex items-center space-x-2">
            <Button
              variant="outline"
              onClick={() => router.push(`/itinerary/${itinerary.id}`)}
              className="flex-grow text-left"
              style={{justifyContent: 'left'}}
            >
              {itinerary.destinations.join(', ')} - {itinerary.num_days} days
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(itinerary.id)}
              className="text-destructive"
            >
              <X className="h-4 w-4" />
            </Button>
          </li>
        ))}
      </ul>
      <div className="mt-4 flex justify-between items-center">
        <Button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1 || isLoading}
        >
          Previous
        </Button>
        <span>Page {currentPage} of {totalPages}</span>
        <Button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages || isLoading}
        >
          Next
        </Button>
      </div>
    </>
  );
}