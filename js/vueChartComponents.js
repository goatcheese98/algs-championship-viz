/**
 * Vue.js Components for ALGS Championship Charts
 * This module provides reusable Vue components for chart controls and displays
 */

// Chart Control Panel Component
const ChartControlPanel = {
    props: {
        matchups: {
            type: Array,
            required: true
        },
        selectedMatchup: {
            type: String,
            default: ''
        },
        isLoading: {
            type: Boolean,
            default: false
        },
        currentGame: {
            type: Number,
            default: 1
        },
        maxGames: {
            type: Number,
            default: 6
        },
        isPlaying: {
            type: Boolean,
            default: false
        },
        animationSpeed: {
            type: String,
            default: 'normal'
        }
    },
    emits: [
        'update:selectedMatchup',
        'update:currentGame', 
        'update:animationSpeed',
        'load-matchup',
        'toggle-playback',
        'restart',
        'export-data',
        'jump-to-game'
    ],
    template: `
        <div class="vue-control-panel">
            <div class="controls-header">
                <h3 class="controls-title">
                    <span class="vue-icon">⚡</span>
                    Chart Controls
                </h3>
                <span class="vue-badge">Vue.js Reactive</span>
            </div>
            
            <div class="controls-grid">
                <div class="control-group">
                    <label for="matchup-select">Tournament Matchup</label>
                    <select 
                        id="matchup-select"
                        :value="selectedMatchup"
                        @change="$emit('update:selectedMatchup', $event.target.value)"
                        class="vue-select"
                    >
                        <option value="">Choose a matchup...</option>
                        <option 
                            v-for="matchup in matchups" 
                            :key="matchup.value"
                            :value="matchup.value"
                        >
                            {{ matchup.label }}
                        </option>
                    </select>
                </div>

                <div class="control-group">
                    <label for="animation-speed">Animation Speed</label>
                    <select 
                        id="animation-speed"
                        :value="animationSpeed"
                        @change="$emit('update:animationSpeed', $event.target.value)"
                        class="vue-select"
                    >
                        <option value="slow">🐌 Slow (2s)</option>
                        <option value="normal">⚡ Normal (1.5s)</option>
                        <option value="fast">🚀 Fast (1s)</option>
                        <option value="instant">💨 Instant (0.1s)</option>
                    </select>
                </div>

                <div class="control-group">
                    <label for="current-game">Game Navigation</label>
                    <div class="game-controls">
                        <button 
                            @click="$emit('jump-to-game', Math.max(1, currentGame - 1))"
                            :disabled="currentGame <= 1"
                            class="game-nav-btn"
                        >⏮️</button>
                        <input 
                            type="number" 
                            id="current-game"
                            :value="currentGame"
                            @input="$emit('update:currentGame', parseInt($event.target.value))"
                            :min="1"
                            :max="maxGames"
                            class="game-input"
                        >
                        <button 
                            @click="$emit('jump-to-game', Math.min(maxGames, currentGame + 1))"
                            :disabled="currentGame >= maxGames"
                            class="game-nav-btn"
                        >⏭️</button>
                    </div>
                </div>

                <div class="control-group">
                    <label>Progress Slider</label>
                    <div class="progress-container">
                        <span class="progress-label">{{ currentGame }}</span>
                        <input 
                            type="range" 
                            :value="currentGame"
                            @input="$emit('update:currentGame', parseInt($event.target.value))"
                            :min="1"
                            :max="maxGames"
                            class="progress-slider"
                        >
                        <span class="progress-label">{{ maxGames }}</span>
                    </div>
                </div>
            </div>

            <div class="action-buttons">
                <button 
                    @click="$emit('load-matchup')"
                    :disabled="!selectedMatchup || isLoading"
                    class="btn btn-primary"
                >
                    <span v-if="isLoading" class="loading-spinner-small"></span>
                    {{ isLoading ? 'Loading...' : '📊 Load Chart' }}
                </button>
                
                <button 
                    @click="$emit('toggle-playback')"
                    :disabled="!selectedMatchup"
                    class="btn btn-secondary"
                >
                    {{ isPlaying ? '⏸️ Pause' : '▶️ Play' }}
                </button>
                
                <button 
                    @click="$emit('restart')"
                    :disabled="!selectedMatchup"
                    class="btn btn-secondary"
                >
                    🔄 Restart
                </button>
                
                <button 
                    @click="$emit('export-data')"
                    :disabled="!selectedMatchup"
                    class="btn btn-secondary"
                >
                    📥 Export
                </button>
            </div>
        </div>
    `,
    style: `
        .vue-control-panel {
            background: linear-gradient(135deg, #2d1b1b 0%, #3d2424 100%);
            border-radius: 12px;
            padding: 25px;
            border: 2px solid #d97706;
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
        }

        .controls-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
            padding-bottom: 15px;
            border-bottom: 1px solid #4a4a4a;
        }

        .controls-title {
            font-size: 1.4rem;
            font-weight: 600;
            color: #f1f5f9;
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .vue-icon {
            font-size: 1.2rem;
        }

        .vue-badge {
            background: linear-gradient(135deg, #4fc08d 0%, #44a08d 100%);
            color: white;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 0.8rem;
            font-weight: 600;
            box-shadow: 0 2px 8px rgba(79, 192, 141, 0.3);
        }

        .controls-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 25px;
        }

        .control-group {
            display: flex;
            flex-direction: column;
            gap: 8px;
        }

        .control-group label {
            font-weight: 600;
            color: #f1f5f9;
            font-size: 0.9rem;
        }

        .vue-select, .game-input {
            padding: 10px;
            border: 2px solid #4a4a4a;
            border-radius: 6px;
            font-size: 0.9rem;
            transition: all 0.3s ease;
            background: #1a1a1a;
            color: #f1f5f9;
        }

        .vue-select:focus, .game-input:focus {
            outline: none;
            border-color: #4fc08d;
            box-shadow: 0 0 0 3px rgba(79, 192, 141, 0.1);
        }

        .game-controls {
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .game-nav-btn {
            padding: 8px;
            border: 1px solid #4a4a4a;
            border-radius: 4px;
            background: #2a2a2a;
            color: #f1f5f9;
            cursor: pointer;
            transition: all 0.3s ease;
        }

        .game-nav-btn:hover:not(:disabled) {
            border-color: #4fc08d;
            background: #3a3a3a;
        }

        .game-nav-btn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }

        .game-input {
            flex: 1;
            text-align: center;
        }

        .progress-container {
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .progress-label {
            font-weight: 600;
            color: #d97706;
            min-width: 20px;
            text-align: center;
        }

        .progress-slider {
            flex: 1;
            height: 6px;
            border-radius: 3px;
            background: #4a4a4a;
            outline: none;
            cursor: pointer;
        }

        .progress-slider::-webkit-slider-thumb {
            appearance: none;
            width: 18px;
            height: 18px;
            border-radius: 50%;
            background: linear-gradient(135deg, #4fc08d 0%, #44a08d 100%);
            cursor: pointer;
            box-shadow: 0 2px 6px rgba(79, 192, 141, 0.4);
        }

        .action-buttons {
            display: flex;
            gap: 10px;
            justify-content: center;
            flex-wrap: wrap;
        }

        .btn {
            padding: 12px 20px;
            border: none;
            border-radius: 6px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            gap: 6px;
        }

        .btn-primary {
            background: linear-gradient(135deg, #d97706 0%, #f59e0b 100%);
            color: white;
            border: 1px solid #d97706;
        }

        .btn-primary:hover:not(:disabled) {
            background: linear-gradient(135deg, #b45309 0%, #d97706 100%);
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(217, 119, 6, 0.3);
        }

        .btn-secondary {
            background: #374151;
            color: #f1f5f9;
            border: 1px solid #4b5563;
        }

        .btn-secondary:hover:not(:disabled) {
            background: #4b5563;
            border-color: #6b7280;
        }

        .btn:disabled {
            opacity: 0.6;
            cursor: not-allowed;
            transform: none !important;
            box-shadow: none !important;
        }

        .loading-spinner-small {
            width: 16px;
            height: 16px;
            border: 2px solid transparent;
            border-top: 2px solid currentColor;
            border-radius: 50%;
            animation: spin 1s linear infinite;
        }

        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    `
};

