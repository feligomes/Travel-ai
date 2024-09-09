import React from 'react';
import { Clock } from 'lucide-react';
import { ItineraryDay } from '../types';

interface ItineraryDisplayProps {
  itinerary: ItineraryDay[] | null;
  isFallback: boolean;
}

export function ItineraryDisplay({ itinerary, isFallback }: ItineraryDisplayProps) {
  if (!itinerary) return null;

  return (
    <div className="mt-6 p-6 bg-card text-card-foreground rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-4">Your Itinerary</h2>
      {isFallback && (
        <p className="text-destructive my-4">Note: This is a generic itinerary due to temporary AI service limitations.</p>
      )}
      {itinerary.map((day) => (
        <div key={day.day} className="mb-6">
          <h3 className="text-xl font-semibold mb-2">Day {day.day}: {day.location}</h3>
          <ul className="space-y-2">
            {day.activities.map((activity, index) => (
              <li key={index} className="flex items-start">
                <Clock className="mr-2 h-5 w-5 text-primary flex-shrink-0" />
                <div>
                  <span className="font-semibold inline-block w-16">{activity.time}</span>
                  <span>{activity.description}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}