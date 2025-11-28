'use client'

import { useEffect, useRef, useState } from 'react'

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

// Session diversity utilities for web proxy
const generateSessionId = () => Math.random().toString(36).substring(2, 15)
const getRandomDelay = () => Math.floor(Math.random() * 1000) + 500 // 500-1500ms
const getRandomUserAgent = () => {
  const agents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
  ]
  return agents[Math.floor(Math.random() * agents.length)]
}

const getRandomColor = () => {
  const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff', '#ffa500', '#800080']
  return colors[Math.floor(Math.random() * colors.length)]
}

const getRandomBorderStyle = () => {
  const styles = ['solid', 'dashed', 'dotted', 'double']
  return styles[Math.floor(Math.random() * styles.length)]
}

// Apply page-level viewport quality control
const applyViewportQualityControl = (zoom: number, sessionId: string) => {
  if (typeof document === 'undefined') return

  // Remove existing viewport control for this session
  const existingStyle = document.getElementById(`viewport-quality-${sessionId}`)
  if (existingStyle) {
    existingStyle.remove()
  }

  // Apply new viewport quality control
  const styleElement = document.createElement('style')
  styleElement.id = `viewport-quality-${sessionId}`
  styleElement.textContent = `
    html {
      zoom: ${zoom};
      -moz-transform: scale(${zoom});
      -webkit-transform: scale(${zoom});
      transform: scale(${zoom});
      transform-origin: top left;
    }
    body {
      width: ${100 / zoom}%;
      height: ${100 / zoom}%;
    }
  `
  document.head.appendChild(styleElement)

  console.log(`Viewport quality control applied: ${zoom} zoom (${sessionId})`)
}

// Reset viewport quality control
const resetViewportQualityControl = (sessionId: string) => {
  if (typeof document === 'undefined') return

  const existingStyle = document.getElementById(`viewport-quality-${sessionId}`)
  if (existingStyle) {
    existingStyle.remove()
    console.log(`Viewport quality control reset (${sessionId})`)
  }
}

