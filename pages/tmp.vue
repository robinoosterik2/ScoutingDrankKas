<template>
    <div>
      <h1>My Nuxt Website</h1>
      <Graph />
    </div>
  </template>
  
  <script>
  import Graph from '~/components/graph.vue';
  
  export default {
    components: {
      Graph,
    },
  };
  </script>