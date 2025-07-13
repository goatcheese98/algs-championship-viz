/**
 * ChartRenderer - Handles all D3.js chart rendering operations
 * Extracted from ChartEngine.js for better modularity and performance
 */

import * as d3 from 'd3';

// Mobile detection utility
function isMobileDevice() {
    return window.innerWidth <= 768
}

// Responsive font scaling utility
function getResponsiveFontSize(baseSize, mobileScale = 0.8) {
    const isMobile = isMobileDevice()
    const containerWidth = window.innerWidth
    
    if (isMobile) {
        // Scale down for mobile, with minimum size constraints
        const scaledSize = Math.max(10, baseSize * mobileScale)
        
        // Further scale based on container width for very small screens
        if (containerWidth < 400) {
            return Math.max(9, scaledSize * 0.9)
        } else if (containerWidth < 600) {
            return Math.max(10, scaledSize * 0.95)
        }
        return scaledSize
    }
    
    // Desktop - scale up slightly for larger screens
    if (containerWidth > 1400) {
        return Math.min(baseSize * 1.1, baseSize + 3)
    }
    
    return baseSize
}

// Point size scaling utility
function getResponsivePointSize(baseSize = 4, mobileScale = 0.8) {
    const isMobile = isMobileDevice()
    const containerWidth = window.innerWidth
    
    if (isMobile) {
        // Scale down for mobile but maintain minimum readability
        const scaledSize = Math.max(3, baseSize * mobileScale)
        
        // Further adjustments for very small screens
        if (containerWidth < 400) {
            return Math.max(2.5, scaledSize * 0.9)
        } else if (containerWidth < 600) {
            return Math.max(3, scaledSize * 0.95)
        }
        return scaledSize
    }
    
    // Desktop - scale up for larger screens
    if (containerWidth > 1400) {
        return Math.min(baseSize * 1.2, baseSize + 2)
    }
    
    return baseSize
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
        // Check if container exists and is valid
        if (!this.container || this.container.empty()) {
            console.warn('⚠️ ChartRenderer: Container not found or empty, skipping SVG setup')
            return
        }
        
        // Remove any existing SVG to prevent conflicts
        this.container.selectAll('svg').remove()
        
        try {
            this.svg = this.container.append('svg')
                .style('width', '100%')
                .style('height', '100%')
                .style('display', 'block')
                .style('position', 'relative')
                .style('z-index', '1')
                .style('overflow', 'visible')
                .style('background', 'transparent')
                .attr('preserveAspectRatio', 'xMidYMid meet')
                .classed('algs-chart-svg', true)
                
            // Main group for chart elements
            this.mainGroup = this.svg.append('g')
                .attr('class', 'main-chart-group')
                .style('pointer-events', 'all')
                
            // X-axis group
            this.xAxisGroup = this.mainGroup.append('g')
                .attr('class', 'x-axis')
                .style('color', '#94a3b8')
                .style('font-size', '12px')
                .style('font-family', 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif')
                
            // Y-axis group (hidden by default)
            this.yAxisGroup = this.mainGroup.append('g')
                .attr('class', 'y-axis')
                .style('opacity', '0')
                .style('pointer-events', 'none')
                
            // Custom Y-axis for team names and positions
            this.customYAxisGroup = this.mainGroup.append('g')
                .attr('class', 'custom-y-axis')
                .style('pointer-events', 'none')
                
            console.log('✅ ChartRenderer: SVG setup completed successfully')
            
        } catch (error) {
            console.error('❌ ChartRenderer: Error setting up SVG:', error)
            throw error
        }
    }
    
    updateDimensions(width, height) {
        // Check if SVG and required elements exist
        if (!this.svg || this.svg.empty()) {
            console.warn('⚠️ ChartRenderer: SVG not available for dimension update')
            return
        }
        
        const totalWidth = width + this.margin.left + this.margin.right
        const totalHeight = height + this.margin.top + this.margin.bottom
        
        // Mobile-specific constraints to prevent overflow
        const isMobile = window.innerWidth <= 768
        let maxWidth, maxHeight
        
        if (isMobile) {
            // For mobile, ensure we don't exceed container bounds
            maxWidth = Math.min(totalWidth, window.innerWidth - 40)
            maxHeight = Math.min(totalHeight, window.innerHeight * 0.8)
        } else {
            // Desktop constraints
            maxWidth = Math.min(totalWidth, window.innerWidth * 0.98)
            maxHeight = Math.min(totalHeight, window.innerHeight * 0.9)
        }
        
        this.svg
            .attr('width', maxWidth)
            .attr('height', maxHeight)
            .style('max-width', '100%')
            .style('max-height', '100%')
            .style('overflow', 'visible')
        
        // Update main group transform with responsive margins (with safety check)
        if (this.mainGroup && !this.mainGroup.empty()) {
            this.mainGroup.attr('transform', `translate(${this.margin.left},${this.margin.top})`)
        }
        
        // Position x-axis at the bottom of the chart area (always visible)
        if (this.xAxisGroup && !this.xAxisGroup.empty()) {
            this.xAxisGroup.attr('transform', `translate(0,${height})`)
        }
        
        // Update scales with responsive ranges
        if (this.xScale && this.yScale) {
            this.xScale.range([0, width])
            this.yScale.range([0, height])
        }
        
        // Remove mobile scaling that might cause overflow
        this.svg.style('transform', 'scale(1)')
        this.svg.style('transform-origin', 'top left')
    }
    
    renderStackedBars(data, config = {}) {
        const { transitionDuration = 1500, currentGameIndex = 1, isFiltered = false, filteredGameIndices = [] } = config
        
        // Check if mainGroup exists and is valid
        if (!this.mainGroup || this.mainGroup.empty()) {
            console.warn('⚠️ ChartRenderer: Main group not available for rendering, skipping')
            return
        }
        
        // Validate that scales have valid domains
        if (!this.yScale || !this.xScale || !this.yScale.domain().length || !this.xScale.domain().length) {
            console.warn('⚠️ Scales not properly initialized, skipping render')
            return
        }
        
        // Check for NaN values in bandwidth
        if (isNaN(this.yScale.bandwidth())) {
            console.warn('⚠️ Y scale bandwidth is NaN, skipping render')
            return
        }
        
        // CRITICAL FIX: If currentGameIndex is 0, render initial state instead of clearing
        if (currentGameIndex === 0) {
            console.log('🔄 Returning to initial state (game 0), rendering initial layout')
            this.renderInitialTeamLayout(data, { transitionDuration })
            return
        }
        
        // CRITICAL: Clear ALL initial state elements ONLY if they exist and we're transitioning to playing state
        const hasInitialState = this.mainGroup.selectAll('.team-group.initial-state').size() > 0
        if (hasInitialState && currentGameIndex > 0) {
            // Clear initial state elements with smooth transition
            this.mainGroup.selectAll('.team-group.initial-state')
                .transition()
                .duration(transitionDuration / 2)  // Faster transition for clearing
                .ease(d3.easeQuadOut)
                .style('opacity', 0)
                .remove()
            
            // Clear initial state team info elements (they'll be recreated in custom y-axis)
            this.mainGroup.selectAll('.ranking-number').remove()
            this.mainGroup.selectAll('.team-label').remove()
            this.mainGroup.selectAll('.logo-container').remove()
            
            // CRITICAL: Also clear any existing custom y-axis elements to prevent conflicts
            this.customYAxisGroup.selectAll('.team-entry').remove()
            
            console.log('🧹 Cleared initial state elements and custom y-axis for fresh progressive gameplay')
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
            .ease(d3.easeQuadOut)  // Consistent easing for smooth movement
            .attr('transform', d => {
                const yPos = this.yScale(d.team)
                const bandwidth = this.yScale.bandwidth()
                if (isNaN(yPos) || isNaN(bandwidth)) return 'translate(0, 0)'
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
        
        // Update axes - this will trigger updateCustomYAxis to render team names/logos
        console.log('🔄 Updating axes and team names/logos for progressive gameplay')
        this.updateAxes(data, transitionDuration)
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
            .attr('rx', getResponsivePointSize(6))  // Responsive corner radius
            .attr('ry', getResponsivePointSize(6))
            .style('transform-origin', 'left center')  // Ensure bars grow from left edge
            .style('opacity', 1)  // Full opacity, no fade-in effects
        
        // Add text labels for game points
        segmentsEnter.append('text')
            .attr('class', 'segment-label')
            .attr('y', 0)    // Position text inside the bars (bars are centered at 0)
            .attr('dy', '0.35em')
            .style('font-size', `${getResponsiveFontSize(14)}px`)
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
            .attr('rx', getResponsivePointSize(6))  // Responsive corner radius
            .attr('ry', getResponsivePointSize(6))
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
                
                // Use responsive font sizing for narrow segments
                const baseSize = segmentWidth < 25 ? 12 : 14
                return `${getResponsiveFontSize(baseSize)}px`
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
            .style('font-size', `${getResponsiveFontSize(14)}px`)
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
        
        // Force X-axis styling with responsive font size
        this.xAxisGroup.selectAll('text')
            .style('font-size', `${getResponsiveFontSize(24, 0.75)}px`, 'important')
            .style('font-weight', '700', 'important')
            .style('font-family', 'Inter, Roboto Mono, monospace', 'important')
            .style('fill', '#f1f5f9', 'important')
            .style('filter', 'drop-shadow(0 0 3px rgba(220, 38, 38, 0.3)) drop-shadow(0 1px 2px rgba(0,0,0,0.8))', 'important')
        
        // Update Y axis with synchronized timing
        this.updateCustomYAxis(data, transitionDuration)
    }
    
    updateCustomYAxis(data, transitionDuration = 1500) {
        // Check if customYAxisGroup exists and is valid
        if (!this.customYAxisGroup || this.customYAxisGroup.empty()) {
            console.warn('⚠️ ChartRenderer: Custom Y-axis group not available, skipping update')
            return
        }
        
        // Check if yScale is valid
        if (!this.yScale || !this.yScale.domain() || this.yScale.domain().length === 0) {
            console.warn('⚠️ ChartRenderer: Y-scale not properly initialized, skipping update')
            return
        }
        
        // CRITICAL FIX: Always allow updates during progressive gameplay
        // The blocking logic was preventing team names from rendering during slider movements
        console.log('🎯 Updating y-axis with team names and logos - synchronized with bar animation')
        console.log('🔍 Data received:', data.length, 'teams')
        console.log('🔍 Team names:', data.map(d => d.team))
        
        // Debug y-axis scale configuration
        console.log('🔍 Y-axis scale domain:', this.yScale.domain())
        console.log('🔍 Y-axis scale range:', this.yScale.range())
        console.log('🔍 Y-axis scale bandwidth:', this.yScale.bandwidth())
        
        // Debug custom y-axis group positioning
        const customYAxisTransform = this.customYAxisGroup.attr('transform')
        console.log('🔍 Custom Y-axis group transform:', customYAxisTransform)
        console.log('🔍 Custom Y-axis group node:', this.customYAxisGroup.node())
        
        // Reset any previous update state to ensure fresh rendering
        this.yAxisUpdateInProgress = false;
        
        // Use data join approach to handle updates properly
        const teamEntries = this.customYAxisGroup.selectAll('.team-entry')
            .data(data, d => d.team)
        
        // Remove exiting elements
        teamEntries.exit().remove()
        
        // Enter new elements
        const teamEntriesEnter = teamEntries.enter()
            .append('g')
            .attr('class', 'team-entry')
            .attr('transform', d => {
                const yPos = this.yScale(d.team)
                const bandwidth = this.yScale.bandwidth()
                console.log(`🔍 Team ${d.team}: yPos=${yPos}, bandwidth=${bandwidth}`)
                return `translate(0, ${yPos + bandwidth / 2})`
            })
        
        console.log('🔍 Creating', teamEntriesEnter.size(), 'new team entries')
        
        this.setupTeamEntries(teamEntriesEnter)
        
        // Merge enter and update selections
        const allTeamEntries = teamEntries.merge(teamEntriesEnter)
        
        console.log('🔍 Total team entries after merge:', allTeamEntries.size())
        
        // IMPORTANT: Always update team content BEFORE starting transitions
        // This ensures team names are visible during the entire transition
        allTeamEntries.select('.ranking-number')
            .text((d, i) => {
                console.log(`🔍 Setting ranking ${i + 1} for team ${d.team}`)
                return i + 1
            })
            .style('fill', '#dc2626')
            .style('font-weight', '700')
            .style('opacity', 1)
        
        allTeamEntries.select('.team-label')
            .text(d => {
                console.log(`🔍 Setting team label for ${d.team}`)
                return d.team
            })
            .style('display', isMobileDevice() ? 'none' : 'block')
            .style('fill', '#f1f5f9')
            .style('font-weight', '600')
            .style('opacity', 1)
        
        // Update team logos immediately to prevent flickering
        this.updateTeamLogos(allTeamEntries)
        
        // THEN apply position transitions with synchronized timing
        allTeamEntries
            .transition()
            .duration(transitionDuration)
            .ease(d3.easeQuadOut)
            .attr('transform', d => `translate(0, ${this.yScale(d.team) + this.yScale.bandwidth() / 2})`)
        
        console.log('✅ Team names and logos updated successfully - should be visible now')
    }
    
    setupTeamEntries(teamEntriesEnter) {
        // Calculate responsive positioning based on available margin
        const windowWidth = window.innerWidth
        let rankingX = -260
        let logoX = -220
        let labelX = -180
        
        // Mobile-specific positioning - utilize more space since team names are hidden
        if (isMobileDevice()) {
            // On mobile, move elements closer to the chart area for better space utilization
            rankingX = -60  // Much closer to the chart area
            logoX = -30     // Position logo very close to the chart
            labelX = -85    // Hidden anyway, but keep consistent
        } else {
            // Desktop responsive positioning
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
            .style('opacity', 1)  // Ensure visibility
            .style('pointer-events', 'none')  // Prevent interference
        
        // Add team logo container with responsive positioning
        const logoGroup = teamEntriesEnter.append('g')
            .attr('class', 'logo-container')
            .attr('transform', `translate(${logoX}, 0)`)
            .style('opacity', 1)  // Ensure visibility
            .style('pointer-events', 'none')  // Prevent interference
        
        // Logo background
        logoGroup.append('circle')
            .attr('class', 'logo-background')
            .attr('r', 16)
            .style('fill', 'rgba(0, 0, 0, 0.8)')
            .style('stroke', 'rgba(0, 0, 0, 0.3)')
            .style('stroke-width', '1px')
            .style('filter', 'drop-shadow(0 2px 4px rgba(0,0,0,0.4))')
            .style('opacity', 1)  // Ensure visibility
        
        // Logo image
        logoGroup.append('image')
            .attr('class', 'team-logo-image')
            .attr('x', -14)
            .attr('y', -14)
            .attr('width', 28)
            .attr('height', 28)
            .style('opacity', 0)
            .style('clip-path', `circle(${getResponsivePointSize(14)}px at center)`)
        
        // Fallback logo
        const fallbackGroup = logoGroup.append('g')
            .attr('class', 'logo-fallback')
            .style('opacity', 1)  // Ensure visibility
            .style('pointer-events', 'none')  // Prevent interference
        
        fallbackGroup.append('circle')
            .attr('class', 'fallback-bg')
            .attr('r', getResponsivePointSize(14))
            .style('stroke', 'rgba(0, 0, 0, 0.5)')
            .style('stroke-width', '1px')
            .style('opacity', 1)  // Ensure visibility
            .style('fill', '#ff6b6b')  // Bright red for debugging - make logos highly visible
        
        fallbackGroup.append('text')
            .attr('class', 'fallback-text')
            .attr('dy', '0.35em')
            .style('text-anchor', 'middle')
            .style('font-size', `${getResponsiveFontSize(12)}px`)
            .style('font-weight', '700')
            .style('fill', '#ffffff')
            .style('text-shadow', '0 1px 2px rgba(0,0,0,0.5)')
            .style('opacity', 1)  // Ensure visibility
            .style('pointer-events', 'none')  // Prevent interference
        
        // Add team name label with responsive positioning (hidden on mobile)
        teamEntriesEnter.append('text')
            .attr('class', 'team-label')
            .attr('x', labelX)
            .attr('dy', '0.35em')
            .style('text-anchor', 'start')
            .style('font-size', windowWidth < 700 ? '14px' : '18px')
            .style('font-weight', '600')
            .style('fill', '#f1f5f9')
            .style('display', isMobileDevice() ? 'none' : 'block')
            .style('opacity', 1)  // Ensure visibility
            .style('pointer-events', 'none')  // Prevent interference
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
        
        console.log('🎬 renderInitialTeamLayout called with:', {
            dataLength: data?.length,
            firstTeam: data?.[0]?.team,
            hasMainGroup: !!this.mainGroup,
            hasXScale: !!this.xScale,
            hasYScale: !!this.yScale,
            xScaleDomain: this.xScale?.domain(),
            yScaleDomain: this.yScale?.domain()
        })
        
        if (!data || data.length === 0) {
            console.warn('⚠️ renderInitialTeamLayout: No data provided')
            return
        }
        
        if (!this.mainGroup || this.mainGroup.empty()) {
            console.warn('⚠️ renderInitialTeamLayout: mainGroup not available')
            return
        }
        
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
        
        try {
            this.xAxisGroup.call(d3.axisBottom(this.xScale)
                .tickFormat(d3.format('.0f'))  // Force integer format
                .tickValues(this.xScale.domain()[1] <= 12 ? 
                    [0, 2, 4, 6, 8, 10, 12] : 
                    this.xScale.ticks().filter(tick => tick % 1 === 0))
            )
            console.log('✅ X-axis updated successfully')
        } catch (error) {
            console.error('❌ Error updating X-axis:', error)
        }
        
        // Create team groups for initial state - NO BARS, only team info
        const teamGroups = this.mainGroup.selectAll('.team-group')
            .data(data, d => d.team)
        
        const teamGroupsEnter = teamGroups.enter()
            .append('g')
            .attr('class', 'team-group initial-state')
        
        console.log('📊 Created team groups for', teamGroupsEnter.size(), 'teams')
        
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
        
        // Mobile-specific positioning - utilize more space since team names are hidden
        if (isMobileDevice()) {
            // On mobile, move elements closer to the chart area for better space utilization
            rankingX = -60  // Much closer to the chart area
            logoX = -30     // Position logo very close to the chart
            labelX = -85    // Hidden anyway, but keep consistent
        } else {
            // Desktop responsive positioning
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
            .attr('r', getResponsivePointSize(16))
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
            .style('clip-path', `circle(${getResponsivePointSize(14)}px at center)`)
        
        // Logo fallback
        const fallbackGroup = logoGroup.append('g')
            .attr('class', 'logo-fallback')
            .style('opacity', 1)
        
        fallbackGroup.append('circle')
            .attr('class', 'fallback-bg')
            .attr('r', getResponsivePointSize(14))
            .style('stroke', 'rgba(0, 0, 0, 0.5)')
            .style('stroke-width', '1px')
        
        fallbackGroup.append('text')
            .attr('class', 'fallback-text')
            .attr('dy', '0.35em')
            .style('text-anchor', 'middle')
            .style('font-size', `${getResponsiveFontSize(12)}px`)
            .style('font-weight', '700')
            .style('fill', '#ffffff')
            .style('text-shadow', '0 1px 2px rgba(0,0,0,0.5)')
        
        // Team name labels with responsive positioning (hidden on mobile)
        teamGroupsEnter.append('text')
            .attr('class', 'team-label')
            .attr('x', labelX)
            .attr('dy', '0.35em')
            .style('text-anchor', 'start')
            .style('font-size', windowWidth < 700 ? '14px' : '18px')
            .style('font-weight', '600')
            .style('fill', '#f1f5f9')
            .style('display', isMobileDevice() ? 'none' : 'block')
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
                .attr('r', getResponsivePointSize(effect.size))
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
                    1: { radius: getResponsivePointSize(15), opacity: 0.9, strokeWidth: 4 },  // Strong glow for 1st
                    2: { radius: getResponsivePointSize(12), opacity: 0.7, strokeWidth: 3 },  // Medium glow for 2nd
                    3: { radius: getResponsivePointSize(8), opacity: 0.5, strokeWidth: 2 }    // Gentle glow for 3rd
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
            .style('font-size', `${getResponsiveFontSize(24)}px`)
            .style('text-anchor', 'middle')
            .style('opacity', 0)
            .text(trophy)
        
        // Animate trophy - REMOVED ZOOM EFFECT: Changed from easeBackOut to easeQuadOut for smoother animation
        trophyText.transition()
            .duration(500)
            .ease(d3.easeQuadOut)  // Changed from d3.easeBackOut to remove bounce/zoom effect
            .style('opacity', 1)
            .attr('x', -40)
            .transition()
            .delay(2000)
            .duration(1000)
            .ease(d3.easeQuadOut)  // Changed from d3.easeQuadIn to easeQuadOut for consistency
            .style('opacity', 0)
            .remove()
    }

    /**
     * Render or hide the game sequence legend
     * @param {boolean} visible - Whether to show or hide the legend
     * @param {Object} dataManager - DataManager instance for game data
     */
    renderLegend(visible, dataManager) {
        // Remove existing legend
        this.svg.selectAll('.chart-legend').remove()
        
        if (!visible || !dataManager) return
        
        // Get the chart container dimensions
        const svgRect = this.svg.node().getBoundingClientRect()
        const chartWidth = svgRect.width
        const chartHeight = svgRect.height
        
        // Enhanced responsive sizing calculations - 50% larger than previous compact version
        const baseWidth = 300  // Increased by 50% from 200
        const baseHeight = 480  // Increased by 50% from 320
        const minWidth = 240   // Increased by 50% from 160
        const minHeight = 330  // Increased by 50% from 220
        const maxWidth = 360   // Increased by 50% from 240
        const maxHeight = Math.min(720, chartHeight * 0.7)  // Increased by 50% from 480
        
        // Calculate responsive dimensions based on viewport
        const legendWidth = Math.min(maxWidth, Math.max(minWidth, baseWidth + (chartWidth - 800) * 0.05))
        const legendHeight = Math.min(maxHeight, Math.max(minHeight, baseHeight + (chartHeight - 600) * 0.1))
        
        // Position legend higher to avoid covering x-axis
        const legendX = chartWidth - legendWidth - 20
        const legendY = chartHeight - legendHeight - 80  // Moved up by 60px from original
        
        // Create legend group
        const legendGroup = this.svg.append('g')
            .attr('class', 'chart-legend')
            .attr('transform', `translate(${legendX}, ${legendY})`)
        
        // Add legend background
        legendGroup.append('rect')
            .attr('class', 'legend-background')
            .attr('x', 0)
            .attr('y', 0)
            .attr('width', legendWidth)
            .attr('height', legendHeight)
            .style('fill', 'rgba(0, 0, 0, 0.85)')
            .style('stroke', 'rgba(255, 255, 255, 0.2)')
            .style('stroke-width', '1px')
            .style('rx', '8px')
            .style('ry', '8px')
            .style('backdrop-filter', 'blur(10px)')
        
        // Add legend title
        legendGroup.append('text')
            .attr('class', 'legend-title')
            .attr('x', legendWidth / 2)
            .attr('y', 32)  // Increased from 22 to account for larger legend
            .style('text-anchor', 'middle')
            .style('font-size', `${getResponsiveFontSize(22)}px`)  // Increased by 50% from 15 to 22
            .style('font-weight', '700')
            .style('fill', '#ffffff')
            .style('text-shadow', '0 1px 2px rgba(0,0,0,0.5)')
            .text('Game Sequence')
        
        // Get max games from data manager
        const maxGames = dataManager.getMaxGames ? dataManager.getMaxGames() : 10
        
        // Calculate responsive item height and spacing - increased for 50% larger legend
        const baseItemHeight = 36  // Increased by 50% from 24 to accommodate larger fonts
        const itemHeight = Math.max(30, Math.min(42, baseItemHeight + (legendHeight - 300) * 0.05))
        const startY = 60  // Increased from 42 to account for larger title
        const itemSpacing = 2  // Increased from 1 for better spacing
        
        // Create legend items for each game
        for (let gameNum = 1; gameNum <= maxGames; gameNum++) {
            const itemY = startY + (gameNum - 1) * (itemHeight + itemSpacing)
            
            // Get map name and color for this game
            const mapName = dataManager.getMapForGame(gameNum)
            const mapColor = dataManager.getMapColor(mapName, gameNum)
            
            // Create item group
            const itemGroup = legendGroup.append('g')
                .attr('class', 'legend-item')
                .attr('transform', `translate(0, ${itemY})`)
            
            // Add color indicator (rounded square instead of circle)
            const squareSize = Math.min(20, itemHeight * 0.55)  // Increased from 14 to 20 (43% increase)
            itemGroup.append('rect')
                .attr('class', 'legend-color-indicator')
                .attr('x', 30 - squareSize/2)  // Increased from 20 to 30 for better positioning
                .attr('y', itemHeight / 2 - squareSize/2)
                .attr('width', squareSize)
                .attr('height', squareSize)
                .attr('rx', 4)  // Increased from 3 to 4 for proportional corner radius
                .attr('ry', 4)
                .style('fill', mapColor)
                .style('stroke', '#ffffff')
                .style('stroke-width', '2px')
                .style('filter', 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))')
            
            // Add game number and map name on the same line
            itemGroup.append('text')
                .attr('class', 'legend-game-text')
                .attr('x', 50)  // Increased from 35 to account for larger color indicators
                .attr('y', itemHeight / 2)
                .attr('dy', '0.35em')
                .style('text-anchor', 'start')
                .style('font-size', `${getResponsiveFontSize(19)}px`)  // Increased by 50% from 13 to 19
                .style('font-weight', '600')
                .style('fill', '#ffffff')
                .style('text-shadow', '0 1px 2px rgba(0,0,0,0.5)')
                .text(`${gameNum} : ${mapName || 'Unknown Map'}`)
            
            // Add hover effect
            itemGroup
                .style('cursor', 'pointer')
                .style('opacity', 0.9)
                .on('mouseenter', function() {
                    d3.select(this).style('opacity', 1)
                    d3.select(this).select('.legend-color-indicator')
                        .style('stroke-width', '3px')
                        .style('filter', 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))')
                })
                .on('mouseleave', function() {
                    d3.select(this).style('opacity', 0.9)
                    d3.select(this).select('.legend-color-indicator')
                        .style('stroke-width', '2px')
                        .style('filter', 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))')
                })
        }
        
        // Add fade-in animation
        legendGroup
            .style('opacity', 0)
            .transition()
            .duration(300)
            .ease(d3.easeQuadOut)
            .style('opacity', 1)
        
        // Add window resize handler for responsive behavior
        const resizeHandler = () => {
            // Only re-render if legend is currently visible
            if (this.svg.selectAll('.chart-legend').size() > 0) {
                this.renderLegend(true, dataManager)
            }
        }
        
        // Store resize handler for proper cleanup
        if (!this.resizeHandlers) this.resizeHandlers = []
        this.resizeHandlers.push(resizeHandler)
        
        // Add resize listener
        window.addEventListener('resize', resizeHandler)
        
        console.log('📊 Chart legend rendered with', maxGames, 'games')
    }

    cleanup() {
        console.log('🧹 ChartRenderer: Starting cleanup...')
        
        try {
            // Remove resize handlers
            if (this.resizeHandlers) {
                this.resizeHandlers.forEach(handler => {
                    window.removeEventListener('resize', handler)
                })
                this.resizeHandlers = []
            }
            
            // Clear all chart elements safely
            if (this.mainGroup && !this.mainGroup.empty()) {
                this.mainGroup.selectAll('*').remove()
            }
            
            if (this.svg && !this.svg.empty()) {
                this.svg.remove()
            }
            
            // Clear references to prevent memory leaks
            this.svg = null
            this.mainGroup = null
            this.xAxisGroup = null
            this.yAxisGroup = null
            this.customYAxisGroup = null
            
            console.log('✅ ChartRenderer: Cleanup completed successfully')
        } catch (error) {
            console.warn('⚠️ ChartRenderer: Error during cleanup:', error)
        }
    }
} 