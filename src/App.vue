<template>
  <!-- The main container for the entire Vue application. -->
  <div id="app-container">
    <!-- 
      The <router-view> component is a functional component that renders the component
      for the current route. It acts as a placeholder where the matched component
      from the Vue Router configuration will be displayed.
    -->
    <router-view />
  </div>
</template>

<script>
// This is the root Vue component for the application.
export default {
  name: 'App' // Defines the name of the component.
}
</script>

<style>
/* 
  Global styles for the application can be added here.
  Alternatively, styles can be imported from external CSS files (as seen in main.js)
  or scoped to individual components.
*/
</style> 