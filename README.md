# 🌾 Crop Rotation Optimizer for Fields of Mistria

A React-based web application for optimizing crop rotations in [Fields of Mistria](https://store.steampowered.com/app/2142790/Fields_of_Mistria/). This tool helps maximize profits by suggesting optimal crop combinations based on available resources, seasonal constraints, and crop characteristics.

## ✨ Features

### 💰 Resource Management
- Configure starting budget
- Set number of available plots
- Specify days remaining in the current season

### 🌱 Crop Management
- Add and manage both single-harvest and renewable crops
- Support for trees and regular crops
- Seasonal availability tracking
- Import/Export crop configurations
- Bulk import via TSV paste functionality
- Enable/Disable crops without deletion

### 📊 Optimization Features
- Automatic calculation of optimal crop rotation
- Per-plot profitability analysis
- Season-specific recommendations
- ROI calculations
- Multiple harvest calculations for renewable crops

### 🎨 User Interface
- Responsive grid layout
- Seasonal filtering
- Clear data visualization
- Interactive season selection
- Detailed crop statistics

## 📖 Usage

### 🆕 Adding New Crops
1. Fill in the crop details in the "Add New Crop" form:
   - Name
   - Type (Single Use/Renewable)
   - Tree status
   - Seed cost
   - Profit per harvest
   - Days to mature
   - Days to reflower (for renewable crops)
   - Select applicable seasons

2. Click "Add Crop" to save the crop to your inventory

### 📥 Bulk Import
You can paste TSV (Tab-Separated Values) data directly into the name field. The format should be:
```
Name    SeedCost    DaysToMature    DaysToReflower    ProfitPerHarvest
```

### ⚙️ Managing Crops
- Use the "Clear All" button to remove all crops
- Export your crop configurations to JSON
- Import previously saved crop configurations
- Enable/Disable individual crops
- Delete specific crops

### 📋 Viewing Recommendations
1. Set your resources (budget, plots, days)
2. Select a season
3. View the recommended crop rotation in the results table
4. Check the detailed breakdown of costs, profits, and ROI

## 🔧 Technical Details

### 🧮 Optimization Algorithm
The tool uses an iterative improvement algorithm that:
1. Makes an initial allocation based on per-plot profitability
2. Iteratively tries removing and reallocating crops
3. Considers both startup costs and recurring profits
4. Respects budget and plot constraints
5. But does **not** account for multi-season/year rollover (i.e. trees)

### 💾 State Management
- Uses React's useState for state management
- Persists crop data in localStorage
- Maintains separate states for:
  - Resource configuration
  - Crop inventory
  - Current season
  - New crop form

### 🎯 UI Components
Built using:
- shadcn/ui components
- Lucide React icons
- Tailwind CSS for styling

## 📦 Dependencies
- React
- shadcn/ui
- Lucide React
- UUID v7
- Tailwind CSS

## 🚀 Installation
1. Ensure the required dependencies are installed
2. Import the CropRotationOptimizer component
3. Add necessary UI component imports from shadcn/ui
4. Include the component in your React application

## 👥 Contributing
Feel free to submit issues and enhancement requests!

## ⚖️ License
This project is open source and available under the MIT License.
