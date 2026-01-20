# Alcohol Wrapped 🍺

Alcohol Wrapped is a Next.js application designed to track and visualize your alcohol consumption habits. Similar to "Spotify Wrapped," it provides detailed insights, statistics, and trends based on your logged drinks.

## 🚀 Features

- **Secure Authentication:** User management and authentication powered by [Clerk](https://clerk.com/).
- **Consumption Tracking:** Log your drinks with details like amount and timestamp.
- **Dashboard & Statistics:**
  - View total volume, total drink count, active days, and daily averages.
  - Analyze daily trends and hourly consumption distributions.
  - See a leaderboard of your most frequently consumed beverages.
- **Drink Management:** Database of drinks with alcohol percentage and unit measurements.

## 🛠️ Tech Stack

- **Framework:** [Next.js 16](https://nextjs.org/) (App Router)
- **Language:** TypeScript
- **Database:** MongoDB (via Mongoose)
- **Authentication:** Clerk
- **Styling:** Tailwind CSS & Custom CSS

## 📂 Project Structure

```bash
├── app/
│   ├── api/            # API Routes (statistics, consumption, drinks)
│   ├── consumptions/   # Page for logging/viewing consumptions
│   ├── dashboard/      # Statistics dashboard with charts
│   ├── drinks/         # Drink management
│   ├── Login/          # Login component
│   ├── layout.tsx      # Root layout
│   └── page.tsx        # Main entry (redirects based on auth)
├── lib/
│   └── db.ts           # MongoDB connection helper
├── models/
│   ├── Consumptions.ts # Mongoose schema for drink consumptions
│   └── Drinks.ts       # Mongoose schema for drink definitions
└── package.json        # Dependencies and scripts
```
