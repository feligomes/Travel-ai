'use client'

import React, { useState, useEffect } from "react";
import { Calendar } from "lucide-react";
import { Input } from "./components/ui/input";
import { DestinationInput } from "./components/DestinationInput";
import { TravelPreferences } from "./components/TravelPreferences";
import { ItineraryGenerator } from "./components/ItineraryGenerator";
import { ItineraryDisplay } from "./components/ItineraryDisplay";
import { SavedItineraries } from "./components/SavedItineraries";
import { useItineraryApi } from "./hooks/useItineraryApi";
import { ItineraryDay, Preferences, SavedItinerary } from "./types";
import { useRouter } from 'next/navigation';

export default function TravelPlannerPage() {
  const router = useRouter();
  const [destinations, setDestinations] = useState<string[]>([""]);
  const [numDays, setNumDays] = useState("");
  const [travelerType, setTravelerType] = useState("");
  const [preferences, setPreferences] = useState<Preferences>({
    food: false,
    culture: false,
    nightlife: false,
  });
  const [itinerary, setItinerary] = useState<ItineraryDay[] | null>(null);
  const [isFallback, setIsFallback] = useState(false);
  const [savedItineraries, setSavedItineraries] = useState<SavedItinerary[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const {
    generateItinerary,
    fetchSavedItineraries,
    deleteItinerary,
    loading: apiLoading,
    error,
  } = useItineraryApi();

  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateItinerary = async () => {
    if (destinations[0] && numDays) {
      setIsGenerating(true);
      try {
        const result = await generateItinerary(
          destinations,
          numDays,
          preferences,
          travelerType
        );
        console.log('Generated itinerary result:', result);
        
        setItinerary(result.itinerary);
        setIsFallback(result.fallback);
        
        // Wait for the itinerary to be saved and fetch the updated list
        const updatedItineraries = await handleFetchSavedItineraries();
        
        // Get the most recently created itinerary (should be the first in the list)
        const mostRecentItinerary = updatedItineraries[0];
        
        if (mostRecentItinerary && mostRecentItinerary.id) {
          console.log('Redirecting to most recent itinerary:', `/itinerary/${mostRecentItinerary.id}`);
          router.push(`/itinerary/${mostRecentItinerary.id}`);
        } else {
          console.error('No saved itineraries available for redirection');
        }
      } catch (error) {
        console.error('Error generating itinerary:', error);
      } finally {
        setIsGenerating(false);
      }
    }
  };

  const handleFetchSavedItineraries = async (page = 1) => {
    try {
      const { itineraries, totalPages, currentPage } = await fetchSavedItineraries(page);
      setSavedItineraries(itineraries);
      setTotalPages(totalPages);
      setCurrentPage(currentPage);
      setIsInitialLoad(false);
      return itineraries; // Return the fetched itineraries
    } catch (error) {
      console.error('Error fetching saved itineraries:', error);
      return []; // Return an empty array in case of error
    }
  };

  const handleDeleteItinerary = async (id: string) => {
    try {
      await deleteItinerary(id);
      handleFetchSavedItineraries(currentPage);
    } catch (error) {
      console.error('Error deleting itinerary:', error);
    }
  };

  useEffect(() => {
    handleFetchSavedItineraries();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background text-foreground">
      <div className="bg-card text-card-foreground rounded-[var(--radius)] shadow-xl p-6 w-full max-w-2xl">
        <h1 className="text-3xl font-bold mb-2">Travel Itinerary Planner</h1>
        <p className="mb-6 text-muted-foreground">Plan your perfect trip with AI assistance</p>
        
        <div className="space-y-4">
          <DestinationInput destinations={destinations} setDestinations={setDestinations} />
          
          <div className="flex items-center space-x-2">
            <Calendar className="text-primary" />
            <Input
              type="number"
              placeholder="Number of days"
              value={numDays}
              onChange={(e) => setNumDays(e.target.value)}
              className="flex-grow"
            />
          </div>
          
          <TravelPreferences
            travelerType={travelerType}
            setTravelerType={setTravelerType}
            preferences={preferences}
            setPreferences={setPreferences}
          />
        </div>
        
        <ItineraryGenerator onGenerate={handleGenerateItinerary} loading={isGenerating} />

        <div className="mt-6">
          <h2 className="text-2xl font-semibold mb-4">Saved Itineraries</h2>
          <SavedItineraries
            savedItineraries={savedItineraries}
            isLoading={isInitialLoad}
            isInitialLoad={isInitialLoad}
            currentPage={currentPage}
            totalPages={totalPages}
            onDelete={handleDeleteItinerary}
            onPageChange={handleFetchSavedItineraries}
          />
        </div>
        
      </div>
    </div>
  )
}
