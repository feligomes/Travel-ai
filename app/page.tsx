'use client'

import * as React from "react"
import { useState } from "react"
import { PlusCircle, MinusCircle, Plane, Calendar, Users, Utensils, Clock } from "lucide-react"
import { Button } from "./components/ui/button"
import { Input } from "./components/ui/input"
import { Label } from "./components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./components/ui/select"
import { Switch } from "./components/ui/switch"
import { Popover, PopoverContent, PopoverTrigger } from "./components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "./components/ui/command"
import { popularDestinations } from "./constants/destinations"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "../lib/utils"

interface Activity {
  time: string;
  description: string;
}

interface ItineraryDay {
  day: number;
  location: string;
  activities: Activity[];
}

export default function TravelPlannerPage() {
  const [destinations, setDestinations] = useState<string[]>([""])
  const [numDays, setNumDays] = useState("")
  const [preferences, setPreferences] = useState({
    food: false,
    culture: false,
    nightlife: false
  })
  const [itinerary, setItinerary] = useState<ItineraryDay[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [isFallback, setIsFallback] = useState(false)
  const [openAutocomplete, setOpenAutocomplete] = useState(-1)
  const [value, setValue] = React.useState("")
  const [selectedDestinations, setSelectedDestinations] = useState<Set<string>>(new Set())
  const [travelerType, setTravelerType] = useState("")

  const addDestination = () => {
    setDestinations([...destinations, ""])
  }

  const removeDestination = (index: number) => {
    const newDestinations = destinations.filter((_, i) => i !== index)
    setDestinations(newDestinations)
  }

  const updateDestination = (index: number, value: string) => {
    const newDestinations = [...destinations]
    const oldValue = newDestinations[index]
    newDestinations[index] = value
    setDestinations(newDestinations)

    // Update the set of selected destinations
    setSelectedDestinations(prev => {
      const newSet = new Set(prev)
      if (oldValue) newSet.delete(oldValue)
      if (value) newSet.add(value)
      return newSet
    })
  }

  const generateItinerary = async () => {
    if (destinations[0] && numDays) {
      setLoading(true)
      try {
        const response = await fetch('/api/create-itinerary', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            destinations: destinations, 
            days: numDays,
            preferences: preferences,
            travelerType: travelerType
          }),
        })
        const data = await response.json()
        setItinerary(data.itinerary)
        setIsFallback(data.fallback || false)
      } catch (error) {
        console.error('Error:', error)
      } finally {
        setLoading(false)
      }
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background text-foreground">
      <div className="bg-card text-card-foreground rounded-[var(--radius)] shadow-xl p-6 w-full max-w-2xl">
        <h1 className="text-3xl font-bold mb-2">Travel Itinerary Planner</h1>
        <p className="mb-6 text-muted-foreground">Plan your perfect trip with AI assistance</p>
        
        <div className="space-y-4">
          {destinations.map((dest, index) => (
            <div key={index} className="flex items-center space-x-2">
              <Plane className="text-primary" />
              <Popover open={openAutocomplete === index} onOpenChange={(open: boolean) => setOpenAutocomplete(open ? index : -1)}>
                <PopoverTrigger asChild>
                  <Input
                    type="text"
                    placeholder={`Destination ${index + 1}`}
                    value={dest}
                    onChange={(e) => updateDestination(index, e.target.value)}
                    className="flex-grow"
                  />
                </PopoverTrigger>
                <PopoverContent className="p-0" align="start">
                  <Command className="bg-popover">
                    <CommandInput placeholder="Search destinations..." />
                    <CommandList>
                      <CommandEmpty>No destination found.</CommandEmpty>
                      <CommandGroup>
                        {popularDestinations
                          .filter(destination => !selectedDestinations.has(destination.label))
                          .map((destination) => (
                            <CommandItem
                              key={destination.value}
                              value={destination.value}
                              onSelect={() => {
                                updateDestination(index, destination.label)
                                setOpenAutocomplete(-1)
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  dest === destination.label ? "opacity-100" : "opacity-0"
                                )}
                              />
                              {destination.label}
                            </CommandItem>
                          ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              {index === destinations.length - 1 ? (
                <Button onClick={addDestination} variant="outline">
                  <PlusCircle className="h-4 w-4" />
                </Button>
              ) : (
                <Button onClick={() => removeDestination(index)} variant="outline">
                  <MinusCircle className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
          
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
          
          <div className="space-y-2">
            <Label htmlFor="travelerType">Traveler Type</Label>
            <Select onValueChange={(value) => setTravelerType(value)}>
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
              <div className="flex items-center space-x-2">
                <Switch
                  id="food"
                  checked={preferences.food}
                  onCheckedChange={(checked) => setPreferences({...preferences, food: checked})}
                />
                <Label htmlFor="food">
                  <Utensils className="inline mr-1 text-primary" /> Food
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="culture"
                  checked={preferences.culture}
                  onCheckedChange={(checked) => setPreferences({...preferences, culture: checked})}
                />
                <Label htmlFor="culture">🏛️ Culture</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="nightlife"
                  checked={preferences.nightlife}
                  onCheckedChange={(checked) => setPreferences({...preferences, nightlife: checked})}
                />
                <Label htmlFor="nightlife">🌙 Nightlife</Label>
              </div>
            </div>
          </div>
        </div>
        
        <Button className="w-full mt-6" onClick={generateItinerary} disabled={loading}>
          {loading ? "Generating Itinerary..." : "Create Itinerary"}
        </Button>

        {isFallback && (
          <p className="text-destructive my-4">Note: This is a generic itinerary due to temporary AI service limitations.</p>
        )}

        {itinerary && (
          <div className="mt-6 p-6 bg-card text-card-foreground rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-4">Your Itinerary</h2>
            {itinerary.map((day) => (
              <div key={day.day} className="mb-6">
                <h3 className="text-xl font-semibold mb-2">Day {day.day}: {day.location}</h3>
                <ul className="space-y-2">
                  {day.activities.map((activity, index) => (
                    <li key={index} className="flex items-start">
                      <Clock className="mr-2 h-5 w-5 text-primary" />
                      <div>
                        <span className="font-semibold">{activity.time}</span> - {activity.description}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
