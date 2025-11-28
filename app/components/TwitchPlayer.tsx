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

    function initializePlayer() {
      if (playerRef.current && window.Twitch && !playerInstanceRef.current) {
        playerInstanceRef.current = new window.Twitch.Player(playerRef.current, {
          channel: channel,
          autoplay: autoplay,
          muted: muted,
          height: settings.height,
          width: "100%"
        })
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
