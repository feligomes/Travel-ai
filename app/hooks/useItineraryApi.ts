import { useState } from 'react';
import { SavedItinerary, ItineraryDay, Preferences } from '../types';

export function useItineraryApi() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const generateItinerary = async (
    destinations: string[],
    numDays: string,
    preferences: Preferences,
    travelerType: string
  ): Promise<{ itinerary: ItineraryDay[]; id: string; timestamp: number }> => {
    setIsGenerating(true);
    setError(null);
    try {
      const response = await fetch('/api/create-itinerary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destinations,
          days: numDays,
          preferences,
          travelerType,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        return data;
      } else {
        throw new Error(data.error || 'Failed to generate itinerary');
      }
    } catch (err) {
      setError('Failed to generate itinerary');
      throw err;
    } finally {
      setIsGenerating(false);
    }
  };

  const fetchSavedItineraries = async (page = 1): Promise<{
    itineraries: SavedItinerary[];
    totalPages: number;
    currentPage: number;
  }> => {
    setIsFetching(true);
    setError(null);
    try {
      const response = await fetch(`/api/itineraries?page=${page}`);
      const data = await response.json();
      return data;
    } catch (err) {
      setError('Failed to fetch saved itineraries');
      throw err;
    } finally {
      setIsFetching(false);
      setIsInitialLoad(false);
    }
  };

  const deleteItinerary = async (id: string): Promise<void> => {
    setIsFetching(true);
    setError(null);
    try {
      const response = await fetch('/api/itineraries', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (!response.ok) {
        throw new Error('Failed to delete itinerary');
      }
    } catch (err) {
      setError('Failed to delete itinerary');
      throw err;
    } finally {
      setIsFetching(false);
    }
  };

  return {
    generateItinerary,
    fetchSavedItineraries,
    deleteItinerary,
    isGenerating,
    isFetching,
    isInitialLoad,
    error,
  };
}