/**
 * Utility functions for ALGS Scraper
 * Configuration helpers, data validation, and convenience functions
 */

const fs = require('fs').promises;
const path = require('path');

class ScraperUtils {
    /**
     * Validate extracted tournament data
     */
    static validateTournamentData(data) {
        const errors = [];
        
        if (!data || !data.teams || !Array.isArray(data.teams)) {
            errors.push('Invalid data structure: missing teams array');
            return { valid: false, errors };
        }
        
        if (data.teams.length === 0) {
            errors.push('No teams found in tournament data');
        }
        
        data.teams.forEach((team, index) => {
            if (!team.name || team.name.trim() === '') {
                errors.push(`Team ${index + 1}: missing team name`);
            }
            
            if (typeof team.totalScore !== 'number' || team.totalScore < 0) {
                errors.push(`Team ${team.name}: invalid total score`);
            }
            
            if (!team.games || !Array.isArray(team.games)) {
                errors.push(`Team ${team.name}: missing games data`);
            }
        });
        
        return {
            valid: errors.length === 0,
            errors: errors,
            teamCount: data.teams.length,
            maxGames: Math.max(...data.teams.map(team => team.games ? team.games.length : 0))
        };
    }
    
    /**
     * Generate scraper configuration for different tournament formats
     */
    static generateTournamentConfig(tournamentType = 'year5-open') {
        const configs = {
            'year5-open': {
                baseUrl: 'https://apexlegendsstatus.com/algs/Y5-Split1/ALGS-Open/Global',
                structure: {
                    'Day1': { rounds: 12, type: 'bracket' },
                    'Day2': { rounds: 12, type: 'bracket' },
                    'Day3': { rounds: 5, type: 'bracket' },
                    'Day4': { rounds: 1, type: 'final' }
                },
                selectors: {
                    teamRow: 'tr[data-team], .team-row, tbody tr',
                    teamName: '.team-name, .team, [data-team-name]',
                    totalScore: '.total-score, .total, .points',
                    gameData: '.game, .game-score, [data-game]',
                    placement: '.placement, .place, .p',
                    kills: '.kills, .k, .elims'
                }
            },
            'year5-champs': {
                baseUrl: 'https://apexlegendsstatus.com/algs/Y5-Split1/ALGS-Championship/Global',
                structure: {
                    'Day1': { rounds: 6, type: 'group' },
                    'Day2': { rounds: 6, type: 'group' },
                    'Day3': { rounds: 6, type: 'playoff' },
                    'Day4': { rounds: 1, type: 'final' }
                },
                selectors: {
                    teamRow: 'tr[data-team], .team-row, tbody tr',
                    teamName: '.team-name, .team, [data-team-name]',
                    totalScore: '.total-score, .total, .points',
                    gameData: '.game, .game-score, [data-game]',
                    placement: '.placement, .place, .p',
                    kills: '.kills, .k, .elims'
                }
            }
        };
        
        return configs[tournamentType] || configs['year5-open'];
    }
    
    /**
     * Create output directory structure
     */
    static async setupOutputDirectories(basePath = '../../public') {
        const directories = [
            path.join(basePath, 'year5champions'),
            path.join(basePath, 'year5champions', 'raw'),
            path.join(basePath, 'year5champions', 'processed')
        ];
        
        for (const dir of directories) {
            await fs.mkdir(dir, { recursive: true });
        }
        
        console.log('✅ Output directories created');
    }
    
    /**
     * Generate URL list for a tournament
     */
    static generateUrlList(config) {
        const urls = [];
        
        for (const [day, dayInfo] of Object.entries(config.structure)) {
            if (day === 'Day4') {
                urls.push({
                    day: day,
                    round: 'Final',
                    url: `${config.baseUrl}/${day}/Final#tab_scores`
                });
            } else {
                const roundsPerGroup = 3;
                for (let i = 1; i <= dayInfo.rounds; i += roundsPerGroup) {
                    const endRound = Math.min(i + roundsPerGroup - 1, dayInfo.rounds);
                    const roundName = `WinnersRound${i}-${endRound}`;
                    urls.push({
                        day: day,
                        round: roundName,
                        url: `${config.baseUrl}/${day}/${roundName}#tab_scores`
                    });
                }
            }
        }
        
        return urls;
    }
    
