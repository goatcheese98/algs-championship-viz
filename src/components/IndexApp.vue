<template>
  <div id="app">
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
            <router-link to="/tournament/ewc-2025" class="ewc-banner-button">
              <span class="ewc-button-text">View EWC 2025</span>
              <span class="ewc-button-arrow">→</span>
            </router-link>
          </div>
        </div>
      </div>
    </section>

    <main class="dashboard-container">
      <div class="dashboard-title">
        <h2>Tournament Dashboard</h2>
        <p>Explore comprehensive visualizations and analytics for ALGS tournaments worldwide</p>
      </div>

      <div class="carousel-container" @mouseenter="pauseAutoplay" @mouseleave="resumeAutoplay">
        <div class="carousel-wrapper">
          <div class="tournaments-carousel" ref="carousel">
            <div class="tournament-card" v-for="tournament in tournaments" :key="tournament.url" @click="goToTournament(tournament.url)">
              <div class="tournament-icon">{{ tournament.icon }}</div>
              <h3>{{ tournament.name }}</h3>
              <div class="tournament-status">Available Now</div>
              
              <p class="tournament-description">
                {{ tournament.description }}
              </p>

              <div class="tournament-details">
                <div class="detail-item" v-for="detail in tournament.details" :key="detail.label">
                  <div class="detail-label">{{ detail.label }}</div>
                  <div class="detail-value">{{ detail.value }}</div>
                </div>
              </div>

              <router-link :to="'/tournament/' + tournament.url" class="enter-button">
                {{ tournament.buttonText }}
              </router-link>
            </div>
          </div>
        </div>
        
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

    <footer>
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
        { 
          name: 'ALGS Year 4 Championship', 
          url: 'year-4-championship',
          icon: '🏆',
          description: 'Experience the ultimate championship with 40 professional teams competing across 4 days of intense competition in Sapporo, Japan.',
          details: [
            { label: 'Location', value: 'Sapporo, Japan' },
            { label: 'Teams', value: '40 Professionals' }
          ],
          buttonText: 'Enter Championship'
        },
        { 
          name: 'ALGS Year 5 Open', 
          url: 'year-5-open',
          icon: '🌍',
          description: 'Explore the global Year 5 Open tournament featuring 12 intense rounds across Winners Round 1, Winners Round 2, and Elimination Round 1.',
          details: [
            { label: 'Format', value: 'Global Open' },
            { label: 'Rounds', value: '12 Total Matches' }
          ],
          buttonText: 'Enter Tournament'
        },
        { 
          name: 'EWC 2025', 
          url: 'ewc-2025',
          icon: '🏆',
          description: 'Experience the prestigious Esports World Cup 2025 featuring 20 elite teams competing in Group A across 10 intense games with diverse maps and strategic legend bans.',
          details: [
            { label: 'Event', value: 'Esports World Cup' },
            { label: 'Teams', value: '20 Elite Teams' }
          ],
          buttonText: 'Enter EWC 2025'
        }
      ],
      autoplayInterval: null,
      isAutoplaying: true
    }
  },
  
  mounted() {
    console.log('🎯 IndexApp mounted() called - Vue component is ready')
    this.initializeAnimations()
    this.initializeCarousel()
  },

  beforeUnmount() {
    clearInterval(this.autoplayInterval)
  },
  
  methods: {
    initializeAnimations() {
      console.log('🎭 Initializing index page animations...')
      
      if (typeof gsap !== 'undefined') {
        gsap.fromTo('.main-title', {
          y: -30,
          opacity: 0
        }, {
          y: 0,
          opacity: 1,
          duration: 1,
          ease: 'power2.out'
        })
        
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
      this.resumeAutoplay();
    },

    pauseAutoplay() {
      this.isAutoplaying = false;
      clearInterval(this.autoplayInterval);
    },

    resumeAutoplay() {
      this.isAutoplaying = true;
      this.autoplayInterval = setInterval(() => {
        this.nextSlide();
      }, 8000);
    },
    
    goToTournament(tournamentId) {
      this.$router.push(`/tournament/${tournamentId}`)
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
      const carousel = this.$refs.carousel;
      if (!carousel) return;

      if (typeof gsap !== 'undefined') {
        gsap.to(carousel, {
          xPercent: -this.currentSlide * 100,
          duration: 0.8,
          ease: 'power3.inOut'
        });
      } else {
        const translateX = -this.currentSlide * 100;
        carousel.style.transform = `translateX(${translateX}%)`;
      }
    },
    
    openDataManagement() {
      const automationServerUrl = 'http://localhost:3002'
      
      try {
        window.open(automationServerUrl, '_blank')
      } catch (error) {
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