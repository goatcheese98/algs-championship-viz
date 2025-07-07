<template>
  <div id="app">
    <!-- ALGS Header -->
    <header class="algs-header">
      <div class="header-content">
        <div class="algs-branding">
          <div class="algs-icon">🏆</div>
          <div class="algs-info">
            <h1 class="main-title">ALGS</h1>
            <p class="subtitle">Apex Legends Global Series</p>
          </div>
        </div>
        <div class="platform-info">
          <p class="tagline">Professional tournament visualization and analytics platform</p>
        </div>
      </div>
    </header>

    <!-- Tournament Dashboard -->
    <main class="dashboard-container">
      <div class="dashboard-title">
        <h2>Tournament Dashboard</h2>
        <p>Explore comprehensive visualizations and analytics for ALGS tournaments worldwide</p>
      </div>

      <div class="tournaments-grid">
        <!-- ALGS Year 4 Championship -->
        <div class="tournament-card" @click="goToTournament('year_4_championship.html')">
          <div class="tournament-icon">🏆</div>
          <h3>ALGS Year 4 Championship</h3>
          <div class="tournament-status">Available Now</div>
          
          <p class="tournament-description">
            Experience the ultimate championship with 40 professional teams competing across 4 days of intense competition in Sapporo, Japan.
          </p>

          <div class="tournament-details">
            <div class="detail-item">
              <div class="detail-label">Location</div>
              <div class="detail-value">Sapporo, Japan</div>
            </div>
            <div class="detail-item">
              <div class="detail-label">Duration</div>
              <div class="detail-value">Jan 29 - Feb 2, 2025</div>
            </div>
            <div class="detail-item">
              <div class="detail-label">Teams</div>
              <div class="detail-value">40 Professionals</div>
            </div>
            <div class="detail-item">
              <div class="detail-label">Format</div>
              <div class="detail-value">Groups → Elimination → Finals</div>
            </div>
          </div>

          <a href="year_4_championship.html" class="enter-button">
            Enter Championship
          </a>
        </div>

        <!-- Future Tournament Placeholder -->
        <div class="tournament-card coming-soon">
          <div class="tournament-icon">🌟</div>
          <h3>ALGS Future Tournaments</h3>
          <div class="tournament-status">Coming Soon</div>
          
          <p class="tournament-description">
            More ALGS tournaments and regional competitions will be added to the dashboard as they become available.
          </p>

          <div class="tournament-details">
            <div class="detail-item">
              <div class="detail-label">Status</div>
              <div class="detail-value">In Development</div>
            </div>
            <div class="detail-item">
              <div class="detail-label">Expected</div>
              <div class="detail-value">TBA</div>
            </div>
          </div>

          <button class="enter-button" disabled>
            Coming Soon
          </button>
        </div>
      </div>
    </main>

    <!-- Footer -->
    <footer class="footer">
      <p>&copy; 2025 ALGS Tournament Dashboard. Built for competitive Apex Legends visualization.</p>
    </footer>
  </div>
</template>

<script>
export default {
  name: 'IndexApp',
  
  data() {
    console.log('🏠 IndexApp data() called - Vue is initializing')
    return {
      message: 'Welcome to ALGS Tournament Dashboard'
    }
  },
  
  mounted() {
    console.log('🎯 IndexApp mounted() called - Vue component is ready')
    this.initializeAnimations()
  },
  
  methods: {
    initializeAnimations() {
      console.log('🎭 Initializing index page animations...')
      
      // Check if GSAP is available
      if (typeof gsap !== 'undefined') {
        // Animate main title entrance
        gsap.fromTo('.main-title', {
          y: -30,
          opacity: 0
        }, {
          y: 0,
          opacity: 1,
          duration: 1,
          ease: 'power2.out'
        })
        
        // Animate tournament cards
        gsap.fromTo('.tournament-card', {
          y: 50,
          opacity: 0,
          scale: 0.9
        }, {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.8,
          stagger: 0.2,
          delay: 0.3,
          ease: 'back.out(1.7)'
        })
      }
    },
    
    goToTournament(url) {
      window.location.href = url
    }
  }
}
</script>

<!-- No scoped styles needed as the CSS is already in index.html --> 