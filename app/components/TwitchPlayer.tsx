'use client'

import { useEffect, useRef } from 'react'

interface TwitchPlayerProps {
  channel: string
  autoplay?: boolean
  muted?: boolean
  height?: string
  quality?: number // 1-5, where 1 is highest quality, 5 is lowest
}

declare global {
  interface Window {
    Twitch: any
  }
}

export default function TwitchPlayer({
  channel,
  autoplay = true,
  muted = true,
  height = "400px",
  quality = 1
}: TwitchPlayerProps) {
  const playerRef = useRef<HTMLDivElement>(null)
  const playerInstanceRef = useRef<any>(null)

  // Quality settings: smaller size = lower quality
  const qualitySettings = {
    1: { height: "500px", scale: 1.0, label: "High Quality" },
    2: { height: "400px", scale: 0.9, label: "Medium Quality" },
    3: { height: "320px", scale: 0.8, label: "Low Quality" },
    4: { height: "240px", scale: 0.7, label: "Very Low Quality" },
    5: { height: "180px", scale: 0.6, label: "Ultra Low Quality" }
  }

  const settings = qualitySettings[quality as keyof typeof qualitySettings] || qualitySettings[1]

  useEffect(() => {
    // Check if script is already loaded
    if (window.Twitch) {
      initializePlayer()
      return
    }

    // Check if script is already in the document
    const existingScript = document.querySelector('script[src="https://player.twitch.tv/js/embed/v1.js"]')
    if (existingScript) {
      existingScript.addEventListener('load', initializePlayer)
      return
    }

    // Load Twitch embed script
    const script = document.createElement('script')
    script.src = 'https://player.twitch.tv/js/embed/v1.js'
    script.async = true
    script.onload = initializePlayer
    document.head.appendChild(script)

    // Quality enforcement system
    let qualityEnforcementInterval: NodeJS.Timeout | null = null
    let qualitySetAttempts = 0
    const maxQualityAttempts = 10

    const getLowestQuality = (qualities: any[]) => {
      if (!qualities || qualities.length === 0) return null

      const sortedQualities = qualities.sort((a: any, b: any) => {
        const aRes = parseInt(a.name.replace('p', '')) || 0
        const bRes = parseInt(b.name.replace('p', '')) || 0
        return aRes - bRes
      })

      // Prefer 160p, then lowest available
      return sortedQualities.find((q: any) => q.name === '160p') || sortedQualities[0]
    }

    const enforceLowestQuality = async (reason: string = 'unknown') => {
      if (!playerInstanceRef.current || qualitySetAttempts >= maxQualityAttempts) return

      try {
        const qualities = playerInstanceRef.current.getQualities()
        const targetQuality = getLowestQuality(qualities)

        if (targetQuality) {
          const currentQuality = playerInstanceRef.current.getQuality()
          if (currentQuality !== targetQuality.name) {
            playerInstanceRef.current.setQuality(targetQuality.name)
            qualitySetAttempts++
            console.log(`[${reason}] Quality enforced to: ${targetQuality.name} (attempt ${qualitySetAttempts})`)
          }
        }
      } catch (error) {
        console.warn(`[${reason}] Quality enforcement failed:`, error)
      }
    }

    const startQualityEnforcement = () => {
      // Clear any existing interval
      if (qualityEnforcementInterval) {
        clearInterval(qualityEnforcementInterval)
      }

      // Set up polling fallback (every 5 seconds)
      qualityEnforcementInterval = setInterval(() => {
        enforceLowestQuality('polling')
      }, 5000)

      console.log('Quality enforcement system started')
    }

    const stopQualityEnforcement = () => {
      if (qualityEnforcementInterval) {
        clearInterval(qualityEnforcementInterval)
        qualityEnforcementInterval = null
        console.log('Quality enforcement system stopped')
      }
    }

    function initializePlayer() {
      if (playerRef.current && window.Twitch && !playerInstanceRef.current) {
        // Reset quality attempts counter
        qualitySetAttempts = 0

        playerInstanceRef.current = new window.Twitch.Player(playerRef.current, {
          channel: channel,
          autoplay: autoplay,
          muted: muted,
          height: settings.height,
          width: "100%"
        })

        // Multiple quality enforcement triggers
        const qualityTriggers = [
          { delay: 1000, reason: 'initial-delay-1s' },
          { delay: 2000, reason: 'initial-delay-2s' },
          { delay: 3000, reason: 'initial-delay-3s' },
          { delay: 5000, reason: 'initial-delay-5s' }
        ]

        // Schedule initial quality settings
        qualityTriggers.forEach(({ delay, reason }) => {
          setTimeout(() => enforceLowestQuality(reason), delay)
        })

        // Event-based quality enforcement
        const events = ['ready', 'video-ready', 'playing', 'quality']
        events.forEach(eventName => {
          try {
            playerInstanceRef.current.addEventListener(eventName, () => {
              setTimeout(() => enforceLowestQuality(`event-${eventName}`), 500)
            })
          } catch (error) {
            console.warn(`Failed to add ${eventName} event listener:`, error)
          }
        })

        // Start polling system
        setTimeout(startQualityEnforcement, 1000)
      }
    }
    // Cleanup function
    return () => {
      stopQualityEnforcement()
      if (playerInstanceRef.current) {
        try {
          playerInstanceRef.current.destroy()
        } catch (error) {
          console.warn('Failed to destroy player:', error)
        }
        playerInstanceRef.current = null
      }
    }
  }, [channel, autoplay, muted, quality])

  return (
    <div className="w-full">
      <div className="mb-2 text-sm text-gray-600 dark:text-gray-400">
        Quality: {settings.label}
      </div>
      <div
        ref={playerRef}
        className="w-full rounded-lg overflow-hidden"
        style={{
          transform: `scale(${settings.scale})`,
          transformOrigin: 'top left',
          width: `${100 / settings.scale}%`,
          height: `${parseInt(settings.height) / settings.scale}px`
        }}
      />
    </div>
  )
}
