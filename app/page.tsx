export default function Home() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          RogueBlock
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Interactive media platform
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md max-w-2xl mx-auto">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
          Interactive Media
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Multiple monitor views streaming the same interactive content.
        </p>
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
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors text-center"
            >
              Monitor {num}
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
