<template>
  <svg ref="svgRef" class="algs-chart-svg"></svg>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted, defineProps, nextTick, computed } from 'vue';
import * as d3 from 'd3';
import { useTournamentStore } from '../stores/tournament.js'; // Import the store
import { GSAPDraggableManager } from '../utils/GSAPDraggableManager.js';
import { gsap } from 'gsap';

// ============================================================================
// 1. DEFINE PROPS (The component's public API)
// ============================================================================
const props = defineProps({
  teamConfig: {
    type: Object,
    required: true,
    default: () => ({})
  },
  compressionFactor: {
    type: Number,
    default: 1.0
  }
});

// Use the store
const store = useTournamentStore();

// Create computed properties to read from the store
const isLegendVisible = computed(() => store.isLegendVisible);
const animationSpeed = computed(() => store.animationSpeed);
const currentGame = computed(() => store.currentGame);
const isFiltered = computed(() => store.isFiltered); // ADD THIS
const filteredGameIndices = computed(() => store.filteredGameIndices); // ADD THIS
const processedChartData = computed(() => store.processedChartData); // ADD THIS
const maxGames = computed(() => store.maxGames); // ADD THIS

// ============================================================================
// 2. COMPUTED PROPERTIES FOR ANIMATION SPEED
// ============================================================================

const speedMultipliers = {
  slow: 1.0,    // Current medium speed becomes new slow
  medium: 0.4,  // Current fast speed becomes new medium baseline  
  fast: 0.2     // Even faster than current fast
};

// Synchronized easing function for smooth team movements
const getTeamMovementEasing = () => d3.easeQuadInOut;

const getTransitionDuration = computed(() => {
  const baseTransitionDuration = 2500;
  const multiplier = speedMultipliers[animationSpeed.value] || 1.0;
  return baseTransitionDuration * multiplier;
});

const getAxisTransitionDuration = computed(() => {
  const baseAxisDuration = 300;
  const multiplier = speedMultipliers[animationSpeed.value] || 1.0;
  return Math.max(100, baseAxisDuration * multiplier); // Minimum 100ms for responsiveness
});

const getSegmentTransitionDuration = computed(() => {
  const baseSegmentDuration = 200;
  const multiplier = speedMultipliers[animationSpeed.value] || 1.0;
  return Math.max(50, baseSegmentDuration * multiplier); // Minimum 50ms for responsiveness
});

// Synchronized team movement duration - ensures names and bars move together
const getTeamMovementDuration = computed(() => {
  const baseTeamDuration = 600;
  const multiplier = speedMultipliers[animationSpeed.value] || 1.0;
  return Math.max(200, baseTeamDuration * multiplier); // Minimum 200ms for smooth movement
});

// ============================================================================
// 3. SETUP REFS FOR DOM AND D3 OBJECTS
// ============================================================================
const svgRef = ref(null);
const dimensions = ref({ width: 0, height: 0 });
const scales = ref({ x: null, y: null });
const mainGroup = ref(null);
const xAxisGroup = ref(null);
const yAxisGroup = ref(null);
const customYAxisGroup = ref(null);

// Legend draggable functionality
let legendDraggableInstance = null;
let legendGroupElement = null;

// Configuration constants
const margin = { top: 50, right: 80, bottom: 60, left: 280 };
// Note: transitionDuration is now computed based on animation speed via getTransitionDuration

// Resize observer reference
let resizeObserver = null;

// ============================================================================
// 4. UTILITY FUNCTIONS (Adapted from ChartRenderer.js)
// ============================================================================


// Font scaling utility
function getResponsiveFontSize(baseSize) {
    const containerWidth = window.innerWidth;
    
    if (containerWidth > 1400) {
        return Math.min(baseSize * 1.1, baseSize + 3);
    }
    
    return baseSize;
}

// Point size scaling utility
function getResponsivePointSize(baseSize = 4) {
    const containerWidth = window.innerWidth;
    
    if (containerWidth > 1400) {
        return Math.min(baseSize * 1.2, baseSize + 2);
    }
    
    return baseSize;
}

// ============================================================================
// 4. CHART RENDERING FUNCTIONS
// ============================================================================

