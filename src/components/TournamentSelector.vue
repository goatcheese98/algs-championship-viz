<template>
  <div class="tournament-overview">
    <div class="overview-header">
      <h1 class="overview-title">Tournament Overview</h1>
      <div class="day-selector">
        <button 
          v-for="day in tournamentDays" 
          :key="day.id"
          :class="['day-tab', { active: selectedDay === day.id }]"
          @click="setDay(day.id)"
        >
          {{ day.name }}
        </button>
      </div>
    </div>

    <transition name="fade" mode="out-in">
      <div :key="selectedDay" class="day-content active">
        <p style="color: #cbd5e1; margin-bottom: 20px;">{{ currentDayInfo.description }}</p>
        
        <div class="matchups-grid">
          <div 
            v-for="matchup in currentDayMatchups" 
            :key="matchup.id"
            :class="['matchup-card', { selected: selectedMatchup === matchup.id }]"
            @click="selectMatchup(matchup.id)"
          >
            <div class="matchup-header">
              <h3 class="matchup-title">{{ matchup.title }}</h3>
              <span :class="['matchup-status', getStatusClass(matchup.id)]">
                {{ getStatusText(matchup.id) }}
              </span>
            </div>
            <p class="matchup-info">{{ matchup.description }}</p>
            <div class="matchup-stats">
              <div class="stat-item">
                <span>👥</span>
                <span>{{ matchup.teams }} Teams</span>
              </div>
              <div class="stat-item">
                <span>🎮</span>
                <span>{{ matchup.games }} Games</span>
              </div>
              <div class="stat-item">
                <span>🗺️</span>
                <span>{{ matchup.maps }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import { useTournamentStore } from '../stores/tournament.js' // Import the store
import { mapState, mapActions } from 'pinia' // Import Pinia helpers

export default {
  name: 'TournamentSelector',
  
  props: {
    isYear5Tournament: {
      type: Boolean,
      default: false
    },
    isEwc2025Tournament: {
      type: Boolean,
      default: false
    },
    // REMOVE selectedMatchup and selectedDay props
    loadedMatchups: {
      type: Set,
      default: () => new Set()
    },
    loadingMatchups: {
      type: Set,
      default: () => new Set()
    }
  },
  
  // REMOVE emits for matchup-selected and day-changed
  emits: [],
  
  data() {
    return {
      // Tournament structure data
      tournamentDays: this.isEwc2025Tournament ? [
        // ========================================
        // EWC 2025 TOURNAMENT STRUCTURE
        // ========================================
        {
          id: 'day1',
          name: 'Day 1 - Group A',
          description: 'EWC 2025 Day 1 Group A featuring 20 elite teams competing across 10 games with diverse maps and strategic legend bans.',
          matchups: [
                          {
                id: 'Day1-A',
                title: 'Group A',
                description: 'Complete Day 1 Group A tournament featuring dynamic game count based on actual data across World\'s Edge, E-District, Storm Point, and Broken Moon.',
                teams: 20,
                games: 'auto', // Dynamic based on CSV data
                maps: 'World\'s Edge → E-District → Storm Point → Broken Moon'
              }
          ]
        },
        {
          id: 'day2',
          name: 'Day 2 - Group B',
                        description: 'EWC 2025 Day 2 Group B featuring 20 elite teams competing across 9 games with strategic map rotations and legend bans.',
          matchups: [
                          {
                id: 'Day2-B',
                title: 'Group B',
                description: 'Complete Day 2 Group B tournament featuring dynamic game count based on actual data across World\'s Edge, E-District, and Storm Point.',
                teams: 20,
                games: 'auto', // Dynamic based on CSV data
                maps: 'World\'s Edge → E-District → Storm Point'
              }
          ]
        },
        {
          id: 'day3',
          name: 'Day 3 - Last Chance',
          description: 'EWC 2025 Day 3 Last Chance featuring 20 elite teams competing across 4 games with the same map rotation as Day 2.',
          matchups: [
            {
              id: 'Day3-LastChance',
              title: 'Last Chance',
              description: 'Final Day 3 Last Chance tournament featuring 4 games with the same map sequence as Day 2: World\'s Edge, E-District, and Storm Point.',
              teams: 20,
              games: 'auto', // Dynamic based on CSV data
              maps: 'World\'s Edge → E-District → Storm Point'
            }
          ]
        }
      ] : this.isYear5Tournament ? [
        // ========================================
        // YEAR 5 OPEN TOURNAMENT STRUCTURE
        // ========================================
        {
          id: 'day1',
          name: 'Day 1 - Winners Round 1',
          description: 'Year 5 Open Winners Round 1 featuring 6 tournament rounds. All rounds use the same map rotation: E-District (2) → Storm Point (2) → World\'s Edge (2).',
          matchups: [
            {
              id: 'Day1-WinnersRound1-1',
              title: 'Winners Round 1 #1',
              description: 'First round of Winners Round 1. 6 games with E-District opening sequence.',
              teams: 20,
              games: 6,
              maps: 'E-District → Storm Point → World\'s Edge'
            },
            {
              id: 'Day1-WinnersRound1-2',
              title: 'Winners Round 1 #2',
              description: 'Second round of Winners Round 1. Consistent map rotation pattern.',
              teams: 20,
              games: 6,
              maps: 'E-District → Storm Point → World\'s Edge'
            },
            {
              id: 'Day1-WinnersRound1-3',
              title: 'Winners Round 1 #3',
              description: 'Third round of Winners Round 1. Standard 6-game format.',
              teams: 20,
              games: 6,
              maps: 'E-District → Storm Point → World\'s Edge'
            },
            {
              id: 'Day1-WinnersRound1-4',
              title: 'Winners Round 1 #4',
              description: 'Fourth round of Winners Round 1. Maintaining competitive balance.',
              teams: 20,
              games: 6,
              maps: 'E-District → Storm Point → World\'s Edge'
            },
            {
              id: 'Day1-WinnersRound1-5',
              title: 'Winners Round 1 #5',
              description: 'Fifth round of Winners Round 1. Continued tournament progression.',
              teams: 20,
              games: 6,
              maps: 'E-District → Storm Point → World\'s Edge'
            },
            {
              id: 'Day1-WinnersRound1-6',
              title: 'Winners Round 1 #6',
              description: 'Final round of Winners Round 1. Concluding the first day of competition.',
              teams: 20,
              games: 6,
              maps: 'E-District → Storm Point → World\'s Edge'
            }
          ]
        }
      ] : [
        // ========================================
        // YEAR 4 CHAMPIONSHIP TOURNAMENT STRUCTURE
        // ========================================
        {
          id: 'day1',
          name: 'Day 1 - Group Stages',
          description: 'Initial group stage matchups determining bracket positions for the tournament. Teams compete across E-District, Storm Point, and World\'s Edge.',
          matchups: [
            {
              id: 'AvsB',
              title: 'Group A vs Group B',
              description: 'Opening group stage matchup featuring teams from Groups A and B. 6 games across E-District (2), Storm Point (2), and World\'s Edge (2).',
              teams: 20,
              games: 6,
              maps: 'E-District → Storm Point → World\'s Edge'
            },
            {
              id: 'CvsD',
              title: 'Group C vs Group D',
              description: 'Second group stage matchup with teams from Groups C and D. Same map rotation as A vs B for fair competition.',
              teams: 20,
              games: 6,
              maps: 'E-District → Storm Point → World\'s Edge'
            },
            {
              id: 'BvsD',
              title: 'Group B vs Group D',
              description: 'Cross-group matchup between Groups B and D. Rotated map order starting with Storm Point for strategic variety.',
              teams: 20,
              games: 6,
              maps: 'Storm Point → World\'s Edge → E-District'
            }
          ]
        },
        {
          id: 'day2',
          name: 'Day 2 - Cross Groups',
          description: 'Cross-group matchups determining final bracket seeding. Advanced map rotations test team adaptability.',
          matchups: [
            {
              id: 'AvsC',
              title: 'Group A vs Group C',
              description: 'Day 2 cross-group matchup between Groups A and C. 6 games with E-District focus.',
              teams: 20,
              games: 6,
              maps: 'E-District → Storm Point → World\'s Edge'
            },
            {
              id: 'BvsC',
              title: 'Group B vs Group C',
              description: 'Strategic cross-group battle between Groups B and C. Storm Point opening rotation.',
              teams: 20,
              games: 6,
              maps: 'Storm Point → World\'s Edge → E-District'
            },
            {
              id: 'AvsD',
              title: 'Group A vs Group D',
              description: 'Final day 2 matchup between Groups A and D. Classic E-District to World\'s Edge progression.',
              teams: 20,
              games: 6,
              maps: 'E-District → Storm Point → World\'s Edge'
            }
          ]
        },
        {
          id: 'day3',
          name: 'Day 3 - Elimination Rounds',
          description: 'High-stakes elimination rounds where teams fight for tournament survival. Extended 8-game series with diverse map pools.',
          matchups: [
            {
              id: 'ER1',
              title: 'Elimination Round 1',
              description: 'First elimination round featuring 8 intense games. Heavy E-District focus with World\'s Edge finale.',
              teams: 20,
              games: 8,
              maps: 'E-District (3) → Storm Point (2) → World\'s Edge (3)'
            }
          ]
        },
        {
          id: 'day4',
          name: 'Day 4 - Finals',
          description: 'Championship finals featuring the ultimate competition. Winners and elimination rounds determine the ALGS Champion.',
          matchups: [
            {
              id: 'ER2',
              title: 'Elimination Round 2',
              description: 'Second elimination round with 8 crucial games. Balanced map rotation for fair competition.',
              teams: 20,
              games: 8,
              maps: 'Storm Point (2) → World\'s Edge (2) → E-District (2) → Mixed (2)'
            },
            {
              id: 'WR1',
              title: 'Winners Round 1',
              description: 'Winners bracket final featuring the top teams. 8 games across all three maps for ultimate victory.',
              teams: 20,
              games: 8,
              maps: 'World\'s Edge (2) → E-District (2) → Storm Point (2) → Mixed (2)'
            }
          ]
        }
      ]
    }
  },
  
  computed: {
    ...mapState(useTournamentStore, ['selectedDay', 'selectedMatchup']), // Map state from store
    currentDayMatchups() {
      const currentDay = this.tournamentDays.find(day => day.id === this.selectedDay);
      return currentDay ? currentDay.matchups : [];
    },
    
    currentDayInfo() {
      return this.tournamentDays.find(day => day.id === this.selectedDay) || {};
    }
  },
  
  watch: {
    selectedDay(newDay, oldDay) {
      if (newDay !== oldDay) {
        console.log('📅 TournamentSelector: Day changed from', oldDay, 'to', newDay);
        // Force reactivity update
        this.$forceUpdate();
      }
    }
  },
  
  methods: {
    ...mapActions(useTournamentStore, ['setDay', 'selectMatchup']), // Map actions
    
    // REMOVE selectDay and selectMatchup methods that emitted events.
    // The @click handlers in the template will now call the mapped store actions directly.
    
    getStatusClass(matchupId) {
      if (this.loadedMatchups.has(matchupId)) return 'loaded';
      if (this.loadingMatchups.has(matchupId)) return 'loading';
      return 'available';
    },
    
    getStatusText(matchupId) {
      if (this.loadedMatchups.has(matchupId)) return 'Loaded';
      if (this.loadingMatchups.has(matchupId)) return 'Loading...';
      return 'Available';
    },
    
    // Public method to get matchup info by ID
    getMatchupInfo(matchupId) {
      const allMatchups = this.tournamentDays.flatMap(day => day.matchups);
      return allMatchups.find(matchup => matchup.id === matchupId);
    },
    
    // Public method to get all available matchups
    getAvailableMatchups() {
      return this.tournamentDays.flatMap(day => 
        day.matchups.map(matchup => ({
          value: matchup.id,
          label: matchup.title,
          games: matchup.games
        }))
      );
    }
  }
}
</script> 