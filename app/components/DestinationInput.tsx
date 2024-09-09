import React, { useState } from 'react';
import { Plane, PlusCircle, MinusCircle } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from './ui/command';
import { popularDestinations } from '../constants/destinations';
import { Check } from 'lucide-react';
import { cn } from '../../lib/utils';

interface DestinationInputProps {
  destinations: string[];
  setDestinations: React.Dispatch<React.SetStateAction<string[]>>;
}

export function DestinationInput({ destinations, setDestinations }: DestinationInputProps) {
  const [openAutocomplete, setOpenAutocomplete] = useState(-1);
  const [selectedDestinations, setSelectedDestinations] = useState<Set<string>>(new Set());

  const addDestination = () => {
    setDestinations([...destinations, '']);
  };

  const removeDestination = (index: number) => {
    const newDestinations = destinations.filter((_, i) => i !== index);
    setDestinations(newDestinations);
  };

  const updateDestination = (index: number, value: string) => {
    const newDestinations = [...destinations];
    const oldValue = newDestinations[index];
    newDestinations[index] = value;
    setDestinations(newDestinations);

    setSelectedDestinations(prev => {
      const newSet = new Set(prev);
      if (oldValue) newSet.delete(oldValue);
      if (value) newSet.add(value);
      return newSet;
    });
  };

  return (
    <>
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
                            updateDestination(index, destination.label);
                            setOpenAutocomplete(-1);
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
    </>
  );
}