const setupSVG = () => {
    console.log('🎨 InteractiveRaceChart: Setting up SVG structure');
    
    const svg = d3.select(svgRef.value);
    if (!svg || svg.empty()) {
        console.warn('⚠️ SVG element not available for setup');
        return;
    }
    
    // Clear any existing content
    svg.selectAll('*').remove();
    
    // Add gradient definitions for enhanced text styling
    const defs = svg.append('defs');
    
    // Legend background gradient (info card style)
    const legendGradient = defs.append('linearGradient')
        .attr('id', 'legendGradient')
        .attr('x1', '0%')
        .attr('y1', '0%')
        .attr('x2', '100%')
        .attr('y2', '100%');
    
    legendGradient.append('stop')
        .attr('offset', '0%')
        .attr('stop-color', 'rgba(0, 0, 0, 0.5)')
        .attr('stop-opacity', '1');
    legendGradient.append('stop')
        .attr('offset', '100%')
        .attr('stop-color', 'rgba(15, 15, 20, 0.6)')
        .attr('stop-opacity', '1');
    
    // Team name gradient
    const teamNameGradient = defs.append('linearGradient')
        .attr('id', 'teamNameGradient')
        .attr('x1', '0%')
        .attr('y1', '0%')
        .attr('x2', '100%')
        .attr('y2', '0%');
    
    teamNameGradient.append('stop')
        .attr('offset', '0%')
        .attr('stop-color', '#ffffff')
        .attr('stop-opacity', '1');
    teamNameGradient.append('stop')
        .attr('offset', '20%')
        .attr('stop-color', '#f8fafc')
        .attr('stop-opacity', '1');
    teamNameGradient.append('stop')
        .attr('offset', '50%')
        .attr('stop-color', '#ff7777')
        .attr('stop-opacity', '1');
    teamNameGradient.append('stop')
        .attr('offset', '80%')
        .attr('stop-color', '#f8fafc')
        .attr('stop-opacity', '1');
    teamNameGradient.append('stop')
        .attr('offset', '100%')
        .attr('stop-color', '#ffffff')
        .attr('stop-opacity', '1');
    
    // Cumulative label gradient
    const cumulativeGradient = defs.append('linearGradient')
        .attr('id', 'cumulativeGradient')
        .attr('x1', '0%')
        .attr('y1', '0%')
        .attr('x2', '100%')
        .attr('y2', '0%');
    
    cumulativeGradient.append('stop')
        .attr('offset', '0%')
        .attr('stop-color', '#ffffff')
        .attr('stop-opacity', '1');
    cumulativeGradient.append('stop')
        .attr('offset', '30%')
        .attr('stop-color', '#ff9999')
        .attr('stop-opacity', '1');
    cumulativeGradient.append('stop')
        .attr('offset', '70%')
        .attr('stop-color', '#ff6666')
        .attr('stop-opacity', '1');
    cumulativeGradient.append('stop')
        .attr('offset', '100%')
        .attr('stop-color', '#ffffff')
        .attr('stop-opacity', '1');
    
    // Ranking number gradient
    const rankingGradient = defs.append('linearGradient')
        .attr('id', 'rankingGradient')
        .attr('x1', '0%')
        .attr('y1', '0%')
        .attr('x2', '0%')
        .attr('y2', '100%');
    
    rankingGradient.append('stop')
        .attr('offset', '0%')
        .attr('stop-color', '#ffffff')
        .attr('stop-opacity', '1');
    rankingGradient.append('stop')
        .attr('offset', '25%')
        .attr('stop-color', '#fecaca')
        .attr('stop-opacity', '1');
    rankingGradient.append('stop')
        .attr('offset', '50%')
        .attr('stop-color', '#dc2626')
        .attr('stop-opacity', '1');
    rankingGradient.append('stop')
        .attr('offset', '75%')
        .attr('stop-color', '#991b1b')
        .attr('stop-opacity', '1');
    rankingGradient.append('stop')
        .attr('offset', '100%')
        .attr('stop-color', '#7f1d1d')
        .attr('stop-opacity', '1');
    
    // Configure SVG
    svg
        .style('width', '100%')
        .style('height', '100%')
        .style('display', 'block')
        .style('position', 'relative')
        .style('z-index', '1')
        .style('overflow', 'visible')
        .style('background', 'transparent')
        .attr('preserveAspectRatio', 'xMidYMid meet');
    
    // Initialize scales with default domains and ranges
    scales.value.x = d3.scaleLinear()
        .domain([0, 100]) // Default domain, will be updated with real data
        .range([0, dimensions.value.width || 800]);
    
    scales.value.y = d3.scaleBand()
        .domain(Array.from({length: 20}, (_, i) => i + 1))
        .range([0, dimensions.value.height || 600])
        .padding(0.1);
    
    // Main group for chart elements
    mainGroup.value = svg.append('g')
        .attr('class', 'main-chart-group')
        .style('pointer-events', 'all');
    
    // X-axis group
    xAxisGroup.value = mainGroup.value.append('g')
        .attr('class', 'x-axis')
        .style('color', '#94a3b8')
        .style('font-size', '12px')
        .style('font-family', 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif');
    
    // Y-axis group (hidden by default)
    yAxisGroup.value = mainGroup.value.append('g')
        .attr('class', 'y-axis')
        .style('opacity', '0')
        .style('pointer-events', 'none');
    
    // Custom Y-axis for team names and positions
    customYAxisGroup.value = mainGroup.value.append('g')
        .attr('class', 'custom-y-axis')
        .style('pointer-events', 'none');
    
    console.log('✅ InteractiveRaceChart: SVG setup completed with scales initialized');
};

const updateDimensions = () => {
    const container = svgRef.value?.parentElement;
    if (!container) {
        console.warn('⚠️ Container not available for dimension update');
        return;
    }
    
    const containerRect = container.getBoundingClientRect();
    const newWidth = Math.max(300, containerRect.width - margin.left - margin.right);
    const baseNewHeight = Math.max(200, containerRect.height - margin.top - margin.bottom);
    const newHeight = baseNewHeight * props.compressionFactor;
    
    dimensions.value = { width: newWidth, height: newHeight };
    
    const totalWidth = newWidth + margin.left + margin.right;
    const totalHeight = newHeight + margin.top + margin.bottom;
    
    const maxWidth = Math.min(totalWidth, window.innerWidth * 0.98);
    const maxHeight = Math.min(totalHeight, window.innerHeight * 0.9);
    
    d3.select(svgRef.value)
        .attr('width', maxWidth)
        .attr('height', maxHeight)
        .style('max-width', '100%')
        .style('max-height', '100%');
    
    // Update main group transform
    if (mainGroup.value) {
        mainGroup.value.attr('transform', `translate(${margin.left},${margin.top})`);
    }
    
    // Position x-axis at the bottom
    if (xAxisGroup.value) {
        xAxisGroup.value.attr('transform', `translate(0,${newHeight})`);
    }
    
    // Update scales ranges
    if (scales.value.x) {
        scales.value.x.range([0, newWidth]);
    }
    if (scales.value.y) {
        scales.value.y.range([0, newHeight]);
    }
    
    console.log('📐 InteractiveRaceChart: Dimensions updated:', { width: newWidth, height: newHeight });
};

const updateScales = (data, currentGameIndex = currentGame.value) => {
    if (!data || data.length === 0) {
        console.warn('⚠️ No data for scale update');
        return;
    }
    
    // Dynamically determine maxScore based on current game progress and filtering
    let maxScore;
    if (currentGameIndex === 0) {
        maxScore = 10; // Minimum for initial state
    } else {
        // Calculate max score considering filtering and current game progress
        maxScore = d3.max(data, d => {
            if (!d.games || d.games.length === 0) return 0;
            
            // Filter games based on current game index and any applied filters
            let relevantGames = d.games;
            
            // First filter by current game progress
            relevantGames = relevantGames.filter(game => game.gameNumber <= currentGameIndex);
            
            // Then apply user filters if active
            if (isFiltered.value && filteredGameIndices.value && filteredGameIndices.value.length > 0) {
                relevantGames = relevantGames.filter(game => 
                    filteredGameIndices.value.includes(game.gameNumber)
                );
            }
            
            // Sum points for relevant games
            const score = relevantGames.reduce((sum, game) => sum + (game.points || 0), 0);
            return score;
        }) || 10;
    }
    
    // Add some padding to maxScore (10% padding, minimum 20)
    maxScore = Math.max(maxScore * 1.1, 20);
    
    console.log('📏 Scale update: maxScore =', maxScore, 'for game', currentGameIndex, 'filtered:', isFiltered.value);
    
    // Update X scale (score domain)
    if (scales.value.x) {
        scales.value.x.domain([0, maxScore]);
    }
    
    // Update Y scale (team positions 1-20)
    if (scales.value.y) {
        scales.value.y.domain(Array.from({length: 20}, (_, i) => i + 1));
    }
};

const updateAxes = (data, duration = getTransitionDuration.value) => {
    if (!xAxisGroup.value || !scales.value.x) return;
    
    const maxScore = scales.value.x.domain()[1];
    
    // Create smart tick values based on the scale
    let tickValues;
    if (maxScore <= 15) {
        tickValues = [0, 2, 4, 6, 8, 10, 12, 14];
    } else if (maxScore <= 30) {
        tickValues = [0, 5, 10, 15, 20, 25, 30];
    } else if (maxScore <= 60) {
        tickValues = [0, 10, 20, 30, 40, 50, 60];
    } else {
        // For larger scales, use automatic ticks but ensure they're integers
        tickValues = scales.value.x.ticks().filter(tick => tick % 1 === 0 && tick <= maxScore);
    }
    
    // Update X-axis
    const xAxis = d3.axisBottom(scales.value.x)
        .tickFormat(d3.format('.0f'))
        .tickValues(tickValues);
    
    const transition = duration > 0 ?
        xAxisGroup.value.transition().duration(duration) :
        xAxisGroup.value;
    
    transition
        .call(xAxis)
        .selectAll('text')
        .style('font-size', getResponsiveFontSize(12) + 'px')
        .style('fill', '#94a3b8');
    
    // Update custom Y-axis
    updateCustomYAxis(data, duration);
};

const updateCustomYAxis = (data, duration = getTransitionDuration.value) => {
    if (!customYAxisGroup.value || !scales.value.y) return;
    
    // Sort teams by cumulative score for proper ranking display
    const currentGameIndex = currentGame.value;
    const sortedData = currentGameIndex === 0 
        ? [...data].sort((a, b) => a.team.localeCompare(b.team)) // Alphabetical for initial state
        : [...data].sort((a, b) => {
            // Calculate cumulative scores for current game
            const scoreA = a.games.slice(0, currentGameIndex).reduce((sum, game) => sum + (game.points || 0), 0);
            const scoreB = b.games.slice(0, currentGameIndex).reduce((sum, game) => sum + (game.points || 0), 0);
            return scoreB - scoreA; // Descending order (highest score first)
        });
    
    const teamEntries = customYAxisGroup.value.selectAll('.team-entry')
        .data(sortedData, d => d.team);
    
    // Remove exiting teams
    teamEntries.exit()
        .transition().duration(duration / 2)
        .style('opacity', 0)
        .remove();
    
    // Add new team entries
    const enterGroup = teamEntries.enter()
        .append('g')
        .attr('class', 'team-entry')
        .style('opacity', 0);
    
    // Setup team entry structure
    setupTeamEntries(enterGroup);
    
    // Merge and update all teams
    const allTeams = enterGroup.merge(teamEntries);
    
    // Update team logos for all teams
    updateTeamLogos(allTeams);
    
    const transition = duration > 0 ? 
        allTeams.transition()
            .duration(getTeamMovementDuration.value)
            .ease(getTeamMovementEasing()) : 
        allTeams;

    console.log('🏷️ Team names movement duration:', getTeamMovementDuration.value, 'ms');

    transition
        .style('opacity', 1)
        .attr('transform', (d, i) => {
            // Use static ranking positions (1-20) instead of team-based positioning
            const ranking = i + 1;
            const yPos = scales.value.y(ranking);
            const bandwidth = scales.value.y.bandwidth();
            return `translate(0, ${yPos + bandwidth / 2})`;
        });
    
    // Update static ranking numbers (always 1-20)
    allTeams.select('.ranking-number')
        .text((d, i) => i + 1); // Static positions 1-20
    
    // Update team names
    allTeams.select('.team-label')
        .text(d => d.team);
};

const setupTeamEntries = (teamEntriesEnter) => {
    const windowWidth = window.innerWidth;
    let rankingX = -260;
    let logoX = -220;
    let labelX = -180;
    
    // Responsive positioning
    if (windowWidth < 1200) {
        rankingX = Math.max(-240, -margin.left + 20);
        logoX = Math.max(-200, -margin.left + 40);
        labelX = Math.max(-160, -margin.left + 60);
    }
    
    if (windowWidth < 900) {
        rankingX = Math.max(-220, -margin.left + 15);
        logoX = Math.max(-180, -margin.left + 35);
        labelX = Math.max(-140, -margin.left + 55);
    }
    
    if (windowWidth < 700) {
        rankingX = Math.max(-140, -margin.left + 10);
        logoX = Math.max(-115, -margin.left + 25);
        labelX = Math.max(-85, -margin.left + 45);
    }
    
    // Ranking numbers
    teamEntriesEnter.append('text')
        .attr('class', 'ranking-number')
        .attr('x', rankingX)
        .attr('dy', '0.35em')
        .style('text-anchor', 'middle')
        .style('font-size', (windowWidth < 700 ? 14 : 18) + 'px')
        .style('font-weight', '700')
        .style('fill', '#dc2626');
    
    // Team logo container
    const logoGroup = teamEntriesEnter.append('g')
        .attr('class', 'logo-container')
        .attr('transform', `translate(${logoX}, 0)`)
        .style('opacity', 1)
        .style('pointer-events', 'none');
    
    // Logo background circle
    logoGroup.append('circle')
        .attr('class', 'logo-background')
        .attr('r', getResponsivePointSize(16))
        .style('fill', 'rgba(0, 0, 0, 0.8)')
        .style('stroke', 'rgba(0, 0, 0, 0.3)')
        .style('stroke-width', '1px')
        .style('filter', 'drop-shadow(0 2px 4px rgba(0,0,0,0.4))');
    
    // Logo image element for actual team logos
    logoGroup.append('image')
        .attr('class', 'team-logo-image')
        .attr('x', -14)
        .attr('y', -14)
        .attr('width', 28)
        .attr('height', 28)
        .style('opacity', 0)
        .style('clip-path', `circle(${getResponsivePointSize(14)}px at center)`);
    
    // Fallback logo group
    const fallbackGroup = logoGroup.append('g')
        .attr('class', 'logo-fallback')
        .style('opacity', 1)
        .style('pointer-events', 'none');
    
    fallbackGroup.append('circle')
        .attr('class', 'fallback-bg')
        .attr('r', getResponsivePointSize(14))
        .style('stroke', 'rgba(0, 0, 0, 0.5)')
        .style('stroke-width', '1px')
        .style('fill', '#dc2626'); // Default red color
    
    fallbackGroup.append('text')
        .attr('class', 'fallback-text')
        .attr('dy', '0.35em')
        .style('text-anchor', 'middle')
        .style('font-size', `${getResponsiveFontSize(12)}px`)
        .style('font-weight', '700')
        .style('fill', '#ffffff')
        .style('text-shadow', '0 1px 2px rgba(0,0,0,0.5)')
        .text('🎮'); // Will be updated by updateTeamLogos
    
    // Team label
    teamEntriesEnter.append('text')
        .attr('class', 'team-label')
        .attr('x', labelX)
        .attr('dy', '0.35em')
        .style('text-anchor', 'start')
        .style('font-size', getResponsiveFontSize(14) + 'px')
        .style('font-weight', '600')
        .style('fill', '#e2e8f0');
};

// Update team logos using teamConfig
const updateTeamLogos = (teamEntries) => {
    console.log('🖼️ Updating team logos...');
    
    teamEntries.each(function(teamData, i, nodes) {
        const teamGroup = d3.select(nodes[i]);
        const teamName = teamData.team;
        
        // Get logo URL from teamConfig
        const logoUrl = props.teamConfig?.getTeamLogo?.(teamName);
        const logoImage = teamGroup.select('.team-logo-image');
        const fallbackGroup = teamGroup.select('.logo-fallback');
        
        // Setup fallback styling
        const fallbackConfig = props.teamConfig?.getFallbackConfig?.(teamName) || 
            { backgroundColor: '#dc2626', initials: teamName.substring(0, 2), icon: '🏆' };
        
        fallbackGroup.select('.fallback-bg')
            .style('fill', fallbackConfig.backgroundColor);
        
        const displayText = fallbackConfig.initials.length <= 3 ? 
            fallbackConfig.initials : fallbackConfig.icon;
        
        fallbackGroup.select('.fallback-text')
            .text(displayText)
            .style('font-size', displayText.length > 2 ? '10px' : '12px');
        
        // Handle logo loading
        if (logoUrl) {
            logoImage.attr('href', logoUrl);
            
            // Show fallback first, then try to load image
            fallbackGroup.style('opacity', 1);
            logoImage.style('opacity', 0);
            
            // Test image loading
            const testImg = new Image();
            testImg.onload = () => {
                // Image loaded successfully, show it
                logoImage.style('opacity', 1);
                fallbackGroup.style('opacity', 0);
            };
            testImg.onerror = () => {
                // Image failed to load, keep fallback
                logoImage.style('opacity', 0);
                fallbackGroup.style('opacity', 1);
                console.warn(`Failed to load logo for ${teamName}:`, logoUrl);
            };
            testImg.src = logoUrl;
        } else {
            // No logo URL, use fallback
            logoImage.style('opacity', 0);
            fallbackGroup.style('opacity', 1);
            console.log(`No logo URL for ${teamName}, using fallback`);
        }
    });
};

// Render legend functionality
const renderLegend = (visible) => {
    console.log('🏷️ Rendering legend, visible:', visible);
    
    if (!mainGroup.value) {
        console.warn('⚠️ No main group for legend rendering');
        return;
    }
    
    // Clean up existing legend draggable instance before removing legend
    if (legendDraggableInstance) {
        console.log('🧹 Cleaning up existing legend draggable before re-render');
        if (legendDraggableInstance.cleanup) {
            legendDraggableInstance.cleanup();
        } else if (GSAPDraggableManager && legendGroupElement?.id) {
            GSAPDraggableManager.destroyDraggable(legendGroupElement.id);
        }
        legendDraggableInstance = null;
        legendGroupElement = null;
    }
    
    // Remove existing legend
    mainGroup.value.select('.legend-group').remove();
    
    if (!visible) {
        console.log('✅ Legend hidden');
        return;
    }
    
    // Get map sequence for current matchup
    const mapSequence = processedChartData.value?.[0]?.games || [];
    if (mapSequence.length === 0) {
        console.warn('⚠️ No games data for legend');
        return;
    }
    
    // Enhanced responsive positioning - move legend higher and make it truly responsive
    const containerWidth = dimensions.value.width;
    const containerHeight = dimensions.value.height;
    
    // Responsive legend dimensions - Increased size
    const baseWidth = Math.min(400, containerWidth * 0.35); // 35% of container width, max 400px (was 25%, 320px)
    const baseHeight = Math.min(500, containerHeight * 0.75); // 75% of container height, max 500px (was 60%, 400px)
    
    // Position legend in upper-right area (moved significantly higher)
    const legendX = containerWidth - baseWidth - 20;
    const legendY = Math.max(40, containerHeight * 0.15); // Start at 15% from top, minimum 40px
    
    console.log('🏷️ Legend positioning:', {
        containerWidth,
        containerHeight,
        legendX,
        legendY,
        legendWidth: baseWidth,
        legendHeight: baseHeight
    });
    
    // Create legend group - position it at the calculated position with draggable support
    const legendGroup = mainGroup.value.append('g')
        .attr('class', 'legend-group')
        .attr('id', 'chart-legend-draggable') // Add ID for draggable functionality
        .attr('transform', `translate(${legendX}, ${legendY})`);
    
    // Legend background with responsive sizing and draggable styling
    const legendBg = legendGroup.append('rect')
        .attr('class', 'legend-background')
        .attr('x', 0)
        .attr('y', 0)
        .attr('rx', 6)
        .attr('ry', 6)
        .style('fill', 'url(#legendGradient)')
        .style('stroke', 'rgba(255, 255, 255, 0.1)')
        .style('stroke-width', '1px')
        .style('backdrop-filter', 'blur(6px)')
        .style('cursor', 'grab') // Show grab cursor to indicate draggable
        .on('mouseenter', function() {
            // Subtle highlight on hover to indicate interactivity (info card style)
            d3.select(this)
                .style('stroke', 'rgba(255, 255, 255, 0.3)')
                .style('stroke-width', '1px');
        })
        .on('mouseleave', function() {
            // Reset styling when not hovering (info card style)
            d3.select(this)
                .style('stroke', 'rgba(255, 255, 255, 0.1)')
                .style('stroke-width', '1px');
        });
    
    // Legend title font size calculation (for dimension planning) - Increased
    const titleFontSize = Math.max(14, Math.min(18, baseWidth / 18)); // Increased from 12-16 to 14-18, changed divisor from 20 to 18
    const titlePadding = 16; // Increased from 8 to 16 for better spacing
    const titleText = 'Game Maps';
    const approximateTitleWidth = titleText.length * (titleFontSize * 0.7); // Approximate title width
    
    // Get unique maps from the sequence
    const uniqueMaps = [];
    const seenMaps = new Set();
    
    mapSequence.forEach(game => {
        if (game.map && !seenMaps.has(game.map)) {
            uniqueMaps.push({
                map: game.map,
                color: game.color || '#4fc08d',
                gameNumber: game.gameNumber 
            });
            seenMaps.add(game.map);
        }
    });
    
    // Create vertical layout for legend items with responsive spacing - Improved spacing
    const itemHeight = Math.max(20, Math.min(28, baseHeight / uniqueMaps.length * 0.8)); // Increased from 16-24 to 20-28
    const totalContentHeight = uniqueMaps.length * itemHeight + 60; // Increased from +40 to +60 for better padding
    
    // Legend items (for width calculation)
    const legendItems = legendGroup.selectAll('.legend-item')
        .data(uniqueMaps)
        .enter()
        .append('g')
        .attr('class', 'legend-item');
    
    // Legend color boxes - responsive sizing
    const boxSize = Math.max(12, Math.min(18, itemHeight * 0.8)); // Increased from 10-14 to 12-18, changed multiplier from 0.7 to 0.8
    legendItems.append('rect')
        .attr('width', boxSize)
        .attr('height', boxSize)
        .attr('rx', 2)
        .attr('ry', 2)
        .style('fill', d => d.color)
        .style('stroke', 'rgba(255, 255, 255, 0.3)')
        .style('stroke-width', '1px');
    
    // Legend text with responsive font size - Increased for better readability
    const textFontSize = Math.max(12, Math.min(16, baseWidth / 20)); // Increased from 10-13 to 12-16, changed divisor from 25 to 20
    legendItems.append('text')
        .attr('x', boxSize + 8)
        .attr('y', boxSize / 2)
        .attr('dy', '0.35em')
        .text(d => d.map)
        .style('fill', '#e2e8f0')
        .style('font-size', `${textFontSize}px`)
        .style('font-weight', '500');
    
    // Calculate and set legend background size based on ALL content (including title)
    const maxTextWidth = Math.max(...uniqueMaps.map(d => d.map.length * (textFontSize * 0.6))); // Approximate text width
    const contentWidth = maxTextWidth + boxSize + 40; // Content width - Increased padding from 30 to 40
    const titleWidth = approximateTitleWidth + 32; // Title width with padding - Increased from 20 to 32
    const actualWidth = Math.max(150, Math.max(contentWidth, titleWidth)); // Ensure both title and content fit
    const actualHeight = Math.max(totalContentHeight, 100);
    
    legendBg
        .attr('width', actualWidth)
        .attr('height', actualHeight);
    
    // Position legend items using actual width for consistency - Improved spacing
    legendItems
        .attr('transform', (d, i) => `translate(16, ${40 + i * itemHeight})`); // Increased left padding from 12 to 16, top from 35 to 40
    
    // NOW create the title with correct positioning using actualWidth (info card style)
    legendGroup.append('text')
        .attr('class', 'legend-title')
        .attr('x', actualWidth / 2) // Use actual legend width for perfect centering
        .attr('y', titlePadding + titleFontSize) // Position based on font size and padding
        .style('text-anchor', 'middle')
        .style('font-size', '12px') // Match info card label size
        .style('font-weight', '500') // Match info card label weight
        .style('fill', '#94a3b8') // Match info card label color
        .style('text-transform', 'uppercase')
        .style('letter-spacing', '0.05em')
        .style('cursor', 'grab') // Make title also show grab cursor
        .text(titleText);
    
    // Add drag indicator (⋮⋮ dots) next to title for better UX
    legendGroup.append('text')
        .attr('class', 'legend-drag-indicator')
        .attr('x', actualWidth - 15) // Position near right edge
        .attr('y', titlePadding + titleFontSize - 2)
        .style('text-anchor', 'middle')
        .style('font-size', `${Math.max(10, titleFontSize - 2)}px`)
        .style('font-weight', '900')
        .style('fill', 'rgba(255, 255, 255, 0.4)')
        .style('cursor', 'grab')
        .style('user-select', 'none')
        .text('⋮⋮'); // Vertical dots to indicate draggable
    
    // Add fade-in animation and initialize draggable when complete
    legendGroup
        .style('opacity', 0)
        .transition()
        .duration(getAxisTransitionDuration.value)
        .ease(d3.easeQuadOut)
        .style('opacity', 1)
        .on('end', () => {
            // Initialize draggable functionality after animation completes
            initLegendDraggable(legendGroup);
        });
    
    console.log('✅ Legend rendered with', uniqueMaps.length, 'items at responsive position');
};

// Initialize draggable functionality for the legend
const initLegendDraggable = (legendGroup) => {
    try {
        // Cleanup any existing draggable instance
        if (legendDraggableInstance) {
            console.log('🧹 Cleaning up existing legend draggable instance');
            if (legendDraggableInstance.cleanup) {
                legendDraggableInstance.cleanup();
            } else if (GSAPDraggableManager && legendGroupElement?.id) {
                GSAPDraggableManager.destroyDraggable(legendGroupElement.id);
            }
            legendDraggableInstance = null;
        }
        
        // Get the actual DOM element from the D3 selection
        legendGroupElement = legendGroup.node();
        
        if (!legendGroupElement) {
            console.warn('⚠️ Legend DOM element not found for draggable initialization');
            return;
        }
        
        console.log('🎯 Initializing legend draggable functionality');
        
        // Check if GSAPDraggableManager is available
        if (!GSAPDraggableManager) {
            console.warn('⚠️ GSAPDraggableManager not available for legend');
            return;
        }
        
        // Initialize draggable with GSAP system
        legendDraggableInstance = GSAPDraggableManager.initializeDraggable(legendGroupElement, {
            type: 'x,y', // Allow both horizontal and vertical dragging
            bounds: 'body', // Allow dragging within the entire viewport
            inertia: true, // Smooth inertia when dragging stops
            cursor: 'grab', // Show grab cursor on hover
            activeCursor: 'grabbing' // Show grabbing cursor while dragging
        });
        
        if (legendDraggableInstance) {
            console.log('✅ Legend draggable initialized successfully');
            
            // Add visual feedback - slightly transparent when dragging
            if (legendGroupElement.addEventListener) {
                legendGroupElement.addEventListener('mousedown', () => {
                    legendGroup.style('opacity', 0.8);
                });
                legendGroupElement.addEventListener('mouseup', () => {
                    legendGroup.style('opacity', 1);
                });
            }
        } else {
            console.warn('⚠️ Legend draggable initialization failed');
        }
        
    } catch (error) {
        console.error('❌ Error initializing legend draggable:', error);
    }
};

const renderStackedBars = (data, config = {}) => {
    if (!data || !mainGroup.value || !scales.value.x || !scales.value.y) {
        console.warn('⚠️ Cannot render bars: missing data or scales');
        return;
    }
    
    const { 
        transitionDuration: duration = getTransitionDuration.value,
        currentGameIndex = currentGame.value,
        isFiltered: configIsFiltered = false 
    } = config;
    
    // Use the computed property from the store
    const currentIsFiltered = isFiltered.value;
    
    console.log('🎨 Rendering stacked bars for', data.length, 'teams at game index', currentGameIndex);
    console.log('🔍 Filtering:', currentIsFiltered, 'Filtered games:', filteredGameIndices.value);
    
    // Filter and process the data based on selected games
    let processedData = data;
    if (currentIsFiltered && filteredGameIndices.value && filteredGameIndices.value.length > 0) {
        // Filter each team's games to only include selected game indices
        processedData = data.map(teamData => {
            // Filter games
            const filteredGames = teamData.games.filter(game => 
                filteredGameIndices.value.includes(game.gameNumber) && 
                game.gameNumber <= currentGameIndex
            );
            
            // Recalculate startX positions for filtered games (cumulative positioning)
            let cumulativeScore = 0;
            const recalculatedGames = filteredGames.map(game => ({
                ...game,
                startX: cumulativeScore,
                cumulativeScore: cumulativeScore += game.points || 0
            }));
            
            return {
                ...teamData,
                games: recalculatedGames
            };
        });
        console.log('🔍 Filtered and recalculated data for games:', filteredGameIndices.value);
    } else {
        // Normal filtering - just limit by current game and recalculate positions
        processedData = data.map(teamData => {
            const currentGames = teamData.games.filter(game => game.gameNumber <= currentGameIndex);
            
            // Recalculate startX positions (cumulative positioning)
            let cumulativeScore = 0;
            const recalculatedGames = currentGames.map(game => ({
                ...game,
                startX: cumulativeScore,
                cumulativeScore: cumulativeScore += game.points || 0
            }));
            
            return {
                ...teamData,
                games: recalculatedGames
            };
        });
    }
    
    // Update scales after data filtering (only if needed)
    updateScales(processedData, currentGameIndex);
    updateAxes(processedData, Math.min(duration, getAxisTransitionDuration.value)); // Cap transition duration for performance
    
    // Sort teams by cumulative score (descending) for proper ranking
    const sortedData = currentGameIndex === 0 
        ? [...processedData].sort((a, b) => a.team.localeCompare(b.team)) // Alphabetical for initial state
        : [...processedData].sort((a, b) => {
            // Calculate cumulative scores for current game (using filtered games)
            const scoreA = a.games.reduce((sum, game) => sum + (game.points || 0), 0);
            const scoreB = b.games.reduce((sum, game) => sum + (game.points || 0), 0);
            return scoreB - scoreA; // Descending order (highest score first)
        });
    
    // Team groups - reduce DOM queries by caching selections
    const teamGroups = mainGroup.value.selectAll('.team-group')
        .data(sortedData, d => d.team);
    
    // Remove exiting teams (faster exit)
    teamGroups.exit()
        .transition().duration(duration / 3) // Faster exit
        .style('opacity', 0)
        .remove();
    
    // Add new team groups
    const teamGroupsEnter = teamGroups.enter()
        .append('g')
        .attr('class', 'team-group')
        .style('opacity', 0);
    
    // Merge and update
    const allTeamGroups = teamGroupsEnter.merge(teamGroups);
    
    // Position team groups based on ranking (synchronized with team names for smooth movement)
    const transition = duration > 0 ? 
        allTeamGroups.transition()
            .duration(getTeamMovementDuration.value)
            .ease(getTeamMovementEasing()) : 
        allTeamGroups;

    console.log('📊 Team charts movement duration:', getTeamMovementDuration.value, 'ms - synced with names');

    transition
        .style('opacity', 1)
        .attr('transform', (d, i) => {
            const ranking = i + 1; // Position 1-20 based on sorted order
            const yPos = scales.value.y(ranking);
            const bandwidth = scales.value.y.bandwidth();
            return `translate(0, ${yPos + bandwidth / 2})`;
        });
    
    // Render segments for each team (performance optimized)
    allTeamGroups.each(function(teamData) {
        renderTeamSegments(d3.select(this), teamData, { 
            transitionDuration: Math.min(duration, getTransitionDuration.value), // Cap transition duration
            currentGameIndex,
            isFiltered
        });
    });
    
    // Render cumulative labels (performance optimized)
    allTeamGroups.each(function(teamData) {
        renderCumulativeLabel(d3.select(this), teamData, Math.min(duration, 400));
    });
};

const renderTeamSegments = (teamGroup, teamData, config) => {
    const { transitionDuration: duration = getTransitionDuration.value } = config;
    
    if (!teamData.games || teamData.games.length === 0) {
        console.warn('⚠️ No games data for team:', teamData.team);
        return;
    }
    
    const segments = teamGroup.selectAll('.game-segment')
        .data(teamData.games, d => d.gameNumber);
    
    // Remove exiting segments
    segments.exit()
        .transition().duration(duration / 2)
        .attr('width', 0)
        .style('opacity', 0)
        .remove();
    
    // Add new segments
    const segmentsEnter = segments.enter()
        .append('g')
        .attr('class', 'game-segment');
    
    // Add rectangle for each segment
    segmentsEnter.append('rect')
        .attr('class', 'segment-bar')
        .attr('height', scales.value.y.bandwidth() * 0.8)
        .attr('y', -scales.value.y.bandwidth() * 0.4)
        .attr('width', 0)
        .style('opacity', 0)
        .style('cursor', 'pointer')
        .on('mouseover', function(event, gameData) {
            // Highlight the segment on hover
            d3.select(this)
                .style('stroke', '#ffffff')
                .style('stroke-width', '2px')
                .style('filter', 'brightness(1.2)');
            
            // Show tooltip
            showTooltip(event, gameData, teamData.team);
        })
        .on('mousemove', function(event, gameData) {
            // Update tooltip position on mouse move
            if (tooltip.value) {
                const [mouseX, mouseY] = d3.pointer(event, document.body);
                tooltip.value
                    .style('left', (mouseX + 15) + 'px')
                    .style('top', (mouseY - 10) + 'px');
            }
        })
        .on('mouseout', function() {
            // Remove highlight
            d3.select(this)
                .style('stroke', 'rgba(0,0,0,0.8)')
                .style('stroke-width', '1px')
                .style('filter', 'none');
            
            // Hide tooltip
            hideTooltip();
        });
    
    // Add text labels for segment points
    segmentsEnter.append('text')
        .attr('class', 'segment-label')
        .attr('dy', '0.35em')
        .style('font-size', `${getResponsiveFontSize(14)}px`)
        .style('font-weight', '600')
        .style('text-anchor', 'middle')
        .style('fill', '#ffffff')
        .style('text-shadow', '1px 1px 2px rgba(0,0,0,0.8)')
        .style('pointer-events', 'none');
    
    // Merge and update segments
    const allSegments = segmentsEnter.merge(segments);
    
    // Ensure ALL segments (new and existing) have event listeners
    allSegments.select('.segment-bar')
        .style('cursor', 'pointer')
        .on('mouseover', function(event, gameData) {
            // Highlight the segment on hover
            d3.select(this)
                .style('stroke', '#ffffff')
                .style('stroke-width', '2px')
                .style('filter', 'brightness(1.2)');
            
            // Show tooltip
            showTooltip(event, gameData, teamData.team);
        })
        .on('mousemove', function(event, gameData) {
            // Update tooltip position on mouse move
            if (tooltip.value) {
                const [mouseX, mouseY] = d3.pointer(event, document.body);
                tooltip.value
                    .style('left', (mouseX + 15) + 'px')
                    .style('top', (mouseY - 10) + 'px');
            }
        })
        .on('mouseout', function() {
            // Remove highlight
            d3.select(this)
                .style('stroke', 'rgba(0,0,0,0.8)')
                .style('stroke-width', '1px')
                .style('filter', 'none');
            
            // Hide tooltip
            hideTooltip();
        });
    
    updateSegments(allSegments, teamData, { transitionDuration: duration });
};

const updateSegments = (segments, teamData, config) => {
    const { transitionDuration: duration = getTransitionDuration.value, currentGameIndex = currentGame.value, isFiltered = false } = config;
    
    // Get bandwidth for consistent sizing
    const bandwidth = scales.value.y.bandwidth();
    if (isNaN(bandwidth)) {
        console.warn('⚠️ Invalid bandwidth in updateSegments');
        return;
    }
    
    // Performance optimization: batch DOM updates
    const updates = [];
    
    segments.each(function(gameData) {
        const segment = d3.select(this);
        const rect = segment.select('.segment-bar');
        
        if (rect.empty()) {
            console.warn('⚠️ Missing segment bar for game:', gameData.gameNumber);
            return;
        }
        
        // Calculate segment positioning (using recalculated startX from filtered data)
        const segmentX = scales.value.x(gameData.startX || 0);
        const segmentWidth = Math.max(1, scales.value.x(gameData.points || 0));
        const segmentColor = gameData.color || '#4fc08d';
        
        // Visibility logic - simplified for performance
        const isVisible = gameData.gameNumber <= currentGameIndex && (gameData.points || 0) > 0;
        
        // Batch the updates instead of immediate DOM manipulation
        updates.push({
            segment,
            rect,
            gameData,
            segmentX,
            segmentWidth,
            segmentColor,
            isVisible,
            bandwidth
        });
    });
    
    // Apply all updates in a single batch (much faster)
    updates.forEach(({ segment, rect, gameData, segmentX, segmentWidth, segmentColor, isVisible, bandwidth }) => {
        // Update segment rectangle - reduced transition duration for snappy feel
        const rectTransition = duration > 0 && duration < 1000 ? 
            rect.transition().duration(Math.min(duration, getSegmentTransitionDuration.value)) : // Much faster transitions
            rect;
        
        rectTransition
            .attr('x', segmentX)
            .attr('width', segmentWidth)
            .attr('height', bandwidth * 0.8)
            .attr('y', -bandwidth * 0.4)
            .attr('rx', getResponsivePointSize(6))
            .attr('ry', getResponsivePointSize(6))
            .style('fill', segmentColor)
            .style('stroke', 'rgba(0,0,0,0.8)')
            .style('stroke-width', '1px')
            .style('filter', 'drop-shadow(0 2px 4px rgba(0,0,0,0.4))')
            .style('opacity', isVisible ? 1 : 0);
        
        // Update segment label - performance optimized
        const label = segment.select('.segment-label');
        if (!label.empty()) {
            const labelTransition = duration > 0 && duration < 1000 ? 
                label.transition().duration(Math.min(duration, getSegmentTransitionDuration.value)) : // Faster label transitions
                label;
            
            // Only show labels for wider segments to reduce clutter and improve performance
            const showLabel = isVisible && segmentWidth > 25 && (gameData.points || 0) > 0;
            
            labelTransition
                .attr('x', segmentX + segmentWidth / 2)
                .attr('y', 0) // Centered vertically with the bar
                .text(showLabel ? (gameData.points || 0) : '')
                .style('opacity', showLabel ? 1 : 0)
                .style('font-size', () => {
                    // Responsive font sizing for narrow segments
                    const baseSize = segmentWidth < 35 ? 11 : 13;
                    return `${getResponsiveFontSize(baseSize)}px`;
                });
        }
    });
};

const renderCumulativeLabel = (teamGroup, teamData, duration = getTransitionDuration.value) => {
    if (!teamData || !teamData.games) {
        console.warn('⚠️ No team data for cumulative label:', teamData.team);
        return;
    }
    
    // Calculate cumulative score up to current game
    const currentGameIndex = currentGame.value;
    let cumulativeScore = 0;
    
    for (let i = 0; i < teamData.games.length && teamData.games[i].gameNumber <= currentGameIndex; i++) {
        cumulativeScore += teamData.games[i].points || 0;
    }
    
    let label = teamGroup.select('.cumulative-label');
    
    if (label.empty()) {
        label = teamGroup.append('text')
            .attr('class', 'cumulative-label')
            .attr('dy', '0.35em')
            .style('text-anchor', 'start')
            .style('font-size', getResponsiveFontSize(14) + 'px')
            .style('font-weight', '700')
            .style('fill', '#f1f5f9')
            .style('text-shadow', '1px 1px 2px rgba(0,0,0,0.8)');
    }
    
    const labelX = scales.value.x(cumulativeScore) + 8;
    
    const transition = duration > 0 ? 
        label.transition().duration(duration) : 
        label;
    
    transition
        .attr('x', labelX)
        .text(cumulativeScore || 0);
};

const renderInitialState = (data) => {
    console.log('🎬 Rendering initial state for', data?.length, 'teams');
    
    if (!data || data.length === 0) {
        console.warn('⚠️ No data for initial state');
        return;
    }
    
    // Clear existing chart elements
    if (mainGroup.value) {
        mainGroup.value.selectAll('.team-group').remove();
        mainGroup.value.selectAll('.game-segment').remove();
    }
    
    // Update scales for initial state (no bars, just team layout)
    updateScales(data);
    updateAxes(data, 0); // No transition for initial state
    
    console.log('✅ Initial state rendered');
};

// ============================================================================
// 4. TOOLTIP FUNCTIONALITY  
// ============================================================================

// Tooltip functionality
const tooltip = ref(null);

const createTooltip = () => {
    // Remove existing tooltip
    d3.select('body').selectAll('.chart-tooltip').remove();
    
    // Create tooltip element
    tooltip.value = d3.select('body')
        .append('div')
        .attr('class', 'chart-tooltip')
        .style('position', 'absolute')
        .style('visibility', 'hidden')
        .style('background', 'linear-gradient(135deg, rgba(26, 26, 26, 0.95) 0%, rgba(42, 42, 42, 0.95) 100%)')
        .style('backdrop-filter', 'blur(12px)')
        .style('border', '1px solid rgba(239, 68, 68, 0.3)')
        .style('border-radius', '8px')
        .style('padding', '12px 16px')
        .style('box-shadow', '0 8px 32px rgba(0, 0, 0, 0.3), 0 0 16px rgba(239, 68, 68, 0.1)')
        .style('color', '#ffffff')
        .style('font-family', 'Inter, system-ui, sans-serif')
        .style('font-size', '13px')
        .style('font-weight', '500')
        .style('line-height', '1.4')
        .style('pointer-events', 'none')
        .style('z-index', '9999')
        .style('max-width', '200px')
        .style('text-align', 'left');
    
    return tooltip.value;
};

const showTooltip = (event, gameData, teamName) => {
    if (!tooltip.value) return;
    
    // Debug: Log the gameData structure to understand what we're getting
    console.log('🔍 Tooltip gameData:', gameData);
    console.log('🔍 Tooltip teamName:', teamName);
    
    // Convert placement points back to placement (reverse lookup)
    const placementPoints = gameData.placementPoints || 0;
    const kills = gameData.kills || 0;
    const points = gameData.points || 0;
    const mapName = gameData.map || 'Unknown Map';
    const gameNumber = gameData.gameNumber || 1;
    
    // Reverse lookup placement from points (ALGS point system)
    const getPlacementFromPoints = (placementPoints) => {
        const pointsToPlacement = {
            12: 1, 9: 2, 7: 3, 5: 4, 4: 5,
            3: [6, 7], 2: [8, 9, 10], 1: [11, 12, 13, 14, 15],
            0: [16, 17, 18, 19, 20]
        };
        
        if (pointsToPlacement[placementPoints]) {
            const placement = pointsToPlacement[placementPoints];
            if (Array.isArray(placement)) {
                return placement[0]; // Use first placement for ranges
            }
            return placement;
        }
        return null;
    };
    
    // Format placement with ordinal suffix
    const getOrdinalSuffix = (num) => {
        if (typeof num !== 'number') return num;
        const lastDigit = num % 10;
        const lastTwoDigits = num % 100;
        
        if (lastTwoDigits >= 11 && lastTwoDigits <= 13) return `${num}th`;
        switch (lastDigit) {
            case 1: return `${num}st`;
            case 2: return `${num}nd`;
            case 3: return `${num}rd`;
            default: return `${num}th`;
        }
    };
    
    const placement = getPlacementFromPoints(placementPoints);
    const placementText = placement ? getOrdinalSuffix(placement) : `${placementPoints} pts`;
    
    tooltip.value
        .style('visibility', 'visible')
        .style('opacity', 0)
        .transition()
        .duration(200)
        .style('opacity', 1)
        .html(`
            <div style="border-bottom: 1px solid rgba(239, 68, 68, 0.3); margin-bottom: 10px; padding-bottom: 8px;">
                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                    <strong style="color: #ef4444; font-size: 15px; font-weight: 700;">${teamName}</strong>
                    <span style="color: #10b981; font-size: 12px; font-weight: 600; background: rgba(16, 185, 129, 0.1); padding: 2px 6px; border-radius: 4px;">Game ${gameNumber}</span>
                </div>
                <div style="color: #a0a0a0; font-size: 12px; font-weight: 500;">${mapName}</div>
            </div>
            <div style="display: grid; grid-template-columns: 1fr auto; gap: 12px 8px; align-items: center;">
                <span style="color: #e0e0e0; font-weight: 500;">Placement:</span>
                <span style="color: #4ade80; font-weight: 700; font-size: 14px;">${placementText}</span>
                
                <span style="color: #e0e0e0; font-weight: 500;">Kills:</span>
                <span style="color: #f87171; font-weight: 700; font-size: 14px;">${kills}</span>
                
                <span style="color: #e0e0e0; font-weight: 500;">Total Points:</span>
                <span style="color: #60a5fa; font-weight: 700; font-size: 14px;">${points}</span>
                
                ${placementPoints + kills > 0 ? `
                <span style="color: #e0e0e0; font-weight: 500; font-size: 11px; grid-column: 1 / -1; margin-top: 4px; padding-top: 4px; border-top: 1px solid rgba(255,255,255,0.1);">
                    ${placementPoints} placement + ${kills} kills = ${points} points
                </span>
                ` : ''}
            </div>
        `);
    
    // Improved tooltip positioning with viewport boundary checking
    const [mouseX, mouseY] = d3.pointer(event, document.body);
    const tooltipWidth = 220; // Approximate tooltip width
    const tooltipHeight = 140; // Approximate tooltip height
    
    // Calculate optimal position
    let left = mouseX + 15;
    let top = mouseY - 10;
    
    // Prevent tooltip from going off-screen
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    if (left + tooltipWidth > viewportWidth) {
        left = mouseX - tooltipWidth - 15; // Position to the left of cursor
    }
    
    if (top + tooltipHeight > viewportHeight) {
        top = mouseY - tooltipHeight - 10; // Position above cursor
    }
    
    // Ensure minimum distance from edges
    left = Math.max(10, Math.min(left, viewportWidth - tooltipWidth - 10));
    top = Math.max(10, Math.min(top, viewportHeight - tooltipHeight - 10));
    
    tooltip.value
        .style('left', left + 'px')
        .style('top', top + 'px');
};

const hideTooltip = () => {
    if (tooltip.value) {
        tooltip.value.style('visibility', 'hidden');
    }
};

// ============================================================================
// 5. LIFECYCLE HOOKS
// ============================================================================

onMounted(async () => {
    console.log('🚀 InteractiveRaceChart: Component mounted');
    
    await nextTick(); // Ensure DOM is ready
    
    setupSVG();
    updateDimensions();
    createTooltip(); // Initialize tooltip
    
    // Setup resize observer
    if (svgRef.value?.parentElement) {
        resizeObserver = new ResizeObserver(() => {
            updateDimensions();
            
            // Re-render legend with new dimensions if it's visible
            if (props.isLegendVisible) {
                renderLegend(true);
            }
            
            // Re-render with current data
            if (processedChartData.value && processedChartData.value.length > 0) {
                const currentData = extractGameData(processedChartData.value, currentGame.value);
                updateScales(currentData);
                updateAxes(currentData);
                
                if (currentGame.value === 0) {
                    renderInitialState(currentData);
                } else {
                    renderStackedBars(currentData);
                }
            }
        });
        resizeObserver.observe(svgRef.value.parentElement);
    }
    
    // Trigger initial render if data is already available
    console.log('🎯 InteractiveRaceChart: Checking for initial data:', {
        hasData: !!(processedChartData.value && processedChartData.value.length > 0),
        dataLength: processedChartData.value?.length || 0,
        currentGame: currentGame.value
    });
    
    if (processedChartData.value && processedChartData.value.length > 0) {
        console.log('📊 InteractiveRaceChart: Initial data available, triggering first render');
        const initialData = extractGameData(processedChartData.value, currentGame.value);
        updateScales(initialData);
        updateAxes(initialData, 0); // No transition for initial render
        
        if (currentGame.value === 0) {
            renderInitialState(initialData);
        } else {
            renderStackedBars(initialData, { transitionDuration: 0 });
        }
    } else {
        console.log('⏳ InteractiveRaceChart: No initial data, waiting for data prop changes');
    }
    
    console.log('✅ InteractiveRaceChart: Setup complete');
});

onUnmounted(() => {
    console.log('🧹 InteractiveRaceChart: Component unmounting');
    
    // Cancel all ongoing transitions and animations first
    cancelAllTransitions();
    
    // Clear any pending render requests
    if (pendingRenderRequest) {
        pendingRenderRequest = null;
    }
    
    // Reset rendering state
    isRenderingInProgress = false;
    
    if (resizeObserver) {
        resizeObserver.disconnect();
        resizeObserver = null;
    }
    
    // Clean up legend draggable instance
    if (legendDraggableInstance) {
        console.log('🧹 Cleaning up legend draggable instance');
        if (legendDraggableInstance.cleanup) {
            legendDraggableInstance.cleanup();
        } else if (GSAPDraggableManager && legendGroupElement?.id) {
            GSAPDraggableManager.destroyDraggable(legendGroupElement.id);
        }
        legendDraggableInstance = null;
        legendGroupElement = null;
    }
    
    // Clean up tooltip
    if (tooltip.value) {
        tooltip.value.remove();
        tooltip.value = null;
    }
    
    // Clean up any remaining tooltips in the DOM
    d3.select('body').selectAll('.chart-tooltip').remove();
    
    console.log('✅ InteractiveRaceChart: Cleanup completed');
});

// ============================================================================
// 6. HELPER FUNCTIONS
// ============================================================================

// Debouncing utility for performance optimization
const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

// Throttling utility for high-frequency updates
const throttle = (func, limit) => {
    let inThrottle;
    return function executedFunction(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
};

// State management for preventing race conditions
let isRenderingInProgress = false;
let pendingRenderRequest = null;

// Cancel any ongoing transitions to prevent conflicts
const cancelAllTransitions = () => {
    if (svgRef.value) {
        d3.select(svgRef.value).selectAll('*').interrupt();
        console.log('🛑 Cancelled all ongoing transitions');
    }
};

// Safe rendering wrapper that prevents race conditions
const safeRender = (renderFunction) => {
    return new Promise((resolve) => {
        if (isRenderingInProgress) {
            console.log('⏳ Render in progress, queuing next render...');
            pendingRenderRequest = () => safeRender(renderFunction).then(resolve);
            return;
        }
        
        isRenderingInProgress = true;
        
        // Use requestAnimationFrame for optimal timing
        requestAnimationFrame(() => {
            try {
                // Additional safety check before rendering
                if (!validateDOMState()) {
                    console.warn('⚠️ DOM state invalid, skipping render');
                    return;
                }
                
                renderFunction();
                console.log('✅ Render completed successfully');
            } catch (error) {
                console.error('❌ Render error:', error);
                
                // Try to recover by clearing problematic elements
                try {
                    if (mainGroup.value) {
                        mainGroup.value.selectAll('.transition-error').remove();
                        console.log('🔧 Cleared potentially problematic elements');
                    }
                } catch (recoveryError) {
                    console.error('❌ Recovery attempt failed:', recoveryError);
                }
            } finally {
                isRenderingInProgress = false;
                
                // Process any pending render requests
                if (pendingRenderRequest) {
                    const nextRender = pendingRenderRequest;
                    pendingRenderRequest = null;
                    // Add small delay before next render to prevent cascading errors
                    setTimeout(() => nextRender(), 10);
                } else {
                    resolve();
                }
            }
        });
    });
};

// Validate DOM elements before rendering
const validateDOMState = () => {
    if (!svgRef.value) {
        console.warn('⚠️ SVG reference not available');
        return false;
    }
    
    if (!mainGroup.value) {
        console.warn('⚠️ Main group not initialized');
        return false;
    }
    
    return true;
};

/**
 * Extract game data for a specific game index from the processed data
 */
const extractGameData = (data, gameIndex) => {
    if (!data || data.length === 0) return [];
    
    // Assume data is already in the format we need (array of team objects with game data)
    // This will depend on how the parent component passes the data
    if (data[0] && typeof data[0].team === 'string') {
        // Data is already in the correct format
        return data;
    }
    
    // If data needs to be extracted from a different format, handle it here
    console.warn('⚠️ Data format not recognized, using as-is');
    return data;
};



// ============================================================================
// 7. REACTIVE WATCHERS
// ============================================================================

// Watch for compression factor changes
watch(() => props.compressionFactor, () => {
  console.log('🔄 Compression factor changed, updating dimensions');
  updateDimensions();
});

// Watch for data changes (new matchup loaded)
  watch(() => processedChartData.value, (newData) => {
    console.log('📊 InteractiveRaceChart: Data changed, re-rendering chart');
    console.log('🔍 Data details:', {
        hasData: !!(newData && newData.length > 0),
        dataLength: newData?.length || 0,
        sampleData: newData?.[0] || null,
        currentGame: props.currentGame
    });
    
    if (!newData || newData.length === 0) {
        console.warn('⚠️ No data provided to chart');
        return;
    }
    
    // Cancel any ongoing transitions before rendering new data
    cancelAllTransitions();
    
    const gameData = extractGameData(newData, currentGame.value);
    console.log('🎮 Extracted game data:', {
        teams: gameData.length,
        sampleTeam: gameData[0],
        currentGame: currentGame.value
    });
    
    // Use safe rendering for data changes
    safeRender(() => {
        if (!validateDOMState()) return;
        
        updateScales(gameData);
        updateAxes(gameData);
        
        if (currentGame.value === 0) {
            console.log('🎬 Rendering initial state');
            renderInitialState(gameData);
        } else {
            console.log('🎨 Rendering stacked bars');
            renderStackedBars(gameData);
        }
    });
}, { deep: true });

// Debounced game change handler for rapid slider movements
const debouncedGameUpdate = debounce((newGame, oldGame) => {
    console.log('🎮 InteractiveRaceChart: Processing debounced game change from', oldGame, 'to', newGame);
    
    if (!processedChartData.value || processedChartData.value.length === 0) {
        console.warn('⚠️ No data available for game change');
        return;
    }
    
    // Cancel any ongoing transitions
    cancelAllTransitions();
    
    const gameData = extractGameData(processedChartData.value, newGame);
    
    // Use safe rendering for game changes
    safeRender(() => {
        if (!validateDOMState()) return;
        
        updateScales(gameData, newGame);
        updateAxes(gameData);
        
        if (newGame === 0) {
            renderInitialState(gameData);
        } else {
            renderStackedBars(gameData, { currentGameIndex: newGame });
        }
    });
}, 50); // 50ms debounce - fast enough to feel responsive, slow enough to prevent race conditions

// Immediate update for non-rapid changes (backup for smooth single changes)
const immediateGameUpdate = throttle((newGame, oldGame) => {
    console.log('🎮 InteractiveRaceChart: Immediate game update from', oldGame, 'to', newGame);
    
    if (!processedChartData.value || processedChartData.value.length === 0) {
        console.warn('⚠️ No data available for game change');
        return;
    }
    
    const gameData = extractGameData(processedChartData.value, newGame);
    
    // Only do immediate update if no render is in progress
    if (!isRenderingInProgress) {
        cancelAllTransitions();
        
        safeRender(() => {
            if (!validateDOMState()) return;
            
            updateScales(gameData, newGame);
            updateAxes(gameData);
            
            if (newGame === 0) {
                renderInitialState(gameData);
            } else {
                renderStackedBars(gameData, { currentGameIndex: newGame });
            }
        });
    }
}, 16); // ~60fps throttling for immediate updates

// Watch for currentGame changes with both immediate and debounced handling
watch(() => currentGame.value, (newGame, oldGame) => {
    // Try immediate update first (for single changes)
    immediateGameUpdate(newGame, oldGame);
    
    // Always queue debounced update (for rapid changes)
    debouncedGameUpdate(newGame, oldGame);
});

// Watch for filtering changes - DEBOUNCED for performance
const debouncedFilterUpdate = debounce((newIsFiltered, newFilteredIndices) => {
    console.log('🔍 InteractiveRaceChart: Processing debounced filter change', { 
        nowFiltered: newIsFiltered,
        newIndices: newFilteredIndices
    });
    
    if (!processedChartData.value || processedChartData.value.length === 0) {
        console.warn('⚠️ No data available for filter change');
        return;
    }
    
    cancelAllTransitions();
    
    const gameData = extractGameData(processedChartData.value, currentGame.value);
    
    safeRender(() => {
        if (!validateDOMState()) return;
        
        if (currentGame.value === 0) {
            renderInitialState(gameData);
        } else {
            renderStackedBars(gameData, { 
                currentGameIndex: currentGame.value,
                isFiltered: newIsFiltered 
            });
        }
    });
}, 150); // 150ms debounce for smooth performance

  watch(() => [isFiltered.value, filteredGameIndices.value], ([newIsFiltered, newFilteredIndices], [oldIsFiltered, oldFilteredIndices]) => {
    console.log('🔍 InteractiveRaceChart: Filter change detected', { 
        wasFiltered: oldIsFiltered, 
        nowFiltered: newIsFiltered,
        oldIndices: oldFilteredIndices,
        newIndices: newFilteredIndices
    });
    
    // Use debounced update for better performance
    debouncedFilterUpdate(newIsFiltered, newFilteredIndices);
}, { deep: true });

// Watch for maxGames changes
watch(() => maxGames.value, (newMaxGames) => {
    console.log('🎯 InteractiveRaceChart: MaxGames changed to', newMaxGames);
    // Scales will be updated in the next render cycle
});

// Watch the computed property from the store
watch(isLegendVisible, (newVisible) => {
    console.log('🏷️ InteractiveRaceChart: Legend visibility changed to', newVisible);
    renderLegend(newVisible);
});


</script>

<style scoped>

.algs-chart-svg {
  width: 100%;
  height: 100%;
  min-height: 400px;
  max-height: 100%;
  overflow: visible;
  background: transparent;
  display: block;
  margin: 0;
  padding: 0;
  position: relative;
}


:deep(.x-axis) {
  color: #94a3b8;
}

:deep(.x-axis text) {
  fill: #94a3b8;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}

:deep(.x-axis line),
:deep(.x-axis path) {
  stroke: #94a3b8;
}

:deep(.team-entry) {
  pointer-events: none;
}

:deep(.ranking-number) {
  font-weight: 700;
  font-size: 16px;
  fill: #ef4444;
  text-shadow: 
    0 1px 3px rgba(0, 0, 0, 0.8),
    0 0 6px rgba(239, 68, 68, 0.4);
  letter-spacing: 0.1px;
}

:deep(.team-label) {
  font-weight: 650;
  font-size: 14px;
  fill: #f8fafc;
  text-shadow: 
    0 1px 3px rgba(0, 0, 0, 0.7),
    0 0 6px rgba(255, 68, 68, 0.25);
  letter-spacing: 0.3px;
}

:deep(.cumulative-label) {
  font-weight: 700;
  font-size: 14px;
  fill: #ffffff;
  text-shadow: 
    0 1px 3px rgba(0, 0, 0, 0.8),
    0 0 8px rgba(255, 68, 68, 0.3);
  letter-spacing: 0.2px;
}

:deep(.segment-bar) {
  stroke: rgba(255, 255, 255, 0.2);
  stroke-width: 1px;
}

:deep(.logo-background) {
  fill: rgba(0, 0, 0, 0.8);
  stroke: rgba(0, 0, 0, 0.3);
  stroke-width: 1px;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.4));
}

:deep(.team-logo-image) {
  opacity: 0;
  transition: opacity 0.3s ease;
}

:deep(.logo-fallback) {
  opacity: 1;
  transition: opacity 0.3s ease;
}

:deep(.fallback-bg) {
  stroke: rgba(0, 0, 0, 0.5);
  stroke-width: 1px;
}

:deep(.fallback-text) {
  fill: #ffffff;
  font-weight: 700;
  text-shadow: 0 1px 2px rgba(0,0,0,0.5);
  pointer-events: none;
}

:deep(.logo-text) {
  fill: white;
  font-size: 12px;
  text-anchor: middle;
}
</style> 