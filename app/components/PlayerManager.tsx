'use client'

interface PlayerInstance {
  id: string
  channel: string
  player: any
  element: HTMLElement
  lastUsed: number
}

interface PlayerManagerConfig {
  maxConcurrentPlayers: number
  cleanupInterval: number
  requestThrottleMs: number
  retryAttempts: number
  retryDelay: number
}

class PlayerManager {
  private static instance: PlayerManager
  private players: Map<string, PlayerInstance> = new Map()
  private activeRequests: Set<string> = new Set()
  private requestQueue: Array<() => Promise<void>> = []
  private isProcessingQueue = false
  private cleanupTimer: NodeJS.Timeout | null = null

  private config: PlayerManagerConfig = {
    maxConcurrentPlayers: 1, // Only allow one player at a time
    cleanupInterval: 30000, // 30 seconds
    requestThrottleMs: 1000, // 1 second between requests
    retryAttempts: 3,
    retryDelay: 2000
  }

  private constructor() {
    this.startCleanupTimer()
  }

  public static getInstance(): PlayerManager {
    if (!PlayerManager.instance) {
      PlayerManager.instance = new PlayerManager()
    }
    return PlayerManager.instance
  }

  private startCleanupTimer(): void {
    this.cleanupTimer = setInterval(() => {
      this.cleanupInactivePlayers()
    }, this.config.cleanupInterval)
  }

  private cleanupInactivePlayers(): void {
    const now = Date.now()
    const inactiveThreshold = 60000 // 1 minute

    // Use Array.from to avoid TypeScript downlevelIteration issues
    Array.from(this.players.entries()).forEach(([id, instance]) => {
      if (now - instance.lastUsed > inactiveThreshold) {
        try {
          instance.player?.destroy()
          this.players.delete(id)
          console.log(`Cleaned up inactive player: ${id}`)
        } catch (error) {
          console.error(`Error cleaning up player ${id}:`, error)
        }
      }
    })
  }

  private async throttleRequest<T>(operation: () => Promise<T>, key: string): Promise<T> {
    // If this request type is already active, queue it
    if (this.activeRequests.has(key)) {
      return new Promise((resolve, reject) => {
        this.requestQueue.push(async () => {
          try {
            const result = await operation()
            resolve(result)
          } catch (error) {
            reject(error)
          }
        })
      })
    }

    // Add to active requests
    this.activeRequests.add(key)

    try {
      // Wait for throttle delay
      await new Promise(resolve => setTimeout(resolve, this.config.requestThrottleMs))

      const result = await operation()
      return result
    } finally {
      // Remove from active requests
      this.activeRequests.delete(key)
      this.processQueue()
    }
  }

  private async processQueue(): Promise<void> {
    if (this.isProcessingQueue || this.requestQueue.length === 0) {
      return
    }

    this.isProcessingQueue = true

    while (this.requestQueue.length > 0) {
      const operation = this.requestQueue.shift()
      if (operation) {
        try {
          await operation()
        } catch (error) {
          console.error('Error processing queued operation:', error)
        }
      }
    }

    this.isProcessingQueue = false
  }

  private async loadTwitchScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      if ((window as any).Twitch) {
        resolve()
        return
      }