// Add visual session diversity and request randomization
const addSessionDiversity = () => {
  const sessionId = generateSessionId()
  const timestamp = Date.now()
  const randomParam = Math.random().toString(36).substring(2, 8)
  const visualId = Math.random().toString(36).substring(2, 6)

  // Add random query parameters to the current URL
  const url = new URL(window.location.href)
  url.searchParams.set('_session', sessionId)
  url.searchParams.set('_ts', timestamp.toString())
  url.searchParams.set('_rnd', randomParam)
  url.searchParams.set('_vid', visualId)

  // Update the URL without causing a page reload
  window.history.replaceState({}, '', url.toString())

  // Add visual session indicators and quality control containers (client-side only)
  if (typeof document !== 'undefined') {
    const styleElement = document.createElement('style')
    styleElement.id = `session-style-${sessionId}`
    styleElement.textContent = `
      .session-${visualId} {
        --session-accent: ${getRandomColor()};
        --session-border: ${getRandomBorderStyle()};
      }
      .session-${visualId}::before {
        content: '';
        position: absolute;
        top: -2px;
        left: -2px;
        right: -2px;
        bottom: -2px;
        background: linear-gradient(45deg, var(--session-accent), transparent, var(--session-accent));
        border-radius: 10px;
        z-index: -1;
        opacity: 0.1;
      }
      .quality-container-${visualId} {
        position: relative;
        overflow: hidden;
        width: 100%;
        height: auto;
      }
      .quality-scaler-${visualId} {
        transform-origin: top left;
        transition: transform 0.3s ease;
      }
      .quality-scaler-${visualId}.quality-5 {
        transform: scale(0.3);
        width: calc(100% / 0.3);
        height: calc(100% / 0.3);
      }
      .quality-scaler-${visualId}.quality-4 {
        transform: scale(0.5);
        width: calc(100% / 0.5);
        height: calc(100% / 0.5);
      }
      .quality-scaler-${visualId}.quality-3 {
        transform: scale(0.7);
        width: calc(100% / 0.7);
        height: calc(100% / 0.7);
      }
      .quality-scaler-${visualId}.quality-2 {
        transform: scale(0.85);
        width: calc(100% / 0.85);
        height: calc(100% / 0.85);
      }
      .quality-scaler-${visualId}.quality-single {
        transform: scale(0.2);
        width: calc(100% / 0.2);
        height: calc(100% / 0.2);
      }
    `
    document.head.appendChild(styleElement)
  }

  // Add random headers to fetch requests (client-side only)
  if (typeof window !== 'undefined') {
    const originalFetch = window.fetch
    window.fetch = function(input, init) {
      const headers = new Headers(init?.headers)
      headers.set('X-Session-ID', sessionId)
      headers.set('X-Client-Timestamp', timestamp.toString())
      headers.set('X-Random-Param', randomParam)
      headers.set('X-Visual-ID', visualId)
      headers.set('User-Agent', getRandomUserAgent())

      return originalFetch.call(this, input, { ...init, headers })
    }

    // Store session data globally for components to access
    ;(window as any).__sessionData = { sessionId, visualId, timestamp }
  }

  console.log('Session diversity applied:', { sessionId, visualId, timestamp, randomParam })
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

  // Quality utility functions
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

  // Check if we should force client-side quality manipulation
  const shouldForceClientQuality = (qualities: any[]) => {
    return qualities && qualities.length === 1 // Single quality stream
  }

  // Generate quality manipulation settings based on quality level
  const getQualityManipulation = (qualityLevel: number, hasSingleQuality: boolean) => {
    // Quality manipulation is now handled by CSS classes
    // This function now just tracks the settings for UI display
    const baseSettings = {
      1: { filters: '' },
      2: { filters: '' },
      3: { filters: '' },
      4: { filters: 'brightness(0.9)' },
      5: { filters: 'brightness(0.8) contrast(0.9)' }
    }

    // For single quality streams, apply additional filters
    if (hasSingleQuality) {
      return {
        filters: 'brightness(0.7) contrast(0.8) blur(0.5px)',
        forceQuality: true,
        containerReduction: true
      }
    }

    return baseSettings[qualityLevel as keyof typeof baseSettings] || baseSettings[5]
  }

  // Apply session diversity on component mount (client-side only)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      addSessionDiversity()
    }
  }, [])

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

    const enforceLowestQuality = async (reason: string = 'unknown') => {
      if (!playerInstanceRef.current || qualitySetAttempts >= maxQualityAttempts) return

      try {
        const qualities = playerInstanceRef.current.getQualities()
        const hasSingleQuality = shouldForceClientQuality(qualities)
        const targetQuality = getLowestQuality(qualities)

        if (hasSingleQuality) {
          // For single quality streams, don't try to change quality - rely on client-side manipulation
          console.log(`[${reason}] Single quality stream detected (${targetQuality?.name}), using client-side quality manipulation`)
          return
        }

        // For multiple quality streams, try to set to lowest quality
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

        // Ensure autoplay requirements are met
        if (autoplay && typeof document !== 'undefined') {
          // Ensure document has focus for autoplay
          if (!document.hasFocus()) {
            window.focus()
          }

          // Ensure player container meets autoplay requirements
          if (playerRef.current) {
            playerRef.current.style.visibility = 'visible'
            playerRef.current.style.opacity = '1'
            playerRef.current.style.pointerEvents = 'auto'
            playerRef.current.style.zIndex = '1'
            playerRef.current.style.position = 'relative'
          }
        }

        // Check if we need to force client-side quality manipulation (will be determined after player loads)
        const initialSettings = settings

        playerInstanceRef.current = new window.Twitch.Player(playerRef.current, {
          channel: channel,
          autoplay: autoplay,
          muted: muted,
          height: initialSettings.height,
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

      // Reset viewport quality control
      if (typeof window !== 'undefined') {
        const sessionData = (window as any).__sessionData || {}
        const sessionId = sessionData.sessionId || 'default'
        resetViewportQualityControl(sessionId)
      }

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

  // Get session data from global scope (client-side only)
  const sessionData = typeof window !== 'undefined' ? (window as any).__sessionData || {} : {}
  const visualId = sessionData.visualId || 'default'

  // Get dynamic quality manipulation settings
  const [hasSingleQuality, setHasSingleQuality] = useState(false)
  const [qualityManipulation, setQualityManipulation] = useState(() =>
    getQualityManipulation(quality, false)
  )

  // Update quality manipulation when quality or single quality status changes
  useEffect(() => {
    const newManipulation = getQualityManipulation(quality, hasSingleQuality)
    setQualityManipulation(newManipulation)

    // Apply viewport quality control if needed
    if (typeof window !== 'undefined' && newManipulation.zoom !== 1.0) {
      const sessionData = (window as any).__sessionData || {}
      const sessionId = sessionData.sessionId || 'default'
      applyViewportQualityControl(newManipulation.zoom, sessionId)
    }
  }, [quality, hasSingleQuality])

  // Check for single quality streams periodically
  useEffect(() => {
    const checkQualities = () => {
      if (playerInstanceRef.current) {
        try {
          const qualities = playerInstanceRef.current.getQualities()
          const singleQuality = shouldForceClientQuality(qualities)
          setHasSingleQuality(singleQuality)
        } catch (error) {
          // Ignore errors during quality checking
        }
      }
    }

    const interval = setInterval(checkQualities, 2000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className={`w-full session-${visualId}`} style={{ position: 'relative' }}>
      <div className="mb-2 text-sm text-gray-600 dark:text-gray-400">
        Quality: {hasSingleQuality ? 'Container Reduced' : settings.label}
        {hasSingleQuality && ' (Single Quality Stream - Using Container Manipulation)'}
        <span className="ml-2 text-xs opacity-50">Session: {visualId}</span>
      </div>
      <div className={`quality-container-${visualId}`}>
        <div
          className={`quality-scaler-${visualId} ${hasSingleQuality ? 'quality-single' : `quality-${quality}`}`}
        >
          <div
            ref={playerRef}
            className="w-full rounded-lg overflow-hidden"
            style={{
              // Ensure visibility for autoplay requirements
              visibility: 'visible',
              opacity: 1,
              // Additional autoplay requirements
              pointerEvents: 'auto',
              zIndex: 1,
              // Keep original player dimensions
              height: settings.height,
              width: '100%'
            }}
          />
        </div>
      </div>
    </div>
  )
}
