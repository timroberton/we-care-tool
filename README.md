# We Care ~ A Tool for Modeling Abortion Care Scenarios

A web-based scenario modeling application for analyzing the impact of health system interventions on abortion care access and health outcomes.

**Live app:** <https://wecaretool.app>

## Overview

This tool helps public health analysts and policymakers model different intervention scenarios for improving abortion care access. Users can adjust parameters related to family planning, demand, facility access, and service readiness to estimate health outcomes and compare policy approaches.

## Features

- **Scenario comparison** - Create and compare multiple intervention scenarios against a baseline
- **AI-powered assistant** - Natural language interface for parameter modification and analysis
- **Interactive visualizations** - Flow diagrams, charts, and tables showing projected outcomes
- **Report generation** - Export findings with embedded visualizations
- **Data portability** - Import/export parameters via CSV
- **Offline capable** - All data stored locally in browser (IndexedDB)
- **Privacy-first** - No server-side data storage; all project data remains on your device

## Data Privacy

This application has **no persistent server-side data storage**. All project data, parameters, and scenarios are stored locally in your browser using IndexedDB. Data never leaves your device unless you explicitly:

- Export parameters as CSV files
- Use the AI assistant (which sends conversation context to Anthropic's API)
- Optionally upload documents to include in AI context (via Anthropic's Files API)

The edge functions serve only as proxies to the Anthropic API - they do not store or log user data.

## Tech Stack

- SolidJS + TypeScript
- Vite
- Tailwind CSS v4
- Netlify (deployment + edge functions)
- Anthropic Claude API (AI assistant)

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Installation

```bash
# Clone the repository
git clone https://github.com/timroberton/we-care-tool.git
cd we-care-tool

# Install dependencies
npm install

# Create environment file
echo "ANTHROPIC_API_KEY=your-api-key-here" > .env

# Start development server
npm run dev
```

The app will be available at `http://localhost:8888` (Netlify Dev) or `http://localhost:3000` (Vite only).

### Available Scripts

```bash
npm run dev          # Start with Netlify Dev (includes serverless functions)
npm run dev-vite     # Start Vite dev server only
npm run build        # Build for production
npm run preview      # Preview production build
npm run typecheck    # Run TypeScript type checking
```

## Project Structure

```
src/
├── components/      # UI components
├── routes/          # Page components
├── stores/          # State management
├── calc_funcs/      # Model calculation logic
├── types/           # TypeScript definitions
├── config/          # Static configuration
├── utils/           # Utility functions
└── panther/         # UI component library (external)

netlify/
└── edge-functions/  # API proxies (AI chat, optional document upload to Anthropic)
```

## Usage

1. **Create a project** - Start with a baseline scenario
2. **Set parameters** - Adjust family planning, demand, access, and readiness values
3. **Add scenarios** - Create alternative intervention scenarios
4. **View results** - See projected outcomes in tables, charts, and flow diagrams
5. **Use AI assistant** - Ask questions or modify parameters via natural language
6. **Generate reports** - Export findings for stakeholders

## Configuration

### Environment Variables

- `ANTHROPIC_API_KEY` - Required for AI assistant functionality

### Deployment

The app is configured for Netlify deployment:

1. Connect your repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Add environment variable: `ANTHROPIC_API_KEY`

## Data and Translations

### Updating Translations

UI strings are managed in `translations/ui_strings.csv`. After editing the CSV:

```bash
npx tsx scripts/build-translations.ts
```

This generates:

- `src/translate/keys.ts` - TypeScript type for all translation keys
- `src/translate/translations_fr.ts` - French translations
- `src/translate/translations_pt.ts` - Portuguese translations

### Updating Country Data

Country baseline data is managed in `data/all.csv`. After editing the CSV:

```bash
npx tsx scripts/build-data.ts
```

This generates `public/data/all.json` which is loaded by the app at runtime.

## License

Copyright 2025 World Health Organization (WHO). All rights reserved. See [LICENSE](LICENSE) for details.

## Support

For technical issues or questions, please contact the development team.
