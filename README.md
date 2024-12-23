# 🌾 Crop Rotation Optimizer for Fields of Mistria

A React-based web application for optimizing crop rotations in [Fields of Mistria](https://store.steampowered.com/app/2142790/Fields_of_Mistria/). This tool helps maximize profits by suggesting optimal crop combinations based on available resources, seasonal constraints, and crop characteristics using the Z3 theorem prover for exact optimization.

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
- Exact optimization using Z3 theorem prover
- Globally optimal solutions guaranteed
- Per-plot profitability analysis
- Season-specific recommendations
- ROI calculations
- Multiple harvest calculations for renewable crops
- Mathematically proven optimal allocations

### 🎨 User Interface
- Responsive grid layout
- Seasonal filtering
- Clear data visualization
- Interactive season selection
- Detailed crop statistics
- Real-time optimization status feedback

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
3. Click "Calculate Optimal Rotation"
4. View the mathematically optimal crop rotation in the results table
5. Check the detailed breakdown of costs, profits, and ROI

## 🔧 Technical Details

### 🧮 Optimization Algorithm
The tool uses the Z3 theorem prover for exact optimization:
1. Creates Z3 integer variables for plot allocations
2. Defines constraints:
   - Non-negative plot allocations
   - Total plots cannot exceed available plots
   - Total startup cost cannot exceed budget
3. Uses binary search to maximize total profit
4. Guarantees globally optimal solutions
5. Handles complex constraints efficiently

### 💾 State Management
- Uses React's useState for state management
- Persists crop data in localStorage
- Maintains separate states for:
  - Resource configuration
  - Crop inventory
  - Current season
  - New crop form
  - Optimization results

### 🎯 UI Components
Built using:
- shadcn/ui components
- Lucide React icons
- Tailwind CSS for styling

## 📦 Dependencies
- React
- z3-solver
- shadcn/ui
- Lucide React
- UUID v7
- Tailwind CSS

## 🚀 Installation
1. Install the required dependencies:
```bash
npm install z3-solver shadcn-ui lucide-react uuid
```
2. Ensure your environment supports Web Assembly (required for z3-solver)
3. Add appropriate headers for SharedArrayBuffer support if deploying to web
4. Import the CropRotationOptimizer component
5. Add necessary UI component imports from shadcn/ui
6. Include the component in your React application

## ⚠️ Requirements
- Environment must support Web Assembly
- Browser must support SharedArrayBuffer
- Appropriate CORS and security headers must be set for web deployment

## 👥 Contributing
Feel free to submit issues and enhancement requests!

## ⚖️ License
This project is open source and available under the MIT License.
