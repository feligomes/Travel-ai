'use client';

import { useState, useEffect } from 'react';

export default function Itineraries() {
  const [itineraries, setItineraries] = useState([]);

  useEffect(() => {
    async function fetchItineraries() {
      const response = await fetch('/api/itineraries');
      const data = await response.json();
      setItineraries(data.itineraries);
    }
    fetchItineraries();
  }, []);

  return (
    <div>
      <h1>Saved Itineraries</h1>
      {itineraries.map((itinerary: any) => (
        <div key={itinerary.id}>
          <h2>{itinerary.destinations.join(', ')} - {itinerary.num_days} days</h2>
          <p>Traveler Type: {itinerary.traveler_type}</p>
          <p>Preferences: {JSON.stringify(itinerary.preferences)}</p>
          <h3>Itinerary:</h3>
          <pre>{JSON.stringify(itinerary.days, null, 2)}</pre>
        </div>
      ))}
    </div>
  );
}