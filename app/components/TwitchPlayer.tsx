'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import PlayerManager from './PlayerManager'

interface TwitchPlayerProps {
  channel: string
  quality?: string
  autoplay?: boolean
  muted?: boolean
  width?: string | number
  height?: string | number
  playerId?: string
}

declare global {
  interface Window {
    Twitch: any
  }
}

export default function TwitchPlayer({
  channel,
  quality = "160p",
  autoplay = true,
  muted = false,
  width = "100%",
  height = "400px",
  playerId
}: TwitchPlayerProps) {
  const playerRef = useRef<HTMLDivElement>(null)
  const playerIdRef = useRef<string>(playerId || `player_${channel}_${Date.now()}`)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  const playerManager = PlayerManager.getInstance()

  const initializePlayer = useCallback(async () => {
    if (!playerRef.current) {
      console.error('Player container not available')
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      console.log(`Initializing Twitch player for channel: ${channel}`)

      // Create player through manager
      const player = await playerManager.createPlayer(
        playerIdRef.current,
        playerRef.current,
        channel,
        {
          autoplay,
          muted,
          width,
          height,
          quality
        }
      )

      // Set up event listeners
      player.addEventListener('ready', () => {
        console.log('Twitch player ready')
        setIsLoading(false)

        try {
          const availableQualities = player.getQualities()
          console.log('Available qualities:', availableQualities)

          // Set quality with fallback
          if (quality && availableQualities.includes(quality)) {
            player.setQuality(quality)
          } else {
            const nonAutoQualities = availableQualities.filter((q: string) => q !== 'auto')
            if (nonAutoQualities.length > 0) {
              const lowestQuality = nonAutoQualities[nonAutoQualities.length - 1]
              console.log('Falling back to lowest quality:', lowestQuality)
              player.setQuality(lowestQuality)
            }
          }
        } catch (qualityError) {
          console.error('Error setting quality:', qualityError)
        }
      })

      player.addEventListener('error', (error: any) => {
        console.error('Twitch player error:', error)
        setError('Video playback error occurred')
        setIsLoading(false)
      })

      player.addEventListener('ended', () => {
        console.log('Stream ended')
      })

    } catch (error) {
      console.error('Error initializing player:', error)
      setError('Failed to load video player')
      setIsLoading(false)
    }
  }, [channel, quality, autoplay, muted, width, height, playerManager])

  const handleRetry = useCallback(() => {
    setRetryCount(prev => prev + 1)
    initializePlayer()
  }, [initializePlayer])

  useEffect(() => {
    initializePlayer()

    // Update last used timestamp periodically
    const interval = setInterval(() => {
      playerManager.updateLastUsed(playerIdRef.current)
    }, 10000) // Every 10 seconds

    return () => {
      clearInterval(interval)
      playerManager.destroyPlayer(playerIdRef.current)
    }
  }, [initializePlayer, playerManager])

  return (
    <div className="w-full relative">
      <div
        ref={playerRef}
        className="w-full rounded-lg overflow-hidden shadow-lg bg-gray-900"
        style={{ width, height }}
      />

      {/* Connection Status Indicator */}
      <div className="absolute top-2 right-2 z-10">
        <div className={`w-3 h-3 rounded-full ${
          error ? 'bg-red-500' :
          isLoading ? 'bg-yellow-500 animate-pulse' :
          'bg-green-500'
        }`} />
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-90 rounded-lg backdrop-blur-sm">
          <div className="text-center text-white">
            <div className="relative mb-4">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-600 border-t-blue-500 mx-auto"></div>
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-white animate-spin mx-auto" style={{ animationDuration: '1.5s' }}></div>
            </div>
            <p className="text-lg font-medium">Loading stream...</p>
            <p className="text-sm text-gray-300 mt-1">Channel: {channel}</p>
            {retryCount > 0 && (
              <p className="text-xs text-gray-400 mt-2">Attempt {retryCount + 1}/3</p>
            )}
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-95 rounded-lg backdrop-blur-sm">
          <div className="text-center text-white max-w-sm px-6">
            <div className="text-red-500 text-4xl mb-4">⚠️</div>
            <h3 className="text-lg font-semibold mb-2">Stream Unavailable</h3>
            <p className="text-gray-300 text-sm mb-4 leading-relaxed">
              {error.includes('429') || error.includes('Too Many Requests')
                ? 'Too many requests. Please wait a moment.'
                : error.includes('network') || error.includes('Network')
                ? 'Network connection issue. Check your internet.'
                : 'Unable to load the video stream. This may be temporary.'}
            </p>

            <div className="space-y-3">
              <button
                onClick={handleRetry}
                disabled={retryCount >= 3}
                className={`w-full px-4 py-2 rounded-lg font-medium transition-colors ${
                  retryCount >= 3
                    ? 'bg-gray-600 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'
                }`}
              >
                {retryCount >= 3 ? 'Max retries reached' : `Retry (${retryCount}/3)`}
              </button>

              <button
                onClick={() => window.location.reload()}
                className="w-full px-4 py-2 bg-gray-600 hover:bg-gray-700 active:bg-gray-800 rounded-lg font-medium transition-colors text-sm"
              >
                Reload Page
              </button>
            </div>

            {process.env.NODE_ENV === 'development' && (
              <details className="mt-4 text-left">
                <summary className="text-xs text-gray-400 cursor-pointer hover:text-gray-300">
                  Debug Info
                </summary>
                <pre className="text-xs text-red-400 mt-2 p-2 bg-gray-800 rounded overflow-auto">
                  {error}
                </pre>
              </details>
            )}
          </div>
        </div>
      )}
    </div>
  )
}