/**
 * Test script to verify ALGS scoring calculations
 * Based on the examples provided by the user
 */

// ALGS placement points distribution
const placementPoints = {
    1: 12,   // 1st place
    2: 9,    // 2nd place
    3: 7,    // 3rd place
    4: 5,    // 4th place
    5: 4,    // 5th place
    6: 3,    // 6th place
    7: 3,    // 7th place
    8: 2,    // 8th place
    9: 2,    // 9th place
    10: 2,   // 10th place
    11: 1,   // 11th place
    12: 1,   // 12th place
    13: 1,   // 13th place
    14: 1,   // 14th place
    15: 1,   // 15th place
    // 16th-20th place get 0 points (handled by default)
};

function calculatePoints(placement, kills) {
    const basePoints = placementPoints[placement] || 0;
    const killPoints = kills * 1; // 1 point per kill
    
    return basePoints + killPoints;
}

// Test cases based on user examples
console.log('🧪 Testing ALGS Scoring Calculations');
console.log('=====================================');

// User example: Team Falcons Game 1 - 5th place (P=5), 12 kills (K=12)
console.log('\n📊 User Example: Team Falcons Game 1');
console.log('Placement: 5th place');
console.log('Kills: 12');
console.log('Expected: 4 (placement) + 12 (kills) = 16 points');
const falcons_game1 = calculatePoints(5, 12);
console.log(`Calculated: ${falcons_game1} points`);
console.log(`✅ ${falcons_game1 === 16 ? 'CORRECT' : 'INCORRECT'}`);

// User example: Team Falcons Game 2 - 1st place (P=1), 18 kills (K=18)  
console.log('\n📊 User Example: Team Falcons Game 2');
console.log('Placement: 1st place');
console.log('Kills: 18');
console.log('Expected: 12 (placement) + 18 (kills) = 30 points');
const falcons_game2 = calculatePoints(1, 18);
console.log(`Calculated: ${falcons_game2} points`);
console.log(`✅ ${falcons_game2 === 30 ? 'CORRECT' : 'INCORRECT'}`);

// Test all placement scenarios
console.log('\n🎯 Testing All Placement Points');
console.log('===============================');

for (let place = 1; place <= 20; place++) {
    const points = calculatePoints(place, 0); // 0 kills to test placement only
    const expected = placementPoints[place] || 0;
    
    console.log(`${place.toString().padStart(2)}th place: ${points} points ${points === expected ? '✅' : '❌'}`);
}

// Test kill points
console.log('\n🔫 Testing Kill Points');
console.log('====================');

for (let kills = 0; kills <= 10; kills++) {
    const points = calculatePoints(20, kills); // 20th place (0 placement points) to test kills only
    const expected = kills;
    
    console.log(`${kills} kills: ${points} points ${points === expected ? '✅' : '❌'}`);
}

// Test edge cases
console.log('\n🧨 Testing Edge Cases');
console.log('=====================');

// Test with 0 placement and 0 kills
console.log(`0 placement, 0 kills: ${calculatePoints(0, 0)} points (should be 0)`);

// Test with invalid placement (25th place)
console.log(`25th place, 5 kills: ${calculatePoints(25, 5)} points (should be 5)`);

// Test with high kills
console.log(`1st place, 20 kills: ${calculatePoints(1, 20)} points (should be 32)`);

console.log('\n✅ All tests completed!'); 