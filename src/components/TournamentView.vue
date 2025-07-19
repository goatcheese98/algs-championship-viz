<template>
  <div id="app">
    
    <header class="tournament-header">
      <div class="header-background">
        <div class="glow-orb glow-orb-1"></div>
        <div class="glow-orb glow-orb-2"></div>
        <div class="glow-orb glow-orb-3"></div>
        <div class="header-grid-pattern"></div>
      </div>
      
      <div class="header-content">
        <div class="header-top">
          <div class="header-branding">
            <div ref="championshipLogo" class="championship-logo">
              <div ref="logoIcon" class="logo-icon apex-logo">
                <svg viewBox="0 0 160 160" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <!-- Ultra-detailed skull gradient -->
                    <radialGradient id="skullMaster" cx="50%" cy="30%" r="50%">
                      <stop offset="0%" style="stop-color:#ffffff;stop-opacity:1" />
                      <stop offset="15%" style="stop-color:#fff2f2;stop-opacity:1" />
                      <stop offset="35%" style="stop-color:#ffd5d5;stop-opacity:1" />
                      <stop offset="55%" style="stop-color:#ff9999;stop-opacity:1" />
                      <stop offset="75%" style="stop-color:#cc4444;stop-opacity:1" />
                      <stop offset="90%" style="stop-color:#992222;stop-opacity:1" />
                      <stop offset="100%" style="stop-color:#440000;stop-opacity:1" />
                    </radialGradient>
                    
                    <!-- Diamond frame gradients -->
                    <linearGradient id="diamondFrame" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" style="stop-color:#ffd5d5;stop-opacity:0.98" />
                      <stop offset="20%" style="stop-color:#ffbbbb;stop-opacity:0.92" />
                      <stop offset="40%" style="stop-color:#ff7777;stop-opacity:0.87" />
                      <stop offset="60%" style="stop-color:#ff4444;stop-opacity:0.82" />
                      <stop offset="80%" style="stop-color:#cc2222;stop-opacity:0.77" />
                      <stop offset="100%" style="stop-color:#881111;stop-opacity:0.72" />
                    </linearGradient>
                    
                    <!-- Enhanced flame gradients -->
                    <radialGradient id="flameHot" cx="50%" cy="85%" r="70%">
                      <stop offset="0%" style="stop-color:#ff2222;stop-opacity:0.95" />
                      <stop offset="25%" style="stop-color:#ff4444;stop-opacity:0.85" />
                      <stop offset="50%" style="stop-color:#ff6666;stop-opacity:0.65" />
                      <stop offset="75%" style="stop-color:#ff9999;stop-opacity:0.45" />
                      <stop offset="100%" style="stop-color:#ffcccc;stop-opacity:0.15" />
                    </radialGradient>
                    
                    <!-- Multi-layer eye glow -->
                    <radialGradient id="eyeCore" cx="50%" cy="45%" r="60%">
                      <stop offset="0%" style="stop-color:#ffffff;stop-opacity:1" />
                      <stop offset="20%" style="stop-color:#ffbbbb;stop-opacity:0.95" />
                      <stop offset="45%" style="stop-color:#ff4444;stop-opacity:0.85" />
                      <stop offset="70%" style="stop-color:#cc2222;stop-opacity:0.7" />
                      <stop offset="90%" style="stop-color:#880000;stop-opacity:0.5" />
                      <stop offset="100%" style="stop-color:#440000;stop-opacity:0.3" />
                    </radialGradient>
                    
                    <!-- Shadow and depth gradients -->
                    <radialGradient id="shadowDepth" cx="50%" cy="60%" r="80%">
                      <stop offset="0%" style="stop-color:#000000;stop-opacity:0.1" />
                      <stop offset="50%" style="stop-color:#330000;stop-opacity:0.4" />
                      <stop offset="100%" style="stop-color:#110000;stop-opacity:0.8" />
                    </radialGradient>
                  </defs>
                  
                  <!-- Ultra-complex outer diamond with crystalline structure -->
                  <path d="M80 5 L130 20 L125 25 L135 30 L128 35 L138 42 L130 47 L140 55 L132 60 L140 68 L130 73 L138 78 L128 85 L135 90 L125 95 L130 100 L115 110 L108 105 L100 115 L92 107 L85 118 L80 110 L75 118 L68 107 L60 115 L52 105 L45 110 L30 100 L35 95 L25 90 L32 85 L22 78 L30 73 L20 68 L28 60 L20 55 L30 47 L22 42 L32 35 L25 30 L35 25 L30 20 L80 5 Z" 
                        fill="url(#diamondFrame)" 
                        stroke="#ff9999" 
                        stroke-width="1.8" 
                        opacity="0.85"/>
                  
                  <!-- Secondary crystalline layer -->
                  <path d="M80 12 L118 25 L113 32 L120 38 L115 45 L122 52 L115 58 L122 65 L115 72 L120 78 L113 85 L118 92 L105 102 L98 97 L90 105 L85 98 L80 108 L75 98 L70 105 L62 97 L55 102 L42 92 L47 85 L40 78 L45 72 L38 65 L45 58 L38 52 L45 45 L40 38 L47 32 L42 25 L80 12 Z" 
                        fill="none" 
                        stroke="url(#diamondFrame)" 
                        stroke-width="1.5" 
                        opacity="0.7"/>
                  
                  <!-- Inner diamond structure -->
                  <path d="M80 22 L110 52 L80 118 L50 52 Z" 
                        fill="url(#shadowDepth)" 
                        stroke="url(#diamondFrame)" 
                        stroke-width="2.2"/>
                  
                  <!-- Tertiary inner diamond -->
                  <path d="M80 30 L95 55 L80 105 L65 55 Z" 
                        fill="none" 
                        stroke="url(#diamondFrame)" 
                        stroke-width="1.2" 
                        opacity="0.6"/>
                  
                  <!-- Central shadow oval for skull -->
                  <ellipse cx="80" cy="65" rx="30" ry="40" 
                           fill="#0d0000" 
                           opacity="0.95"/>
                  
                  <!-- Skull base structure with anatomical accuracy -->
                  <path d="M55 50 Q55 38 65 34 Q75 31 80 30 Q85 31 95 34 Q105 38 105 50 Q105 58 102 63 Q105 68 105 78 Q102 85 95 88 Q90 90 80 92 Q70 90 65 88 Q58 85 55 78 Q55 68 58 63 Q55 58 55 50 Z" 
                        fill="url(#skullMaster)"/>
                  
                  <!-- Left horn structure -->
                  <path d="M58 40 Q52 35 48 28 Q45 22 44 18 Q44 15 46 14 Q48 15 50 18 Q52 22 55 28 Q58 32 60 38" 
                        fill="url(#skullMaster)" 
                        stroke="rgba(204, 68, 68, 0.8)" 
                        stroke-width="1"/>
                  
                  <!-- Right horn structure -->
                  <path d="M102 40 Q108 35 112 28 Q115 22 116 18 Q116 15 114 14 Q112 15 110 18 Q108 22 105 28 Q102 32 100 38" 
                        fill="url(#skullMaster)" 
                        stroke="rgba(204, 68, 68, 0.8)" 
                        stroke-width="1"/>
                  
                  <!-- Horn tips with glow -->
                  <circle cx="46" cy="14" r="1.5" fill="#ff4444" opacity="0.9"/>
                  <circle cx="114" cy="14" r="1.5" fill="#ff4444" opacity="0.9"/>
                  <circle cx="46" cy="14" r="0.8" fill="#ffffff" opacity="0.8"/>
                  <circle cx="114" cy="14" r="0.8" fill="#ffffff" opacity="0.8"/>
                  
                  <!-- Horn ridges for texture -->
                  <path d="M50 32 Q52 30 54 32" fill="none" stroke="rgba(153, 34, 34, 0.6)" stroke-width="0.6"/>
                  <path d="M52 25 Q54 23 56 25" fill="none" stroke="rgba(153, 34, 34, 0.6)" stroke-width="0.6"/>
                  <path d="M106 32 Q108 30 110 32" fill="none" stroke="rgba(153, 34, 34, 0.6)" stroke-width="0.6"/>
                  <path d="M104 25 Q106 23 108 25" fill="none" stroke="rgba(153, 34, 34, 0.6)" stroke-width="0.6"/>
                  
                  <!-- Skull temporal bones -->
                  <path d="M58 45 Q65 42 72 44 Q78 43 88 44 Q95 42 102 45" 
                        fill="none" 
                        stroke="rgba(204, 68, 68, 0.7)" 
                        stroke-width="1.2"/>
                  
                  <!-- Forehead structure -->
                  <path d="M62 40 Q70 38 80 38 Q90 38 98 40" 
                        fill="none" 
                        stroke="rgba(255, 187, 187, 0.6)" 
                        stroke-width="0.8"/>
                  
                  <!-- Eye socket complex structure -->
                  <ellipse cx="68" cy="55" rx="7" ry="9" fill="#000000"/>
                  <ellipse cx="92" cy="55" rx="7" ry="9" fill="#000000"/>
                  
                  <!-- Eye socket depth layers -->
                  <ellipse cx="68" cy="53" rx="5.5" ry="7.5" fill="rgba(51, 0, 0, 0.9)"/>
                  <ellipse cx="92" cy="53" rx="5.5" ry="7.5" fill="rgba(51, 0, 0, 0.9)"/>
                  <ellipse cx="68" cy="52" rx="4" ry="6" fill="rgba(102, 0, 0, 0.8)"/>
                  <ellipse cx="92" cy="52" rx="4" ry="6" fill="rgba(102, 0, 0, 0.8)"/>
                  
                  <!-- Multi-layered glowing eyes -->
                  <circle cx="68" cy="55" r="4" fill="url(#eyeCore)"/>
                  <circle cx="92" cy="55" r="4" fill="url(#eyeCore)"/>
                  <circle cx="68" cy="54" r="3" fill="#ff4444" opacity="0.9"/>
                  <circle cx="92" cy="54" r="3" fill="#ff4444" opacity="0.9"/>
                  <circle cx="68" cy="53" r="2" fill="#ff6666" opacity="0.8"/>
                  <circle cx="92" cy="53" r="2" fill="#ff6666" opacity="0.8"/>
                  <circle cx="68" cy="52" r="1.5" fill="#ffffff"/>
                  <circle cx="92" cy="52" r="1.5" fill="#ffffff"/>
                  <circle cx="68" cy="51.5" r="0.8" fill="#ffffff" opacity="0.9"/>
                  <circle cx="92" cy="51.5" r="0.8" fill="#ffffff" opacity="0.9"/>
                  
                  <!-- Detailed nasal structure -->
                  <path d="M80 60 L76 68 L80 75 L84 68 Z" fill="#000000"/>
                  <path d="M78 65 L82 65" stroke="#222" stroke-width="0.6"/>
                  <path d="M79 68 L81 68" stroke="#333" stroke-width="0.4"/>
                  
                  <!-- Complex jaw and mouth structure -->
                  <path d="M62 75 Q80 85 98 75" 
                        fill="none" 
                        stroke="#000000" 
                        stroke-width="3"/>
                  <path d="M65 78 Q80 83 95 78" 
                        fill="none" 
                        stroke="rgba(51, 0, 0, 0.9)" 
                        stroke-width="2"/>
                  <path d="M68 80 Q80 82 92 80" 
                        fill="none" 
                        stroke="rgba(102, 0, 0, 0.8)" 
                        stroke-width="1.5"/>
                  
                  <!-- Highly detailed teeth with individual characteristics -->
                  <rect x="70" y="80" width="1.8" height="4.5" fill="#ffffff" rx="0.4"/>
                  <rect x="72.5" y="80" width="1.8" height="5.5" fill="#ffffff" rx="0.4"/>
                  <rect x="75" y="80" width="1.8" height="6" fill="#ffffff" rx="0.4"/>
                  <rect x="77.5" y="80" width="2" height="6.5" fill="#ffffff" rx="0.4"/>
                  <rect x="80.5" y="80" width="2" height="6.5" fill="#ffffff" rx="0.4"/>
                  <rect x="83" y="80" width="1.8" height="6" fill="#ffffff" rx="0.4"/>
                  <rect x="85.5" y="80" width="1.8" height="5.5" fill="#ffffff" rx="0.4"/>
                  <rect x="88" y="80" width="1.8" height="4.5" fill="#ffffff" rx="0.4"/>
                  
                  <!-- Ultra-detailed flame structures -->
                  <!-- Left flame cascade -->
                  <path d="M38 38 Q30 30 35 22 Q42 28 48 18 Q52 30 45 40 Q50 48 42 52 Q38 45 42 38 Q35 45 38 38" fill="url(#flameHot)"/>
                  <path d="M28 50 Q20 42 25 34 Q32 40 38 30 Q42 42 35 52 Q40 60 32 64 Q28 57 32 50 Q25 57 28 50" fill="url(#flameHot)"/>
                  <path d="M35 65 Q27 57 32 49 Q39 55 45 45 Q49 57 42 67 Q47 75 39 79 Q35 72 39 65 Q32 72 35 65" fill="url(#flameHot)"/>
                  <path d="M45 80 Q37 72 42 64 Q49 70 55 60 Q59 72 52 82 Q57 90 49 94 Q45 87 49 80 Q42 87 45 80" fill="url(#flameHot)"/>
                  <path d="M32 85 Q24 77 29 69 Q36 75 42 65 Q46 77 39 87 Q44 95 36 99 Q32 92 36 85 Q29 92 32 85" fill="url(#flameHot)"/>
                  
                  <!-- Right flame cascade -->
                  <path d="M122 38 Q130 30 125 22 Q118 28 112 18 Q108 30 115 40 Q110 48 118 52 Q122 45 118 38 Q125 45 122 38" fill="url(#flameHot)"/>
                  <path d="M132 50 Q140 42 135 34 Q128 40 122 30 Q118 42 125 52 Q120 60 128 64 Q132 57 128 50 Q135 57 132 50" fill="url(#flameHot)"/>
                  <path d="M125 65 Q133 57 128 49 Q121 55 115 45 Q111 57 118 67 Q113 75 121 79 Q125 72 121 65 Q128 72 125 65" fill="url(#flameHot)"/>
                  <path d="M115 80 Q123 72 118 64 Q111 70 105 60 Q101 72 108 82 Q103 90 111 94 Q115 87 111 80 Q118 87 115 80" fill="url(#flameHot)"/>
                  <path d="M128 85 Q136 77 131 69 Q124 75 118 65 Q114 77 121 87 Q116 95 124 99 Q128 92 124 85 Q131 92 128 85" fill="url(#flameHot)"/>
                  
                  <!-- Central bottom apex with crystalline detail -->
                  <path d="M80 92 L70 110 L80 118 L90 110 Z" fill="url(#skullMaster)"/>
                  <path d="M80 95 L74 107 L80 113 L86 107 Z" fill="rgba(255, 153, 153, 0.9)"/>
                  <path d="M80 98 L77 104 L80 108 L83 104 Z" fill="rgba(255, 187, 187, 0.8)"/>
                  
                  <!-- Micro flame details -->
                  <circle cx="48" cy="35" r="2.5" fill="url(#flameHot)" opacity="0.7"/>
                  <circle cx="112" cy="35" r="2.5" fill="url(#flameHot)" opacity="0.7"/>
                  <circle cx="42" cy="55" r="2" fill="url(#flameHot)" opacity="0.8"/>
                  <circle cx="118" cy="55" r="2" fill="url(#flameHot)" opacity="0.8"/>
                  <circle cx="45" cy="75" r="1.8" fill="url(#flameHot)" opacity="0.75"/>
                  <circle cx="115" cy="75" r="1.8" fill="url(#flameHot)" opacity="0.75"/>
                  
                  <!-- Inner geometric accents -->
                  <path d="M60 38 L80 28 L100 38" fill="none" stroke="url(#diamondFrame)" stroke-width="1.2" opacity="0.6"/>
                  <path d="M60 82 L80 92 L100 82" fill="none" stroke="url(#diamondFrame)" stroke-width="1.2" opacity="0.6"/>
                  <path d="M52 60 L65 50 L78 60" fill="none" stroke="url(#diamondFrame)" stroke-width="0.8" opacity="0.4"/>
                  <path d="M82 60 L95 50 L108 60" fill="none" stroke="url(#diamondFrame)" stroke-width="0.8" opacity="0.4"/>
                  
                  <!-- Additional crystalline structure details -->
                  <polygon points="80,15 85,22 80,25 75,22" fill="url(#diamondFrame)" opacity="0.5"/>
                  <polygon points="80,95 75,102 80,108 85,102" fill="url(#diamondFrame)" opacity="0.5"/>
                  <polygon points="45,60 52,55 55,65 48,68" fill="url(#diamondFrame)" opacity="0.4"/>
                  <polygon points="115,60 108,55 105,65 112,68" fill="url(#diamondFrame)" opacity="0.4"/>
                </svg>
              </div>
              <div ref="logoParticles" class="logo-particles"></div>
            </div>
            
            <div class="brand-info">
              <div class="brand-subtitle">ALGS Tournament Platform</div>
              <div ref="championshipTitle" class="championship-title">
                <h1 ref="titleMain" class="title-main">
                  {{ isEwc2025Tournament ? '' : (isYear5Tournament ? 'ALGS Year 5 Open' : '') }}
                </h1>
              </div>
            </div>
          </div>

          <div class="header-actions">
            <div class="tournament-status">
              <span class="status-indicator ended"></span>
              <span class="status-text">Tournament Ended</span>
            </div>
            
            <div ref="tournamentInfo" class="tournament-info-inline">
              <div ref="infoItem1" class="info-card">
                <div class="info-icon-container">
                  <span ref="infoIcon1" class="info-icon">
                    {{ isEwc2025Tournament ? '🏆' : (isYear5Tournament ? '🌍' : '📍') }}
                  </span>
                </div>
                <div class="info-content">
                  <div class="info-label">Event</div>
                  <div ref="infoText1" class="info-value">
                    {{ isEwc2025Tournament ? 'Championship Tournament' : (isYear5Tournament ? 'Global Tournament' : 'Sapporo, Japan') }}
                  </div>
                </div>
              </div>

              <div ref="infoItem2" class="info-card">
                <div class="info-icon-container">
                  <span ref="infoIcon2" class="info-icon">📅</span>
                </div>
                <div class="info-content">
                  <div class="info-label">Schedule</div>
                  <div ref="infoText2" class="info-value">
                    {{ isEwc2025Tournament ? 'Day 1 - Group A' : (isYear5Tournament ? 'Split 1 - 2025' : 'Jan 29 - Feb 2, 2025') }}
                  </div>
                </div>
              </div>

              <div ref="infoItem3" class="info-card">
                <div class="info-icon-container">
                  <span ref="infoIcon3" class="info-icon">⚔️</span>
                </div>
                <div class="info-content">
                  <div class="info-label">Format</div>
                  <div ref="infoText3" class="info-value">
                    {{ isEwc2025Tournament ? '20 Teams' : (isYear5Tournament ? '6 Tournament Rounds' : '40 Teams') }}
                  </div>
                </div>
              </div>
            </div>
            
            <nav class="header-nav">
              <router-link to="/" class="nav-link primary">
                <span class="nav-icon">🏠</span>
                <span class="nav-text">Dashboard</span>
              </router-link>
              <router-link v-if="isYear5Tournament" to="/tournament/year-4-championship" class="nav-link">
                <span class="nav-icon">🏆</span>
                <span class="nav-text">Year 4</span>
              </router-link>
              <router-link v-if="isEwc2025Tournament" to="/tournament/year-4-championship" class="nav-link">
                <span class="nav-icon">🏆</span>
                <span class="nav-text">Year 4</span>
              </router-link>
              <router-link v-if="isEwc2025Tournament" to="/tournament/year-5-open" class="nav-link">
                <span class="nav-icon">🌍</span>
                <span class="nav-text">Year 5</span>
              </router-link>
            </nav>
          </div>
        </div>
      </div>
    </header>

    <div class="main-layout bento-grid">
      
      <TournamentSelector
        ref="tournamentSelector"
        :is-year5-tournament="isYear5Tournament"
        :is-ewc2025-tournament="isEwc2025Tournament"
        :loaded-matchups="loadedMatchups"
        :loading-matchups="loadingMatchups"
        style="display: none;"
      />
      
      
      <div class="left-column" :class="{ 'adjust-controls-layout': shouldAdjustControlsLayout }">
        
        <div class="dashboard-panel" :class="{ 'has-collapsed-sections': hasCollapsedSections }">
          
          
          <div class="dashboard-header">
            <div class="dashboard-main">
              <div ref="dashboardTitle" class="dashboard-title-enhanced">
                <span ref="dashboardText" class="dashboard-text">Tournament Dashboard</span>
                <div ref="dashboardGlow" class="dashboard-glow"></div>
              </div>
            </div>
          </div>
          
          
          <div class="dashboard-section">
            <div class="section-header" @click="toggleTournamentDays">
              <div class="section-main">
                <div class="section-icon">
                  <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                    <line x1="16" y1="2" x2="16" y2="6"/>
                    <line x1="8" y1="2" x2="8" y2="6"/>
                    <line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                </div>
                <span class="section-title">Tournament Days</span>
              </div>
              <div class="collapse-icon">
                <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" 
                     :style="{ transform: tournamentDaysCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)' }">
                  <path d="m6 9 6 6 6-6"/>
                </svg>
              </div>
            </div>
            <transition name="slide-down">
              <div v-show="!tournamentDaysCollapsed" class="section-content">
                <div class="day-tabs">
                  <button v-for="day in tournamentDays" 
                          :key="day.id"
                          :class="['day-tab', { active: selectedDay === day.id }]"
                          @click="setDay(day.id)"
                          :title="day.name">
                    {{ day.name }}
                  </button>
                </div>
              </div>
            </transition>
          </div>

          
          <div class="dashboard-section">
            <div class="section-header" @click="toggleMatchups">
              <div class="section-main">
                <div class="section-icon">
                  <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                    <line x1="3" y1="6" x2="21" y2="6"/>
                    <path d="M16 10a4 4 0 0 1-8 0"/>
                  </svg>
                </div>
                <span class="section-title">Matchups</span>
              </div>
              <div class="collapse-icon">
                <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" 
                     :style="{ transform: matchupsCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)' }">
                  <path d="m6 9 6 6 6-6"/>
                </svg>
              </div>
            </div>
            <transition name="slide-down">
              <div v-show="!matchupsCollapsed" class="section-content">
                <div class="matchup-list">
                  <button v-for="matchup in currentDayMatchups" 
                          :key="matchup.id"
                          :class="['matchup-item', { active: selectedMatchup === matchup.id }]"
                          @click="handleMatchupSelect(matchup.id)"
                          :title="matchup.description">
                    <span class="matchup-name">{{ matchup.title }}</span>
                    <span class="matchup-games">{{ matchup.games === 'auto' ? 'Auto' : matchup.games + 'G' }}</span>
                  </button>
                </div>
              </div>
            </transition>
          </div>
          
        </div>
        
        
        <ActionPanel
          v-if="selectedMatchup"
          :current-map="currentMap"
          @export-requested="exportData"
          :key="`action-panel-${selectedDay}-${selectedMatchup}`"
          class="controls-panel-grid"
        />
      </div>
      
      
      <div class="chart-section">
        
        <div class="chart-title-section" v-if="selectedMatchup">
          <div class="chart-title-accent"></div>
          <div class="chart-title-corners"></div>
          <div class="chart-title-container">
            <div class="chart-title-main">
              <h2 class="chart-title">{{ dynamicChartTitle }}</h2>
              <div class="chart-subtitle" v-if="dynamicChartSubtitle">{{ dynamicChartSubtitle }}</div>
            </div>
          </div>
        </div>
        
        <transition name="fade" mode="out-in">
          <div v-if="!selectedMatchup" key="loading" class="no-selection">
          
          <div ref="chartLoadingContainer" class="chart-loading-container">
            
            
            <div ref="centralGlow" class="central-glow"></div>
            
            
            <div class="chart-bars-container">
              <div ref="chartBar1" class="chart-bar chart-bar-1"></div>
              <div ref="chartBar2" class="chart-bar chart-bar-2"></div>
              <div ref="chartBar3" class="chart-bar chart-bar-3"></div>
              <div ref="chartBar4" class="chart-bar chart-bar-4"></div>
              <div ref="chartBar5" class="chart-bar chart-bar-5"></div>
              
              
              <div ref="connectingLine" class="connecting-line"></div>
            </div>
            
            
            <div ref="outerRing" class="outer-ring">
              <div class="ring-circle"></div>
              <div class="ring-dot ring-dot-1"></div>
              <div class="ring-dot ring-dot-2"></div>
            </div>
            
            
            <div ref="innerRing" class="inner-ring">
              <div class="inner-ring-circle"></div>
              <div class="inner-ring-dot"></div>
            </div>
            
            
            <div ref="roamingCircle1" class="roaming-circle roaming-circle-1"></div>
            <div ref="roamingCircle2" class="roaming-circle roaming-circle-2"></div>
            <div ref="roamingCircle3" class="roaming-circle roaming-circle-3"></div>
            <div ref="roamingCircle4" class="roaming-circle roaming-circle-4"></div>
            
            
            <div ref="scanningLine" class="scanning-line"></div>
            
            
            <div class="loading-content">
              <h3 ref="mainHeading" class="loading-heading">
                Select a matchup to view the interactive chart
              </h3>
              <div class="loading-text-container">
                <p ref="subText1" class="loading-text">
                  Choose from the tournament matchups in the side panel to see detailed race charts with game-by-game progression.
                </p>
              </div>
            </div>
            
            
            <div ref="accentLine" class="accent-line"></div>
            
            
            <div class="corner-accent corner-accent-tl"></div>
            <div class="corner-accent corner-accent-tr"></div>
            <div class="corner-accent corner-accent-bl"></div>
            <div class="corner-accent corner-accent-br"></div>
            
            
            <div ref="floatingDot1" class="floating-dot floating-dot-1"></div>
            <div ref="floatingDot2" class="floating-dot floating-dot-2"></div>
            <div ref="floatingDot3" class="floating-dot floating-dot-3"></div>
            <div ref="floatingDot4" class="floating-dot floating-dot-4"></div>
            
          </div>
        </div>

          <div v-else key="chart" class="chart-container">
            <InteractiveRaceChart
              :teamConfig="teamConfig"
            />
            <transition name="fade">
              <div v-if="isLoading" class="loading-overlay">
                <div class="loading-spinner"></div>
              </div>
            </transition>
          </div>
        </transition>
      </div>
    </div>
    
  </div>
