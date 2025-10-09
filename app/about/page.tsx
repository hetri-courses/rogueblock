export default function About() {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
        About RogueBlock
      </h1>
      
      <div className="prose prose-lg dark:prose-invert max-w-none">
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          RogueBlock is a professional interactive media platform designed 
          to help content creators and developers optimize their media experience.
        </p>
        
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
          Features
        </h2>
        
        <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 mb-6 space-y-2">
          <li>Real-time interactive media</li>
          <li>Multi-platform testing capabilities</li>
          <li>Quality analysis and performance metrics</li>
          <li>Automatic optimization detection</li>
          <li>Cross-platform compatibility testing</li>
        </ul>
        
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
          Technology
        </h2>
        
        <p className="text-gray-600 dark:text-gray-400">
          Built with Next.js, TypeScript, and Tailwind CSS, RogueBlock provides a modern, 
          responsive interface for interactive media and analysis.
        </p>
      </div>
    </div>
  )
}
