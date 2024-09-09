import React from 'react';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Switch } from './ui/switch';
import { Preferences } from '../types';

interface TravelPreferencesProps {
  travelerType: string;
  setTravelerType: (value: string) => void;
  preferences: Preferences;
  setPreferences: React.Dispatch<React.SetStateAction<Preferences>>;
}

export function TravelPreferences({
  travelerType,
  setTravelerType,
  preferences,
  setPreferences,
}: TravelPreferencesProps) {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="travelerType">Traveler Type</Label>
        <Select onValueChange={setTravelerType} value={travelerType}>
          <SelectTrigger id="travelerType">
            <SelectValue placeholder="Select traveler type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="solo">Solo</SelectItem>
            <SelectItem value="couple">Couple</SelectItem>
            <SelectItem value="family">Family</SelectItem>
            <SelectItem value="group">Group</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label>Travel Preferences</Label>
        <div className="flex space-x-4">
          {Object.entries(preferences).map(([key, value]) => (
            <div key={key} className="flex items-center space-x-2">
              <Switch
                id={key}
                checked={value}
                onCheckedChange={(checked) => setPreferences(prev => ({...prev, [key]: checked}))}
              />
              <Label htmlFor={key} className="hidden sm:inline-block">
                {key === 'food' && '🍽️ Food'}
                {key === 'culture' && '🏛️ Culture'}
                {key === 'nightlife' && '🌙 Nightlife'}
              </Label>
              <Label htmlFor={key} className="sm:hidden">
                {key === 'food' && '🍽️'}
                {key === 'culture' && '🏛️'}
                {key === 'nightlife' && '🌙'}
              </Label>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}