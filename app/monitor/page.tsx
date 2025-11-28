import TwitchPlayer from '../components/TwitchPlayer'

export default function Monitor() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Interactive Content
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Live streaming content
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <TwitchPlayer
          channel="animalworks"
          autoplay={true}
          muted={true}
          height="500px"
        />
      </div>
    </div>
  )
}
