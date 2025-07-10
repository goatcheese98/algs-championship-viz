/**
 * ChartRenderer - Handles all D3.js chart rendering operations
 * Extracted from ChartEngine.js for better modularity and performance
 */

// Ensure D3 is available
const d3 = window.d3
if (!d3) {
    throw new Error('D3.js is not available. Please ensure d3.v7.min.js is loaded.')
}

export class ChartRenderer {
    constructor(container, margin, scales, teamConfig = null) {
        this.container = container
        this.margin = margin
        this.xScale = scales.x
        this.yScale = scales.y
        this.teamConfig = teamConfig
        this.svg = null
        this.mainGroup = null
        this.xAxisGroup = null
        this.yAxisGroup = null
        this.customYAxisGroup = null
        
        // Flag to prevent y-axis stutter during transitions
        this.yAxisUpdateInProgress = false
        
        this.setupSVG()
    }
    
    setupSVG() {
        this.svg = this.container.append('svg')
            .style('width', '100%')
            .style('height', '100%')
            .style('display', 'block')
            .style('position', 'relative')
            .style('z-index', '1')
            .style('overflow', 'visible')
        
        this.mainGroup = this.svg.append('g')
            .attr('class', 'main-group')
            .attr('transform', `translate(${this.margin.left},${this.margin.top})`)
        
        this.xAxisGroup = this.mainGroup.append('g')
            .attr('class', 'x-axis axis x-axis-large-font')
        
        this.yAxisGroup = this.mainGroup.append('g')
            .attr('class', 'y-axis')
        
        this.customYAxisGroup = this.mainGroup.append('g')
            .attr('class', 'custom-y-axis')
    }
    
    updateDimensions(width, height) {
        const totalWidth = width + this.margin.left + this.margin.right
        const totalHeight = height + this.margin.top + this.margin.bottom
        
        // Ensure SVG doesn't exceed container bounds
        const maxWidth = Math.min(totalWidth, window.innerWidth * 0.98)
        const maxHeight = Math.min(totalHeight, window.innerHeight * 0.9)
        
        this.svg
            .attr('width', maxWidth)
            .attr('height', maxHeight)
            .style('max-width', '100%')
            .style('max-height', '100%')
            .style('overflow', 'visible')
        
        // Update main group transform with responsive margins
        this.mainGroup.attr('transform', `translate(${this.margin.left},${this.margin.top})`)
        
        // Position x-axis at the bottom of the chart area (always visible)
        this.xAxisGroup.attr('transform', `translate(0,${height})`)
        
        // Update scales with responsive ranges
        this.xScale.range([0, width])
        this.yScale.range([0, height])
        
        // Add responsive scaling for better mobile experience
        if (window.innerWidth < 700) {
            this.svg.style('transform', 'scale(0.95)')
            this.svg.style('transform-origin', 'top left')
        } else {
            this.svg.style('transform', 'scale(1)')
        }
    }
    
    renderStackedBars(data, config = {}) {
        const { transitionDuration = 1500, currentGameIndex = 1, isFiltered = false, filteredGameIndices = [] } = config
        
        // Validate that scales have valid domains
        if (!this.yScale.domain().length || !this.xScale.domain().length) {
            console.warn('⚠️ Scales not properly initialized, skipping render')
            return
        }
        
        // Check for NaN values in bandwidth
        if (isNaN(this.yScale.bandwidth())) {
            console.warn('⚠️ Y scale bandwidth is NaN, skipping render')
            return
        }
        
        // CRITICAL: Clear ALL initial state elements ONLY if they exist (to prevent repeated clearing)
        if (this.mainGroup.selectAll('.team-group.initial-state').size() > 0) {
            this.mainGroup.selectAll('.team-group.initial-state').remove()
            this.mainGroup.selectAll('.ranking-number').remove()
            this.mainGroup.selectAll('.team-label').remove()
            this.mainGroup.selectAll('.logo-container').remove()
            console.log('🧹 Cleared initial state elements (one-time transition)')
        }
        
        // Create team groups for playing state
        const teamGroups = this.mainGroup.selectAll('.team-group')
            .data(data, d => d.team)
        
        teamGroups.exit().remove()
        
        const teamGroupsEnter = teamGroups.enter()
            .append('g')
            .attr('class', 'team-group playing-state')
        
        const allTeamGroups = teamGroups.merge(teamGroupsEnter)
        
        // Position team groups with synchronized animation (same timing as y-axis)
        allTeamGroups
            .transition()
            .duration(transitionDuration)
            .ease(d3.easeQuadOut)
            .attr('transform', d => {
                const yPos = this.yScale(d.team)
                const bandwidth = this.yScale.bandwidth()
                
                if (isNaN(yPos) || isNaN(bandwidth)) {
                    console.warn('⚠️ Invalid position values, using fallback')
                    return `translate(0, 0)`
                }
                
                return `translate(0, ${yPos + bandwidth / 2})`
            })
        
        // Render game segments for each team
        allTeamGroups.each((teamData, i, nodes) => {
            this.renderTeamSegments(d3.select(nodes[i]), teamData, { 
                transitionDuration, 
                currentGameIndex, 
                isFiltered, 
                filteredGameIndices 
            })
        })
    }
    