      const script = document.createElement('script')
      script.src = 'https://player.twitch.tv/js/embed/v1.js'
      script.async = true
      script.onload = () => resolve()
      script.onerror = () => reject(new Error('Failed to load Twitch script'))
      document.head.appendChild(script)
    })
  }

  private async createPlayerWithRetry(
    element: HTMLElement,
    channel: string,
    options: any,
    attempt: number = 1
  ): Promise<any> {
    try {
      const player = new (window as any).Twitch.Player(element, {
        ...options,
        channel,
        parent: this.getParentDomains()
      })

      return player
    } catch (error) {
      console.error(`Player creation attempt ${attempt} failed:`, error)

      if (attempt < this.config.retryAttempts) {
        await new Promise(resolve => setTimeout(resolve, this.config.retryDelay * attempt))
        return this.createPlayerWithRetry(element, channel, options, attempt + 1)
      }

      throw error
    }
  }

  private getParentDomains(): string[] {
    const hostname = window.location.hostname

    // For development, use only localhost to avoid tracking prevention issues
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return ['localhost']
    }

    // For production/Github Pages
    if (hostname.includes('github.io')) {
      return ['hetri-courses.github.io']
    }

    // For other domains, use the current hostname
    return [hostname]
  }

  public async createPlayer(
    id: string,
    element: HTMLElement,
    channel: string,
    options: any = {}
  ): Promise<any> {
    return this.throttleRequest(async () => {
      console.log(`Creating player for channel: ${channel}, id: ${id}`)

      // Destroy existing player if it exists
      if (this.players.has(id)) {
        try {
          this.players.get(id)?.player?.destroy()
        } catch (error) {
          console.error(`Error destroying existing player ${id}:`, error)
        }
        this.players.delete(id)
      }

      // Load Twitch script
      await this.loadTwitchScript()

      // Create new player with retry logic and HLS error handling
      const player = await this.createPlayerWithRetryAndHLSRecovery(element, channel, options)

      // Set up HLS error recovery listeners
      this.setupHLSErrorRecovery(player, id, channel, element, options)

      // Store player instance
      const instance: PlayerInstance = {
        id,
        channel,
        player,
        element,
        lastUsed: Date.now()
      }

      this.players.set(id, instance)

      console.log(`Player created successfully for ${channel}`)
      return player
    }, `create_player_${channel}`)
  }

  private async createPlayerWithRetryAndHLSRecovery(
    element: HTMLElement,
    channel: string,
    options: any,
    attempt: number = 1
  ): Promise<any> {
    try {
      const player = await this.createPlayerWithRetry(element, channel, options)
      return player
    } catch (error: any) {
      console.error(`Player creation attempt ${attempt} failed:`, error)

      // If it's an HLS-related error, try alternative approaches
      if (error.message?.includes('HLS') || error.message?.includes('playlist') ||
          error.message?.includes('manifest') || attempt >= this.config.retryAttempts) {
        throw error
      }

      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, this.config.retryDelay * attempt))

      // Try with different quality settings
      const fallbackOptions = { ...options }
      if (options.quality) {
        fallbackOptions.quality = 'auto' // Fallback to auto quality
      }

      return this.createPlayerWithRetryAndHLSRecovery(element, channel, fallbackOptions, attempt + 1)
    }
  }

  private setupHLSErrorRecovery(
    player: any,
    id: string,
    channel: string,
    element: HTMLElement,
    options: any
  ): void {
    // Listen for HLS-specific errors
    const hlsErrorHandler = async (error: any) => {
      console.error(`HLS error for player ${id}:`, error)

      // Check if it's a recoverable HLS error
      if (error?.message?.includes('playlist') ||
          error?.message?.includes('manifest') ||
          error?.message?.includes('HLS') ||
          error?.code === 4000) { // Twitch HLS error codes

        console.log(`Attempting HLS recovery for player ${id}`)

        try {
          // Pause the player first
          player.pause()

          // Wait a moment
          await new Promise(resolve => setTimeout(resolve, 2000))

          // Try to reload the player
          player.setChannel(channel)

          // Set quality again after reload
          setTimeout(() => {
            try {
              const qualities = player.getQualities()
              if (qualities && qualities.length > 0 && options.quality) {
                if (qualities.includes(options.quality)) {
                  player.setQuality(options.quality)
                } else {
                  // Fallback to lowest quality
                  const nonAuto = qualities.filter((q: string) => q !== 'auto')
                  if (nonAuto.length > 0) {
                    player.setQuality(nonAuto[nonAuto.length - 1])
                  }
                }
              }
            } catch (qualityError) {
              console.error('Error setting quality after HLS recovery:', qualityError)
            }
          }, 3000)

        } catch (recoveryError) {
          console.error(`HLS recovery failed for player ${id}:`, recoveryError)

          // If recovery fails, recreate the entire player
          setTimeout(async () => {
            try {
              console.log(`Recreating player ${id} after HLS recovery failure`)
              await this.createPlayer(id, element, channel, options)
            } catch (recreateError) {
              console.error(`Player recreation failed for ${id}:`, recreateError)
            }
          }, 5000)
        }
      }
    }

    // Add error event listeners
    player.addEventListener('error', hlsErrorHandler)

    // Also listen for internal player errors
    player.addEventListener('internal-error', (error: any) => {
      console.error(`Internal player error for ${id}:`, error)
      hlsErrorHandler(error)
    })

    // Listen for offline/online events
    const handleOnline = () => {
      console.log(`Player ${id} back online, attempting recovery`)
      setTimeout(() => {
        try {
          player.setChannel(channel)
        } catch (error) {
          console.error(`Error setting channel on reconnect for ${id}:`, error)
        }
      }, 2000)
    }

    window.addEventListener('online', handleOnline)

    // Store cleanup function
    const instance = this.players.get(id)
    if (instance) {
      instance.player._cleanup = () => {
        window.removeEventListener('online', handleOnline)
      }
    }
  }

  public destroyPlayer(id: string): void {
    const instance = this.players.get(id)
    if (instance) {
      try {
        instance.player?.destroy()
        console.log(`Destroyed player: ${id}`)
      } catch (error) {
        console.error(`Error destroying player ${id}:`, error)
      }
      this.players.delete(id)
    }
  }

  public updateLastUsed(id: string): void {
    const instance = this.players.get(id)
    if (instance) {
      instance.lastUsed = Date.now()
    }
  }

  public getActivePlayerCount(): number {
    return this.players.size
  }

  public cleanup(): void {
    // Use Array.from to avoid TypeScript downlevelIteration issues
    Array.from(this.players.keys()).forEach(id => {
      this.destroyPlayer(id)
    })

    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer)
      this.cleanupTimer = null
    }
  }
}

export default PlayerManager
