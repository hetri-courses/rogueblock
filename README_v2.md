# RogueBlock

A professional Next.js application with embedded media players and interactive content.

## Features

- **5 Interactive Pages**: Each page features embedded media content
- **Consistent Layout**: All pages use the same layout and format
- **Optimized Performance**: Configured for efficient bandwidth usage
- **Responsive Design**: Built with Tailwind CSS for modern, responsive UI
- **GitHub Pages Ready**: Configured for automatic deployment to GitHub Pages

## Pages

- **Home** (`/`) - Main landing page with overview
- **About** (`/about`) - Information about the platform
- **Contact** (`/contact`) - Contact information
- **Content 1-5** (`/monitor-1` through `/monitor-5`) - Interactive content pages

## Technology Stack

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **GitHub Actions** - Automated deployment to GitHub Pages

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Export static files for GitHub Pages
npm run export
```

## Deployment

The site is automatically deployed to GitHub Pages when changes are pushed to the main branch. The GitHub Actions workflow handles the build and deployment process.

## License

MIT License - see LICENSE file for details.