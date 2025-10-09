export default function Home() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          RogueBlock Interactive Platform
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Professional interactive media platform with embedded content
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
            Interactive Content
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Real-time interactive media with automatic quality detection and performance optimization.
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
            Multi-Platform Testing
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Test content performance with multiple simultaneous connections from different locations and devices.
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
            Quality Analysis
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Analyze content quality, performance metrics, and optimization across different viewing conditions.
          </p>
        </div>
      </div>

      <div className="mt-12 text-center">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
          Content Pages
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Access our interactive content pages for comprehensive analysis
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map((num) => (
            <a
              key={num}
              href={`/monitor-${num}`}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
            >
              Content {num}
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