</template>

<script>
import { useTeamConfig } from '../composables/useTeamConfig.js'
import TournamentSelector from './TournamentSelector.vue'
import ActionPanel from './ActionPanel.vue'
import InteractiveRaceChart from './InteractiveRaceChart.vue'
import { useTournamentStore } from '../stores/tournament.js'
import { mapActions, mapState } from 'pinia'
import { gsap } from 'gsap'

export default {
  name: 'TournamentView',
  
  components: {
    TournamentSelector,
    ActionPanel,
    InteractiveRaceChart
  },
  
  props: {
    id: {
      type: String,
      required: true
    }
  },
  
  setup() {
    // Initialize team configuration composable
    const teamConfig = useTeamConfig();
    
    // Return for template usage
    return {
      teamConfig
    };
  },
  
  data() {
    console.log('📋 TournamentView data() called - Vue is initializing');
    
    // Detect tournament type from route parameter
    const tournamentId = this.id;
    const isYear5 = tournamentId === 'year-5-open';
    const isEwc2025 = tournamentId === 'ewc-2025';
    
    console.log('🎯 Tournament Detection:', {
      tournamentId,
      isYear5: isYear5,
      isEwc2025: isEwc2025,
      tournamentType: isEwc2025 ? 'ALGS Championship' : (isYear5 ? 'Year 5 Open' : 'Year 4 Championship')
    });
    
    return {
      // Tournament detection
      isYear5Tournament: isYear5,
      isEwc2025Tournament: isEwc2025,

      // Simple UI state (non-data related)
      currentMap: '',
      
      // Status tracking for UI
      loadedMatchups: new Set(),
      loadingMatchups: new Set(),
      
      // Animation intervals
      playInterval: null,
      
      // Game selection state
      selectedGames: [],
      
      
      // Advanced controls state
      advancedControlsExpanded: false,
      
      // Collapsible sections state
      tournamentDaysCollapsed: false,
      matchupsCollapsed: false,
      
      // Debug collision detection
      collisionDebug: {
        dashboardRect: null,
        controlsRect: null,
        horizontalOverlap: false,
        verticallyRelated: false,
        isInOriginalPosition: false,
        shouldAffect: false
      },
      
      // Tournament days data
      tournamentDays: [],
      
      // ResizeObserver for dynamic positioning
      dashboardResizeObserver: null,
      
    }
  },
  
  watch: {
    // Watch for route changes to update tournament type
    '$route'(newRoute, oldRoute) {
      console.log('🔄 Route changed:', { from: oldRoute.params.id, to: newRoute.params.id });
      
      if (newRoute.params.id !== oldRoute.params.id) {
        // Update tournament detection flags
        this.isYear5Tournament = newRoute.params.id === 'year-5-open';
        this.isEwc2025Tournament = newRoute.params.id === 'ewc-2025';
        
        // Set tournament type in store
        const tournamentType = this.isEwc2025Tournament ? 'ewc2025' : 
                               (this.isYear5Tournament ? 'year5' : 'year4');
        this.setTournamentType(tournamentType);
        
        // Re-initialize tournament days data
        this.initializeTournamentDays();
        
        // Clear existing selections
        this.cleanupChart();
        
        console.log('✅ Tournament type updated:', {
          tournamentType,
          isYear5: this.isYear5Tournament,
          isEwc2025: this.isEwc2025Tournament
        });
      }
    },
    
    // Watch for play/pause state changes to handle animation
    isPlaying: {
      handler(newIsPlaying, oldIsPlaying) {
        console.log('🎮 Play state changed:', { from: oldIsPlaying, to: newIsPlaying });
        
        if (newIsPlaying) {
          this.startAnimation();
        } else {
          this.stopAnimation();
        }
      },
      immediate: false
    },
    
    // Watch for matchup changes and fetch data from store
    selectedMatchup(newMatchup, oldMatchup) {
      console.log('📊 TournamentView: selectedMatchup changed:', { from: oldMatchup, to: newMatchup });
      if (newMatchup) {
        this.fetchDataForMatchup();
        this.updateCurrentMap();
        // Note: Controls positioning now handled by CSS Grid layout
      }
    },
    
    selectedDay() {
      this.cleanupChart();
    },
    
    maxGames(newMaxGames, oldMaxGames) {
      if (newMaxGames !== oldMaxGames) {
        console.log('🎮 TournamentView: maxGames changed from', oldMaxGames, 'to', newMaxGames);
      }
    },

    // Watch for data changes to update current map
    processedChartData() {
      this.updateCurrentMap();
    },

    currentGame() {
      this.updateCurrentMap();
    },
    
    // Note: Controls positioning now handled by CSS Grid layout
    tournamentDays() {
      // Grid layout automatically handles positioning
    },

    // Watch for collapse changes to update collision detection
    hasCollapsedSections() {
      // Trigger collision detection when collapse state changes
      this.$nextTick(() => {
        this.isControlsInDashboardLane();
      });
    }
  },
  
  computed: {
    ...mapState(useTournamentStore, [
      'selectedMatchup',
      'selectedDay',
      'isPlaying',
      'currentGame',
      'processedChartData',
      'isLoading',
      'errorMessage',
      'maxGames',
      'isLegendVisible',
      'animationSpeed'
    ]),
    
    currentDayMatchups() {
      const currentDay = this.tournamentDays.find(day => day.id === this.selectedDay);
      return currentDay ? currentDay.matchups : [];
    },
    
    // Dynamic chart title based on tournament day and matchup
    dynamicChartTitle() {
      if (!this.selectedDay || !this.selectedMatchup) return '';
      
      const currentDay = this.tournamentDays.find(day => day.id === this.selectedDay);
      const currentMatchup = this.currentDayMatchups.find(matchup => matchup.id === this.selectedMatchup);
      
      if (!currentDay || !currentMatchup) return '';
      
      // Format: "Day Name - Matchup Title"
      const dayName = currentDay.name;
      const matchupTitle = currentMatchup.title;
      
      return `${dayName} - ${matchupTitle}`;
    },
    
    // Dynamic chart subtitle with additional context
    dynamicChartSubtitle() {
      if (!this.selectedMatchup) return '';
      
      const currentMatchup = this.currentDayMatchups.find(matchup => matchup.id === this.selectedMatchup);
      if (!currentMatchup) return '';
      
      // Show tournament type only
      const tournamentType = this.isEwc2025Tournament ? '' : 
                             (this.isYear5Tournament ? 'ALGS Year 5 Open' : '');
      
      return tournamentType;
    },

    // Check if any sections are collapsed to adjust layout
    hasCollapsedSections() {
      return this.tournamentDaysCollapsed || this.matchupsCollapsed;
    },

    // Check if Controls panel should be affected by collapse (only if in same lane)
    shouldAdjustControlsLayout() {
      if (!this.hasCollapsedSections) return false;
      
      // Check if Controls panel is in its original position or overlapping with dashboard
      return this.isControlsInDashboardLane();
    }
  },
  
  mounted() {
    console.log('🎯 TournamentView mounted() called - Vue component is ready');
    
    // Set tournament type in store based on route
    const tournamentType = this.isEwc2025Tournament ? 'ewc2025' : 
                           (this.isYear5Tournament ? 'year5' : 'year4');
    this.setTournamentType(tournamentType);
    
    // Initialize tournament days data
    this.initializeTournamentDays();
    
    // Auto-load first matchup on initial load
    this.autoLoadFirstMatchup();
    
    // Enable fluid dragging for controls panel
    this.enableControlsDragging();
    
    // Initialize professional header animations with GSAP
    this.initializeHeaderAnimations();
    
    // Initialize dashboard title animations
    this.initializeDashboardAnimations();
    
    // Initialize chart loading animation
    this.initializeChartLoadingAnimation();
    
    
    // Add debug method to global scope for troubleshooting
    window.debugTournamentView = () => {
      console.log('🔍 Tournament View Debug Info:', {
        selectedDay: this.selectedDay,
        selectedMatchup: this.selectedMatchup,
        computedMaxGames: this.maxGames,
        isEwc2025Tournament: this.isEwc2025Tournament,
        tournamentSelector: !!this.$refs.tournamentSelector,
        processedChartData: this.processedChartData?.length || 0
      });
    };
    
    // Filter out browser extension errors
    window.addEventListener('error', (event) => {
      if (event.message.includes('message channel closed') || 
          event.message.includes('listener indicated an asynchronous response')) {
        console.debug('🔧 Filtered browser extension error:', event.message);
        event.preventDefault();
        return false;
      }
    });
    
    window.addEventListener('unhandledrejection', (event) => {
      if (event.reason?.message?.includes('message channel closed') ||
          event.reason?.message?.includes('listener indicated an asynchronous response')) {
        console.debug('🔧 Filtered browser extension promise rejection:', event.reason.message);
        event.preventDefault();
        return false;
      }
    });
  },
  
  methods: {
    ...mapActions(useTournamentStore, [
      'selectMatchup',
      'setPlaying',
      'setCurrentGame',
      'setDay',
      'setTournamentType',
      'fetchDataForMatchup',
      'resetPlayback',
      'toggleLegend',
      'setAnimationSpeed',
      'setGameFilter'
    ]),
    
    // Initialize tournament days data
    initializeTournamentDays() {
      this.tournamentDays = this.isEwc2025Tournament ? [
        {
          id: 'day1',
          name: 'Day 1',
          matchups: [{
            id: 'Day1-A',
            title: 'Group A',
            description: 'Day 1 Group A featuring 20 elite teams',
            games: 'auto'
          }]
        },
        {
          id: 'day2',
          name: 'Day 2',
          matchups: [{
            id: 'Day2-B',
            title: 'Group B',
            description: 'Day 2 Group B featuring 20 elite teams',
            games: 'auto'
          }]
        },
        {
          id: 'day3',
          name: 'Day 3',
          matchups: [{
            id: 'Day3-LastChance',
            title: 'Last Chance',
            description: 'Day 3 Last Chance featuring 20 elite teams',
            games: 'auto'
          }]
        }
      ] : this.isYear5Tournament ? [
        {
          id: 'day1',
          name: 'Day 1 - Winners R1',
          matchups: [
            { id: 'Day1-WinnersRound1-1', title: 'Winners R1 #1', description: 'Year 5 Winners Round 1 #1', games: 6 },
            { id: 'Day1-WinnersRound1-2', title: 'Winners R1 #2', description: 'Year 5 Winners Round 1 #2', games: 6 },
            { id: 'Day1-WinnersRound1-3', title: 'Winners R1 #3', description: 'Year 5 Winners Round 1 #3', games: 6 },
            { id: 'Day1-WinnersRound1-4', title: 'Winners R1 #4', description: 'Year 5 Winners Round 1 #4', games: 6 },
            { id: 'Day1-WinnersRound1-5', title: 'Winners R1 #5', description: 'Year 5 Winners Round 1 #5', games: 6 },
            { id: 'Day1-WinnersRound1-6', title: 'Winners R1 #6', description: 'Year 5 Winners Round 1 #6', games: 6 }
          ]
        }
      ] : [
        {
          id: 'day1',
          name: 'Day 1',
          matchups: [
            { id: 'AvsB', title: 'A vs B', description: 'Group A vs Group B matchup', games: 6 },
            { id: 'CvsD', title: 'C vs D', description: 'Group C vs Group D matchup', games: 6 },
            { id: 'BvsD', title: 'B vs D', description: 'Group B vs Group D matchup', games: 6 }
          ]
        },
        {
          id: 'day2',
          name: 'Day 2',
          matchups: [
            { id: 'AvsC', title: 'A vs C', description: 'Group A vs Group C matchup', games: 6 },
            { id: 'BvsC', title: 'B vs C', description: 'Group B vs Group C matchup', games: 6 },
            { id: 'AvsD', title: 'A vs D', description: 'Group A vs Group D matchup', games: 6 }
          ]
        },
        {
          id: 'day3',
          name: 'Day 3',
          matchups: [
            { id: 'ER1', title: 'Elimination R1', description: 'First elimination round', games: 8 }
          ]
        },
        {
          id: 'day4',
          name: 'Day 4',
          matchups: [
            { id: 'ER2', title: 'Elimination R2', description: 'Second elimination round', games: 8 },
            { id: 'WR1', title: 'Winners R1', description: 'Winners bracket final', games: 8 }
          ]
        }
      ];
    },
    
    
    // Handle matchup selection with proper data fetching
    async handleMatchupSelect(matchupId) {
      console.log('🎯 Handling matchup selection:', matchupId);
      
      try {
        // Clear any existing data first
        this.cleanupChart();
        
        // Select the matchup in the store
        await this.selectMatchup(matchupId);
        
        // Add a small delay to ensure store state is updated
        await this.$nextTick();
        
        // Trigger data fetching for the selected matchup
        await this.fetchDataForMatchup();
        
        console.log('✅ Matchup selection completed:', {
          selectedMatchup: this.selectedMatchup,
          hasData: !!(this.processedChartData && this.processedChartData.length > 0),
          maxGames: this.maxGames
        });
        
      } catch (error) {
        console.error('❌ Error handling matchup selection:', error);
      }
    },
    
    // Auto-load first available matchup
    autoLoadFirstMatchup() {
      console.log('🚀 Auto-loading first matchup...');
      
      // Use nextTick to ensure tournament days are fully initialized
      this.$nextTick(() => {
        if (this.tournamentDays && this.tournamentDays.length > 0) {
          // Get first day
          const firstDay = this.tournamentDays[0];
          console.log('📅 First day found:', firstDay.name);
          
          // Set the day first
          this.setDay(firstDay.id);
          
          // Wait for day to be set, then select first matchup
          this.$nextTick(() => {
            if (firstDay.matchups && firstDay.matchups.length > 0) {
              const firstMatchup = firstDay.matchups[0];
              console.log('⚔️ Auto-selecting first matchup:', firstMatchup.title);
              
              // Use a slight delay to ensure everything is ready
              setTimeout(() => {
                this.handleMatchupSelect(firstMatchup.id);
                // Note: Controls positioning now handled by CSS Grid layout
              }, 100);
            } else {
              console.warn('⚠️ No matchups found in first day');
            }
          });
        } else {
          console.warn('⚠️ No tournament days available for auto-loading');
        }
      });
    },
    
    // Position controls panel below dashboard
    positionControlsPanel() {
      // Use multiple attempts to ensure DOM is fully rendered and positioned
      const attemptPositioning = () => {
        const dashboardPanel = document.querySelector('.dashboard-panel');
        const controlsPanel = document.querySelector('.standalone-controls');
        
        if (dashboardPanel && controlsPanel) {
          // Get dashboard position and dimensions
          const dashboardRect = dashboardPanel.getBoundingClientRect();
          const dashboardHeight = dashboardPanel.offsetHeight;
          const mainLayout = document.querySelector('.main-layout');
          const mainLayoutRect = mainLayout ? mainLayout.getBoundingClientRect() : { left: 0, top: 0 };
          
          // Calculate position directly below dashboard, centered
          const topPosition = dashboardHeight + 48; // 40px (main-layout padding) + 8px gap
          const dashboardLeft = dashboardRect.left - mainLayoutRect.left;
          
          // Force positioning immediately - centered with dashboard
          controlsPanel.style.position = 'absolute';
          controlsPanel.style.top = `${topPosition}px`;
          controlsPanel.style.left = `${dashboardLeft}px`; // Align with dashboard left edge
          controlsPanel.style.width = '280px'; // Match dashboard width exactly
          controlsPanel.style.zIndex = '1000';
          
          console.log('📍 Controls positioned below dashboard (centered):', {
            dashboardHeight,
            dashboardLeft,
            calculatedTop: topPosition,
            dashboardRect: dashboardRect,
            mainLayoutRect: mainLayoutRect
          });
          
          // Set up ResizeObserver to handle dynamic resizing
          if (!this.dashboardResizeObserver) {
            this.dashboardResizeObserver = new ResizeObserver(() => {
              const newDashboardRect = dashboardPanel.getBoundingClientRect();
              const newMainLayoutRect = mainLayout ? mainLayout.getBoundingClientRect() : { left: 0, top: 0 };
              const newDashboardHeight = dashboardPanel.offsetHeight;
              const newTopPosition = newDashboardHeight + 48;
              const newDashboardLeft = newDashboardRect.left - newMainLayoutRect.left;
              
              controlsPanel.style.top = `${newTopPosition}px`;
              controlsPanel.style.left = `${newDashboardLeft}px`;
              
              console.log('📍 Controls repositioned on resize:', {
                top: newTopPosition,
                left: newDashboardLeft
              });
            });
            this.dashboardResizeObserver.observe(dashboardPanel);
          }
          
          return true; // Successfully positioned
        }
        return false; // Failed to position
      };
      
      // Try positioning immediately
      if (!attemptPositioning()) {
        // If immediate positioning fails, try again after a short delay
        setTimeout(() => {
          if (!attemptPositioning()) {
            // Final attempt after DOM is definitely ready
            setTimeout(attemptPositioning, 200);
          }
        }, 50);
      }
    },
    
    // Enable fluid dragging for controls panel
    enableControlsDragging() {
      // Wait for controls panel to be rendered
      this.$nextTick(() => {
        const controlsPanel = document.querySelector('.controls-panel-grid');
        
        if (controlsPanel && typeof gsap !== 'undefined' && gsap.plugins.Draggable) {
          // Create highly fluid draggable instance
          gsap.registerPlugin(Draggable);
          
          Draggable.create(controlsPanel, {
            type: "x,y",
            edgeResistance: 0.1,
            inertia: true,
            autoScroll: 1,
            minimumMovement: 2,
            // Extremely smooth movement settings
            dragResistance: 0,
            throwResistance: 200,
            maxDuration: 0.8,
            // Bounds to keep it within viewport
            bounds: window,
            // Smooth cursor changes
            onDragStart: function() {
              gsap.set(controlsPanel, { scale: 1.02, rotationZ: 0.01 });
            },
            onDrag: function() {
              // Smooth real-time updates
              gsap.set(controlsPanel, { 
                force3D: true,
                transformOrigin: "center center"
              });
            },
            onDragEnd: function() {
              gsap.to(controlsPanel, {
                scale: 1,
                rotationZ: 0,
                duration: 0.3,
                ease: "power2.out"
              });
            }
          });
          
          console.log('✅ Fluid dragging enabled for controls panel');
        }
      });
    },
    
    // Professional Championship Header Animations
    initializeHeaderAnimations() {
      console.log('🎭 Initializing sophisticated header animations...');
      
      // Check if GSAP is available
      if (typeof gsap === 'undefined') {
        console.warn('⚠️ GSAP not available - header animations disabled');
        return;
      }
      
      // Wait for DOM to be ready
      this.$nextTick(() => {
        // Check if refs exist before animating
        const elementsToAnimate = [
          this.$refs.championshipLogo,
          this.$refs.championshipTitle,
          this.$refs.tournamentInfo
        ].filter(Boolean);
        
        if (elementsToAnimate.length === 0) {
          console.warn('⚠️ Header animation refs not found - skipping animations');
          return;
        }
        
        // Set initial states for elements that will be animated
        gsap.set(elementsToAnimate, {
          opacity: 0,
          y: 30,
          scale: 0.9
        });
        
        // Set specific states for individual info items (check if they exist)
        const infoItems = [
          this.$refs.infoItem1,
          this.$refs.infoItem2,
          this.$refs.infoItem3
        ].filter(Boolean);
        
        if (infoItems.length > 0) {
          gsap.set(infoItems, {
            opacity: 0,
            x: -20,
            scale: 0.95
          });
        }
        
        // Create simplified master timeline
        const masterTimeline = gsap.timeline();
        
        // 1. Championship Logo animation
        if (this.$refs.championshipLogo) {
          masterTimeline.to(this.$refs.championshipLogo, {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.8,
            ease: 'back.out(1.7)'
          });
        }
        
        // 2. Championship Title animation
        if (this.$refs.championshipTitle) {
          masterTimeline.to(this.$refs.championshipTitle, {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.6,
            ease: 'power2.out'
          }, '-=0.4');
        }
        
        // 3. Tournament Info animation
        if (this.$refs.tournamentInfo) {
          masterTimeline.to(this.$refs.tournamentInfo, {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.6,
            ease: 'power2.out'
          }, '-=0.3');
        }
        
        // 4. Individual info items animation
        if (infoItems.length > 0) {
          masterTimeline.to(infoItems, {
            opacity: 1,
            x: 0,
            scale: 1,
            duration: 0.5,
            ease: 'power2.out',
            stagger: 0.1
          }, '-=0.3');
        }
        
        // 5. Setup continuous animations
        this.setupContinuousAnimations();
      });
    },
    
    setupContinuousAnimations() {
      // Only animate elements that exist
      if (this.$refs.logoIcon) {
        // Continuous logo glow effect
        gsap.to(this.$refs.logoIcon, {
          textShadow: '0 0 20px rgba(255, 215, 0, 0.8), 0 0 40px rgba(255, 215, 0, 0.6)',
          duration: 2,
          ease: 'power2.inOut',
          yoyo: true,
          repeat: -1
        });
      }
      
      // Subtle floating animation for info items (only if they exist)
      const infoItems = [
        this.$refs.infoItem1,
        this.$refs.infoItem2,
        this.$refs.infoItem3
      ].filter(Boolean);
      
      if (infoItems.length > 0) {
        gsap.to(infoItems, {
          y: -2,
          duration: 3,
          ease: 'power2.inOut',
          yoyo: true,
          repeat: -1,
          stagger: 0.5
        });
      }
      
      // Particle animation for logo (only if it exists)
      if (this.$refs.logoParticles) {
        gsap.to(this.$refs.logoParticles, {
          opacity: 0.7,
          scale: 1.1,
          duration: 1.5,
          ease: 'power2.inOut',
          yoyo: true,
          repeat: -1
        });
      }
    },

    // Dashboard Title Animations
    initializeDashboardAnimations() {
      console.log('🎮 Initializing dashboard title animations...');
      
      // Check if GSAP is available
      if (typeof gsap === 'undefined') {
        console.warn('⚠️ GSAP not available - dashboard animations disabled');
        return;
      }
      
      // Set initial state for dashboard title
      gsap.set(this.$refs.dashboardTitle, {
        opacity: 0,
        scale: 0.8,
        rotationX: -15,
        filter: 'blur(3px)'
      });
      
      gsap.set(this.$refs.dashboardText, {
        opacity: 0,
        y: 20,
        backgroundPosition: '-200% center'
      });
      
      gsap.set(this.$refs.dashboardGlow, {
        opacity: 0,
        scale: 0
      });
      
      // Create dashboard animation timeline
      const dashboardTimeline = gsap.timeline({ delay: 0.8 });
      
      // Animate dashboard container
      dashboardTimeline
        .to(this.$refs.dashboardTitle, {
          opacity: 1,
          scale: 1,
          rotationX: 0,
          filter: 'blur(0px)',
          duration: 1,
          ease: 'back.out(1.7)'
        })
        .to(this.$refs.dashboardText, {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'power3.out'
        }, '-=0.5')
        .to(this.$refs.dashboardText, {
          backgroundPosition: '200% center',
          duration: 2,
          ease: 'power2.inOut'
        }, '-=0.3')
        .to(this.$refs.dashboardGlow, {
          opacity: 0.6,
          scale: 1,
          duration: 0.6,
          ease: 'power2.out'
        }, '-=1');
      
      // Setup continuous dashboard effects
      this.setupDashboardContinuousEffects();
    },
    
    setupDashboardContinuousEffects() {
      // Continuous glow pulse
      gsap.to(this.$refs.dashboardGlow, {
        opacity: 0.3,
        scale: 1.1,
        duration: 2,
        ease: 'power2.inOut',
        yoyo: true,
        repeat: -1
      });
      
      // Subtle text shimmer effect
      gsap.to(this.$refs.dashboardText, {
        textShadow: '0 0 10px rgba(220, 38, 38, 0.8), 0 0 20px rgba(245, 158, 11, 0.4)',
        duration: 3,
        ease: 'power2.inOut',
        yoyo: true,
        repeat: -1
      });
    },

    // Vue.js + GSAP Chart Loading Animation
    initializeChartLoadingAnimation() {
      console.log('📊 Initializing chart loading animations...');
      
      // Check if GSAP is available
      if (typeof gsap === 'undefined') {
        console.warn('⚠️ GSAP not available - chart loading animations disabled');
        return;
      }
      
      // Wait for refs to be available
      this.$nextTick(() => {
        // Central glow pulsing animation - optimized for performance
        if (this.$refs.centralGlow) {
          gsap.to(this.$refs.centralGlow, {
            scale: 1.125,
            duration: 3,
            ease: "power1.inOut",
            repeat: -1,
            yoyo: true,
            force3D: true
          });
        }
        
        // Chart bars animation - optimized with transform3d
        const chartBars = [
          this.$refs.chartBar1,
          this.$refs.chartBar2,
          this.$refs.chartBar3,
          this.$refs.chartBar4,
          this.$refs.chartBar5
        ].filter(Boolean);
        
        if (chartBars.length > 0) {
          chartBars.forEach((bar, index) => {
            const originalHeight = parseInt(getComputedStyle(bar).height);
            const animationHeight = originalHeight * 1.8; // Increased amplitude
            
            gsap.to(bar, {
              scaleY: 1.8,
              duration: 1.0 + (index * 0.15), // Faster, more varied timing
              ease: "power2.inOut",
              repeat: -1,
              yoyo: true,
              delay: index * 0.08,
              force3D: true,
              transformOrigin: "bottom"
            });
          });
        }
        
        // Connecting line opacity animation
        if (this.$refs.connectingLine) {
          gsap.to(this.$refs.connectingLine, {
            opacity: 0.9,
            duration: 2.5,
            ease: "power1.inOut",
            repeat: -1,
            yoyo: true
          });
        }
        
        // Outer ring rotation - optimized
        if (this.$refs.outerRing) {
          gsap.to(this.$refs.outerRing, {
            rotation: 360,
            duration: 20,
            ease: "none",
            repeat: -1,
            force3D: true,
            transformOrigin: "center"
          });
        }
        
        // Inner ring rotation - counter-clockwise
        if (this.$refs.innerRing) {
          gsap.to(this.$refs.innerRing, {
            rotation: -360,
            duration: 15,
            ease: "none",
            repeat: -1,
            force3D: true,
            transformOrigin: "center"
          });
        }
        
        // Roaming circles animation - smooth orbital movement
        const roamingCircles = [
          this.$refs.roamingCircle1,
          this.$refs.roamingCircle2,
          this.$refs.roamingCircle3,
          this.$refs.roamingCircle4
        ].filter(Boolean);
        
        if (roamingCircles.length > 0) {
          roamingCircles.forEach((circle, index) => {
            // Create orbital movement patterns
            const radius = 80 + (index * 15);
            const duration = 8 + (index * 2);
            const offset = (index * 90); // Distribute around circle
            
            gsap.to(circle, {
              rotation: 360,
              duration: duration,
              ease: "none",
              repeat: -1,
              force3D: true,
              transformOrigin: `${radius}px center`,
              delay: offset / 360 * duration
            });
          });
        }
        
        // Scanning line animation - vertical movement
        if (this.$refs.scanningLine) {
          gsap.to(this.$refs.scanningLine, {
            y: "100vh",
            duration: 8,
            ease: "power1.inOut",
            repeat: -1,
            yoyo: true,
            force3D: true
          });
        }
        
        // Text content fade in animation - staggered for better alignment
        const textElements = [
          this.$refs.mainHeading,
          this.$refs.subText1
        ].filter(Boolean);
        
        if (textElements.length > 0) {
          gsap.set(textElements, {
            opacity: 0,
            y: 30,
            force3D: true
          });
          
          gsap.to(textElements, {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: "power2.out",
            stagger: 0.15,
            delay: 0.5,
            force3D: true
          });
        }
        
        // Accent line pulsing - enhanced
        if (this.$refs.accentLine) {
          gsap.to(this.$refs.accentLine, {
            opacity: 0.8,
            scaleX: 1.2,
            duration: 3,
            ease: "power1.inOut",
            repeat: -1,
            yoyo: true,
            force3D: true
          });
        }
        
        // Floating dots pulsing animation - improved performance
        const floatingDots = [
          this.$refs.floatingDot1,
          this.$refs.floatingDot2,
          this.$refs.floatingDot3,
          this.$refs.floatingDot4
        ].filter(Boolean);
        
        if (floatingDots.length > 0) {
          floatingDots.forEach((dot, index) => {
            gsap.to(dot, {
              opacity: 0.9,
              scale: 1.8,
              duration: 1.2 + (index * 0.25),
              ease: "power2.inOut",
              repeat: -1,
              yoyo: true,
              delay: index * 0.4,
              force3D: true
            });
          });
        }
        
        console.log('✨ Chart loading animations initialized successfully!');
      });
    },
    
    
    
    updateCurrentMap() {
      // Get map name from chart data based on current game
      if (this.currentGame === 0) {
        this.currentMap = 'Initial State';
      } else if (this.processedChartData && this.processedChartData.length > 0) {
        const firstTeam = this.processedChartData[0];
        if (firstTeam && firstTeam.games) {
          const currentGameData = firstTeam.games.find(game => game.gameNumber === this.currentGame);
          if (currentGameData && currentGameData.map) {
            this.currentMap = `Game ${this.currentGame} - ${currentGameData.map}`;
          } else {
            this.currentMap = `Game ${this.currentGame}`;
          }
        } else {
          this.currentMap = `Game ${this.currentGame}`;
          }
      } else {
        this.currentMap = `Game ${this.currentGame}`;
      }
    },

    async cleanupChart() {
      console.log('🧹 TournamentView: Cleaning up chart resources');
      
      try {
        // Reset UI state (data clearing is handled by the store)
        this.setCurrentGame(0);
        this.currentMap = '';
        this.setPlaying(false);
        
        // Stop any ongoing animation
        this.stopAnimation();
        
        console.log('✅ Chart cleanup completed successfully');
      } catch (error) {
        console.warn('⚠️ Error during chart cleanup:', error);
      }
    },
    
    // Add new methods for side panel game controls
    updateGameFromSlider(event) {
      const gameValue = Math.min(Math.max(0, parseInt(event.target.value)), this.maxGames);
      this.setCurrentGame(gameValue);
    },
    
    selectGame(gameNum) {
      // Set the current game to the selected game
      this.setCurrentGame(gameNum);
    },
    
    // Combined game click handler - jump to game or toggle filter
    handleGameClick(gameNum, event) {
      console.log('🎮 Game button clicked:', { gameNum, shiftKey: event?.shiftKey });
      
      if (event && event.shiftKey) {
        // Shift+click to toggle filter
        console.log('🎯 Toggling filter for game:', gameNum);
        this.toggleGameFilter(gameNum);
      } else {
        // Regular click to jump to game
        console.log('🎮 Jumping to game:', gameNum);
        this.selectGame(gameNum);
      }
    },
    
    togglePlayback() {
      this.setPlaying(!this.isPlaying);
    },
    
    restart() {
      this.resetPlayback();
    },
    
    getGameButtonStyle(gameNum) {
      const isActive = this.currentGame === gameNum;
      
      // Get map color for this game from chart data
      let gameColor = '#6366f1'; // default fallback
      
      if (this.processedChartData && this.processedChartData.length > 0) {
        const firstTeam = this.processedChartData[0];
        if (firstTeam && firstTeam.games) {
          const gameData = firstTeam.games.find(game => game.gameNumber === gameNum);
          if (gameData && gameData.color) {
            gameColor = gameData.color;
          }
        }
      }
      
      return {
        background: `linear-gradient(135deg, ${gameColor} 0%, ${this.adjustColor(gameColor, -10)} 100%)`,
        border: `2px solid ${gameColor}`,
        color: '#ffffff',
        boxShadow: isActive ? `0 0 8px ${gameColor}60, 0 2px 4px rgba(0,0,0,0.3)` : 'none',
        transform: isActive ? 'scale(1.05)' : 'scale(1)'
      };
    },
    
    // Circular game style with highlighting for current, filtered, and passed games
    getCircularGameStyle(gameNum) {
      const isCurrent = this.currentGame === gameNum;
      const isFiltered = this.selectedGames.includes(gameNum);
      const isPassed = gameNum < this.currentGame;
      
      // Get map color for this game from chart data
      let gameColor = '#6366f1'; // default fallback
      
      if (this.processedChartData && this.processedChartData.length > 0) {
        const firstTeam = this.processedChartData[0];
        if (firstTeam && firstTeam.games) {
          const gameData = firstTeam.games.find(game => game.gameNumber === gameNum);
          if (gameData && gameData.color) {
            gameColor = gameData.color;
          }
        }
      }
      
      // Base styles
      let baseStyles = {
        background: `linear-gradient(135deg, ${gameColor} 0%, ${this.adjustColor(gameColor, -10)} 100%)`,
        border: `2px solid ${gameColor}`,
        color: '#ffffff'
      };
      
      // Filtered games - unique visual style with inner glow
      if (isFiltered) {
        baseStyles.background = `radial-gradient(circle at center, ${gameColor} 0%, ${this.adjustColor(gameColor, -20)} 70%, ${this.adjustColor(gameColor, -40)} 100%)`;
        baseStyles.border = `3px solid ${gameColor}`;
        baseStyles.boxShadow = `inset 0 0 12px ${this.adjustColor(gameColor, 30)}, 0 0 16px ${gameColor}60`;
        baseStyles.transform = 'scale(1.05)';
        baseStyles.position = 'relative';
      }
      // Current game highlighting (only if not filtered)
      else if (isCurrent) {
        baseStyles.boxShadow = `0 0 12px ${gameColor}80, 0 0 24px ${gameColor}40`;
        baseStyles.transform = 'scale(1.15)';
        baseStyles.zIndex = '10';
      }
      // Passed games highlighting
      else if (isPassed) {
        baseStyles.opacity = '0.7';
        baseStyles.background = `linear-gradient(135deg, ${this.adjustColor(gameColor, -20)} 0%, ${this.adjustColor(gameColor, -30)} 100%)`;
        baseStyles.border = `2px solid ${this.adjustColor(gameColor, -15)}`;
      }
      // Future games (default state)
      else {
        baseStyles.opacity = '0.6';
        baseStyles.background = `linear-gradient(135deg, ${this.adjustColor(gameColor, -40)} 0%, ${this.adjustColor(gameColor, -50)} 100%)`;
        baseStyles.border = `2px solid ${this.adjustColor(gameColor, -35)}`;
      }
      
      return baseStyles;
    },
    
    adjustColor(hexColor, percent) {
      // Simple color adjustment utility
      if (!hexColor || typeof hexColor !== 'string' || !hexColor.startsWith('#')) {
        return hexColor || '#dc2626';
      }
      
      const num = parseInt(hexColor.slice(1), 16);
      const amt = Math.round(2.55 * percent);
      const R = (num >> 16) + amt;
      const G = (num >> 8 & 0x00FF) + amt;
      const B = (num & 0x0000FF) + amt;
      
      return `#${(0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
        (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
        (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1)}`;
    },
    
    // Smart grid layout based on number of games
    getGridStyle() {
      const totalGames = this.maxGames || 0;
      if (totalGames === 0) return {};
      
      // Calculate optimal rows and columns
      const cols = Math.ceil(Math.sqrt(totalGames));
      const rows = Math.ceil(totalGames / cols);
      
      return {
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        gridTemplateRows: `repeat(${rows}, 1fr)`,
        gap: '6px'
      };
    },
    
    // Get current tournament display text
    getCurrentTournamentText() {
      if (!this.selectedMatchup) return '';
      
      // Get matchup info from tournament selector
      const matchupInfo = this.$refs.tournamentSelector?.getMatchupInfo(this.selectedMatchup);
      if (!matchupInfo) return '';
      
      // Format based on tournament type
      if (this.isEwc2025Tournament) {
        if (this.selectedMatchup.includes('Day1')) return 'T1 Group A';
        if (this.selectedMatchup.includes('Day2')) return 'T2 Group B';
        if (this.selectedMatchup.includes('Day3')) return 'T3 Last Chance';
      } else if (this.isYear5Tournament) {
        return 'T1 Winners R1';
      } else {
        // Year 4 tournament
        if (this.selectedMatchup.includes('ER1')) return 'T3 Elimination R1';
        if (this.selectedMatchup.includes('ER2')) return 'T4 Elimination R2';
        if (this.selectedMatchup.includes('WR1')) return 'T4 Winners R1';
        if (this.selectedDay === 'day1') return 'T1 Group Stage';
        if (this.selectedDay === 'day2') return 'T2 Cross Groups';
      }
      
      return 'Tournament';
    },
    
    // Game filter methods
    async toggleGameFilter(gameNum) {
      const wasSelected = this.selectedGames.includes(gameNum);
      
      if (wasSelected) {
        // If already selected, toggle it off
        this.selectedGames.splice(this.selectedGames.indexOf(gameNum), 1);
        console.log(`🎮 Removed game ${gameNum} from filter. Selected: [${this.selectedGames.join(', ')}]`);
      } else {
        // If not selected, add it to the selection (allow multiple)
        this.selectedGames.push(gameNum);
        console.log(`🎮 Added game ${gameNum} to filter. Selected: [${this.selectedGames.join(', ')}]`);
        
        // Auto-progress to max level when any filter is selected
        if (this.currentGame < this.maxGames) {
          console.log(`🎯 Auto-progressing to game ${this.maxGames} for filtering`);
          this.setCurrentGame(this.maxGames);
        }
      }
      
      // Call the store action
      this.setGameFilter({ 
        games: this.selectedGames, 
        action: wasSelected ? 'remove' : 'add',
        gameNum,
        maxGames: this.maxGames
      });
    },
    
    resetGameFilter() {
      console.log('🔄 Resetting game filter and returning to initial state');
      this.selectedGames = [];
      
      this.setGameFilter({ games: [], action: 'clear', maxGames: this.maxGames });
      this.setCurrentGame(0); // Also reset game progress
    },
    
    getGameTooltip(gameNum) {
      // Get map name from chart data if available
      let mapName = '';
      
      if (this.processedChartData && this.processedChartData.length > 0) {
        const firstTeam = this.processedChartData[0];
        if (firstTeam && firstTeam.games) {
          const gameData = firstTeam.games.find(game => game.gameNumber === gameNum);
          if (gameData && gameData.map) {
            mapName = ` - ${gameData.map}`;
          }
        }
      }
      
      return `Game ${gameNum}${mapName}`;
    },
    
    getCurrentMapStyle() {
      let mapColor = '#10b981'; // default fallback
      
      // Get map color for current game from chart data
      if (this.processedChartData && this.processedChartData.length > 0 && this.currentGame > 0) {
        const firstTeam = this.processedChartData[0];
        if (firstTeam && firstTeam.games) {
          const currentGameData = firstTeam.games.find(game => game.gameNumber === this.currentGame);
          if (currentGameData && currentGameData.color) {
            mapColor = currentGameData.color;
          }
        }
      }
      
      return {
        background: `linear-gradient(135deg, ${mapColor} 0%, ${this.adjustColor(mapColor, -20)} 100%)`,
        border: `2px solid ${mapColor}`,
        color: '#ffffff',
        boxShadow: `0 0 15px ${mapColor}60, 0 4px 8px rgba(0,0,0,0.3)`
      };
    },
    
    // Advanced controls toggle
    toggleAdvancedControls() {
      this.advancedControlsExpanded = !this.advancedControlsExpanded;
    },

    // Collapsible sections toggle
    toggleTournamentDays() {
      this.tournamentDaysCollapsed = !this.tournamentDaysCollapsed;
    },

    toggleMatchups() {
      this.matchupsCollapsed = !this.matchupsCollapsed;
    },

    // Check if Controls panel is in the same lane as Dashboard
    isControlsInDashboardLane() {
      try {
        const dashboardPanel = document.querySelector('.dashboard-panel');
        const controlsPanel = document.querySelector('.enhanced-action-panel, .controls-panel-grid');
        
        if (!dashboardPanel || !controlsPanel) {
          this.collisionDebug = {
            ...this.collisionDebug,
            panelsFound: false,
            reason: 'Missing DOM elements - Dashboard or Controls panel not found'
          };
          console.log('🔍 Collision Check: Missing panels', { 
            dashboardPanel: !!dashboardPanel, 
            controlsPanel: !!controlsPanel 
          });
          return true; // Default to safe behavior
        }

        const dashboardRect = dashboardPanel.getBoundingClientRect();
        const controlsRect = controlsPanel.getBoundingClientRect();
        
        // Check horizontal overlap - stricter detection
        const horizontalOverlap = !(controlsRect.right < dashboardRect.left - 20 || controlsRect.left > dashboardRect.right + 20);
        
        // Check if controls are vertically related (roughly same area or below) 
        const verticallyRelated = controlsRect.top >= dashboardRect.top - 100; // More tolerance
        
        // Check if controls are in original position (left side of screen) - more specific
        const isInOriginalPosition = controlsRect.left < (window.innerWidth * 0.4); // Controls should be in left 40% of screen
        
        // Additional check: Controls panel should be relatively close to dashboard
        const isNearDashboard = Math.abs(controlsRect.left - dashboardRect.left) < 100;
        
        const shouldAdjust = horizontalOverlap && verticallyRelated && isInOriginalPosition && isNearDashboard;
        
        // Update debug data with comprehensive information
        this.collisionDebug = {
          panelsFound: true,
          dashboard: {
            left: Math.round(dashboardRect.left),
            right: Math.round(dashboardRect.right),
            top: Math.round(dashboardRect.top),
            bottom: Math.round(dashboardRect.bottom),
            width: Math.round(dashboardRect.width),
            height: Math.round(dashboardRect.height)
          },
          controls: {
            left: Math.round(controlsRect.left),
            right: Math.round(controlsRect.right),
            top: Math.round(controlsRect.top),
            bottom: Math.round(controlsRect.bottom),
            width: Math.round(controlsRect.width),
            height: Math.round(controlsRect.height)
          },
          analysis: {
            horizontalOverlap,
            verticallyRelated,
            isInOriginalPosition,
            isNearDashboard,
            windowWidth: window.innerWidth,
            shouldAdjust
          },
          reason: shouldAdjust ? 
            'Controls panel is spatially related to Dashboard' : 
            `Controls panel is not spatially related: ${!horizontalOverlap ? 'no horizontal overlap' : ''} ${!verticallyRelated ? 'not vertically related' : ''} ${!isInOriginalPosition ? 'not in original position' : ''} ${!isNearDashboard ? 'not near dashboard' : ''}`.trim()
        };
        
        // Enhanced console logging with visual indicators
        console.log('🔍 COLLISION DETECTION REPORT:');
        console.log('📊 Panel Positions:', {
          dashboard: this.collisionDebug.dashboard,
          controls: this.collisionDebug.controls
        });
        console.log('🧠 Analysis:', this.collisionDebug.analysis);
        console.log(`💡 Decision: ${shouldAdjust ? '✅ APPLY LAYOUT ADJUSTMENT' : '❌ NO LAYOUT ADJUSTMENT'}`);
        console.log(`📝 Reason: ${this.collisionDebug.reason}`);
        
        return shouldAdjust;
      } catch (error) {
        console.error('❌ Collision detection error:', error);
        this.collisionDebug = {
          panelsFound: false,
          error: error.message,
          reason: 'Error occurred during collision detection'
        };
        return true; // Default to safe behavior
      }
    },
    
    // Export data handler
    exportData() {
      if (this.processedChartData && this.processedChartData.length > 0) {
        const selectedMatchup = this.selectedMatchup;
        
        // Generate CSV content from processed chart data
        const csvContent = this.generateCSVContent(this.processedChartData, selectedMatchup);
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `${selectedMatchup}_export.csv`;
        a.click();
        
        URL.revokeObjectURL(url);
      } else {
        console.warn('⚠️ No chart data available for export');
      }
    },

    handleExportRequested(selectedMatchup) {
      console.log('📤 Export requested for:', selectedMatchup);
      
      if (this.processedChartData && this.processedChartData.length > 0) {
        // Generate CSV content from processed chart data
        const csvContent = this.generateCSVContent(this.processedChartData, selectedMatchup);
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `${selectedMatchup}_export.csv`;
        a.click();
        
        URL.revokeObjectURL(url);
      } else {
        console.warn('⚠️ No chart data available for export');
      }
    },

    startAnimation() {
      console.log('🎬 Starting animation from game', this.currentGame);
      
      // Clear any existing animation
      this.stopAnimation();
        
      // If we're at the end, restart from game 1
      if (this.currentGame >= this.maxGames) {
        this.setCurrentGame(1);
      } else if (this.currentGame === 0) {
        // If at initial state, start from game 1
        this.setCurrentGame(1);
      }
      
      // Start the animation interval
      this.playInterval = setInterval(() => {
        if (this.currentGame < this.maxGames) {
          this.setCurrentGame(this.currentGame + 1);
        this.updateCurrentMap();
          console.log('🎮 Animation progressed to game', this.currentGame);
        } else {
          // Reached the end, stop playing
          console.log('🏁 Animation completed');
          this.setPlaying(false); // Use the action to update the store
        }
      }, 3000); // 3 seconds per game - adjust speed as needed
    },

    generateCSVContent(data, matchupName) {
      if (!data || data.length === 0) return '';
      
      // Create CSV header
      const maxGames = Math.max(...data.map(team => team.games?.length || 0));
      const headers = ['Team', 'Total Points'];
      for (let i = 1; i <= maxGames; i++) {
        headers.push(`Game ${i} Points`, `Game ${i} Map`);
        }
        
      // Create CSV rows
      const rows = [headers.join(',')];
      
      data.forEach(team => {
        const row = [team.team];
        
        // Calculate total points
        const totalPoints = team.games?.reduce((sum, game) => sum + (game.points || 0), 0) || 0;
        row.push(totalPoints);
        
        // Add game-by-game data
        for (let i = 1; i <= maxGames; i++) {
          const game = team.games?.find(g => g.gameNumber === i);
          row.push(game?.points || 0);
          row.push(game?.map || '');
        }
        
        rows.push(row.join(','));
      });
      
      return rows.join('\n');
    }
  },
  
  beforeUnmount() {
    console.log('🧹 TournamentView beforeUnmount() called - cleaning up');
    
    
    // Stop any ongoing animation
    this.stopAnimation();
    
    
    
    
    // Clean up chart
    this.cleanupChart();
    
    // Clean up ResizeObserver
    if (this.dashboardResizeObserver) {
      this.dashboardResizeObserver.disconnect();
      this.dashboardResizeObserver = null;
    }
  },
  
  stopAnimation() {
    if (this.animationInterval) {
      clearInterval(this.animationInterval);
      this.animationInterval = null;
    }
    this.setPlaying(false);
  },
  
}
</script>

 