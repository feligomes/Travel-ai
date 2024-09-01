'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Clock } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { ItinerarySkeleton } from '../../components/ItinerarySkeleton'

interface Activity {
  time: string;
  description: string;
}

interface ItineraryDay {
  day: number;
  location: string;
  activities: Activity[];
}

interface Itinerary {
  id: string;
  destinations: string[];
  num_days: number;
  days: ItineraryDay[];
}

export default function ItineraryPage({ params }: { params: { id: string } }) {
  const [itinerary, setItinerary] = useState<Itinerary | null>(null)
  const router = useRouter()

  useEffect(() => {
    async function fetchItinerary() {
      try {
        const response = await fetch(`/api/itineraries/${params.id}`)
        const data = await response.json()
        setItinerary(data.itinerary)
      } catch (error) {
        console.error('Error fetching itinerary:', error)
      }
    }
    fetchItinerary()
  }, [params.id])

  if (!itinerary) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background text-foreground">
        <div className="bg-card text-card-foreground rounded-[var(--radius)] shadow-xl p-6 w-full max-w-2xl">
          <Button variant="outline" onClick={() => router.push('/')} className="mb-4">
            Back to Planner
          </Button>
          <ItinerarySkeleton />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background text-foreground">
      <div className="bg-card text-card-foreground rounded-[var(--radius)] shadow-xl p-6 w-full max-w-2xl">
        <Button variant="outline" onClick={() => router.push('/')} className="mb-4">
          Back to Planner
        </Button>
        <h1 className="text-3xl font-bold mb-2">
          {itinerary.destinations.join(', ')} - {itinerary.num_days} days
        </h1>
        <div className="mt-6 p-6 bg-card text-card-foreground rounded-lg shadow-md">
          {itinerary.days.map((day) => (
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
      </div>
    </div>
  )
}