// Chart Status Display Component
const ChartStatusDisplay = {
    props: {
        chartStatus: {
            type: String,
            default: 'idle'
        },
        dataStatus: {
            type: String,
            default: 'idle'
        },
        currentMatchup: {
            type: String,
            default: ''
        },
        currentMap: {
            type: String,
            default: ''
        },
        currentGame: {
            type: Number,
            default: 1
        },
        maxGames: {
            type: Number,
            default: 6
        }
    },
    computed: {
        chartStatusText() {
            const statusMap = {
                idle: 'Idle',
                loading: 'Loading',
                ready: 'Ready',
                error: 'Error'
            };
            return statusMap[this.chartStatus] || 'Unknown';
        },
        dataStatusText() {
            const statusMap = {
                idle: 'No Data',
                loading: 'Loading',
                ready: 'Loaded',
                error: 'Error'
            };
            return statusMap[this.dataStatus] || 'Unknown';
        }
    },
    template: `
        <div class="vue-status-display">
            <div class="status-row">
                <div class="status-item">
                    <div :class="['status-dot', chartStatus]"></div>
                    <span class="status-label">Chart: {{ chartStatusText }}</span>
                </div>
                
                <div class="status-item">
                    <div :class="['status-dot', dataStatus]"></div>
                    <span class="status-label">Data: {{ dataStatusText }}</span>
                </div>
                
                <div v-if="currentMatchup" class="status-item">
                    <div class="status-dot ready"></div>
                    <span class="status-label">{{ currentMatchup.toUpperCase() }}</span>
                </div>
            </div>
            
            <div v-if="currentMap || currentGame" class="info-row">
                <div v-if="currentMap" class="info-item">
                    <span class="info-icon">🗺️</span>
                    <span>{{ currentMap }}</span>
                </div>
                
                <div class="info-item">
                    <span class="info-icon">🎮</span>
                    <span>Game {{ currentGame }} / {{ maxGames }}</span>
                </div>
                
                <div class="info-item">
                    <span class="info-icon">📊</span>
                    <span>{{ Math.round((currentGame / maxGames) * 100) }}% Complete</span>
                </div>
            </div>
        </div>
    `,
    style: `
        .vue-status-display {
            background: rgba(0, 0, 0, 0.4);
            border-radius: 8px;
            padding: 15px;
            margin-bottom: 20px;
            border: 1px solid #4a4a4a;
        }

        .status-row, .info-row {
            display: flex;
            gap: 20px;
            align-items: center;
            flex-wrap: wrap;
        }

        .info-row {
            margin-top: 10px;
            padding-top: 10px;
            border-top: 1px solid #4a4a4a;
        }

        .status-item, .info-item {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 6px 12px;
            border-radius: 6px;
            background: rgba(0, 0, 0, 0.3);
            border: 1px solid #4a4a4a;
        }

        .status-dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
        }

        .status-dot.idle {
            background: #6b7280;
        }

        .status-dot.loading {
            background: #fbbf24;
            animation: pulse 1.5s infinite;
        }

        .status-dot.ready {
            background: #10b981;
        }

        .status-dot.error {
            background: #ef4444;
        }

        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
        }

        .status-label {
            font-size: 0.9rem;
            font-weight: 500;
            color: #f1f5f9;
        }

        .info-icon {
            font-size: 1rem;
        }

        .info-item span:last-child {
            font-size: 0.9rem;
            color: #d1d5db;
        }
    `
};

