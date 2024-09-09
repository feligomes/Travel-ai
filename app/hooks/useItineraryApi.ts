import { useState } from 'react';
import { SavedItinerary, ItineraryDay, Preferences } from '../types';

export function useItineraryApi() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateItinerary = async (
    destinations: string[],
    numDays: string,
    preferences: Preferences,
    travelerType: string
  ): Promise<{ itinerary: ItineraryDay[]; fallback: boolean; id: string }> => {
    setLoading(true);
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
          timestamp: Date.now(),
        }),
      });
      const data = await response.json();
      return data;
    } catch (err) {
      setError('Failed to generate itinerary');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const fetchSavedItineraries = async (page = 1): Promise<{
    itineraries: SavedItinerary[];
    totalPages: number;
    currentPage: number;
  }> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/itineraries?page=${page}`);
      const data = await response.json();
      return data;
    } catch (err) {
      setError('Failed to fetch saved itineraries');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteItinerary = async (id: string): Promise<void> => {
    setLoading(true);
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
      setLoading(false);
    }
  };

  return {
    generateItinerary,
    fetchSavedItineraries,
    deleteItinerary,
    loading,
    error,
  };
}