    renderTeamSegments(teamGroup, teamData, config) {
        const { transitionDuration, currentGameIndex, isFiltered, filteredGameIndices } = config
        
        // Validate bandwidth before using it
        const bandwidth = this.yScale.bandwidth()
        if (isNaN(bandwidth)) {
            console.warn('⚠️ Invalid bandwidth in renderTeamSegments, using fallback')
            return
        }
        
        // Game segments
        const gameSegments = teamGroup.selectAll('.game-segment')
            .data(teamData.games, d => d.gameNumber)
        
        gameSegments.exit().remove()
        
        const segmentsEnter = gameSegments.enter()
            .append('g')
            .attr('class', 'game-segment')
        
        // Add rectangles for game segments with normal thickness
        segmentsEnter.append('rect')
            .attr('class', 'segment-bar')
            .attr('height', bandwidth * 0.8)  // Reduced from 1.5 to 0.8 for normal thickness
            .attr('y', -bandwidth * 0.4)     // Position bars UP to align with team labels
            .attr('x', 0)
            .attr('width', 0)               // Start with 0 width - will grow horizontally only
            .attr('rx', 6)  // Slightly smaller radius
            .attr('ry', 6)
            .style('transform-origin', 'left center')  // Ensure bars grow from left edge
            .style('opacity', 1)  // Full opacity, no fade-in effects
        
        // Add text labels for game points
        segmentsEnter.append('text')
            .attr('class', 'segment-label')
            .attr('y', 0)    // Position text inside the bars (bars are centered at 0)
            .attr('dy', '0.35em')
            .style('font-size', '14px')
            .style('font-weight', '600')
            .style('text-anchor', 'middle')
            .style('fill', '#ffffff')      // White color for visibility inside bars
            .style('text-shadow', '1px 1px 2px rgba(0,0,0,0.8)')
        
        const allSegments = gameSegments.merge(segmentsEnter)
        
        // Update segments with animation
        this.updateSegments(allSegments, teamData, { transitionDuration, currentGameIndex, isFiltered, filteredGameIndices })
        
        // Add cumulative score label
        this.renderCumulativeLabel(teamGroup, teamData, transitionDuration)
    }
    
