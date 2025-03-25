import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Maximize2, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ChartDataset {
  label?: string;
  data: number[];
  backgroundColor?: string | string[];
  borderColor?: string | string[];
  borderWidth?: number;
}

interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
}

type ChartType = 'line' | 'bar' | 'pie' | 'doughnut' | 'radar' | 'scatter';

interface HealthTrendChartProps {
  data: ChartData | any[];
  type: string;
  title?: string;
}

const HealthTrendChart: React.FC<HealthTrendChartProps> = ({ data, type, title }) => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    // Destroy previous chart if it exists
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    if (!data || !chartRef.current) {
      return;
    }

    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;
    
    // Prepare chart configuration based on the type and data
    const chartData = formatChartData(data, type);
    
    // Create the chart with proper configuration
    chartInstance.current = new Chart(ctx, {
      type: mapChartType(type),
      data: chartData,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: !!title,
            text: title,
            font: {
              size: 16,
              weight: 'bold',
              family: "'Inter', sans-serif"
            },
            color: '#374151'
          },
          legend: {
            position: 'top' as const,
            labels: {
              font: {
                family: "'Inter', sans-serif",
                size: 12
              },
              color: '#6B7280'
            }
          },
          tooltip: {
            enabled: true,
            backgroundColor: 'rgba(17, 24, 39, 0.9)',
            titleFont: {
              family: "'Inter', sans-serif",
              size: 14
            },
            bodyFont: {
              family: "'Inter', sans-serif",
              size: 13
            },
            padding: 12,
            cornerRadius: 8,
            displayColors: true
          }
        },
        scales: type.toLowerCase() !== 'pie' && type.toLowerCase() !== 'doughnut' ? {
          x: {
            grid: {
              display: false
            },
            ticks: {
              font: {
                family: "'Inter', sans-serif",
                size: 11
              },
              color: '#9CA3AF'
            }
          },
          y: {
            grid: {
              color: 'rgba(243, 244, 246, 1)'
            },
            ticks: {
              font: {
                family: "'Inter', sans-serif",
                size: 11
              },
              color: '#9CA3AF'
            }
          }
        } : undefined
      }
    });

    // Cleanup function
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [data, type, title]);

  // Map the chart type from backend to Chart.js type
  const mapChartType = (backendType: string): ChartType => {
    const typeMap: Record<string, ChartType> = {
      'line': 'line',
      'bar': 'bar',
      'pie': 'pie',
      'doughnut': 'doughnut',
      'radar': 'radar',
      'scatter': 'scatter'
    };
    
    return typeMap[backendType.toLowerCase()] || 'bar';
  };

  // Format the data for Chart.js based on the type
  const formatChartData = (rawData: any, chartType: string): ChartData => {
    // If data is already in the correct format for Chart.js
    if (rawData.labels && rawData.datasets) {
      return rawData as ChartData;
    }

    // Default colors for datasets with better aesthetics
    const backgroundColors = [
      'rgba(79, 70, 229, 0.5)',  // Indigo
      'rgba(239, 68, 68, 0.5)',  // Red
      'rgba(16, 185, 129, 0.5)', // Green
      'rgba(245, 158, 11, 0.5)', // Amber
      'rgba(99, 102, 241, 0.5)', // Indigo-lighter
      'rgba(217, 70, 239, 0.5)', // Fuchsia
      'rgba(6, 182, 212, 0.5)',  // Cyan
    ];

    const borderColors = backgroundColors.map(color => color.replace('0.5', '1'));

    // For line and bar charts with simple array data
    if (Array.isArray(rawData)) {
      // If it's an array of objects like [{year: '2020', count: 123}, ...]
      if (rawData.length > 0 && typeof rawData[0] === 'object') {
        const keys = Object.keys(rawData[0]);
        const labelKey = keys.find(k => k.match(/year|date|label|name|term/i)) || keys[0];
        const valueKey = keys.find(k => k.match(/count|value|amount/i)) || keys[1];

        return {
          labels: rawData.map(item => item[labelKey]),
          datasets: [{
            label: 'Count',
            data: rawData.map(item => Number(item[valueKey]) || 0),
            backgroundColor: backgroundColors[0],
            borderColor: borderColors[0],
            borderWidth: 2
          }]
        };
      }
      
      // Simple array of values
      return {
        labels: Array.from({ length: rawData.length }, (_, i) => `Item ${i+1}`),
        datasets: [{
          label: 'Value',
          data: rawData.map((v: unknown) => Number(v) || 0),
          backgroundColor: backgroundColors[0],
          borderColor: borderColors[0],
          borderWidth: 2
        }]
      };
    }

    // For pie charts with object data like {label1: value1, label2: value2}
    if (typeof rawData === 'object' && !Array.isArray(rawData)) {
      const labels = Object.keys(rawData);
      const values = Object.values(rawData).map(v => Number(v) || 0);
      
      return {
        labels: labels,
        datasets: [{
          data: values,
          backgroundColor: backgroundColors.slice(0, labels.length),
          borderColor: borderColors.slice(0, labels.length),
          borderWidth: 1
        }]
      };
    }

    // Default empty data
    return {
      labels: [],
      datasets: [{
        label: 'No Data',
        data: [],
        backgroundColor: backgroundColors[0],
        borderColor: borderColors[0],
        borderWidth: 2
      }]
    };
  };

  const downloadChart = () => {
    if (!chartRef.current) return;
    
    const link = document.createElement('a');
    link.download = `${title || 'health-trend-chart'}.png`;
    link.href = chartRef.current.toDataURL('image/png');
    link.click();
  };

  const fullScreenChart = () => {
    if (!chartRef.current) return;
    
    // You would implement a modal/fullscreen view here
    // This is just a placeholder
    alert('Fullscreen chart view would appear here');
  };

  return (
    <Card className="health-trend-chart shadow-sm border-gray-200">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <BarChart className="h-5 w-5 text-indigo-600 mr-2" />
            <CardTitle className="text-lg text-gray-800">{title || 'Health Trend Analysis'}</CardTitle>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="h-8 w-8 p-0"
              onClick={fullScreenChart}
            >
              <Maximize2 className="h-4 w-4 text-gray-600" />
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="h-8 w-8 p-0"
              onClick={downloadChart}
            >
              <Download className="h-4 w-4 text-gray-600" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="h-[300px] w-full">
          <canvas ref={chartRef}></canvas>
        </div>
      </CardContent>
    </Card>
  );
};

export default HealthTrendChart; 