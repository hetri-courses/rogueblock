'use client'

import { useEffect, useRef } from 'react'

interface TwitchPlayerProps {
  channel: string
  quality?: string
  autoplay?: boolean
  muted?: boolean
  width?: string | number
  height?: string | number
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
  muted = true,
  width = "100%",
  height = "400px"
}: TwitchPlayerProps) {
  const playerRef = useRef<HTMLDivElement>(null)
  const playerInstanceRef = useRef<any>(null)

  useEffect(() => {
    const loadTwitchScript = () => {
      return new Promise<void>((resolve, reject) => {
        if (window.Twitch) {
          resolve()
          return
        }

        const script = document.createElement('script')
        script.src = 'https://player.twitch.tv/js/embed/v1.js'
        script.async = true
        script.onload = () => resolve()
        script.onerror = () => reject(new Error('Failed to load media script'))
        document.head.appendChild(script)
      })
    }

    const initializePlayer = async () => {
      try {
        console.log('Loading media script...')
        await loadTwitchScript()
        console.log('Media script loaded successfully')

        if (playerRef.current && window.Twitch) {
          console.log('Initializing media player for channel:', channel)

          // Destroy existing player if it exists
          if (playerInstanceRef.current) {
            playerInstanceRef.current.destroy()
          }

          // Create new player
          const player = new window.Twitch.Player(playerRef.current, {
            channel: channel,
            parent: ["hetri-courses.github.io"],
            autoplay: autoplay,
            muted: muted,
            width: width,
            height: height,
            quality: quality
          })

          playerInstanceRef.current = player
          console.log('Media player created successfully')

          // Set quality after player is ready
          player.addEventListener(window.Twitch.Player.READY, () => {
            console.log('Media player ready')
            
            // Force to lowest available quality
            const availableQualities = player.getQualities()
            console.log('Available qualities:', availableQualities)
            
            // Remove auto and select the lowest non-auto quality
            const nonAutoQualities = availableQualities.filter((q: string) => q !== 'auto')
            if (nonAutoQualities.length > 0) {
              const lowestQuality = nonAutoQualities[0]
              console.log('Forcing to lowest quality:', lowestQuality)
              player.setQuality(lowestQuality)
            }
            
          })
        } else {
          console.error('Player ref or media not available')
        }
      } catch (error) {
        console.error('Error initializing media player:', error)
      }
    }

    initializePlayer()

    // Cleanup function
    return () => {
      if (playerInstanceRef.current) {
        try {
          playerInstanceRef.current.destroy()
        } catch (error) {
          console.error('Error destroying media player:', error)
        }
      }
    }
  }, [channel, quality, autoplay, muted, width, height])

  return (
    <div className="w-full">
      <div
        ref={playerRef}
        className="w-full rounded-lg overflow-hidden shadow-lg"
        style={{ width, height }}
      />
    </div>
  )
}