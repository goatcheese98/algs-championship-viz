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
    constructor(container, margin, scales) {
        this.container = container
        this.margin = margin
        this.xScale = scales.x
        this.yScale = scales.y
        this.svg = null
        this.mainGroup = null
        this.xAxisGroup = null
        this.yAxisGroup = null
        this.customYAxisGroup = null
        
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
        
        this.svg
            .attr('width', totalWidth)
            .attr('height', totalHeight)
            .style('max-width', '100%')
            .style('max-height', '100%')
        
        this.xAxisGroup.attr('transform', `translate(0,${height})`)
        
        // Update scales
        this.xScale.range([0, width])
        this.yScale.range([0, height])
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
        
        // Create team groups
        const teamGroups = this.mainGroup.selectAll('.team-group')
            .data(data, d => d.team)
        
        teamGroups.exit().remove()
        
        const teamGroupsEnter = teamGroups.enter()
            .append('g')
            .attr('class', 'team-group')
        
        const allTeamGroups = teamGroups.merge(teamGroupsEnter)
        
        // Position team groups with NaN protection
        allTeamGroups
            .transition()
            .duration(transitionDuration)
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
            .attr('width', 0)
            .attr('rx', 6)  // Slightly smaller radius
            .attr('ry', 6)
        
        // Add text labels for game points
        segmentsEnter.append('text')
            .attr('class', 'segment-label')
            .attr('y', -bandwidth * 0.6)    // Position text above the bars (bars are at -0.4)
            .attr('dy', '0.35em')
            .style('font-size', '14px')
            .style('font-weight', '600')
            .style('text-anchor', 'middle')
            .style('fill', '#f1f5f9')      // Change to light color for visibility
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
        
        // Update segment labels
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
            .attr('y', -bandwidth * 0.6)   // Position above bars (bars are at -0.4)
            .text(d => {
                const isVisible = isFiltered && filteredGameIndices.length > 0 
                    ? filteredGameIndices.includes(d.gameNumber)
                    : d.gameNumber <= currentGameIndex
                
                const segmentWidth = isFiltered && filteredGameIndices.length > 0 
                    ? (filteredGameIndices.includes(d.gameNumber) ? this.xScale(d.points) : 0)
                    : (d.gameNumber <= currentGameIndex ? this.xScale(d.points) : 0)
                
                // Show points if segment is visible and wide enough
                return (isVisible && segmentWidth > 30 && d.points > 0) ? d.points : ''
            })
            .style('opacity', d => {
                const isVisible = isFiltered && filteredGameIndices.length > 0 
                    ? filteredGameIndices.includes(d.gameNumber)
                    : d.gameNumber <= currentGameIndex
                
                const segmentWidth = isFiltered && filteredGameIndices.length > 0 
                    ? (filteredGameIndices.includes(d.gameNumber) ? this.xScale(d.points) : 0)
                    : (d.gameNumber <= currentGameIndex ? this.xScale(d.points) : 0)
                
                return (isVisible && segmentWidth > 30 && d.points > 0) ? 1 : 0
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
            .attr('y', bandwidth / 2)
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
            .attr('y', bandwidth / 2)
            .text(d => d.cumulativeScore)
    }
    
    updateAxes(data) {
        // Update X axis
        const xAxis = d3.axisBottom(this.xScale)
            .tickFormat(d3.format('.0f'))
        
        this.xAxisGroup.call(xAxis)
        
        // Force X-axis styling
        this.xAxisGroup.selectAll('text')
            .style('font-size', '24px', 'important')
            .style('font-weight', '700', 'important')
            .style('font-family', 'Inter, Roboto Mono, monospace', 'important')
            .style('fill', '#f1f5f9', 'important')
            .style('filter', 'drop-shadow(0 0 3px rgba(220, 38, 38, 0.3)) drop-shadow(0 1px 2px rgba(0,0,0,0.8))', 'important')
        
        // Update Y axis
        this.updateCustomYAxis(data)
    }
    
    updateCustomYAxis(data) {
        // Clear existing Y-axis
        this.yAxisGroup.selectAll('*').remove()
        
        // Create team entries
        const teamEntries = this.customYAxisGroup.selectAll('.team-entry')
            .data(data, d => d.team)
        
        teamEntries.exit().remove()
        
        const teamEntriesEnter = teamEntries.enter()
            .append('g')
            .attr('class', 'team-entry')
        
        this.setupTeamEntries(teamEntriesEnter)
        
        const allTeamEntries = teamEntries.merge(teamEntriesEnter)
        
        // Update positions and content
        allTeamEntries
            .transition()
            .duration(1500)
            .attr('transform', d => `translate(0, ${this.yScale(d.team) + this.yScale.bandwidth() / 2})`)
        
        // Update rankings and labels
        allTeamEntries.select('.ranking-number')
            .text((d, i) => i + 1)
        
        allTeamEntries.select('.team-label')
            .text(d => d.team)
        
        // Update team logos
        this.updateTeamLogos(allTeamEntries)
    }
    
    setupTeamEntries(teamEntriesEnter) {
        // Add ranking number
        teamEntriesEnter.append('text')
            .attr('class', 'ranking-number')
            .attr('x', -260)
            .attr('dy', '0.35em')
            .style('text-anchor', 'middle')
            .style('font-size', '18px')
            .style('font-weight', '700')
            .style('fill', '#dc2626')
        
        // Add team logo container
        const logoGroup = teamEntriesEnter.append('g')
            .attr('class', 'logo-container')
            .attr('transform', 'translate(-220, 0)')
        
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
        
        // Add team name label
        teamEntriesEnter.append('text')
            .attr('class', 'team-label')
            .attr('x', -190)
            .attr('dy', '0.35em')
            .style('text-anchor', 'start')
            .style('font-size', '18px')
            .style('font-weight', '600')
            .style('fill', '#f1f5f9')
    }
    
    updateTeamLogos(teamEntries) {
        teamEntries.each((teamData, i, nodes) => {
            const teamGroup = d3.select(nodes[i])
            const teamName = teamData.team
            
            const logoUrl = window.TeamConfig?.getTeamLogo(teamName)
            const logoImage = teamGroup.select('.team-logo-image')
            const fallbackGroup = teamGroup.select('.logo-fallback')
            
            // Setup fallback styling first
            const fallbackConfig = window.TeamConfig?.getFallbackConfig(teamName) || 
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
        
        // CRITICAL: Clear ALL existing bars and segments first
        this.mainGroup.selectAll('.team-group').remove()
        this.mainGroup.selectAll('.game-segment').remove()
        this.mainGroup.selectAll('.segment-bar').remove()
        this.mainGroup.selectAll('.segment-label').remove()
        this.mainGroup.selectAll('.cumulative-label').remove()
        
        console.log('🧹 Cleared all existing bars for initial state')
        
        // Update axes with initial state (zero domain)
        const tempXScale = this.xScale.copy().domain([0, 1]) // Minimal domain for initial state
        this.xAxisGroup.call(d3.axisBottom(tempXScale))
        
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
        // Ranking numbers
        teamGroupsEnter.append('text')
            .attr('class', 'ranking-number')
            .attr('x', -260)
            .attr('dy', '0.35em')
            .style('text-anchor', 'middle')
            .style('font-size', '18px')
            .style('font-weight', '700')
            .style('fill', '#dc2626')
            .text((d, i) => i + 1)
        
        // Team logo container
        const logoGroup = teamGroupsEnter.append('g')
            .attr('class', 'logo-container')
            .attr('transform', 'translate(-220, 0)')
        
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
        
        // Team name labels
        teamGroupsEnter.append('text')
            .attr('class', 'team-label')
            .attr('x', -190)
            .attr('dy', '0.35em')
            .style('text-anchor', 'start')
            .style('font-size', '18px')
            .style('font-weight', '600')
            .style('fill', '#f1f5f9')
            .text(d => d.team)
        
        // Update team logos
        this.updateTeamLogos(teamGroupsEnter)
        
        console.log('✅ Initial team layout rendered - ONLY teams, logos, and rankings (no bars)')
    }
    


    cleanup() {
        if (this.svg) {
            this.svg.remove()
        }
    }
} 