// src/router/index.js

// Import necessary functions from vue-router to create and manage routes.
import { createRouter, createWebHistory } from 'vue-router';

// Import the Vue components that will be rendered for specific routes.
import IndexApp from '../components/IndexApp.vue'; // Component for the home/index page.
import TournamentView from '../components/TournamentView.vue'; // Component to display individual tournament details.

// Define the application's routes.
const routes = [
  {
    path: '/', // The URL path for this route.
    name: 'Home', // A unique name for the route, useful for programmatic navigation.
    component: IndexApp // The component to render when this route is active.
  },
  {
    // This is a dynamic route, meaning part of the path is a variable.
    // It's used to display different tournament pages based on the `:id` parameter.
    // Examples: /tournament/year-4-championship, /tournament/ewc-2025
    path: '/tournament/:id', // `:id` is a route parameter that captures a segment of the URL.
    name: 'Tournament', // Name of the route.
    component: TournamentView, // Component to render for tournament pages.
    // `props: true` tells Vue Router to pass the route parameters (like `id`)
    // as props to the `TournamentView` component. This makes it easier to access
    // the tournament ID within the component.
    props: true
  }
];

// Create the router instance.
const router = createRouter({
  // `createWebHistory()` creates an HTML5 history mode router.
  // This mode uses the browser's history API to achieve URL navigation
  // without a page reload, resulting in cleaner URLs (e.g., example.com/tournament/id).
  history: createWebHistory(),
  routes // Assign the defined routes to the router.
});

// Export the router instance so it can be used in the main application file (main.js).
export default router; 