// Chart Container Component
const ChartContainer = {
    props: {
        title: {
            type: String,
            default: 'ALGS Championship Chart'
        },
        isLoading: {
            type: Boolean,
            default: false
        },
        error: {
            type: String,
            default: ''
        }
    },
    template: `
        <div class="vue-chart-container">
            <div class="chart-header">
                <h2 class="chart-title">{{ title }}</h2>
                <div class="chart-actions">
                    <slot name="actions"></slot>
                </div>
            </div>
            
            <div class="chart-content">
                <div id="vue-chart-area" class="chart-area"></div>
                
                <transition name="fade">
                    <div v-if="isLoading" class="loading-overlay">
                        <div class="loading-content">
                            <div class="loading-spinner"></div>
                            <p>Loading chart data...</p>
                        </div>
                    </div>
                </transition>
                
                <div v-if="error" class="error-overlay">
                    <div class="error-content">
                        <div class="error-icon">⚠️</div>
                        <p>{{ error }}</p>
                    </div>
                </div>
            </div>
        </div>
    `,
    style: `
        .vue-chart-container {
            background: linear-gradient(135deg, #1e1414 0%, #2d1b1b 50%, #1e1414 100%);
            border-radius: 12px;
            padding: 25px;
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
            border: 2px solid #d97706;
            position: relative;
            width: 100%;
            flex: 1;
            display: flex;
            flex-direction: column;
            min-height: 600px;
        }

        .chart-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
            padding-bottom: 15px;
            border-bottom: 2px solid #d97706;
        }

        .chart-title {
            font-size: 1.6rem;
            font-weight: 600;
            color: #f1f5f9;
            margin: 0;
        }

        .chart-content {
            flex: 1;
            position: relative;
            min-height: 500px;
        }

        .chart-area {
            width: 100%;
            height: 100%;
            min-height: 500px;
        }

        .loading-overlay, .error-overlay {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 8px;
            z-index: 10;
        }

        .loading-content, .error-content {
            text-align: center;
            color: #f1f5f9;
        }

        .loading-spinner {
            width: 50px;
            height: 50px;
            border: 4px solid #4a4a4a;
            border-top: 4px solid #4fc08d;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto 15px;
        }

        .error-icon {
            font-size: 3rem;
            margin-bottom: 15px;
        }

        .fade-enter-active, .fade-leave-active {
            transition: opacity 0.3s ease;
        }

        .fade-enter-from, .fade-leave-to {
            opacity: 0;
        }

        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    `
};

// Export components for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        ChartControlPanel,
        ChartStatusDisplay,
        ChartContainer
    };
} else {
    // Global export for browser
    window.VueChartComponents = {
        ChartControlPanel,
        ChartStatusDisplay,
        ChartContainer
    };
} 