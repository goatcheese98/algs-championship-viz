<template>
  <div class="tournament-overview">
    <div class="overview-header">
      <h1 class="overview-title">Tournament Overview</h1>
      <div class="algs-stage-cards">
        <div 
          v-for="day in tournamentDays" 
          :key="day.id"
          :class="['stage-card', { active: selectedDay === day.id }]"
          @click="setDay(day.id)"
        >
          {{ day.name }}
        </div>
      </div>
    </div>

    <transition name="fade" mode="out-in">
      <div :key="selectedDay" class="day-content active">
        <p style="color: #cbd5e1; margin-bottom: 20px;">{{ currentDayInfo.description }}</p>
        
        <div class="algs-matchups-grid">
          <div 
            v-for="matchup in currentDayMatchups" 
            :key="matchup.id"
            :class="['algs-matchup-card', { selected: selectedMatchup === matchup.id }]"
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
import { useTournamentStore } from '../stores/tournament.js'
import { mapState, mapActions } from 'pinia'
import { getTournamentDays } from '../data/tournaments'

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
    loadedMatchups: {
      type: Set,
      default: () => new Set()
    },
    loadingMatchups: {
      type: Set,
      default: () => new Set()
    }
  },
  
  emits: [],
  
  data() {
    return {
      tournamentDays: this.getTournamentData()
    }
  },
  
  computed: {
    ...mapState(useTournamentStore, ['selectedDay', 'selectedMatchup']),
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
        this.$forceUpdate();
      }
    }
  },
  
  methods: {
    ...mapActions(useTournamentStore, ['setDay', 'selectMatchup']),
    
    getTournamentData() {
      if (this.isEwc2025Tournament) {
        return getTournamentDays('ewc-2025')
      } else if (this.isYear5Tournament) {
        return getTournamentDays('year-5-open')
      } else {
        return getTournamentDays('year-4-championship')
      }
    },
    
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
    
    getMatchupInfo(matchupId) {
      const allMatchups = this.tournamentDays.flatMap(day => day.matchups);
      return allMatchups.find(matchup => matchup.id === matchupId);
    },
    
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