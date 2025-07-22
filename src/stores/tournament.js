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
    processedChartData: [],
    isLoading: false,
    errorMessage: '',
    tournamentType: 'year4',
  }),

  getters: {
    maxGames: (state) => {
      if (state.processedChartData && state.processedChartData.length > 0) {
        const firstTeam = state.processedChartData[0];
        if (firstTeam && firstTeam.games && firstTeam.games.length > 0) {
          return firstTeam.games.length;
        }
      }
      
      const fallbackGameCount = state.tournamentType === 'ewc2025' ? 
        (state.selectedDay === 'day1' ? 10 : 
         state.selectedDay === 'day2' ? 9 : 
         state.selectedDay === 'day3' ? 6 : 6) :
        (state.tournamentType === 'year5' ? 6 : 8);
      
      return fallbackGameCount;
    }
  },

  actions: {
    setTournamentType(type) {
      this.tournamentType = type;
    },

    selectMatchup(matchupId) {
      this.selectedMatchup = matchupId;
      this.resetPlayback();
    },

    setDay(dayId) {
      this.selectedDay = dayId;
      this.selectedMatchup = '';
      this.resetPlayback();
    },

    // Set day without clearing selected matchup (for initial auto-loading)
    setDayOnly(dayId) {
      this.selectedDay = dayId;
      this.resetPlayback();
    },

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

    setGameFilter({ games, action, maxGames }) {
      if (action === 'clear' || games.length === 0) {
        this.isFiltered = false;
        this.filteredGameIndices = [];
      } else {
        this.isFiltered = true;
        // Sort filtered game indices to ensure consistent order.
        this.filteredGameIndices = [...games].sort((a, b) => a - b);
        // If filtering, auto-progress the current game to the max filtered game.
        if (maxGames && this.currentGame < maxGames) {
          this.currentGame = maxGames;
        }
      }
    },

    async fetchDataForMatchup() {
      if (!this.selectedMatchup) return;

      console.log('📊 [Store] Fetching data for matchup:', this.selectedMatchup);
      
      this.isLoading = true;
      this.processedChartData = [];
      this.errorMessage = '';

      try {
        const csvPath = this._buildCsvPath(this.selectedMatchup);
        console.log(`📂 [Store] Loading CSV for ${this.tournamentType}:`, csvPath);

        const rawData = await this._loadCsvData(csvPath);

        const processedData = await this._processRawDataForChart(rawData);

        this.processedChartData = processedData;

        console.log('✅ [Store] Data fetched successfully:', {
          teams: this.processedChartData.length,
          maxGames: this.maxGames,
          sampleTeam: this.processedChartData[0]
        });

        this.setCurrentGame(0);

      } catch (error) {
        this.errorMessage = error.message;
        this.processedChartData = [];
      } finally {
        this.isLoading = false;
      }
    },

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
      
      const columns = rawData.columns || [];
      const isLongFormat = columns.includes('Game') && columns.includes('Team') && columns.includes('Placement');
      const isWideFormat = columns.some(col => col.includes('Game ') && col.includes(' P'));

      let processedData;
      
      if (isLongFormat) {
        console.log('📊 [Store] Detected long format data (EWC/Year5 style)');
        // Transform long format data into wide format.
        processedData = this._transformLongDataToWide(rawData);
      } else if (isWideFormat) {
        console.log('📊 [Store] Detected wide format data (Year4 style)');
        processedData = rawData; // Wide format data can be used directly.
      } else {
        console.warn('⚠️ [Store] Unknown data format, attempting wide format processing');
        processedData = rawData; // Fallback to using raw data as is.
      }
      
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
      
      const placementPointsMap = {
        '1': 12, '2': 9, '3': 7, '4': 5, '5': 4,
        '6': 3, '7': 3, '8': 2, '9': 2, '10': 2,
        '11': 1, '12': 1, '13': 1, '14': 1, '15': 1,
        '16': 0, '17': 0, '18': 0, '19': 0, '20': 0
      };
      
      const teamsData = {};
      
      rawData.forEach(row => {
        const teamName = row.Team;
        const gameNumber = parseInt(row.Game); // Convert game number to integer.
        const placement = row.Placement;
        const kills = parseInt(row.Kills) || 0; // Convert kills to integer, default to 0 if not present.
        
        if (!teamsData[teamName]) {
          teamsData[teamName] = {
            Team: teamName,
            'Overall Points': 0 // Initialize overall points for the team.
          };
        }
        
        const placementPoints = placementPointsMap[placement] || 0;
        
        const placementProp = `Game ${gameNumber} P`;
        const killsProp = `Game ${gameNumber} K`;
        
        teamsData[teamName][placementProp] = placementPoints;
        teamsData[teamName][killsProp] = kills;
        
        teamsData[teamName]['Overall Points'] += placementPoints + kills;
      });
      
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

      const firstTeam = data[0];
      const gameColumns = Object.keys(firstTeam).filter(col => 
        col.startsWith('Game ') && col.endsWith(' P')
      );
      const maxGames = gameColumns.length;
      
      const mapSequence = getMapSequence(this.selectedMatchup);
      console.log('🗺️ [Store] Using map sequence for', this.selectedMatchup, ':', mapSequence);
      
      const chartData = data.map(team => {
        const games = [];
        let cumulativeScore = 0;
        
        for (let gameNum = 1; gameNum <= maxGames; gameNum++) {
          const placementPoints = team[`Game ${gameNum} P`] || 0;
          const kills = team[`Game ${gameNum} K`] || 0;
          const gamePoints = placementPoints + kills;
          
          const mapName = mapSequence?.maps?.[gameNum] || 'Unknown';
          const occurrenceCount = calculateMapOccurrence(mapName, gameNum, mapSequence);
          const gameColor = getMapColorByOccurrence(mapName, occurrenceCount);
          
          games.push({
            gameNumber: gameNum,
            placementPoints,
            kills,
            points: gamePoints,
            startX: cumulativeScore, // Starting score for this game segment on the chart.
            map: mapName,
            color: gameColor // Color associated with the map.
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
      
      chartData.sort((a, b) => b.totalScore - a.totalScore);
      
      return chartData;
    }
  },
}); 