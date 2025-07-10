const { convertToYear4Format, convertAllFiles } = require('./format-converter');
const path = require('path');

/**
 * Batch convert all Year 5 raw data to Year 4 format
 * This script converts all CSV files in public/year5champions/raw/ 
 * to the Year 4 format in public/year5champions/processed/
 */
function convertYear5ToYear4Format() {
    console.log('🔄 Converting Year 5 data to Year 4 format...\n');
    
    // Define paths relative to project root
    const inputDir = path.join(__dirname, '../../public/year5champions/raw');
    const outputDir = path.join(__dirname, '../../public/year5champions/processed');
    
    // Convert all files
    const results = convertAllFiles(inputDir, outputDir, '-year4-format');
    
    // Show results
    console.log('\n📊 Conversion Summary:');
    console.log('═'.repeat(50));
    
    results.forEach(result => {
        console.log(`✅ ${result.file}`);
        console.log(`   → ${result.teamsCount} teams, ${result.gamesCount} games`);
        console.log(`   → Output: ${path.basename(result.outputPath)}`);
        console.log('');
    });
    
    console.log(`🎉 Successfully converted ${results.length} files to Year 4 format!`);
    console.log(`📁 Output location: ${outputDir}`);
    
    return results;
}

// Run if called directly
if (require.main === module) {
    convertYear5ToYear4Format();
}

module.exports = {
    convertYear5ToYear4Format
}; 