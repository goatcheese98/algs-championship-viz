// src/stores/tournament.js

// Import `defineStore` from Pinia to create a new store.
import { defineStore } from 'pinia';
// Import D3.js for data parsing, specifically CSV parsing.
import * as d3 from 'd3';
// Import utility functions for map coloring and sequence data.
import { getMapColorByOccurrence, calculateMapOccurrence } from '../chart/MapColoringLogic.js';
import { getMapSequence } from '../chart/MapSequenceData.js';

// Define and export the Pinia store named 'tournament'.
// This store manages all tournament-related state, actions, and getters.
export const useTournamentStore = defineStore('tournament', {
  // `state` is a function that returns the initial state of the store.
  state: () => ({
    selectedMatchup: '', // Stores the ID of the currently selected tournament matchup (e.g., 'AvsB', 'Day1-A').
    selectedDay: 'day1', // Stores the selected day for multi-day tournaments (e.g., 'day1', 'day2').
    isLegendVisible: false, // Controls the visibility of the chart legend.
    animationSpeed: 'medium', // Sets the playback speed for chart animations (e.g., 'slow', 'medium', 'fast').
    isPlaying: false, // Boolean indicating if the chart animation is currently playing.
    currentGame: 0, // Tracks the current game number being displayed in the animation.
    isFiltered: false, // Indicates if a game filter is active.
    filteredGameIndices: [], // Stores the indices of games that are currently filtered/selected.
    processedChartData: [], // Holds the transformed and pre-computed data ready for chart rendering.
    isLoading: false, // Boolean indicating if data is currently being fetched or processed.
    errorMessage: '', // Stores any error messages encountered during data operations.
    tournamentType: 'year4', // Specifies the type of tournament (e.g., 'year4', 'year5', 'ewc2025').
  }),

  // `getters` are equivalent to computed properties for stores.
  // They are used to derive new state from existing state.
  getters: {
    // Calculates the maximum number of games for the currently loaded data.
    // It first tries to determine this from the `processedChartData`.
    // If data is not yet loaded, it falls back to static values based on `tournamentType` and `selectedDay`.
    maxGames: (state) => {
      // If processed data exists, get max games from the first team's game array length.
      if (state.processedChartData && state.processedChartData.length > 0) {
        const firstTeam = state.processedChartData[0];
        if (firstTeam && firstTeam.games && firstTeam.games.length > 0) {
          return firstTeam.games.length;
        }
      }
      
      // Fallback: Return a predefined number of games based on the tournament type and selected day.
      const fallbackGameCount = state.tournamentType === 'ewc2025' ? 
        (state.selectedDay === 'day1' ? 10 : 
         state.selectedDay === 'day2' ? 9 : 
         state.selectedDay === 'day3' ? 6 : 6) :
        (state.tournamentType === 'year5' ? 6 : 8);
      
      return fallbackGameCount;
    }
  },

  // `actions` are methods that can modify the state. They can be asynchronous.
  actions: {
    // Action to set the current tournament type.
    setTournamentType(type) {
      this.tournamentType = type;
    },

    // Action to select a specific matchup.
    // Resets playback state when a new matchup is selected.
    selectMatchup(matchupId) {
      this.selectedMatchup = matchupId;
      this.resetPlayback();
    },

    // Action to set the current day for multi-day tournaments.
    // Resets matchup selection and playback state.
    setDay(dayId) {
      this.selectedDay = dayId;
      this.selectedMatchup = ''; // Clear selected matchup when day changes.
      this.resetPlayback();
    },

    // Action to toggle the visibility of the chart legend.
    toggleLegend() {
      this.isLegendVisible = !this.isLegendVisible;
    },

    // Action to set the animation playback speed.
    setAnimationSpeed(speed) {
      this.animationSpeed = speed;
    },

    // Action to toggle the playback state (playing/paused).
    togglePlayback() {
      this.isPlaying = !this.isPlaying;
    },

    // Action to explicitly set the playing status.
    setPlaying(status) {
      this.isPlaying = status;
    },

    // Action to set the current game number for animation.
    // If gameIndex is 0, it also clears any active filters.
    setCurrentGame(gameIndex) {
      this.currentGame = gameIndex;
      if (gameIndex === 0) {
        this.isFiltered = false;
        this.filteredGameIndices = [];
      }
    },

    // Action to reset all playback-related state variables.
    resetPlayback() {
      this.isPlaying = false;
      this.currentGame = 0;
      this.isFiltered = false;
      this.filteredGameIndices = [];
    },

    // Action to apply or clear game filters.
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

    // Main asynchronous action to fetch and process data for the selected matchup.
    async fetchDataForMatchup() {
      // Do nothing if no matchup is selected.
      if (!this.selectedMatchup) return;

      console.log('📊 [Store] Fetching data for matchup:', this.selectedMatchup);
      
      // Set loading state and clear previous data/errors.
      this.isLoading = true;
      this.processedChartData = [];
      this.errorMessage = '';

      try {
        // 1. Construct the correct CSV file path based on the tournament type and matchup ID.
        const csvPath = this._buildCsvPath(this.selectedMatchup);
        console.log(`📂 [Store] Loading CSV for ${this.tournamentType}:`, csvPath);

        // 2. Fetch the raw CSV data from the determined path.
        const rawData = await this._loadCsvData(csvPath);

        // 3. Process the raw data, intelligently detecting its format (long vs. wide).
        const processedData = await this._processRawDataForChart(rawData);

        // 4. Update the store's state with the newly processed data.
        this.processedChartData = processedData;

        console.log('✅ [Store] Data fetched successfully:', {
          teams: this.processedChartData.length,
          maxGames: this.maxGames,
          sampleTeam: this.processedChartData[0]
        });

        // Reset the current game to 0 after new data is loaded.
        this.setCurrentGame(0);

      } catch (error) {
        // Catch and log any errors during the fetch/process cycle.
        console.error('❌ [Store] Error fetching matchup data:', error);
        this.errorMessage = error.message;
        this.processedChartData = []; // Clear data on error.
      } finally {
        // Always set loading to false once the operation completes (success or failure).
        this.isLoading = false;
      }
    },

    // Private helper method to construct the CSV file path based on tournament type.
    _buildCsvPath(matchupId) {
      if (this.tournamentType === 'ewc2025') {
        return `/ewc2025/raw/${matchupId}.csv`;
      } else if (this.tournamentType === 'year5') {
        return `/year5champions/raw/${matchupId}.csv`;
      } else {
        return `/year4champions/raw/${matchupId}.csv`;
      }
    },

    // Private helper method to load CSV data from a given path.
    async _loadCsvData(csvPath) {
      console.log('📂 [Store] Loading CSV data from:', csvPath);
      
      const response = await fetch(csvPath);
      // Throw an error if the network response was not ok (e.g., 404, 500).
      if (!response.ok) {
        throw new Error(`Failed to load CSV: ${response.status} ${response.statusText}`);
      }
      
      // Read the response body as text and parse it as CSV using D3.
      const csvText = await response.text();
      const rawData = d3.csvParse(csvText);
      
      console.log('✅ [Store] CSV loaded:', {
        path: csvPath,
        rows: rawData.length,
        columns: rawData.columns
      });
      
      return rawData;
    },

    // Private helper method to intelligently process raw CSV data.
    // It detects whether the data is in 'long' or 'wide' format and transforms it if necessary.
    async _processRawDataForChart(rawData) {
      console.log('🔄 [Store] Processing raw data for chart...');
      
      // Determine data format based on the presence of specific columns.
      const columns = rawData.columns || [];
      const isLongFormat = columns.includes('Game') && columns.includes('Team') && columns.includes('Placement');
      // Wide format typically has columns like 'Game 1 P', 'Game 2 K', etc.
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
      
      // Pre-compute game-by-game cumulative scores and map details for all teams.
      const chartData = this._preComputeGameData(processedData);
      
      console.log('✅ [Store] Data processed for chart:', {
        teams: chartData.length,
        maxGames: this.maxGames,
        sampleTeam: chartData[0]
      });
      
      return chartData;
    },

    // Private helper method to transform 'long' format CSV data into 'wide' format.
    // Long format: each row is a single game's data for one team.
    // Wide format: each row is a team, with columns for each game's placement and kills.
    _transformLongDataToWide(rawData) {
      console.log('🔄 [Store] Transforming long format data to wide format...');
      
      // ALGS official placement-to-points conversion map.
      const placementPointsMap = {
        '1': 12, '2': 9, '3': 7, '4': 5, '5': 4,
        '6': 3, '7': 3, '8': 2, '9': 2, '10': 2,
        '11': 1, '12': 1, '13': 1, '14': 1, '15': 1,
        '16': 0, '17': 0, '18': 0, '19': 0, '20': 0
      };
      
      const teamsData = {}; // Object to build up wide format data, keyed by team name.
      
      // Iterate over each row in the raw (long format) data.
      rawData.forEach(row => {
        const teamName = row.Team;
        const gameNumber = parseInt(row.Game); // Convert game number to integer.
        const placement = row.Placement;
        const kills = parseInt(row.Kills) || 0; // Convert kills to integer, default to 0 if not present.
        
        // Initialize the team's data structure if it doesn't exist.
        if (!teamsData[teamName]) {
          teamsData[teamName] = {
            Team: teamName,
            'Overall Points': 0 // Initialize overall points for the team.
          };
        }
        
        // Get placement points from the predefined map.
        const placementPoints = placementPointsMap[placement] || 0;
        
        // Define property names for placement and kills for the current game.
        const placementProp = `Game ${gameNumber} P`;
        const killsProp = `Game ${gameNumber} K`;
        
        // Assign the calculated placement points and kills to the team's data.
        teamsData[teamName][placementProp] = placementPoints;
        teamsData[teamName][killsProp] = kills;
        
        // Update the team's overall cumulative points.
        teamsData[teamName]['Overall Points'] += placementPoints + kills;
      });
      
      // Convert the `teamsData` object into an array of team objects.
      // Sort the teams by their 'Overall Points' in descending order.
      const transformedData = Object.values(teamsData).sort((a, b) => b['Overall Points'] - a['Overall Points']);
      
      console.log('✅ [Store] Long data transformed:', {
        originalRows: rawData.length,
        transformedTeams: transformedData.length
      });
      
      return transformedData;
    },

    // Private helper method to pre-compute game-by-game data for chart rendering.
    // This includes cumulative scores, map names, and map colors.
    _preComputeGameData(data) {
      console.log('⚡ [Store] Pre-computing game-by-game data...');
      
      if (!data || data.length === 0) return [];

      // Determine the maximum number of games by inspecting the columns of the first team's data.
      const firstTeam = data[0];
      const gameColumns = Object.keys(firstTeam).filter(col => 
        col.startsWith('Game ') && col.endsWith(' P')
      );
      const maxGames = gameColumns.length;
      
      // Get the specific map sequence for the currently selected matchup.
      const mapSequence = getMapSequence(this.selectedMatchup);
      console.log('🗺️ [Store] Using map sequence for', this.selectedMatchup, ':', mapSequence);
      
      // Map over each team to create their game-by-game data structure.
      const chartData = data.map(team => {
        const games = []; // Array to store individual game data for the team.
        let cumulativeScore = 0; // Initialize cumulative score for the team.
        
        // Iterate through each game to calculate scores and assign map details.
        for (let gameNum = 1; gameNum <= maxGames; gameNum++) {
          // Retrieve placement points and kills for the current game.
          const placementPoints = team[`Game ${gameNum} P`] || 0;
          const kills = team[`Game ${gameNum} K`] || 0;
          const gamePoints = placementPoints + kills; // Total points for the current game.
          
          // Get map name and calculate its occurrence for coloring.
          const mapName = mapSequence?.maps?.[gameNum] || 'Unknown';
          const occurrenceCount = calculateMapOccurrence(mapName, gameNum, mapSequence);
          const gameColor = getMapColorByOccurrence(mapName, occurrenceCount);
          
          // Push the game's data into the `games` array.
          games.push({
            gameNumber: gameNum,
            placementPoints,
            kills,
            points: gamePoints,
            startX: cumulativeScore, // Starting score for this game segment on the chart.
            map: mapName,
            color: gameColor // Color associated with the map.
          });
          
          cumulativeScore += gamePoints; // Update cumulative score.
        }
        
        // Return the team's processed data, including all games and total score.
        return {
          team: team.Team,
          games,
          totalScore: cumulativeScore,
          cumulativeScore: cumulativeScore // Redundant, but kept for consistency with existing structure.
        };
      });
      
      // Sort the final chart data by total score in descending order.
      chartData.sort((a, b) => b.totalScore - a.totalScore);
      
      return chartData;
    }
  },
}); 