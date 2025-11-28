import TwitchPlayer from '../components/TwitchPlayer'

export default function Monitor5() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Monitor 5
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Live streaming content
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <TwitchPlayer
          channel="AwfullyBadAtLife"
          autoplay={true}
          muted={false}
          quality={5}
        />
      </div>
    </div>
  )
}
