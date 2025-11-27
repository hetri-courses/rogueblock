'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)

    this.setState({
      error,
      errorInfo
    })

    // Call optional error callback
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }

    // Log error details for debugging
    console.group('Error Details')
    console.error('Error:', error.message)
    console.error('Stack:', error.stack)
    console.error('Component Stack:', errorInfo.componentStack)
    console.groupEnd()
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null })
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Default error UI
      return (
        <div className="min-h-[400px] flex items-center justify-center bg-gray-900 rounded-lg border border-red-500">
          <div className="text-center p-6 max-w-md">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h2 className="text-xl font-semibold text-white mb-2">
              Something went wrong
            </h2>
            <p className="text-gray-300 mb-4">
              The video player encountered an error. This might be due to network issues,
              browser restrictions, or service unavailability.
            </p>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mb-4 text-left bg-gray-800 p-3 rounded text-sm">
                <summary className="cursor-pointer text-gray-300 mb-2">
                  Error Details (Development)
                </summary>
                <pre className="text-red-400 whitespace-pre-wrap text-xs">
                  {this.state.error.message}
                  {this.state.error.stack}
                </pre>
              </details>
            )}

            <div className="space-y-2">
              <button
                onClick={this.handleRetry}
                className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
              >
                Try Again
              </button>

              <button
                onClick={() => window.location.reload()}
                className="w-full px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors text-sm"
              >
                Reload Page
              </button>
            </div>

            <p className="text-xs text-gray-500 mt-4">
              Error ID: {Date.now().toString(36)}
            </p>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
