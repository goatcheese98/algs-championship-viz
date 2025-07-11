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

        <!-- ALGS Year 5 Open -->
        <div class="tournament-card" @click="goToTournament('year_5_open.html')">
          <div class="tournament-icon">🌍</div>
          <h3>ALGS Year 5 Open</h3>
          <div class="tournament-status">Available Now</div>
          
          <p class="tournament-description">
            Explore the global Year 5 Open tournament featuring 12 intense rounds across Winners Round 1, Winners Round 2, and Elimination Round 1.
          </p>

          <div class="tournament-details">
            <div class="detail-item">
              <div class="detail-label">Format</div>
              <div class="detail-value">Global Open</div>
            </div>
            <div class="detail-item">
              <div class="detail-label">Season</div>
              <div class="detail-value">Split 1 - 2025</div>
            </div>
            <div class="detail-item">
              <div class="detail-label">Rounds</div>
              <div class="detail-value">12 Total Matches</div>
            </div>
            <div class="detail-item">
              <div class="detail-label">Structure</div>
              <div class="detail-value">Winners → Elimination</div>
            </div>
          </div>

          <a href="year_5_open.html" class="enter-button">
            Enter Tournament
          </a>
        </div>
      </div>
    </main>

    <!-- Visualization Dashboard Navigation -->
    <section class="dashboard-navigation">
      <div class="nav-container">
        <h2>📊 Visualization Dashboard</h2>
        <p>Quick access to all tournament data visualizations and analytics</p>
        
        <div class="nav-cards-grid">
          <!-- Year 4 Championship Card -->
          <div class="nav-card" @click="goToTournament('year_4_championship.html')">
            <div class="nav-icon">🏆</div>
            <h3>Year 4 Championship</h3>
            <p>View detailed match analytics and team performance data</p>
            <a href="year_4_championship.html" class="nav-button">
              View Analytics
            </a>
          </div>
          
          <!-- Year 5 Open Card -->
          <div class="nav-card" @click="goToTournament('year_5_open.html')">
            <div class="nav-icon">🌍</div>
            <h3>Year 5 Open</h3>
            <p>Explore all 12 rounds of Year 5 tournament data</p>
            <a href="year_5_open.html" class="nav-button">
              View Analytics
            </a>
          </div>
          
          <!-- Data Management Card -->
          <div class="nav-card" @click="openDataManagement()">
            <div class="nav-icon">🔧</div>
            <h3>Data Management</h3>
            <p>Access automation tools and file management utilities</p>
            <button class="nav-button" @click="openDataManagement">
              Manage Data
            </button>
          </div>
        </div>
      </div>
    </section>

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
        
        // Animate dashboard navigation cards
        gsap.fromTo('.nav-card', {
          y: 30,
          opacity: 0
        }, {
          y: 0,
          opacity: 1,
          duration: 0.6,
          stagger: 0.1,
          delay: 0.8,
          ease: 'power2.out'
        })
      }
    },
    
    goToTournament(url) {
      window.location.href = url
    },
    
    openDataManagement() {
      // Check if we're running locally and the automation server might be available
      const automationServerUrl = 'http://localhost:3002'
      
      // Try to open the automation server GUI
      try {
        window.open(automationServerUrl, '_blank')
      } catch (error) {
        // If that fails, show instructions
        const message = `
🔧 Data Management Tools

To access the data management interface:

1. Navigate to: src/data-extraction/
2. Run: npm install (if not already done)
3. Run: node automation-server.js
4. Open: http://localhost:3002

This will open the automation server GUI where you can:
• Process tournament URLs
• Manage concurrent processing
• Rename files with day prefixes
• Monitor processing results

The automation server provides full control over data extraction and file management operations.
        `
        
        alert(message)
      }
    }
  }
}
</script>

<!-- No scoped styles needed as the CSS is already in index.html --> 