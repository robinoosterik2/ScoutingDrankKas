<template>
    <div>
      <apexchart
        type="line"
        :options="chartOptions"
        :series="series"
      ></apexchart>
    </div>
  </template>
  
  <script>
  import VueApexCharts from 'vue3-apexcharts';
  
  export default {
    components: {
      apexchart: VueApexCharts,
    },
    data() {
      return {
        chartOptions: {
          chart: {
            id: 'line-chart',
          },
          xaxis: {
            categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
          },
        },
        series: [
          {
            name: 'Sales',
            data: [30, 40, 35, 50, 49, 60, 70],
          },
        ],
      };
    },
  };
  </script>