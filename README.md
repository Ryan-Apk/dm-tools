# dm-tools

A set of tools for running D&D games. This project provides utilities to assist Dungeon Masters in managing campaigns, tracking game mechanics, and enhancing the overall D&D experience.

## Tech Stack

- **Frontend Framework**: React 18.3.1
- **Build Tool**: Vite 8.0.12
- **Routing**: React Router DOM 7.17.0
- **Styling**: Tailwind CSS 4.3.0
- **Code Quality**: ESLint

## Features

- **Roadmap**: Planned features include dice rolling, dice history recording, and d10000 table functionality
- **Bug Tracking**: Known issues are tracked and viewable in the app

## Getting Started

### Prerequisites

Make sure you have Node.js installed on your system. You can download it from [nodejs.org](https://nodejs.org/).

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Ryan-Apk/dm-tools.git
cd dm-tools
```

2. Install dependencies:
```bash
npm install
```

Or if you prefer pnpm:
```bash
pnpm install
```

### Development

To start the development server with hot module replacement:

```bash
npm run dev
```

The application will be available at `http://localhost:5173` (or another port if 5173 is in use).

### Building for Production

To create an optimized production build:

```bash
npm run build
```

The compiled files will be in the `dist` directory.

### Preview Production Build

To preview the production build locally:

```bash
npm run preview
```

### Linting

To check code quality with ESLint:

```bash
npm run lint
```

## Project Structure

```
dm-tools/
├── src/
│   ├── components/          # Reusable React components
│   │   └── Button.jsx       # Custom button component
│   ├── pages/               # Page components
│   │   ├── App.jsx          # Main app router
│   │   ├── BugList.jsx      # Bug list and roadmap page
│   │   └── NotFound.jsx     # 404 page
│   ├── assets/              # Static assets
│   └── main.jsx             # Application entry point
├── public/                  # Public static files
├── index.html               # HTML template
├── vite.config.js           # Vite configuration
└── package.json             # Project dependencies
```

## Routes

- `/` - Home page (currently showing test content)
- `/bugs` - View roadmap and known bugs
- `*` - 404 Not Found page

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with HMR |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint checks |

## Future Enhancements

- Dice rolling functionality
- Dice history recording
- D10000 table integration

## Known Issues

- Issue with Firefox mouse cursors where clicking the button breaks them

## License

This project is private.
