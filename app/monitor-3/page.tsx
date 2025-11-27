'use client'

import TwitchPlayer from '../components/TwitchPlayer'
import ErrorBoundary from '../components/ErrorBoundary'

export default function Monitor3() {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Tfue Live Stream
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Live streaming content from Tfue - Quality: 160p
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <ErrorBoundary>
          <TwitchPlayer
            channel="tfue"
            quality="160p"
            autoplay={false}
            muted={false}
            height="500px"
            playerId="monitor-3-player"
          />
        </ErrorBoundary>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Content Status</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Active</p>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Quality</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">160p (Optimized)</p>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Streamer</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Tfue</p>
          </div>
        </div>
      </div>
    </div>
  )
}
