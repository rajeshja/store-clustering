# StoreMapper

StoreMapper is a Next.js application that allows users to upload store location data from a CSV file, and then uses a GenAI-powered backend to cluster the stores based on geographic proximity. The clustered stores are then visualized on an interactive map.

## Core Features

- **AI-Powered Clustering**: Uses a machine learning model to determine optimal clustering of stores.
- **Interactive Map Visualization**: Renders store locations on a Google Map, with clusters color-coded for easy identification.
- **Store Details**: Click on any store pin to see details like its name and type.
- **CSV Data Input**: Easily upload your store data via a simple CSV file.

## Getting Started

### Prerequisites

- Node.js (v18 or later)
- npm, yarn, or pnpm

### Environment Variables

Before running the application, you need to set up your environment variables. Copy the `.env.local.example` file to a new file named `.env.local`:

```bash
cp .env.local.example .env.local
```

Now, open `.env.local` and add your Google Maps API key:

```
# Get a key from the Google Cloud Console: https://console.cloud.google.com/google/maps-apis/overview
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="YOUR_API_KEY_HERE"
```

### Installation

Install the project dependencies:

```bash
npm install
```

### Running the Development Server

To run the app in development mode, use the following command:

```bash
npm run dev
```

The application will be available at [http://localhost:9002](http://localhost:9002).

## How to Use

1.  Open the application in your browser.
2.  On the sidebar, click "Select a file..." to upload a CSV file containing your store data.
3.  The CSV file must have the following columns: `storeId`, `name`, `type`, `latitude`, `longitude`.
4.  Adjust the "Number of Clusters" slider if desired (from 5 to 10).
5.  Click the "Cluster Stores" button.
6.  The map will update to show your stores, color-coded by their assigned cluster.
