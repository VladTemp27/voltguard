# VoltGuard Client

Energy monitoring application built with React and Vite.

## Tech Stack

- **React 19.2.0** - UI library
- **Vite 7.2.2** - Build tool and dev server
- **React Router DOM 7.1.1** - Client-side routing
- **Tailwind CSS 4.1.9** - Utility-first CSS framework
- **Radix UI** - Headless UI components
- **Recharts** - Charts and data visualization
- **Lucide React** - Icon library

## Project Structure

```
client/
├── public/              # Static assets
├── src/
│   ├── components/      # Reusable React components
│   │   ├── modals/      # Modal components
│   │   └── ui/          # UI component library (Radix UI based)
│   ├── hooks/           # Custom React hooks
│   ├── lib/             # Utility functions
│   ├── pages/           # Page components (routed)
│   │   ├── Dashboard.jsx
│   │   ├── Analytics.jsx
│   │   ├── Game.jsx
│   │   ├── Settings.jsx
│   │   └── System.jsx
│   ├── styles/          # Global styles
│   ├── App.jsx          # Main app component with routing
│   └── main.jsx         # Application entry point
├── index.html           # HTML template
├── vite.config.js       # Vite configuration
├── tailwind.config.js   # Tailwind CSS configuration
├── postcss.config.js    # PostCSS configuration
└── package.json         # Dependencies and scripts
```

## Getting Started

### Install Dependencies

```bash
npm install
```

### Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Features

- **Dashboard** - Overview of energy consumption with mobile-optimized interface
- **Analytics** - Detailed consumption trends and insights with interactive charts
- **System** - Camera monitoring and device management
- **Game** - Gamification features with virtual pet and achievements
- **Settings** - User preferences and system configuration

## Path Aliases

The project uses `@` as an alias for the `src` directory:

```javascript
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
```

## Routing

Routes are configured in `src/App.jsx` using React Router:

- `/` - Redirects to dashboard
- `/dashboard` - Main dashboard view
- `/analytics` - Analytics and charts
- `/game` - Gamification features
- `/settings` - Settings page
- `/system` - System and camera management

## Styling

The project uses Tailwind CSS with a custom color palette:

- **Primary**: Blue (#245C94)
- **Secondary/Accent**: Orange (#FE8D00)
- **Background**: Off-White (#FFFFFF)

CSS variables are defined in `src/styles/globals.css` and support both light and dark modes.

## Migration Notes

This project was converted from Next.js to Vite + React:

- Removed Next.js specific features (SSR, file-based routing, Image optimization)
- Replaced Next.js routing with React Router
- Converted TypeScript to JavaScript
- Updated all component imports and exports
- Configured Vite for optimal development experience

## License

MIT
