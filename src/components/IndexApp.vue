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
          <button class="data-management-btn" @click="openDataManagement">
            <span class="btn-icon">🔧</span>
            Data Tools
          </button>
        </div>
      </div>
    </header>

    <!-- EWC 2025 Banner (more compact) -->
    <section class="ewc-banner">
      <div class="ewc-banner-content">
        <div class="ewc-banner-background">
          <div class="ewc-glow-orb ewc-glow-orb-1"></div>
          <div class="ewc-glow-orb ewc-glow-orb-2"></div>
          <div class="ewc-glow-orb ewc-glow-orb-3"></div>
        </div>
        
        <div class="ewc-banner-info">
          <div class="ewc-banner-logo">
            <span class="ewc-banner-icon">🏆</span>
          </div>
          
          <div class="ewc-banner-text">
            <h2 class="ewc-banner-title">EWC 2025 - NOW LIVE!</h2>
            <p class="ewc-banner-subtitle">Experience the Esports World Cup 2025 featuring 20 elite teams</p>
            <div class="ewc-banner-stats">
              <span class="ewc-stat">🌍 Global Event</span>
              <span class="ewc-stat">👥 20 Teams</span>
              <span class="ewc-stat">🎮 10 Games</span>
            </div>
          </div>
          
          <div class="ewc-banner-action">
            <a href="ewc_2025.html" class="ewc-banner-button">
              <span class="ewc-button-text">View EWC 2025</span>
              <span class="ewc-button-arrow">→</span>
            </a>
          </div>
        </div>
      </div>
    </section>

    <!-- Tournament Dashboard with Carousel -->
    <main class="dashboard-container">
      <div class="dashboard-title">
        <h2>Tournament Dashboard</h2>
        <p>Explore comprehensive visualizations and analytics for ALGS tournaments worldwide</p>
      </div>

      <!-- Tournament Carousel -->
      <div class="carousel-container">
        <div class="carousel-wrapper">
          <div class="tournaments-carousel" ref="carousel">
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
                  <div class="detail-label">Teams</div>
                  <div class="detail-value">40 Professionals</div>
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
                  <div class="detail-label">Rounds</div>
                  <div class="detail-value">12 Total Matches</div>
                </div>
              </div>

              <a href="year_5_open.html" class="enter-button">
                Enter Tournament
              </a>
            </div>

            <!-- EWC 2025 -->
            <div class="tournament-card" @click="goToTournament('ewc_2025.html')">
              <div class="tournament-icon">🏆</div>
              <h3>EWC 2025</h3>
              <div class="tournament-status">Available Now</div>
              
              <p class="tournament-description">
                Experience the prestigious Esports World Cup 2025 featuring 20 elite teams competing in Group A across 10 intense games with diverse maps and strategic legend bans.
              </p>

              <div class="tournament-details">
                <div class="detail-item">
                  <div class="detail-label">Event</div>
                  <div class="detail-value">Esports World Cup</div>
                </div>
                <div class="detail-item">
                  <div class="detail-label">Teams</div>
                  <div class="detail-value">20 Elite Teams</div>
                </div>
              </div>

              <a href="ewc_2025.html" class="enter-button">
                Enter EWC 2025
              </a>
            </div>
          </div>
        </div>
        
        <!-- Carousel Navigation -->
        <div class="carousel-nav">
          <button class="carousel-btn prev" @click="prevSlide">
            <span>‹</span>
          </button>
          <div class="carousel-dots">
            <span class="dot" 
                  v-for="(card, index) in tournaments" 
                  :key="index"
                  :class="{ active: index === currentSlide }"
                  @click="goToSlide(index)"></span>
          </div>
          <button class="carousel-btn next" @click="nextSlide">
            <span>›</span>
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
      message: 'Welcome to ALGS Tournament Dashboard',
      currentSlide: 0,
      tournaments: [
        { name: 'ALGS Year 4 Championship', url: 'year_4_championship.html' },
        { name: 'ALGS Year 5 Open', url: 'year_5_open.html' },
        { name: 'EWC 2025', url: 'ewc_2025.html' }
      ]
    }
  },
  
  mounted() {
    console.log('🎯 IndexApp mounted() called - Vue component is ready')
    this.initializeAnimations()
    this.initializeCarousel()
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
    
    initializeCarousel() {
      // Auto-advance carousel every 8 seconds
      setInterval(() => {
        this.nextSlide()
      }, 8000)
    },
    
    goToTournament(url) {
      window.location.href = url
    },
    
    nextSlide() {
      this.currentSlide = (this.currentSlide + 1) % this.tournaments.length
      this.updateCarousel()
    },
    
    prevSlide() {
      this.currentSlide = this.currentSlide === 0 ? this.tournaments.length - 1 : this.currentSlide - 1
      this.updateCarousel()
    },
    
    goToSlide(index) {
      this.currentSlide = index
      this.updateCarousel()
    },
    
    updateCarousel() {
      const carousel = this.$refs.carousel
      if (carousel) {
        const translateX = -this.currentSlide * 100
        carousel.style.transform = `translateX(${translateX}%)`
      }
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

<!-- No scoped styles needed as the CSS is in index.html --> 