// src/stores/tournament.js
import { defineStore } from 'pinia';
import * as d3 from 'd3';
import { getMapColorByOccurrence, calculateMapOccurrence } from '../chart/MapColoringLogic.js';
import { getMapSequence } from '../chart/MapSequenceData.js';

export const useTournamentStore = defineStore('tournament', {
  state: () => ({
    selectedMatchup: '',
    selectedDay: 'day1',
    isLegendVisible: false,
    animationSpeed: 'medium',
    isPlaying: false,
    currentGame: 0,
    isFiltered: false,
    filteredGameIndices: [],
    // New data-related state
    processedChartData: [],
    isLoading: false,
    errorMessage: '',
    tournamentType: 'year4',
  }),

  getters: {
    maxGames: (state) => {
      // Dynamic maxGames based on actual CSV data
      if (state.processedChartData && state.processedChartData.length > 0) {
        const firstTeam = state.processedChartData[0];
        if (firstTeam && firstTeam.games && firstTeam.games.length > 0) {
          return firstTeam.games.length;
        }
      }
      
      // Fallback to static values based on tournament type and day
      const fallbackGameCount = state.tournamentType === 'ewc2025' ? 
        (state.selectedDay === 'day1' ? 10 : 
         state.selectedDay === 'day2' ? 9 : 
         state.selectedDay === 'day3' ? 6 : 6) :
        (state.tournamentType === 'year5' ? 6 : 8);
      
      return fallbackGameCount;
    }
  },

  actions: {
    // Tournament Type Management
    setTournamentType(type) {
      this.tournamentType = type;
    },

    // Selection Management
    selectMatchup(matchupId) {
      this.selectedMatchup = matchupId;
      this.resetPlayback();
    },

    setDay(dayId) {
      this.selectedDay = dayId;
      this.selectedMatchup = '';
      this.resetPlayback();
    },

    // Playback Control
    toggleLegend() {
      this.isLegendVisible = !this.isLegendVisible;
    },

    setAnimationSpeed(speed) {
      this.animationSpeed = speed;
    },

    togglePlayback() {
      this.isPlaying = !this.isPlaying;
    },

    setPlaying(status) {
      this.isPlaying = status;
    },

    setCurrentGame(gameIndex) {
      this.currentGame = gameIndex;
      if (gameIndex === 0) {
        this.isFiltered = false;
        this.filteredGameIndices = [];
      }
    },

    resetPlayback() {
      this.isPlaying = false;
      this.currentGame = 0;
      this.isFiltered = false;
      this.filteredGameIndices = [];
    },

    // Filter Management
    setGameFilter({ games, action, maxGames }) {
      if (action === 'clear' || games.length === 0) {
        this.isFiltered = false;
        this.filteredGameIndices = [];
      } else {
        this.isFiltered = true;
        this.filteredGameIndices = [...games].sort((a, b) => a - b);
        // Auto-progress to max level when filtering
        if (maxGames && this.currentGame < maxGames) {
          this.currentGame = maxGames;
        }
      }
    },

    // Main Data Fetching Action
    async fetchDataForMatchup() {
      if (!this.selectedMatchup) return;

      console.log('📊 [Store] Fetching data for matchup:', this.selectedMatchup);
      
      // Set loading state and clear previous data
      this.isLoading = true;
      this.processedChartData = [];
      this.errorMessage = '';

      try {
        // 1. Determine the correct CSV file path based on tournament type and matchup
        const csvPath = this._buildCsvPath(this.selectedMatchup);
        console.log(`📂 [Store] Loading CSV for ${this.tournamentType}:`, csvPath);

        // 2. Fetch and parse the CSV data
        const rawData = await this._loadCsvData(csvPath);

        // 3. Intelligently detect the data format and process accordingly
        const processedData = await this._processRawDataForChart(rawData);

        // 4. Update the processed chart data
        this.processedChartData = processedData;

        console.log('✅ [Store] Data fetched successfully:', {
          teams: this.processedChartData.length,
          maxGames: this.maxGames,
          sampleTeam: this.processedChartData[0]
        });

        // Reset game state
        this.setCurrentGame(0);

      } catch (error) {
        console.error('❌ [Store] Error fetching matchup data:', error);
        this.errorMessage = error.message;
        this.processedChartData = [];
      } finally {
        this.isLoading = false;
      }
    },

    // Private Helper Methods
    _buildCsvPath(matchupId) {
      if (this.tournamentType === 'ewc2025') {
        return `/ewc2025/raw/${matchupId}.csv`;
      } else if (this.tournamentType === 'year5') {
        return `/year5champions/raw/${matchupId}.csv`;
      } else {
        return `/year4champions/raw/${matchupId}.csv`;
      }
    },

    async _loadCsvData(csvPath) {
      console.log('📂 [Store] Loading CSV data from:', csvPath);
      
      const response = await fetch(csvPath);
      if (!response.ok) {
        throw new Error(`Failed to load CSV: ${response.status} ${response.statusText}`);
      }
      
      const csvText = await response.text();
      const rawData = d3.csvParse(csvText);
      
      console.log('✅ [Store] CSV loaded:', {
        path: csvPath,
        rows: rawData.length,
        columns: rawData.columns
      });
      
      return rawData;
    },

    async _processRawDataForChart(rawData) {
      console.log('🔄 [Store] Processing raw data for chart...');
      
      // Intelligently detect data format based on columns
      const columns = rawData.columns || [];
      const isLongFormat = columns.includes('Game') && columns.includes('Team') && columns.includes('Placement');
      const isWideFormat = columns.some(col => col.includes('Game ') && col.includes(' P'));

      let processedData;
      
      if (isLongFormat) {
        console.log('📊 [Store] Detected long format data (EWC/Year5 style)');
        processedData = this._transformLongDataToWide(rawData);
      } else if (isWideFormat) {
        console.log('📊 [Store] Detected wide format data (Year4 style)');
        processedData = rawData;
      } else {
        console.warn('⚠️ [Store] Unknown data format, attempting wide format processing');
        processedData = rawData;
      }
      
      // Pre-compute game-by-game data for all teams
      const chartData = this._preComputeGameData(processedData);
      
      console.log('✅ [Store] Data processed for chart:', {
        teams: chartData.length,
        maxGames: this.maxGames,
        sampleTeam: chartData[0]
      });
      
      return chartData;
    },

    _transformLongDataToWide(rawData) {
      console.log('🔄 [Store] Transforming long format data to wide format...');
      
      // ALGS placement-to-points conversion map
      const placementPointsMap = {
        '1': 12, '2': 9, '3': 7, '4': 5, '5': 4,
        '6': 3, '7': 3, '8': 2, '9': 2, '10': 2,
        '11': 1, '12': 1, '13': 1, '14': 1, '15': 1,
        '16': 0, '17': 0, '18': 0, '19': 0, '20': 0
      };
      
      const teamsData = {};
      
      // Process each row from raw data
      rawData.forEach(row => {
        const teamName = row.Team;
        const gameNumber = parseInt(row.Game);
        const placement = row.Placement;
        const kills = parseInt(row.Kills) || 0;
        
        // Initialize team if not exists
        if (!teamsData[teamName]) {
          teamsData[teamName] = {
            Team: teamName,
            'Overall Points': 0
          };
        }
        
        // Get placement points from lookup table
        const placementPoints = placementPointsMap[placement] || 0;
        
        // Create property names for this game
        const placementProp = `Game ${gameNumber} P`;
        const killsProp = `Game ${gameNumber} K`;
        
        // Assign the points
        teamsData[teamName][placementProp] = placementPoints;
        teamsData[teamName][killsProp] = kills;
        
        // Update overall points
        teamsData[teamName]['Overall Points'] += placementPoints + kills;
      });
      
      // Convert to array and sort by overall points (descending)
      const transformedData = Object.values(teamsData).sort((a, b) => b['Overall Points'] - a['Overall Points']);
      
      console.log('✅ [Store] Long data transformed:', {
        originalRows: rawData.length,
        transformedTeams: transformedData.length
      });
      
      return transformedData;
    },

    _preComputeGameData(data) {
      console.log('⚡ [Store] Pre-computing game-by-game data...');
      
      if (!data || data.length === 0) return [];

      // Extract game columns
      const firstTeam = data[0];
      const gameColumns = Object.keys(firstTeam).filter(col => 
        col.startsWith('Game ') && col.endsWith(' P')
      );
      const maxGames = gameColumns.length;
      
      // Get map sequence for the current matchup
      const mapSequence = getMapSequence(this.selectedMatchup);
      console.log('🗺️ [Store] Using map sequence for', this.selectedMatchup, ':', mapSequence);
      
      const chartData = data.map(team => {
        const games = [];
        let cumulativeScore = 0;
        
        for (let gameNum = 1; gameNum <= maxGames; gameNum++) {
          const placementPoints = team[`Game ${gameNum} P`] || 0;
          const kills = team[`Game ${gameNum} K`] || 0;
          const gamePoints = placementPoints + kills;
          
          // Get map name and color for this game
          const mapName = mapSequence?.maps?.[gameNum] || 'Unknown';
          const occurrenceCount = calculateMapOccurrence(mapName, gameNum, mapSequence);
          const gameColor = getMapColorByOccurrence(mapName, occurrenceCount);
          
          games.push({
            gameNumber: gameNum,
            placementPoints,
            kills,
            points: gamePoints,
            startX: cumulativeScore,
            map: mapName,
            color: gameColor
          });
          
          cumulativeScore += gamePoints;
        }
        
        return {
          team: team.Team,
          games,
          totalScore: cumulativeScore,
          cumulativeScore: cumulativeScore
        };
      });
      
      // Sort by total score descending
      chartData.sort((a, b) => b.totalScore - a.totalScore);
      
      return chartData;
    }
  },
}); 