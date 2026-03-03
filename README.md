# EcoSynergy: Circular Farm Systems Integrator

A systems-thinking demonstration that models the flows of energy, water, and biological waste within an agricultural ecosystem. This Single Page Application (SPA) demonstrates a **Circular Economy** approach by quantifying the "hidden" value in farm waste.

## Features

- **Biogas Potential Simulator:** Calculates energy generation from livestock manure
- **Carbon Sequestration Calculator:** Estimates CO2 removal via crop-residue-to-biochar conversion
- **Water Independence Metric:** Models rainwater harvesting potential against irrigation needs
- **Financial & Impact Dashboard:** Real-time conversion of physical units (kWh, Liters) into financial savings ($) and Environmental Impact (Tons CO2e)

## Technology Stack

- **React 18** - UI framework
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Recharts** - Data visualization

## Installation

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```

3. Build for production:
```bash
npm run build
```

## Project Structure

```
├── src/
│   ├── components/
│   │   ├── Sidebar.jsx      # Input fields for farm data
│   │   ├── KPICards.jsx     # Key performance indicators
│   │   └── Charts.jsx       # Data visualizations
│   ├── utils/
│   │   └── calculator.js    # Calculation functions
│   ├── App.jsx              # Main application component
│   ├── main.jsx             # Entry point
│   └── index.css            # Global styles
├── farmData.json            # Constants and coefficients
└── package.json
```

## System Constraints

- **No IoT/Live Sensors:** Static input mode - user manually enters values
- **Client-Side Logic:** All calculations happen in the browser
- **Deterministic Math:** Uses standard engineering coefficients (averages)
- **Scope:** Includes Cows, Pigs, Chickens, Corn, Wheat, Soy, Solar, Rain

## Deployment

This project can be easily deployed to:
- **Vercel** - Connect your GitHub repo
- **Netlify** - Connect your GitHub repo

Both platforms offer free hosting for static sites.

## License

This is a student project for educational purposes.

