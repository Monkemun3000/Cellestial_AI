export interface NASAImage {
  id: string
  name: string
  description: string
  url: string
  credit: string
  year: string
}

export const nasaImages: Record<string, NASAImage> = {
  'hubble-deep-field': {
    id: 'hubble-deep-field',
    name: 'Hubble Deep Field',
    description: 'The Hubble Deep Field, showing thousands of galaxies in a tiny patch of sky',
    url: 'https://images.unsplash.com/photo-1446776877081-d282a0f896e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
    credit: 'NASA/ESA/Hubble',
    year: '1995'
  },
  'pillars-creation': {
    id: 'pillars-creation',
    name: 'Pillars of Creation',
    description: 'Iconic pillars of gas and dust in the Eagle Nebula',
    url: 'https://images.unsplash.com/photo-1502134249126-9f3755a50d78?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
    credit: 'NASA/ESA/Hubble',
    year: '1995'
  },
  'earth-rise': {
    id: 'earth-rise',
    name: 'Earthrise',
    description: 'The famous Earthrise photo taken during Apollo 8 mission',
    url: 'https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
    credit: 'NASA/Apollo 8',
    year: '1968'
  },
  'galaxy-whirlpool': {
    id: 'galaxy-whirlpool',
    name: 'Whirlpool Galaxy',
    description: 'The beautiful spiral structure of the Whirlpool Galaxy',
    url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
    credit: 'NASA/ESA/Hubble',
    year: '2005'
  }
}

export function getNASAImage(id: string): NASAImage | undefined {
  return nasaImages[id]
}

export function getAllNASAImages(): NASAImage[] {
  return Object.values(nasaImages)
}
