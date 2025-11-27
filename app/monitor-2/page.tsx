'use client'

import TwitchPlayer from '../components/TwitchPlayer'

export default function Monitor2() {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Content Page 2
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Interactive media content - Quality: 160p
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <TwitchPlayer 
          channel="animalworks"
          quality="160p"
          autoplay={true}
          muted={false}
          height="500px"
        />
        
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
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Page ID</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Content-2</p>
          </div>
        </div>
      </div>
    </div>
  )
}
