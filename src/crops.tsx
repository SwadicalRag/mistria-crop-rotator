import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

import {v7 as uuid} from "uuid"

interface CropDefinition {
  id: string;
  name: string;
  type: 'single' | 'renewable';
  seedCost: number;
  profitPerHarvest: number;
  daysToMature: number;
  daysToReflower?: number;
  seasons: string[];
  isTree: boolean;
  isDisabled: boolean;
}

interface CropMetrics {
  availableHarvests: number;
  startupCost: number;
  totalCost: number;
  totalProfit: number;
  netProfit: number;
  allocatedPlots: number;
}

interface CropAllocation extends CropDefinition, CropMetrics {}

const CropRotationOptimizer = () => {
  const [budget, setBudget] = useState(1000);  // Starting budget
  const [availablePlots, setAvailablePlots] = useState(4);  // Number of plots
  const [daysInSeason, setDaysInSeason] = useState(28);  // Days left in season
  
  const savedCrops = localStorage.getItem('crops');
  let initialCropState: CropDefinition[] = [
    { 
      id: uuid(),
      name: 'Tomato',
      type: 'renewable',
      seedCost: 150,
      profitPerHarvest: 50,
      daysToMature: 14,
      daysToReflower: 7,
      seasons: ['spring', 'summer'],
      isTree: false,
      isDisabled: false
    },
    {
      id: uuid(),
      name: 'Apple Tree',
      type: 'renewable',
      seedCost: 500,
      profitPerHarvest: 200,
      daysToMature: 60,
      daysToReflower: 30,
      seasons: ['summer', 'fall'],
      isTree: true,
      isDisabled: false
    },
    {
      id: uuid(),
      name: 'Lettuce',
      type: 'single',
      seedCost: 20,
      profitPerHarvest: 40,
      daysToMature: 10,
      seasons: ['spring', 'fall'],
      isTree: false,
      isDisabled: false
    }
  ];

  if (savedCrops) {
    initialCropState = JSON.parse(savedCrops);
  }

  const [crops, setCrops] = useState(initialCropState);

  const [newCrop, setNewCrop] = useState({
    name: '',
    type: 'single',
    seedCost: 0,
    profitPerHarvest: 0,
    daysToMature: 0,
    daysToReflower: 0,
    seasons: [] as string[],
    isTree: false,
    isDisabled: false
  } satisfies Omit<CropDefinition, "id"> as Omit<CropDefinition, "id">);

  const [currentSeason, setCurrentSeason] = useState('spring');
  const seasons = ['spring', 'summer', 'fall', 'winter'];

  const addCrop = () => {
    if (newCrop.name && newCrop.seedCost && newCrop.daysToMature && newCrop.profitPerHarvest) {
      setCrops([...crops, { ...newCrop, id: uuid() }]);
      setNewCrop({
        name: '',
        type: 'single',
        seedCost: 0,
        profitPerHarvest: 0,
        daysToMature: 0,
        daysToReflower: 0,
        seasons: [...newCrop.seasons],
        isTree: false,
        isDisabled: false,
      });
    }
  };

  const toggleSeason = (season: string) => {
    const newSeasons = newCrop.seasons.includes(season)
      ? newCrop.seasons.filter(s => s !== season)
      : [...newCrop.seasons, season];
    setNewCrop({ ...newCrop, seasons: newSeasons });
  };

  
  // Save crops to localStorage whenever they change
  React.useEffect(() => {
    localStorage.setItem('crops', JSON.stringify(crops));
  }, [crops]);

  const calculateCropProfitability = (crop: CropDefinition, numPlots: number): CropMetrics => {
    if (crop.type === 'renewable') {
      const daysAfterFirstHarvest = daysInSeason - crop.daysToMature;
      const additionalHarvests = Math.floor(daysAfterFirstHarvest / crop.daysToReflower!);
      const totalHarvests = 1 + additionalHarvests;
      const startupCost = crop.seedCost * numPlots;
      const totalCost = crop.seedCost * numPlots;
      const totalProfit = totalHarvests * crop.profitPerHarvest * numPlots
      const netProfit = totalProfit - totalCost;
      
      return {
        availableHarvests: totalHarvests,
        startupCost,
        totalCost,
        totalProfit,
        netProfit,
        allocatedPlots: numPlots
      };
    } else {
      const cyclesPerSeason = Math.floor(daysInSeason / crop.daysToMature);
      const startupCost = crop.seedCost * numPlots;
      const totalCost = cyclesPerSeason * crop.seedCost * numPlots;
      const totalProfit = cyclesPerSeason * crop.profitPerHarvest * numPlots;
      const netProfit = totalProfit - totalCost;
      return {
        availableHarvests: cyclesPerSeason,
        startupCost,
        totalCost,
        totalProfit,
        netProfit,
        allocatedPlots: numPlots
      };
    }
  };

  const calculateTotalProfit = (allocations: { netProfit: number; }[]) => {
    return allocations.reduce((total, allocation) => total + allocation.netProfit, 0);
  };

  const calculateOptimalRotation = () => {
    const availableCrops = crops.filter(crop => 
      crop.seasons.includes(currentSeason) && !crop.isDisabled
    );

    // Calculate profit per plot for each crop
    const cropProfits = availableCrops.map(crop => {
      const singlePlotMetrics = calculateCropProfitability(crop, 1);
      return {
        crop,
        ...singlePlotMetrics
      };
    }).sort((a, b) => (b.netProfit) - (a.netProfit));

    // Initial allocation function
    const allocatePlots = (remainingBudget: number, remainingPlots: number, allocations: CropAllocation[] = []) => {
      for (const cropMetric of cropProfits) {
        if (remainingBudget <= 0 || remainingPlots <= 0) break;
        
        // Calculate maximum plots we can afford and allocate
        const maxPlotsAffordable = Math.floor(remainingBudget / cropMetric.startupCost);
        const plotsToAllocate = Math.min(maxPlotsAffordable, remainingPlots);
        
        if (plotsToAllocate > 0) {
          const metrics = calculateCropProfitability(cropMetric.crop, plotsToAllocate);
          console.log("ALLOCATING", cropMetric.crop.name, plotsToAllocate, metrics);
          allocations.push({
            ...cropMetric.crop,
            ...cropMetric,
          });
          
          remainingBudget -= metrics.startupCost;
          remainingPlots -= plotsToAllocate;
        }
      }
      return allocations;
    };

    // Initial allocation
    let bestAllocation = allocatePlots(budget, availablePlots);
    let bestProfit = calculateTotalProfit(bestAllocation);
    let improved = true;

    // Iterative improvement
    while (improved) {
      improved = false;
      
      // Try removing each allocation and reallocating
      for (let i = 0; i < bestAllocation.length; i++) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const removedAllocation = bestAllocation[i];
        const remainingAllocations = bestAllocation.filter((_, index: number) => index !== i);
        
        // Calculate new budget and plots available after removal
        const newBudget = budget - remainingAllocations.reduce((sum, a) => sum + a.totalCost, 0);
        const newPlots = availablePlots - remainingAllocations.reduce((sum, a) => sum + a.allocatedPlots, 0);
        
        // Try reallocating with remaining budget and plots
        const newAllocation = [
          ...remainingAllocations,
          ...allocatePlots(newBudget, newPlots)
        ];
        
        const newProfit = calculateTotalProfit(newAllocation);
        
        if (newProfit > bestProfit) {
          bestAllocation = newAllocation;
          bestProfit = newProfit;
          improved = true;
          break;
        }
      }
    }

    return bestAllocation;
  };

  const parseTsvRow = (row: string): Omit<CropDefinition, "id"> | null => {
    const values = row.split('\t');
    if (values.length >= 4) {
      const [name, seedCost, daysToMature, daysToReflower, profitPerHarvest] = values;
      
      // Skip empty rows
      if (!name.trim()) return null;

      // Check if this is a renewable crop based on whether daysToReflower is provided
      const isRenewable = daysToReflower && daysToReflower.trim() !== '';
      
      return {
        name: name.trim(),
        type: isRenewable ? 'renewable' : 'single',
        seedCost: parseInt(seedCost) || 0,
        daysToMature: parseInt(daysToMature) || 0,
        daysToReflower: isRenewable ? (parseInt(daysToReflower) || 0) : 0,
        profitPerHarvest: parseInt(profitPerHarvest) || 0,
        seasons: [...newCrop.seasons],
        isTree: newCrop.isTree,
        isDisabled: false,
      };
    }
    return null;
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    // Validate first before preventDefault
    const pastedText = e.clipboardData.getData('text');
    const everyRowHas4Values = pastedText.trim().split('\n').every(row => row.split('\t').length >= 4);
    if (!everyRowHas4Values) return;

    e.preventDefault();
    
    // Split by newlines and parse each row
    const rows = pastedText.split('\n').filter(row => row.split('\t').length >= 4);
    const newCrops: CropDefinition[] = [];

    const lastRow = rows.pop();
    for (const row of rows) {
      const cropData = parseTsvRow(row);
      if (cropData) {
        newCrops.push({ ...cropData, id: uuid() });
      }
    }

    if (lastRow || newCrops.length > 0) {
      setCrops(prev => [...prev, ...newCrops]);
      if (lastRow) {
        const cropData = parseTsvRow(lastRow);
        if (cropData) {
          setNewCrop({ ...cropData });
          return;
        }
      }

      // Reset the new crop form
      setNewCrop({
        name: '',
        type: 'single',
        seedCost: 0,
        daysToMature: 0,
        daysToReflower: 0,
        profitPerHarvest: 0,
        seasons: [...newCrop.seasons],
        isTree: newCrop.isTree,
        isDisabled: false,
      });
    }
  };

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  return (
    <div className="p-4 mx-auto space-y-4">
      {/* Resource Configuration */}
      <Card>
          <CardHeader>
            <CardTitle>Resources</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <label className="flex-1">
                  Starting Budget:
                  <input
                    type="number"
                    className="w-full p-2 border rounded mt-1"
                    value={budget}
                    onChange={(e) => setBudget(parseInt(e.target.value))}
                  />
                </label>
                <label className="flex-1">
                  Available Plots:
                  <input
                    type="number"
                    className="w-full p-2 border rounded mt-1"
                    value={availablePlots}
                    onChange={(e) => setAvailablePlots(parseInt(e.target.value))}
                  />
                </label>
                <label className="flex-1">
                  Days Left in Season:
                  <input
                    type="number"
                    className="w-full p-2 border rounded mt-1"
                    value={daysInSeason}
                    onChange={(e) => setDaysInSeason(parseInt(e.target.value))}
                  />
                </label>
              </div>
            </div>
          </CardContent>
        </Card>

      {/* Main grid for Crop Configuration and Results */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Crop Configuration */}
        <Card>
          <CardHeader>
            <CardTitle>Add New Crop</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="block">
                  <span className="text-sm font-medium">Crop Name:</span>
                  <input
                    type="text"
                    className="w-full p-2 border rounded mt-1"
                    value={newCrop.name}
                    onChange={(e) => setNewCrop({ ...newCrop, name: e.target.value })}
                    onPaste={handlePaste}
                  />
                </label>
              </div>
              
              <div className="flex items-center space-x-4">
                <label className="block flex-1">
                  <span className="text-sm font-medium">Crop Type:</span>
                  <select
                    className="w-full p-2 border rounded mt-1"
                    value={newCrop.type}
                    onChange={(e) => setNewCrop({ ...newCrop, type: e.target.value as 'single' | 'renewable' })}
                  >
                    <option value="single">Single Use</option>
                    <option value="renewable">Renewable</option>
                  </select>
                </label>
                
                <label className="flex items-center space-x-2 mt-6">
                  <input
                    type="checkbox"
                    checked={newCrop.isTree}
                    onChange={(e) => setNewCrop({ ...newCrop, isTree: e.target.checked })}
                  />
                  <span>Is Tree</span>
                </label>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <label className="block">
                  <span className="text-sm font-medium">Seed Cost ($):</span>
                  <input
                    type="number"
                    className="w-full p-2 border rounded mt-1"
                    value={newCrop.seedCost}
                    onChange={(e) => setNewCrop({ ...newCrop, seedCost: parseInt(e.target.value) })}
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-medium">Profit per Harvest ($):</span>
                  <input
                    type="number"
                    className="w-full p-2 border rounded mt-1"
                    value={newCrop.profitPerHarvest}
                    onChange={(e) => setNewCrop({ ...newCrop, profitPerHarvest: parseInt(e.target.value) })}
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-medium">Days to Mature:</span>
                  <input
                    type="number"
                    className="w-full p-2 border rounded mt-1"
                    value={newCrop.daysToMature}
                    onChange={(e) => setNewCrop({ ...newCrop, daysToMature: parseInt(e.target.value) })}
                  />
                </label>
                {newCrop.type === 'renewable' && (
                  <label className="block">
                    <span className="text-sm font-medium">Days to Reflower:</span>
                    <input
                      type="number"
                      className="w-full p-2 border rounded mt-1"
                      value={newCrop.daysToReflower}
                      onChange={(e) => setNewCrop({ ...newCrop, daysToReflower: parseInt(e.target.value) })}
                    />
                  </label>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                {seasons.map(season => (
                  <Button
                    key={season}
                    variant={newCrop.seasons.includes(season) ? "default" : "outline"}
                    onClick={() => toggleSeason(season)}
                    className="capitalize"
                  >
                    {season}
                  </Button>
                ))}
              </div>

              <Button onClick={addCrop} className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Add Crop
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Optimization Results */}
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Recommended Rotation for {currentSeason}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Season Selection */}
              <div className="flex space-x-2">
                {seasons.map(season => (
                  <Button
                    key={season}
                    variant={currentSeason === season ? "default" : "outline"}
                    onClick={() => setCurrentSeason(season)}
                    className="capitalize"
                  >
                    {season}
                  </Button>
                ))}
              </div>

              {/* Results Table */}
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      <th className="p-2 border text-left">Crop</th>
                      <th className="p-2 border text-right">Plots</th>
                      <th className="p-2 border text-right">Startup Cost</th>
                      <th className="p-2 border text-right">Total Cost</th>
                      <th className="p-2 border text-right">Total Profit</th>
                      <th className="p-2 border text-right">Net Profit</th>
                      <th className="p-2 border text-right">Harvests</th>
                      <th className="p-2 border text-right">ROI</th>
                    </tr>
                  </thead>
                  <tbody>
                    {calculateOptimalRotation().map((result) => (
                      <tr key={result.id}>
                        <td className="p-2 border">
                          <span className="font-mono mr-2">
                            {result.isTree ? '🌳' : '🌱'}
                          </span>
                          {result.name}
                        </td>
                        <td className="p-2 border text-right">{result.allocatedPlots}</td>
                        <td className="p-2 border text-right">${result.startupCost}</td>
                        <td className="p-2 border text-right">${result.totalCost}</td>
                        <td className="p-2 border text-right">${result.totalProfit}</td>
                        <td className="p-2 border text-right">${result.netProfit}</td>
                        <td className="p-2 border text-right">{result.availableHarvests}</td>
                        <td className="p-2 border text-right">
                          {((result.netProfit! / result.totalCost!) * 100).toFixed(1)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Available Crops per Season */}
        <Card className="col-span-2 mt-4">
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <span>Available Crops by Season</span>
              <div className="space-x-2">
                <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" >Clear All</Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete all your crop configurations. This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => setCrops([])}>
                        Continue
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                <Button
                  variant="outline"
                  onClick={() => {
                    const dataStr = JSON.stringify(crops, null, 2);
                    const blob = new Blob([dataStr], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = 'crop_configurations.json';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    URL.revokeObjectURL(url);
                  }}
                >
                  Export Crops
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = '.json';
                    input.onchange = (e) => {
                      const file = (e.target as HTMLInputElement).files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (e) => {
                          try {
                            const importedCrops = JSON.parse(e.target!.result! as string);
                            setCrops(importedCrops);
                          } catch (error) {
                            console.error('Error parsing JSON:', error);
                          }
                        };
                        reader.readAsText(file);
                      }
                    };
                    input.click();
                  }}
                >
                  Import Crops
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="p-2 border text-left">Crop</th>
                    <th className="p-2 border text-center">Type</th>
                    <th className="p-2 border text-right">Seed Cost</th>
                    <th className="p-2 border text-right">Profit/Harvest</th>
                    <th className="p-2 border text-right">Days to Mature</th>
                    <th className="p-2 border text-right">Days to Reflower</th>
                    <th className="p-2 border text-right">Startup Cost/Plot</th>
                    <th className="p-2 border text-right">Total Cost/Plot</th>
                    <th className="p-2 border text-right">Total Profit/Plot</th>
                    <th className="p-2 border text-right">Net Profit/Plot</th>
                    <th className="p-2 border text-right">Harvests/Plot</th>
                    <th className="p-2 border text-right">ROI/Plot</th>
                    <th className="p-2 border text-center">Seasons</th>
                    <th className="p-2 border text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {[...crops]
                    .map(crop => {
                      const metrics = calculateCropProfitability(crop, 1);
                      return {
                        crop,
                        metrics,
                        roi: (metrics.totalProfit - metrics.totalCost) / metrics.totalCost
                      };
                    })
                    // .sort((a, b) => b.roi - a.roi)
                    .sort((a, b) => (b.metrics.totalProfit - b.metrics.totalCost) - (a.metrics.totalProfit - a.metrics.totalCost))
                    .map(({ crop, metrics, roi }) => (
                      <tr key={crop.id} className={`${crop.seasons.includes(currentSeason) ? 'bg-green-50' : ''} ${crop.isDisabled ? 'opacity-50' : ''}`}>
                        <td className="p-2 border">
                          <span className="font-mono mr-2">
                            {crop.isTree ? '🌳' : '🌱'}
                          </span>
                          {crop.name}
                        </td>
                        <td className="p-2 border text-center capitalize">{crop.type}</td>
                        <td className="p-2 border text-right">${crop.seedCost}</td>
                        <td className="p-2 border text-right">${crop.profitPerHarvest}</td>
                        <td className="p-2 border text-right">{crop.daysToMature}</td>
                        <td className="p-2 border text-right">
                          {crop.type === 'renewable' ? crop.daysToReflower : '-'}
                        </td>
                        <td className="p-2 border text-right">${metrics.startupCost}</td>
                        <td className="p-2 border text-right">${metrics.totalCost}</td>
                        <td className="p-2 border text-right">${metrics.totalProfit}</td>
                        <td className="p-2 border text-right">${metrics.totalProfit - metrics.totalCost}</td>
                        <td className="p-2 border text-right">{metrics.availableHarvests}</td>
                        <td className="p-2 border text-right">{(roi * 100).toFixed(1)}%</td>
                        <td className="p-2 border text-center">
                          <div className="flex gap-1 justify-center">
                            {seasons.map(season => (
                              <span
                                key={season}
                                className={`px-2 py-1 rounded-full text-xs ${
                                  crop.seasons.includes(season)
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-gray-100 text-gray-400'
                                }`}
                              >
                                {season.slice(0, 3)}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="p-2 border text-center">
                          <div className="flex gap-2 justify-center">
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => {
                                const newCrops = crops.filter(c => c.id !== crop.id);
                                setCrops(newCrops);
                              }}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                            <Button
                              variant={crop.isDisabled ? "outline" : "default"}
                              size="sm"
                              onClick={() => {
                                const newCrops = crops.map(c => 
                                  c.id === crop.id ? { ...c, isDisabled: !c.isDisabled } as typeof c : c
                                );
                                setCrops(newCrops);
                              }}
                            >
                              {crop.isDisabled ? "Enable" : "Disable"}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CropRotationOptimizer;