    /**
     * Save scraping report
     */
    static async saveScrapingReport(data, outputPath) {
        const report = {
            timestamp: new Date().toISOString(),
            totalMatchups: Object.keys(data).length,
            matchups: {},
            summary: {
                totalTeams: 0,
                totalGames: 0,
                averageTeamsPerMatchup: 0
            }
        };
        
        let totalTeams = 0;
        let totalGames = 0;
        let matchupCount = 0;
        
        for (const [day, dayData] of Object.entries(data)) {
            for (const [round, roundData] of Object.entries(dayData)) {
                const validation = this.validateTournamentData(roundData);
                
                report.matchups[`${day}_${round}`] = {
                    valid: validation.valid,
                    teamCount: validation.teamCount,
                    maxGames: validation.maxGames,
                    errors: validation.errors
                };
                
                if (validation.valid) {
                    totalTeams += validation.teamCount;
                    totalGames += validation.maxGames;
                    matchupCount++;
                }
            }
        }
        
        report.summary.totalTeams = totalTeams;
        report.summary.totalGames = totalGames;
        report.summary.averageTeamsPerMatchup = matchupCount > 0 ? (totalTeams / matchupCount).toFixed(2) : 0;
        
        await fs.writeFile(outputPath, JSON.stringify(report, null, 2));
        console.log(`📊 Scraping report saved: ${outputPath}`);
        
        return report;
    }
    
    /**
     * Clean and normalize team names
     */
    static normalizeTeamName(teamName) {
        return teamName
            .trim()
            .replace(/[\r\n\t]/g, '')
            .replace(/\s+/g, ' ')
            .replace(/[^\w\s\-]/g, '')
            .substring(0, 50); // Limit length
    }
    
    /**
     * Detect and handle different page layouts
     */
    static getPageSelectors(pageContent) {
        // This function can be expanded based on different page layouts
        // For now, return the default selectors
        return {
            teamRow: 'tr[data-team], .team-row, tbody tr',
            teamName: '.team-name, .team, [data-team-name]',
            totalScore: '.total-score, .total, .points',
            gameData: '.game, .game-score, [data-game]',
            placement: '.placement, .place, .p',
            kills: '.kills, .k, .elims'
        };
    }
    
    /**
     * Generate CSV with additional metadata
     */
    static async generateEnhancedCSV(tournamentData, outputPath) {
        const lines = [];
        
        // Add metadata header
        lines.push('# ALGS Tournament Data');
        lines.push(`# Generated: ${new Date().toISOString()}`);
        lines.push(`# Day: ${tournamentData.day}`);
        lines.push(`# Round: ${tournamentData.round}`);
        lines.push(`# Teams: ${tournamentData.teams.length}`);
        lines.push('');
        
        // Add CSV header
        const maxGames = Math.max(...tournamentData.teams.map(team => team.games.length));
        const header = ['Team', 'Total'];
        for (let i = 1; i <= maxGames; i++) {
            header.push(`Game${i}`);
        }
        lines.push(header.join(','));
        
        // Add team data
        tournamentData.teams.forEach(team => {
            const row = [
                `"${ScraperUtils.normalizeTeamName(team.name)}"`,
                team.totalScore
            ];
            
            for (let i = 0; i < maxGames; i++) {
                const gameData = team.games[i];
                if (gameData) {
                    row.push(gameData.points);
                } else {
                    row.push(0);
                }
            }
            
            lines.push(row.join(','));
        });
        
        await fs.writeFile(outputPath, lines.join('\n'));
        console.log(`✅ Enhanced CSV saved: ${outputPath}`);
        
        return outputPath;
    }
}

module.exports = ScraperUtils; 