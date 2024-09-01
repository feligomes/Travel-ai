'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';

export default function Itinerary() {
  const [itinerary, setItinerary] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isFallback, setIsFallback] = useState(false);
  const searchParams = useSearchParams();

  const generateItinerary = async () => {
    const destination = searchParams.get('destination');
    const days = searchParams.get('days');

    if (destination && days) {
      setLoading(true);
      try {
        const response = await fetch('/api/generate-itinerary', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ destination, days }),
        });
        const data = await response.json();
        setItinerary(data.itinerary);
        setIsFallback(data.fallback || false);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg">Generating your itinerary...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 bg-background text-foreground">
      <h1 className="text-3xl font-semibold mb-6 text-foreground">Your Itinerary</h1>
      {!itinerary && (
        <button 
          onClick={generateItinerary} 
          className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md transition-colors"
        >
          Generate Itinerary
        </button>
      )}
      {isFallback && (
        <p className="text-destructive my-4">Note: This is a generic itinerary due to temporary AI service limitations.</p>
      )}
      {itinerary ? (
        <div className="mt-6 p-6 bg-card text-card-foreground rounded-lg shadow-md">
          <pre className="whitespace-pre-wrap">{itinerary}</pre>
        </div>
      ) : (
        <p className="mt-4 text-muted-foreground">Click the button to generate your itinerary.</p>
      )}
    </div>
  );
}