    updateSegments(segments, teamData, config) {
        const { transitionDuration, currentGameIndex, isFiltered, filteredGameIndices } = config
        
        // Get bandwidth once and validate
        const bandwidth = this.yScale.bandwidth()
        if (isNaN(bandwidth)) {
            console.warn('⚠️ Invalid bandwidth in updateSegments')
            return
        }
        
        // Update segment rectangles
        segments.select('.segment-bar')
            .style('opacity', d => {
                if (isFiltered && filteredGameIndices.length > 0) {
                    return filteredGameIndices.includes(d.gameNumber) ? 1 : 0
                }
                return d.gameNumber <= currentGameIndex ? 1 : 0
            })
            .transition()
            .duration(transitionDuration)
            .attr('x', d => {
                if (isFiltered && filteredGameIndices.length > 0) {
                    return filteredGameIndices.includes(d.gameNumber) ? this.xScale(d.startX) : this.xScale(teamData.cumulativeScore)
                }
                return d.gameNumber > currentGameIndex ? this.xScale(teamData.cumulativeScore) : this.xScale(d.startX)
            })
            .attr('width', d => {
                if (isFiltered && filteredGameIndices.length > 0) {
                    return filteredGameIndices.includes(d.gameNumber) ? this.xScale(d.points) : 0
                }
                return d.gameNumber <= currentGameIndex ? this.xScale(d.points) : 0
            })
            .attr('height', bandwidth * 0.8)  // Consistent normal thickness
            .attr('y', -bandwidth * 0.4)     // Consistent positioning - bars aligned with team labels
            .attr('rx', 6)  // Consistent radius
            .attr('ry', 6)
            .style('fill', d => d.color)
            .style('stroke', 'rgba(0,0,0,0.8)')
            .style('stroke-width', '1px')
            .style('filter', 'drop-shadow(0 2px 4px rgba(0,0,0,0.4))')
        
        // Update segment labels with improved logic for small values
        segments.select('.segment-label')
            .transition()
            .duration(transitionDuration)
            .attr('x', d => {
                const segmentWidth = isFiltered && filteredGameIndices.length > 0 
                    ? (filteredGameIndices.includes(d.gameNumber) ? this.xScale(d.points) : 0)
                    : (d.gameNumber <= currentGameIndex ? this.xScale(d.points) : 0)
                
                const segmentStart = isFiltered && filteredGameIndices.length > 0
                    ? (filteredGameIndices.includes(d.gameNumber) ? this.xScale(d.startX) : this.xScale(teamData.cumulativeScore))
                    : (d.gameNumber > currentGameIndex ? this.xScale(teamData.cumulativeScore) : this.xScale(d.startX))
                
                return segmentStart + segmentWidth / 2
            })
            .attr('y', 0)   // Position inside bars (bars are centered at 0)
            .text(d => {
                const isVisible = isFiltered && filteredGameIndices.length > 0 
                    ? filteredGameIndices.includes(d.gameNumber)
                    : d.gameNumber <= currentGameIndex
                
                const segmentWidth = isFiltered && filteredGameIndices.length > 0 
                    ? (filteredGameIndices.includes(d.gameNumber) ? this.xScale(d.points) : 0)
                    : (d.gameNumber <= currentGameIndex ? this.xScale(d.points) : 0)
                
                // Show points if segment is visible and points > 0
                // Lowered threshold from 30 to 15 to show "1" in narrow segments
                return (isVisible && segmentWidth > 15 && d.points > 0) ? d.points : ''
            })
            .style('opacity', d => {
                const isVisible = isFiltered && filteredGameIndices.length > 0 
                    ? filteredGameIndices.includes(d.gameNumber)
                    : d.gameNumber <= currentGameIndex
                
                const segmentWidth = isFiltered && filteredGameIndices.length > 0 
                    ? (filteredGameIndices.includes(d.gameNumber) ? this.xScale(d.points) : 0)
                    : (d.gameNumber <= currentGameIndex ? this.xScale(d.points) : 0)
                
                return (isVisible && segmentWidth > 15 && d.points > 0) ? 1 : 0
            })
            .style('font-size', d => {
                const segmentWidth = isFiltered && filteredGameIndices.length > 0 
                    ? (filteredGameIndices.includes(d.gameNumber) ? this.xScale(d.points) : 0)
                    : (d.gameNumber <= currentGameIndex ? this.xScale(d.points) : 0)
                
                // Use smaller font for narrow segments to ensure "1" fits
                return segmentWidth < 25 ? '12px' : '14px'
            })
    }
    
    renderCumulativeLabel(teamGroup, teamData, transitionDuration) {
        // Validate bandwidth
        const bandwidth = this.yScale.bandwidth()
        if (isNaN(bandwidth)) {
            console.warn('⚠️ Invalid bandwidth in renderCumulativeLabel')
            return
        }
        
        const cumulativeLabel = teamGroup.selectAll('.cumulative-label')
            .data([teamData])
        
        cumulativeLabel.exit().remove()
        
        const cumulativeLabelEnter = cumulativeLabel.enter()
            .append('text')
            .attr('class', 'cumulative-label')
            .attr('y', 0)    // Position on same axis as bars
            .attr('dy', '0.35em')
            .style('font-size', '14px')
            .style('font-weight', '700')
            .style('fill', '#f1f5f9')
            .style('text-anchor', 'start')
            .style('filter', 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))')
        
