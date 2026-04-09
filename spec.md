# Urban Heat Island Analysis Tool

## Current State
The app allows selecting a single Indian city, auto-fetches current temperature via OpenWeatherMap API and historical monthly averages via Open-Meteo, then displays charts, UHI severity bar, AI insights, and dynamic color theming based on UHI delta.

## Requested Changes (Diff)

### Add
- A **City Comparison** mode alongside the existing single-city mode
- Two city dropdowns (City A and City B) for side-by-side comparison
- Auto-fetch current temp and historical monthly averages for both cities simultaneously
- A **comparison results view** that shows:
  - Both cities' current temperatures side-by-side
  - Both cities' historical averages side-by-side
  - A combined bar/line chart overlaying both cities' 12-month historical trends
  - Temperature difference (delta) between the two cities at current time
  - Comparative UHI severity for each city
  - AI-generated comparative feedback (which city is warmer/cooler, by how much, what it means for UHI)
- Dynamic theming based on the temperature difference between the two cities (blue = similar temps, red = large gap)

### Modify
- App entry/landing: add a toggle/tab to switch between "Single City" and "Compare Two Cities" modes
- Existing single-city flow remains fully intact

### Remove
- Nothing removed

## Implementation Plan
1. Add a mode toggle ("Single City" | "Compare Cities") on the main screen
2. When "Compare Cities" is selected, show two CityDropdown components side by side
3. When both cities are selected, auto-fetch data for both cities in parallel
4. Show a comparison results panel with:
   - Two stat cards (one per city) with current temp, historical avg, delta, trend
   - An overlaid 12-month bar/line chart with two data series (different colors)
   - A UHI severity bar for each city
   - An AI comparison feedback block summarizing which city has stronger UHI effect, temp difference, and recommendations
5. Dynamic theme driven by the absolute difference in current temps between the two cities
6. Loading states and error handling for both fetch operations
