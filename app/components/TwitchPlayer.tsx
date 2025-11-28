'use client'

interface TwitchPlayerProps {
  channel: string
  quality?: string
  autoplay?: boolean
  muted?: boolean
  width?: string | number
  height?: string | number
}

export default function TwitchPlayer({
  channel,
  quality = "160p",
  autoplay = false,
  muted = false,
  width = "100%",
  height = "500px"
}: TwitchPlayerProps) {
  // Build the Twitch embed URL with parameters for quality control
  const embedUrl = `https://player.twitch.tv/?channel=${channel}&parent=hetri-courses.github.io&quality=${quality}&autoplay=${autoplay}&muted=${muted}`

  return (
    <div className="w-full relative">
      <iframe
        src={embedUrl}
        width={width}
        height={height}
        allowFullScreen
        className="w-full rounded-lg overflow-hidden shadow-lg bg-gray-900"
        style={{ width, height }}
        title={`Twitch stream: ${channel}`}
        sandbox="allow-scripts allow-same-origin allow-presentation"
        referrerPolicy="no-referrer"
        loading="lazy"
      />

      {/* Status indicator */}
      <div className="absolute top-2 right-2 z-10">
        <div className="w-3 h-3 rounded-full bg-green-500" />
      </div>
    </div>
  )
}
