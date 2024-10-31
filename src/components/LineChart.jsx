import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

const LineChart = ({ groupedPayouts, payoutscolor="none", insitsscolor="none"  }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  let defaultBackgroundColor = 'rgb(75, 192, 192)';
  let defaultBorderColor = 'rgb(75, 192, 192)';
  let fillcolor = false;

  if (payoutscolor !== "none" || insitsscolor !== "none") {
    if (insitsscolor !== "green") {
      defaultBackgroundColor = "rgb(249,104,104,.3)";
      defaultBorderColor = "rgb(249,104,104,.3)";
      fillcolor = true;
    } else if (payoutscolor !== "red") {
      defaultBackgroundColor = "rgb(95,179,94,.3)";
      defaultBorderColor = "rgb(95,179,94,.3)";
      fillcolor = true;
    }
  }
  

  useEffect(() => {
    const ctx = chartRef.current.getContext('2d');

    if (chartInstance.current) {
      chartInstance.current.destroy();
    }
    
    // Get the current date
    const currentDate = new Date();
    const labels = [];
    const data = [];

    // Loop to generate labels for the last 30 days from today
    for (let i = 29; i >= 0; i--) {
      const date = new Date(currentDate);
      date.setDate(currentDate.getDate() - i);
      const key = date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
      labels.push(key);

      // Check if there's data available for this date
      const payoutData = groupedPayouts[key];
      if (payoutData !== undefined) { // Check if data is not undefined (null is also undefined)
        data.push(payoutData.totalAmount / 100); // Use the actual data value
      } else {
        data.push(0); 
      }
    }

    // const labels = Object.keys(groupedPayouts); 
    // const data = Object.values(groupedPayouts).map(({ totalAmount }) => totalAmount/100); 

    // console.log("dataf in chart kjs",data,groupedPayouts)

    chartInstance.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Total volume',
          data: data,
          fill: fillcolor,
          backgroundColor: defaultBackgroundColor,
          borderColor: defaultBorderColor,
          tension: 0.4,
          // skipNull: false
        }]
      },
      options: {
        scales: {
          x: {
            display: false
          },
          y: {
            beginAtZero: true,
            display: false,
            ticks: {
              min: 0,
              max: 100
            }
          }
        },
        plugins: {
          title: {
            display: false,
            text: 'Trends Over Topic',
            font: {
              size: 16,
              weight: 'bold'
            },
            align: 'start',
            position: 'top'
          },
          legend: {
            display: false
          },
          tooltip: {
            mode: 'index',
            intersect: false,
            callbacks: {
              label: function(tooltipItem) {
                return tooltipItem.yLabel;
              }
            }
          }
        },
        elements: {
          line: {
            tension: 0.4
          }
        },
        responsive: true,
        maintainAspectRatio: false
      }
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [groupedPayouts]);

  return <canvas ref={chartRef} />;
};

export default LineChart;
