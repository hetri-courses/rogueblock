export default function Contact() {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
        Contact Us
      </h1>
      
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Get in Touch
        </h2>
        
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Have questions about RogueBlock or need help with interactive media? 
          We're here to help you optimize your content experience.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Support
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              For technical support and optimization assistance.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              General Inquiries
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              For general questions about our platform and services.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
