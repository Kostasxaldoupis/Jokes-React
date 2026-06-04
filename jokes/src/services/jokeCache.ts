export type CachedJoke = {
  setup: string
  punchline: string
  type: string
  id: number
  source: string
  category: string
  timestamp: number
}

class JokeCache {
  private cacheName = 'joke-cache'
  private maxCacheSize = 50

  // Save joke to cache
  saveJoke(joke: Omit<CachedJoke, 'timestamp'>): void {
    try {
      const cached = this.getCachedJokes()
      const newJoke: CachedJoke = { ...joke, timestamp: Date.now() }
      
      // Don't duplicate
      if (cached.some(j => j.id === joke.id)) return
      
      // Remove oldest if cache is full
      if (cached.length >= this.maxCacheSize) {
        cached.shift()
      }
      
      cached.push(newJoke)
      localStorage.setItem(this.cacheName, JSON.stringify(cached))
    } catch (error) {
      console.error('Failed to cache joke:', error)
    }
  }

  // Get all cached jokes
  getCachedJokes(): CachedJoke[] {
    try {
      const cached = localStorage.getItem(this.cacheName)
      if (!cached) return []
      return JSON.parse(cached)
    } catch (error) {
      console.error('Failed to read cache:', error)
      return []
    }
  }

  // Get random joke from cache (optionally by category)
  getRandomCachedJoke(category?: string): CachedJoke | null {
    const jokes = this.getCachedJokes()
    const filtered = category && category !== 'Any' 
      ? jokes.filter(j => j.category === category || j.category === 'Any')
      : jokes
    
    if (filtered.length === 0) return null
    const randomIndex = Math.floor(Math.random() * filtered.length)
    return filtered[randomIndex]
  }

  // Check if we have cached jokes
  hasCachedJokes(category?: string): boolean {
    const jokes = this.getCachedJokes()
    if (!category || category === 'Any') return jokes.length > 0
    return jokes.some(j => j.category === category)
  }

  // Clear cache
  clearCache(): void {
    localStorage.removeItem(this.cacheName)
  }
}

export default new JokeCache()