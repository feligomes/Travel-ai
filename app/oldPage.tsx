'use client'
import { useState, useEffect } from 'react'
import { Button, TextField, Autocomplete, Chip, CircularProgress, Typography, Box } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'

const initialDestinations = ['Paris', 'Tokyo', 'New York', 'London', 'Rome', 'Sydney']

const loadingPhrases = [
  "Finding the best local cuisines...",
  "Discovering hidden gems...",
  "Planning exciting adventures...",
  "Locating Instagram-worthy spots...",
  "Uncovering local secrets...",
  "Crafting unforgettable moments...",
  "Mapping out the perfect route...",
  "Selecting the coziest accommodations...",
  "Timing your visit for local festivals...",
  "Curating unique experiences..."
]

interface ItineraryDay {
  day: number;
  date: string;
  location: string;
  activities: {
    time: string;
    description: string;
  }[];
}

export default function Home() {
  const [selectedDestinations, setSelectedDestinations] = useState<string[]>([])
  const [availableDestinations, setAvailableDestinations] = useState<string[]>(initialDestinations)
  const [days, setDays] = useState<string>('')
  const [itinerary, setItinerary] = useState<ItineraryDay[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [loadingPhrase, setLoadingPhrase] = useState<string>('')
  const [inputValue, setInputValue] = useState('')

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (loading) {
      let index = 0
      interval = setInterval(() => {
        setLoadingPhrase(loadingPhrases[index])
        index = (index + 1) % loadingPhrases.length
      }, 3000) // Change phrase every 3 seconds
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [loading])

  const handleAdd = (event: React.SyntheticEvent, value: string | null) => {
    if (value && !selectedDestinations.includes(value)) {
      setSelectedDestinations([...selectedDestinations, value])
      setAvailableDestinations(availableDestinations.filter(dest => dest !== value))
      setInputValue('') // Clear the input after selection
    }
  }

  const handleDelete = (destinationToDelete: string) => {
    setSelectedDestinations(selectedDestinations.filter(dest => dest !== destinationToDelete))
    setAvailableDestinations([...availableDestinations, destinationToDelete])
  }

  const handleCreate = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/create-itinerary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destinations: selectedDestinations,
          days: parseInt(days) || undefined,
          prompt: `Create a travel itinerary for ${selectedDestinations.join(', ')} for ${days} days. Provide the itinerary as an array of day objects, where each day object has the following structure:
          {
            "day": number,
            "date": "YYYY-MM-DD",
            "location": "City, Country",
            "activities": [
              {
                "time": "Morning",
                "description": "Activity description"
              },
              {
                "time": "Afternoon",
                "description": "Activity description"
              },
              {
                "time": "Evening",
                "description": "Activity description"
              }
            ]
          }`
        }),
      });
      const data = await response.json();
      console.log('API response:', data);
      if (data.itinerary && Array.isArray(data.itinerary)) {
        setItinerary(data.itinerary);
      } else {
        console.error('Invalid itinerary data:', data);
        setItinerary([]);
      }
    } catch (error) {
      console.error('Error creating itinerary:', error);
      setItinerary([]);
    }
    setLoading(false);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 p-6">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-xl overflow-hidden">
        <div className="p-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Travel Itinerary Planner</h1>
          <p className="text-xl text-gray-600 mb-8">Plan your perfect trip with AI</p>
          <Autocomplete
            options={availableDestinations}
            renderInput={(params) => (
              <TextField 
                {...params} 
                label="Add a destination" 
                variant="outlined" 
                className="bg-white rounded-lg mb-4"
              />
            )}
            onChange={handleAdd}
            value={null}
            inputValue={inputValue}
            onInputChange={(event, newInputValue) => {
              setInputValue(newInputValue)
            }}
          />
          <TextField
            label="Number of days"
            type="number"
            value={days}
            onChange={(e) => setDays(e.target.value)}
            variant="outlined"
            className="bg-white rounded-lg mb-4"
            fullWidth
          />
          {selectedDestinations.length > 0 && (
            <div className="mt-8">
              <h3 className="text-2xl font-semibold text-gray-800 mb-4">Selected Destinations:</h3>
              <div className="flex flex-wrap">
                {selectedDestinations.map(dest => (
                  <Chip
                    key={dest}
                    label={dest}
                    onDelete={() => handleDelete(dest)}
                    deleteIcon={<CloseIcon />}
                    className="m-1 bg-purple-200 text-purple-800"
                  />
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="px-8 pb-8">
          <Button 
            variant="contained" 
            fullWidth 
            onClick={handleCreate}
            disabled={selectedDestinations.length === 0 || loading || !days}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3 rounded-lg transition duration-300 ease-in-out transform hover:scale-105"
          >
            {loading ? 'Creating Itinerary...' : 'Create Itinerary'}
          </Button>
          {loading && (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 2 }}>
              <CircularProgress size={24} sx={{ mr: 2 }} />
              <Typography variant="body2" color="text.secondary">
                {loadingPhrase}
              </Typography>
            </Box>
          )}
        </div>
        {itinerary.length > 0 && (
          <div className="px-8 pb-8">
            <h3 className="text-2xl font-semibold text-gray-800 mb-4">Your Itinerary:</h3>
            {itinerary.map((day) => (
              <Box key={day.day} className="mb-6 bg-gray-50 p-4 rounded-lg">
                <Typography variant="h6" className="font-bold text-purple-700 mb-2">
                  Day {day.day}: {day.location}
                </Typography>
                {day.activities.map((activity, index) => (
                  <Typography key={index} variant="body1" className="ml-4 mb-2">
                    <span className="font-semibold text-purple-600">{activity.time}:</span> {activity.description}
                  </Typography>
                ))}
              </Box>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}