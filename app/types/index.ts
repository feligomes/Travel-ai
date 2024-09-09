export interface Activity {
  time: string;
  description: string;
}

export interface ItineraryDay {
  day: number;
  location: string;
  activities: Activity[];
}

export interface SavedItinerary {
  id: string;
  destinations: string[];
  num_days: number;
}

export interface Preferences {
  food: boolean;
  culture: boolean;
  nightlife: boolean;
}