        cumulativeLabel.merge(cumulativeLabelEnter)
            .transition()
            .duration(transitionDuration)
            .attr('x', d => this.xScale(d.cumulativeScore) + 8)
            .attr('y', 0)    // Position on same axis as bars
            .text(d => d.cumulativeScore)
    }
    
    updateAxes(data, transitionDuration = 1500) {
        // DEBUG: Check what the x-axis domain actually is
        console.log('🔍 ChartRenderer updateAxes - xScale domain:', this.xScale.domain())
        console.log('🔍 ChartRenderer updateAxes - xScale range:', this.xScale.range())
        
        // Update X axis with improved configuration
        const xAxis = d3.axisBottom(this.xScale)
            .tickFormat(d3.format('.0f'))  // Force integer format
            .ticks(8)  // Limit number of ticks
            
        // DEBUG: Check what ticks we're getting
        const allTicks = this.xScale.ticks(8)
        const integerTicks = allTicks.filter(tick => tick % 1 === 0)
        console.log('🔍 All ticks:', allTicks)
        console.log('🔍 Integer ticks:', integerTicks)
        
        // Only filter for integer ticks if we have a reasonable domain
        const domain = this.xScale.domain()
        const domainRange = domain[1] - domain[0]
        
        if (domainRange > 1) {
            // Normal case - filter for integer ticks
            console.log('🔍 Setting tickValues to integer ticks:', integerTicks)
            xAxis.tickValues(integerTicks)
        } else {
            // Small domain case - use default ticks
            console.log('🔍 Using default ticks due to small domain range:', domainRange)
        }
        
        // DEBUG: Check what the axis is actually going to render
        console.log('🔍 Final axis configuration:')
        console.log('  - Domain:', domain)
        console.log('  - Range:', this.xScale.range())
        console.log('  - Tick values:', integerTicks)
        
        // Apply the axis
        this.xAxisGroup.call(xAxis)
        
        // DEBUG: Check what ticks were actually rendered
        const renderedTicks = this.xAxisGroup.selectAll('.tick text').nodes().map(node => node.textContent)
        console.log('🔍 Actually rendered tick labels:', renderedTicks)
        
        // Force X-axis styling
        this.xAxisGroup.selectAll('text')
            .style('font-size', '24px', 'important')
            .style('font-weight', '700', 'important')
            .style('font-family', 'Inter, Roboto Mono, monospace', 'important')
            .style('fill', '#f1f5f9', 'important')
            .style('filter', 'drop-shadow(0 0 3px rgba(220, 38, 38, 0.3)) drop-shadow(0 1px 2px rgba(0,0,0,0.8))', 'important')
        
        // Update Y axis with synchronized timing
        this.updateCustomYAxis(data, transitionDuration)
    }
    
    updateCustomYAxis(data, transitionDuration = 1500) {
        // Prevent double rendering during transitions
        if (this.yAxisUpdateInProgress) {
            return;
        }
        this.yAxisUpdateInProgress = true;
        
        console.log('🎯 Updating y-axis - synchronized with bar animation')
        
        // CRITICAL: Remove ALL initial state elements to prevent dual text effect (only once)
        if (this.mainGroup.selectAll('.team-group.initial-state').size() > 0) {
            this.mainGroup.selectAll('.team-group.initial-state').remove()
            this.mainGroup.selectAll('.ranking-number').remove()
            this.mainGroup.selectAll('.team-label').remove()
            this.mainGroup.selectAll('.logo-container').remove()
            console.log('🧹 Cleared initial state elements from y-axis (one-time)')
        }
        
        // Use data join approach to handle updates properly
        const teamEntries = this.customYAxisGroup.selectAll('.team-entry')
            .data(data, d => d.team)
        
        // Remove exiting elements
        teamEntries.exit().remove()
        
        // Enter new elements
        const teamEntriesEnter = teamEntries.enter()
            .append('g')
            .attr('class', 'team-entry')
            .attr('transform', d => `translate(0, ${this.yScale(d.team) + this.yScale.bandwidth() / 2})`)
        
        this.setupTeamEntries(teamEntriesEnter)
        
        // Merge enter and update selections
        const allTeamEntries = teamEntries.merge(teamEntriesEnter)
        
        // Synchronize with bar animation timing (use passed duration)
        allTeamEntries
            .transition()
            .duration(transitionDuration)  // Match bar animation duration exactly
            .ease(d3.easeQuadOut)
            .attr('transform', d => `translate(0, ${this.yScale(d.team) + this.yScale.bandwidth() / 2})`)
        
        // Update text content with same timing
        allTeamEntries.select('.ranking-number')
            .text((d, i) => i + 1)
        
        allTeamEntries.select('.team-label')
            .text(d => d.team)
        
        // Update team logos
        this.updateTeamLogos(allTeamEntries)
        
        // Reset flag after animation completes
        setTimeout(() => {
            this.yAxisUpdateInProgress = false;
        }, transitionDuration + 100);  // Slightly longer than animation duration
    }
    
    setupTeamEntries(teamEntriesEnter) {
        // Calculate responsive positioning based on available margin
        const windowWidth = window.innerWidth
        let rankingX = -260
        let logoX = -220
        let labelX = -180
        
        // Adjust positioning for smaller screens
        if (windowWidth < 1200) {
            rankingX = Math.max(-240, -this.margin.left + 20)
            logoX = Math.max(-200, -this.margin.left + 40)
            labelX = Math.max(-160, -this.margin.left + 60)
        }
        
        if (windowWidth < 900) {
            rankingX = Math.max(-220, -this.margin.left + 15)
            logoX = Math.max(-180, -this.margin.left + 35)
            labelX = Math.max(-140, -this.margin.left + 55)
        }
        
        if (windowWidth < 700) {
            rankingX = Math.max(-140, -this.margin.left + 10)
            logoX = Math.max(-115, -this.margin.left + 25)
            labelX = Math.max(-85, -this.margin.left + 45)
        }
        
        // Add ranking number with responsive positioning
        teamEntriesEnter.append('text')
            .attr('class', 'ranking-number')
            .attr('x', rankingX)
            .attr('dy', '0.35em')
            .style('text-anchor', 'middle')
            .style('font-size', windowWidth < 700 ? '14px' : '18px')
            .style('font-weight', '700')
            .style('fill', '#dc2626')
        
        // Add team logo container with responsive positioning
        const logoGroup = teamEntriesEnter.append('g')
            .attr('class', 'logo-container')
            .attr('transform', `translate(${logoX}, 0)`)
        
        // Logo background
        logoGroup.append('circle')
            .attr('class', 'logo-background')
            .attr('r', 16)
            .style('fill', 'rgba(0, 0, 0, 0.8)')
            .style('stroke', 'rgba(0, 0, 0, 0.3)')
            .style('stroke-width', '1px')
            .style('filter', 'drop-shadow(0 2px 4px rgba(0,0,0,0.4))')
        
        // Logo image
        logoGroup.append('image')
            .attr('class', 'team-logo-image')
            .attr('x', -14)
            .attr('y', -14)
            .attr('width', 28)
            .attr('height', 28)
            .style('opacity', 0)
            .style('clip-path', 'circle(14px at center)')
        
        // Fallback logo
        const fallbackGroup = logoGroup.append('g')
            .attr('class', 'logo-fallback')
            .style('opacity', 1)
        
        fallbackGroup.append('circle')
            .attr('class', 'fallback-bg')
            .attr('r', 14)
            .style('stroke', 'rgba(0, 0, 0, 0.5)')
            .style('stroke-width', '1px')
        
        fallbackGroup.append('text')
            .attr('class', 'fallback-text')
            .attr('dy', '0.35em')
            .style('text-anchor', 'middle')
            .style('font-size', '12px')
            .style('font-weight', '700')
            .style('fill', '#ffffff')
            .style('text-shadow', '0 1px 2px rgba(0,0,0,0.5)')
        
        // Add team name label with responsive positioning
        teamEntriesEnter.append('text')
            .attr('class', 'team-label')
            .attr('x', labelX)
            .attr('dy', '0.35em')
            .style('text-anchor', 'start')
            .style('font-size', windowWidth < 700 ? '14px' : '18px')
            .style('font-weight', '600')
            .style('fill', '#f1f5f9')
    }
    
    updateTeamLogos(teamEntries) {
        teamEntries.each((teamData, i, nodes) => {
            const teamGroup = d3.select(nodes[i])
            const teamName = teamData.team
            
            // Use injected teamConfig or fallback to global window.TeamConfig
            const config = this.teamConfig || window.TeamConfig
            const logoUrl = config?.getTeamLogo(teamName)
            const logoImage = teamGroup.select('.team-logo-image')
            const fallbackGroup = teamGroup.select('.logo-fallback')
            
            // Setup fallback styling first
            const fallbackConfig = config?.getFallbackConfig(teamName) || 
                { backgroundColor: '#dc2626', initials: teamName.substring(0, 2), icon: '🏆' }
            
            fallbackGroup.select('.fallback-bg')
                .style('fill', fallbackConfig.backgroundColor)
            
            const displayText = fallbackConfig.initials.length <= 3 ? 
                fallbackConfig.initials : fallbackConfig.icon
            
            fallbackGroup.select('.fallback-text')
                .text(displayText)
                .style('font-size', displayText.length > 2 ? '10px' : '12px')
            
            // Handle logo loading
            if (logoUrl) {
                logoImage.attr('href', logoUrl)
                
                // Show fallback first, then try to load image
                fallbackGroup.style('opacity', 1)
                logoImage.style('opacity', 0)
                
                // Test image loading
                const testImg = new Image()
                testImg.onload = () => {
                    // Image loaded successfully, show it
                    logoImage.style('opacity', 1)
                    fallbackGroup.style('opacity', 0)
                }
                testImg.onerror = () => {
                    // Image failed to load, keep fallback
                    logoImage.style('opacity', 0)
                    fallbackGroup.style('opacity', 1)
                    console.warn(`Failed to load logo for ${teamName}:`, logoUrl)
                }
                testImg.src = logoUrl
            } else {
                // No logo URL, use fallback
                logoImage.style('opacity', 0)
                fallbackGroup.style('opacity', 1)
                console.log(`No logo URL for ${teamName}, using fallback`)
            }
        })
    }
    
    /**
     * Render initial team layout (just names and axes, no bars)
     * @param {Array} data - Team data
     * @param {Object} config - Configuration
     */
    renderInitialTeamLayout(data, config = {}) {
        const { transitionDuration = 2500 } = config
        
        // CRITICAL: Clear ALL existing elements from both systems
        this.mainGroup.selectAll('.team-group').remove()
        this.mainGroup.selectAll('.game-segment').remove()
        this.mainGroup.selectAll('.segment-bar').remove()
        this.mainGroup.selectAll('.segment-label').remove()
        this.mainGroup.selectAll('.cumulative-label').remove()
        this.customYAxisGroup.selectAll('*').remove()
        this.yAxisGroup.selectAll('*').remove()
        
        console.log('🧹 Cleared all existing elements for initial state')
        
        // Update axes with initial state - USE PROPER DYNAMIC SCALING
        // Don't override with hardcoded [0, 1] domain!
        console.log('🔍 renderInitialTeamLayout - Using current xScale domain:', this.xScale.domain())
        this.xAxisGroup.call(d3.axisBottom(this.xScale)
            .tickFormat(d3.format('.0f'))  // Force integer format
            .tickValues(this.xScale.domain()[1] <= 12 ? 
                [0, 2, 4, 6, 8, 10, 12] : 
                this.xScale.ticks().filter(tick => tick % 1 === 0))
        )
        
        // Create team groups for initial state - NO BARS, only team info
        const teamGroups = this.mainGroup.selectAll('.team-group')
            .data(data, d => d.team)
        
        const teamGroupsEnter = teamGroups.enter()
            .append('g')
            .attr('class', 'team-group initial-state')
        
        // Position team groups immediately (no transition needed for initial state)
        teamGroupsEnter.attr('transform', d => {
            const yPos = this.yScale(d.team)
            const bandwidth = this.yScale.bandwidth()
            return `translate(0, ${yPos + bandwidth / 2})`
        })
        
        // Add ONLY ranking numbers, logos, and team labels - NO BARS OR SCORES
        // Calculate responsive positioning (same as setupTeamEntries)
        const windowWidth = window.innerWidth
        let rankingX = -260
        let logoX = -220
        let labelX = -180
        
        // Adjust positioning for smaller screens
        if (windowWidth < 1200) {
            rankingX = Math.max(-240, -this.margin.left + 20)
            logoX = Math.max(-200, -this.margin.left + 40)
            labelX = Math.max(-160, -this.margin.left + 60)
        }
        
        if (windowWidth < 900) {
            rankingX = Math.max(-220, -this.margin.left + 15)
            logoX = Math.max(-180, -this.margin.left + 35)
            labelX = Math.max(-140, -this.margin.left + 55)
        }
        
        if (windowWidth < 700) {
            rankingX = Math.max(-140, -this.margin.left + 10)
            logoX = Math.max(-115, -this.margin.left + 25)
            labelX = Math.max(-85, -this.margin.left + 45)
        }
        
        // Ranking numbers with responsive positioning
        teamGroupsEnter.append('text')
            .attr('class', 'ranking-number')
            .attr('x', rankingX)
            .attr('dy', '0.35em')
            .style('text-anchor', 'middle')
            .style('font-size', windowWidth < 700 ? '14px' : '18px')
            .style('font-weight', '700')
            .style('fill', '#dc2626')
            .text((d, i) => i + 1)
        
        // Team logo container with responsive positioning
        const logoGroup = teamGroupsEnter.append('g')
            .attr('class', 'logo-container')
            .attr('transform', `translate(${logoX}, 0)`)
        
        // Logo background circle
        logoGroup.append('circle')
            .attr('class', 'logo-background')
            .attr('r', 16)
            .style('fill', 'rgba(0, 0, 0, 0.8)')
            .style('stroke', 'rgba(0, 0, 0, 0.3)')
            .style('stroke-width', '1px')
            .style('filter', 'drop-shadow(0 2px 4px rgba(0,0,0,0.4))')
        
        // Logo image placeholder
        logoGroup.append('image')
            .attr('class', 'team-logo-image')
            .attr('x', -14)
            .attr('y', -14)
            .attr('width', 28)
            .attr('height', 28)
            .style('opacity', 0)
            .style('clip-path', 'circle(14px at center)')
        
        // Logo fallback
        const fallbackGroup = logoGroup.append('g')
            .attr('class', 'logo-fallback')
            .style('opacity', 1)
        
        fallbackGroup.append('circle')
            .attr('class', 'fallback-bg')
            .attr('r', 14)
            .style('stroke', 'rgba(0, 0, 0, 0.5)')
            .style('stroke-width', '1px')
        
        fallbackGroup.append('text')
            .attr('class', 'fallback-text')
            .attr('dy', '0.35em')
            .style('text-anchor', 'middle')
            .style('font-size', '12px')
            .style('font-weight', '700')
            .style('fill', '#ffffff')
            .style('text-shadow', '0 1px 2px rgba(0,0,0,0.5)')
        
        // Team name labels with responsive positioning
        teamGroupsEnter.append('text')
            .attr('class', 'team-label')
            .attr('x', labelX)
            .attr('dy', '0.35em')
            .style('text-anchor', 'start')
            .style('font-size', windowWidth < 700 ? '14px' : '18px')
            .style('font-weight', '600')
            .style('fill', '#f1f5f9')
            .text(d => d.team)
        
        // Update team logos
        this.updateTeamLogos(teamGroupsEnter)
        
        console.log('✅ Initial team layout rendered - ONLY teams, logos, and rankings (no bars)')
    }
    


    /**
     * Trigger celebratory animation for top 3 teams
     * @param {Array} data - Final sorted data with teams
     */
    triggerCelebratoryAnimation(data) {
        if (!data || data.length < 3) return
        
        // Get top 3 teams
        const topThree = data.slice(0, 3)
        
        console.log('🎉 Triggering celebratory animation for top 3 teams')
        
        // Create celebratory effects for each position
        topThree.forEach((teamData, index) => {
            const position = index + 1 // 1st, 2nd, 3rd
            this.createCelebratoryEffect(teamData, position)
        })
    }
    
    /**
     * Create celebratory effect for a specific team
     * @param {Object} teamData - Team data object
     * @param {number} position - Position (1, 2, or 3)
     */
    createCelebratoryEffect(teamData, position) {
        const yPos = this.yScale(teamData.team)
        const bandwidth = this.yScale.bandwidth()
        
        if (isNaN(yPos) || isNaN(bandwidth)) return
        
        const centerY = yPos + bandwidth / 2
        
        // Different effects for different positions
        const effects = {
            1: { color: '#FFD700', particles: 12, size: 8 },  // Gold
            2: { color: '#C0C0C0', particles: 10, size: 6 },  // Silver
            3: { color: '#CD7F32', particles: 8, size: 5 }    // Bronze
        }
        
        const effect = effects[position]
        
        // Create particle burst effect
        for (let i = 0; i < effect.particles; i++) {
            const angle = (i / effect.particles) * 2 * Math.PI
            const distance = 30 + Math.random() * 20
            
            const particle = this.mainGroup.append('circle')
                .attr('class', 'celebration-particle')
                .attr('cx', -30) // Start from left edge
                .attr('cy', centerY)
                .attr('r', effect.size)
                .style('fill', effect.color)
                .style('opacity', 1)
                .style('filter', 'drop-shadow(0 0 3px rgba(255,255,255,0.8))')
            
            // Animate particle outward
            particle.transition()
                .duration(1500)
                .ease(d3.easeQuadOut)
                .attr('cx', -30 + Math.cos(angle) * distance)
                .attr('cy', centerY + Math.sin(angle) * distance)
                .style('opacity', 0)
                .remove()
        }
        
        // Create pulsing glow effect on the team name specifically
        const teamGroup = this.mainGroup.selectAll('.team-group')
            .filter(d => d.team === teamData.team)
        
        if (!teamGroup.empty()) {
            const teamLabel = teamGroup.select('.team-label')
            
            if (!teamLabel.empty()) {
                // Define glow intensity based on position
                const glowIntensity = {
                    1: { radius: 15, opacity: 0.9, strokeWidth: 4 },  // Strong glow for 1st
                    2: { radius: 12, opacity: 0.7, strokeWidth: 3 },  // Medium glow for 2nd
                    3: { radius: 8, opacity: 0.5, strokeWidth: 2 }    // Gentle glow for 3rd
                }
                
                const glow = glowIntensity[position]
                
                // Apply glow effect directly to team name text
                teamLabel
                    .style('filter', `drop-shadow(0 0 ${glow.radius}px ${effect.color})`)
                    .style('text-shadow', `0 0 ${glow.radius}px ${effect.color}`)
                    .transition()
                    .duration(500)
                    .ease(d3.easeQuadOut)
                    .style('opacity', 1)
                    .transition()
                    .duration(2000)
                    .ease(d3.easeQuadInOut)
                    .style('opacity', glow.opacity)
                    .transition()
                    .duration(1500)
                    .ease(d3.easeQuadOut)
                    .style('opacity', 1)
                    .style('filter', 'none')
                    .style('text-shadow', 'none')
            }
        }
        
        // Add position trophy/medal emoji
        const trophy = position === 1 ? '🏆' : position === 2 ? '🥈' : '🥉'
        
        const trophyText = this.mainGroup.append('text')
            .attr('class', 'celebration-trophy')
            .attr('x', -50)
            .attr('y', centerY)
            .attr('dy', '0.35em')
            .style('font-size', '24px')
            .style('text-anchor', 'middle')
            .style('opacity', 0)
            .text(trophy)
        
        // Animate trophy
        trophyText.transition()
            .duration(500)
            .ease(d3.easeBackOut)
            .style('opacity', 1)
            .attr('x', -40)
            .transition()
            .delay(2000)
            .duration(1000)
            .ease(d3.easeQuadIn)
            .style('opacity', 0)
            .remove()
    }

    cleanup() {
        if (this.svg) {
            this.svg.remove()
        }
    }
} 