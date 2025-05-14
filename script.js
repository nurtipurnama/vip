// Core data structure
const matchData = {
    h2h: [], // Head-to-head matches
    team1: [], // Team 1's matches
    team2: [] // Team 2's matches
};

// Team and match info
let sport = 'football';
let team1Name = 'Team 1';
let team2Name = 'Team 2';
let team1Ranking = 0;
let team2Ranking = 0;
let matchImportance = 'regular';
let matchLocation = 'neutral';
let totalLine = 0;
let pointSpread = 0;
let spreadDirection = 'team1';
let totalOdds = 1.90;
let spreadOddsTeam1 = 1.90;
let spreadOddsTeam2 = 1.90;

// Weighting factors (natural and balanced)
const WEIGHTS = {
    H2H: 0.25,           // Head-to-head history
    RECENT_FORM: 0.20,   // Recent performance
    SCORING: 0.20,       // Scoring trends
    DEFENSE: 0.15,       // Defensive strength
    MOMENTUM: 0.10,      // Team momentum
    HOME_ADVANTAGE: 0.10, // Home/away advantage
    RANKING: 0.05,       // Team rankings
    MATCH_IMPORTANCE: 0.05 // Match context
};

// Match importance multipliers (natural impact)
const IMPORTANCE_MULTIPLIERS = {
    decider: 1.3,
    rivalry: 1.2,
    qualifier: 1.15,
    regular: 1.0,
    nba_playoff: 1.25,
    nba_allstar: 0.9,
    nba_playin: 1.2,
    nba_final: 1.35
};

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    updateTeamLabels();
    showToast('Welcome to Sports Match Predictor', 'info');
});

// Setup event listeners
function setupEventListeners() {
    document.getElementById('sport').addEventListener('change', () => {
        sport = document.getElementById('sport').value;
        updateTeamLabels();
    });
    document.getElementById('team-form').addEventListener('input', handleTeamSetup);
    document.getElementById('h2h-add-btn').addEventListener('click', handleH2HAdd);
    document.getElementById('team1-add-btn').addEventListener('click', handleTeam1Add);
    document.getElementById('team2-add-btn').addEventListener('click', handleTeam2Add);
    document.getElementById('clear-data-btn').addEventListener('click', clearAllData);
    document.getElementById('sample-data-btn').addEventListener('click', addSampleData);
    document.getElementById('analyze-button').addEventListener('click', runPrediction);
}

// Handle team setup changes
function handleTeamSetup() {
    team1Name = document.getElementById('team1').value || 'Team 1';
    team2Name = document.getElementById('team2').value || 'Team 2';
    team1Ranking = parseInt(document.getElementById('team1-ranking').value) || 0;
    team2Ranking = parseInt(document.getElementById('team2-ranking').value) || 0;
    matchImportance = document.getElementById('match-importance').value;
    matchLocation = document.getElementById('match-location').value;
    updateTeamLabels();
}

// Update team labels
function updateTeamLabels() {
    document.getElementById('h2h-team1-label').textContent = `${team1Name} Scores (comma separated)`;
    document.getElementById('h2h-team2-label').textContent = `${team2Name} Scores (comma separated)`;
    document.getElementById('team1-scores-label').textContent = `${team1Name} Scores (comma separated)`;
    document.getElementById('team2-scores-label').textContent = `${team2Name} Scores (comma separated)`;
    const spreadDirectionEl = document.getElementById('spread-direction');
    spreadDirectionEl.options[0].textContent = team1Name;
    spreadDirectionEl.options[1].textContent = team2Name;
}

// Handle Head-to-Head Scores Add
function handleH2HAdd() {
    const team1ScoresText = document.getElementById('h2h-team1').value.trim();
    const team2ScoresText = document.getElementById('h2h-team2').value.trim();
    if (!team1ScoresText || !team2ScoresText) {
        showToast('Please enter scores for both teams', 'warning');
        return;
    }
    const team1Scores = team1ScoresText.split(',').map(score => parseFloat(score.trim()));
    const team2Scores = team2ScoresText.split(',').map(score => parseFloat(score.trim()));
    if (!validateScores(team1Scores, team2Scores)) return;
    matchData.h2h = [];
    const minLength = Math.min(team1Scores.length, team2Scores.length);
    for (let i = 0; i < minLength; i++) {
        const timestamp = Date.now() - ((minLength - i) * 7 * 24 * 60 * 60 * 1000);
        processMatchScore('h2h', i + 1, team1Scores[i], team2Scores[i], timestamp);
    }
    updateMatchSummary('h2h');
    document.getElementById('h2h-team1').value = '';
    document.getElementById('h2h-team2').value = '';
    showToast(`Added ${minLength} Head-to-Head matches`, 'success');
}

// Handle Team 1 Scores Add
function handleTeam1Add() {
    const team1ScoresText = document.getElementById('team1-scores').value.trim();
    const opponentScoresText = document.getElementById('team1-opponent').value.trim();
    if (!team1ScoresText || !opponentScoresText) {
        showToast('Please enter scores for both teams', 'warning');
        return;
    }
    const team1Scores = team1ScoresText.split(',').map(score => parseFloat(score.trim()));
    const opponentScores = opponentScoresText.split(',').map(score => parseFloat(score.trim()));
    if (!validateScores(team1Scores, opponentScores)) return;
    matchData.team1 = [];
    const minLength = Math.min(team1Scores.length, opponentScores.length);
    for (let i = 0; i < minLength; i++) {
        const timestamp = Date.now() - ((minLength - i) * 7 * 24 * 60 * 60 * 1000);
        processMatchScore('team1', i + 1, team1Scores[i], opponentScores[i], timestamp);
    }
    updateMatchSummary('team1');
    document.getElementById('team1-scores').value = '';
    document.getElementById('team1-opponent').value = '';
    showToast(`Added ${minLength} matches for ${team1Name}`, 'success');
}

// Handle Team 2 Scores Add
function handleTeam2Add() {
    const team2ScoresText = document.getElementById('team2-scores').value.trim();
    const opponentScoresText = document.getElementById('team2-opponent').value.trim();
    if (!team2ScoresText || !opponentScoresText) {
        showToast('Please enter scores for both teams', 'warning');
        return;
    }
    const team2Scores = team2ScoresText.split(',').map(score => parseFloat(score.trim()));
    const opponentScores = opponentScoresText.split(',').map(score => parseFloat(score.trim()));
    if (!validateScores(team2Scores, opponentScores)) return;
    matchData.team2 = [];
    const minLength = Math.min(team2Scores.length, team2Scores.length);
    for (let i = 0; i < minLength; i++) {
        const timestamp = Date.now() - ((minLength - i) * 7 * 24 * 60 * 60 * 1000);
        processMatchScore('team2', i + 1, team2Scores[i], opponentScores[i], timestamp);
    }
    updateMatchSummary('team2');
    document.getElementById('team2-scores').value = '';
    document.getElementById('team2-opponent').value = '';
    showToast(`Added ${minLength} matches for ${team2Name}`, 'success');
}

// Add sample data
function addSampleData() {
    clearAllData();
    document.getElementById('team1').value = sport === 'football' ? 'Barcelona' : 'Lakers';
    document.getElementById('team2').value = sport === 'football' ? 'Real Madrid' : 'Celtics';
    document.getElementById('team1-ranking').value = '3';
    document.getElementById('team2-ranking').value = '2';
    handleTeamSetup();
    document.getElementById('h2h-team1').value = sport === 'football' ? '2,1,0' : '110,105,98';
    document.getElementById('h2h-team2').value = sport === 'football' ? '1,1,2' : '108,100,102';
    handleH2HAdd();
    document.getElementById('team1-scores').value = sport === 'football' ? '3,2,1' : '115,110,108';
    document.getElementById('team1-opponent').value = sport === 'football' ? '0,1,0' : '100,102,98';
    handleTeam1Add();
    document.getElementById('team2-scores').value = sport === 'football' ? '2,3,0' : '112,118,105';
    document.getElementById('team2-opponent').value = sport === 'football' ? '1,0,1' : '108,110,100';
    handleTeam2Add();
    document.getElementById('total-line').value = sport === 'football' ? '2.5' : '220.5';
    document.getElementById('total-odds').value = '1.90';
    document.getElementById('point-spread').value = '0.5';
    document.getElementById('spread-odds-team1').value = '1.85';
    document.getElementById('spread-odds-team2').value = '1.95';
    showToast('Sample data added successfully', 'success');
}

// Validate scores
function validateScores(scores1, scores2) {
    if (scores1.some(isNaN) || scores2.some(isNaN)) {
        showToast('Please enter valid scores (numbers only)', 'error');
        return false;
    }
    if (scores1.some(score => score < 0) || scores2.some(score => score < 0)) {
        showToast('Scores must be non-negative', 'error');
        return false;
    }
    if (scores1.length === 0 || scores2.length === 0) {
        showToast('Please enter at least one score', 'warning');
        return false;
    }
    return true;
}

// Process match score
function processMatchScore(category, matchNumber, score1, score2, timestamp) {
    const totalScore = score1 + score2;
    let team1Score, team2Score, outcome;
    if (category === 'h2h') {
        team1Score = score1;
        team2Score = score2;
        outcome = team1Score > team2Score ? `${team1Name} Wins` :
                  team2Score > team1Score ? `${team2Name} Wins` : 'Draw';
    } else if (category === 'team1') {
        team1Score = score1;
        team2Score = score2;
        outcome = team1Score > team2Score ? `${team1Name} Wins` :
                  team2Score > team1Score ? 'Opponent Wins' : 'Draw';
    } else if (category === 'team2') {
        team1Score = score2; // Opponent
        team2Score = score1;
        outcome = team2Score > team1Score ? `${team2Name} Wins` :
                  team1Score > team2Score ? 'Opponent Wins' : 'Draw';
    }
    matchData[category].push({
        matchNumber,
        team1Score,
        team2Score,
        totalScore,
        outcome,
        timestamp
    });
    matchData[category].sort((a, b) => a.timestamp - b.timestamp);
}

// Update match summary
function updateMatchSummary(category) {
    const summaryElement = document.getElementById(`${category}-match-summary`);
    if (matchData[category].length === 0) {
        summaryElement.innerHTML = '<p>No matches added yet.</p>';
        return;
    }
    const matchItems = matchData[category].map(match => {
        let team1Label = category === 'h2h' ? team1Name : category === 'team1' ? team1Name : 'Opponent';
        let team2Label = category === 'h2h' ? team2Name : category === 'team2' ? team2Name : 'Opponent';
        const daysAgo = Math.floor((Date.now() - match.timestamp) / (24 * 60 * 60 * 1000));
        const dateInfo = daysAgo === 0 ? 'Today' : daysAgo === 1 ? 'Yesterday' : `${daysAgo} days ago`;
        return `
            <div class="match-item">
                <div class="match-score">${team1Label} ${match.team1Score} - ${match.team2Score} ${team2Label}</div>
                <div class="match-date">${dateInfo}</div>
            </div>
        `;
    }).join('');
    summaryElement.innerHTML = `<h4>Added ${matchData[category].length} matches:</h4><div class="match-list">${matchItems}</div>`;
}

// Clear all match data
function clearAllData() {
    if (matchData.h2h.length + matchData.team1.length + matchData.team2.length > 0 &&
        !confirm('Are you sure you want to clear all match data?')) {
        return;
    }
    matchData.h2h = [];
    matchData.team1 = [];
    matchData.team2 = [];
    updateMatchSummary('h2h');
    updateMatchSummary('team1');
    updateMatchSummary('team2');
    showToast('All match data has been cleared', 'info');
}

// Run prediction
function runPrediction() {
    if (!validateInputs()) return;
    processMatchData();
    const results = performPrediction();
    displayResults(results);
}

// Validate inputs
function validateInputs() {
    if (matchData.h2h.length + matchData.team1.length + matchData.team2.length === 0) {
        showToast('Please add match data before analyzing', 'error');
        return false;
    }
    if (!team1Name.trim() || !team2Name.trim()) {
        showToast('Please enter names for both teams', 'error');
        return false;
    }
    if (team1Name.trim() === team2Name.trim()) {
        showToast('Team names must be different', 'error');
        return false;
    }
    return true;
}

// Process match data
function processMatchData() {
    totalLine = parseFloat(document.getElementById('total-line').value) || 0;
    pointSpread = parseFloat(document.getElementById('point-spread').value) || 0;
    spreadDirection = document.getElementById('spread-direction').value;
    totalOdds = parseFloat(document.getElementById('total-odds').value) || 1.90;
    spreadOddsTeam1 = parseFloat(document.getElementById('spread-odds-team1').value) || 1.90;
    spreadOddsTeam2 = parseFloat(document.getElementById('spread-odds-team2').value) || 1.90;
}

// Perform prediction
function performPrediction() {
    const features = prepareFeatures();
    const probabilities = calculateProbabilities(features);
    const projectedTotal = calculateProjectedTotal(features);
    const projectedMargin = calculateProjectedMargin(features);
    const [team1Score, team2Score] = calculateProjectedScores(projectedTotal, projectedMargin);
    
    // Ensure consistency
    const adjustedProbabilities = adjustProbabilities(probabilities, projectedMargin);
    
    // Calculate betting recommendations and EV
    const overUnderRec = totalLine > 0 ? calculateOverUnderRecommendation(projectedTotal) : null;
    const spreadRec = pointSpread > 0 ? calculateSpreadRecommendation(projectedMargin) : null;
    
    return {
        team1Score,
        team2Score,
        probabilities: adjustedProbabilities,
        projectedTotal,
        projectedMargin,
        overUnderRec,
        spreadRec
    };
}

// Prepare features for prediction
function prepareFeatures() {
    const team1AvgScore = calculateTeamAverage(team1Name, true);
    const team2AvgScore = calculateTeamAverage(team2Name, false);
    const team1AvgConceded = calculateTeamConceded(team1Name, true);
    const team2AvgConceded = calculateTeamConceded(team2Name, false);
    const h2hAdvantage = calculateH2HAdvantage();
    const team1Momentum = calculateMomentum(team1Name, true);
    const team2Momentum = calculateMomentum(team2Name, false);
    const scoringTrend = calculateScoringTrend();
    const locationFactor = matchLocation === 'team1_home' ? 1 : matchLocation === 'team2_home' ? -1 : 0;
    const rankingDiff = team1Ranking && team2Ranking ? team2Ranking - team1Ranking : 0; // Lower rank is better
    
    return {
        team1AvgScore,
        team2AvgScore,
        team1AvgConceded,
        team2AvgConceded,
        h2hAdvantage,
        team1Momentum,
        team2Momentum,
        scoringTrend,
        locationFactor,
        rankingDiff,
        matchImportance: IMPORTANCE_MULTIPLIERS[matchImportance],
        totalMatches: matchData.h2h.length + matchData.team1.length + matchData.team2.length,
        h2hMatches: matchData.h2h.length
    };
}

// Calculate team average score
function calculateTeamAverage(teamName, isTeam1) {
    let scores = [];
    if (isTeam1) {
        matchData.h2h.forEach(match => scores.push(match.team1Score));
        matchData.team1.forEach(match => scores.push(match.team1Score));
    } else {
        matchData.h2h.forEach(match => scores.push(match.team2Score));
        matchData.team2.forEach(match => scores.push(match.team2Score));
    }
    return scores.length ? scores.reduce((sum, score) => sum + score, 0) / scores.length : sport === 'football' ? 1.3 : 100;
}

// Calculate team average conceded
function calculateTeamConceded(teamName, isTeam1) {
    let conceded = [];
    if (isTeam1) {
        matchData.h2h.forEach(match => conceded.push(match.team2Score));
        matchData.team1.forEach(match => conceded.push(match.team2Score));
    } else {
        matchData.h2h.forEach(match => conceded.push(match.team1Score));
        matchData.team2.forEach(match => conceded.push(match.team1Score));
    }
    return conceded.length ? conceded.reduce((sum, score) => sum + score, 0) / conceded.length : sport === 'football' ? 1.3 : 100;
}

// Calculate head-to-head advantage
function calculateH2HAdvantage() {
    if (matchData.h2h.length < 2) return 0;
    let team1Wins = 0, team2Wins = 0;
    matchData.h2h.forEach(match => {
        if (match.team1Score > match.team2Score) team1Wins++;
        else if (match.team2Score > match.team1Score) team2Wins++;
    });
    const totalH2H = team1Wins + team2Wins;
    return totalH2H ? (team1Wins - team2Wins) / totalH2H : 0;
}

// Calculate team momentum
function calculateMomentum(teamName, isTeam1) {
    let matches = [];
    if (isTeam1) {
        matches = [...matchData.h2h.map(m => ({ score: m.team1Score, oppScore: m.team2Score, timestamp: m.timestamp })),
                   ...matchData.team1.map(m => ({ score: m.team1Score, oppScore: m.team2Score, timestamp: m.timestamp }))];
    } else {
        matches = [...matchData.h2h.map(m => ({ score: m.team2Score, oppScore: m.team1Score, timestamp: m.timestamp })),
                   ...matchData.team2.map(m => ({ score: m.team2Score, oppScore: m.team1Score, timestamp: m.timestamp }))];
    }
    matches.sort((a, b) => b.timestamp - a.timestamp);
    if (matches.length < 3) return 0;
    const recent = matches.slice(0, 3);
    let momentum = 0;
    recent.forEach((match, i) => {
        const weight = (3 - i) / 6; // Recent matches weigh more
        if (match.score > match.oppScore) momentum += weight;
        else if (match.score < match.oppScore) momentum -= weight;
    });
    return momentum;
}

// Calculate scoring trend
function calculateScoringTrend() {
    let recentScores = [];
    [...matchData.h2h, ...matchData.team1, ...matchData.team2].forEach(match => {
        recentScores.push(match.totalScore);
    });
    if (recentScores.length < 3) return 0;
    const avg = recentScores.reduce((sum, score) => sum + score, 0) / recentScores.length;
    const leagueAvg = sport === 'football' ? 2.5 : 220;
    return (avg - leagueAvg) / leagueAvg;
}

// Calculate probabilities
function calculateProbabilities(features) {
    const { team1AvgScore, team2AvgScore, team1AvgConceded, team2AvgConceded, h2hAdvantage, team1Momentum, team2Momentum,
            scoringTrend, locationFactor, rankingDiff, matchImportance } = features;
    
    let team1Strength = 0;
    team1Strength += (team1AvgScore - team2AvgConceded) * WEIGHTS.SCORING;
    team1Strength += (team2AvgConceded - team1AvgConceded) * WEIGHTS.DEFENSE;
    team1Strength += h2hAdvantage * WEIGHTS.H2H;
    team1Strength += team1Momentum * WEIGHTS.MOMENTUM;
    team1Strength += locationFactor * WEIGHTS.HOME_ADVANTAGE;
    team1Strength += rankingDiff * WEIGHTS.RANKING / 20;
    team1Strength *= matchImportance * WEIGHTS.MATCH_IMPORTANCE + 1;
    
    let team2Strength = 0;
    team2Strength += (team2AvgScore - team1AvgConceded) * WEIGHTS.SCORING;
    team2Strength += (team1AvgConceded - team2AvgConceded) * WEIGHTS.DEFENSE;
    team2Strength -= h2hAdvantage * WEIGHTS.H2H;
    team2Strength += team2Momentum * WEIGHTS.MOMENTUM;
    team2Strength -= locationFactor * WEIGHTS.HOME_ADVANTAGE;
    team2Strength -= rankingDiff * WEIGHTS.RANKING / 20;
    team2Strength *= matchImportance * WEIGHTS.MATCH_IMPORTANCE + 1;
    
    // Base draw probability
    const drawBase = sport === 'football' ? 0.25 : 0.05;
    const strengthDiff = Math.abs(team1Strength - team2Strength);
    const drawProb = Math.max(0.05, drawBase - strengthDiff * 0.1);
    
    // Win probabilities
    let team1WinProb = 0.5 + (team1Strength - team2Strength) / 2;
    let team2WinProb = 0.5 + (team2Strength - team1Strength) / 2;
    
    // Adjust for draw
    team1WinProb *= (1 - drawProb);
    team2WinProb *= (1 - drawProb);
    
    // Normalize
    const total = team1WinProb + team2WinProb + drawProb;
    return {
        team1WinProb: Math.max(5, (team1WinProb / total) * 100),
        team2WinProb: Math.max(5, (team2WinProb / total) * 100),
        drawProb: Math.max(5, (drawProb / total) * 100)
    };
}

// Adjust probabilities for consistency
function adjustProbabilities(probabilities, projectedMargin) {
    let { team1WinProb, team2WinProb, drawProb } = probabilities;
    if (Math.abs(projectedMargin) < 0.5) {
        drawProb = Math.min(40, drawProb + 5);
    } else if (projectedMargin > 0.5) {
        team1WinProb = Math.min(85, team1WinProb + 5);
    } else if (projectedMargin < -0.5) {
        team2WinProb = Math.min(85, team2WinProb + 5);
    }
    const total = team1WinProb + team2WinProb + drawProb;
    return {
        team1WinProb: (team1WinProb / total) * 100,
        team2WinProb: (team2WinProb / total) * 100,
        drawProb: (drawProb / total) * 100
    };
}

// Calculate projected total
function calculateProjectedTotal(features) {
    const { team1AvgScore, team2AvgScore, team1AvgConceded, team2AvgConceded, scoringTrend, matchImportance } = features;
    let baseTotal = (team1AvgScore + team2AvgConceded + team2AvgScore + team1AvgConceded) / 2;
    baseTotal += scoringTrend * (sport === 'football' ? 0.5 : 10);
    if (matchImportance < 1) baseTotal *= 1.1; // Less important matches may be more open
    else if (matchImportance > 1.2) baseTotal *= 0.9; // Important matches may be tighter
    if (features.totalMatches < 4) {
        const leagueAvg = sport === 'football' ? 2.5 : 220;
        baseTotal = baseTotal * 0.7 + leagueAvg * 0.3;
    }
    return Math.max(sport === 'football' ? 0.5 : 50, baseTotal);
}

// Calculate projected margin
function calculateProjectedMargin(features) {
    const { team1AvgScore, team2AvgScore, team1AvgConceded, team2AvgConceded, h2hAdvantage, team1Momentum, team2Momentum,
            locationFactor, rankingDiff, matchImportance } = features;
    let margin = (team1AvgScore - team2AvgConceded) - (team2AvgScore - team1AvgConceded);
    margin += h2hAdvantage * (sport === 'football' ? 0.5 : 5);
    margin += (team1Momentum - team2Momentum) * (sport === 'football' ? 0.3 : 3);
    margin += locationFactor * (sport === 'football' ? 0.4 : 4);
    margin += rankingDiff * (sport === 'football' ? 0.02 : 0.2);
    if (matchImportance > 1.2) margin *= 1.1; // Stronger teams dominate in important matches
    if (features.totalMatches < 4) margin *= 0.7; // Less data, more conservative
    return margin;
}

// Calculate projected scores
function calculateProjectedScores(projectedTotal, projectedMargin) {
    const team1Score = Math.round((projectedTotal / 2) + (projectedMargin / 2));
    const team2Score = Math.round((projectedTotal / 2) - (projectedMargin / 2));
    return [Math.max(0, team1Score), Math.max(0, team2Score)];
}

// Calculate over/under recommendation
function calculateOverUnderRecommendation(projectedTotal) {
    if (totalLine <= 0) return null;
    const diff = projectedTotal - totalLine;
    const probOver = diff > 0 ? Math.min(80, 50 + diff * 20) : Math.max(20, 50 - Math.abs(diff) * 20);
    const probUnder = 100 - probOver;
    const evWithoutOdds = probOver / 100 - 0.5;
    const evWithOdds = totalOdds > 1 ? (probOver / 100 * totalOdds - 1) : 0;
    return {
        recommendation: diff > 0.3 ? `OVER ${totalLine}` : diff < -0.3 ? `UNDER ${totalLine}` : 'NO EDGE',
        probOver,
        probUnder,
        evWithoutOdds,
        evWithOdds
    };
}

// Calculate spread recommendation
function calculateSpreadRecommendation(projectedMargin) {
    if (pointSpread <= 0) return null;
    const adjustedMargin = spreadDirection === 'team1' ? projectedMargin : -projectedMargin;
    const spread = spreadDirection === 'team1' ? pointSpread : -pointSpread;
    let probCover = 50 + (adjustedMargin - spread) * 20;
    probCover = Math.max(20, Math.min(80, probCover));
    
    // Handle handicap logic
    const favoriteTeam = spreadDirection === 'team1' ? team1Name : team2Name;
    const underdogTeam = spreadDirection === 'team1' ? team2Name : team1Name;
    const favoriteOdds = spreadDirection === 'team1' ? spreadOddsTeam1 : spreadOddsTeam2;
    const underdogOdds = spreadDirection === 'team1' ? spreadOddsTeam2 : spreadOddsTeam1;
    
    let recommendation;
    if (adjustedMargin > spread + 0.3) {
        recommendation = `${favoriteTeam} -${pointSpread}`;
    } else if (adjustedMargin < spread - 0.3) {
        recommendation = `${underdogTeam} +${pointSpread}`;
    } else {
        recommendation = 'NO EDGE';
    }
    
    const evWithoutOdds = probCover / 100 - 0.5;
    const evWithOdds = favoriteOdds > 1 ? (probCover / 100 * favoriteOdds - 1) : 0;
    
    return {
        recommendation,
        probCover,
        probNotCover: 100 - probCover,
        evWithoutOdds,
        evWithOdds
    };
}

// Display results
function displayResults(results) {
    const { team1Score, team2Score, probabilities, overUnderRec, spreadRec } = results;
    let html = `
        <h3>Prediction Results</h3>
        <p><strong>Prediction Score:</strong> ${team1Name} ${team1Score} - ${team2Score} ${team2Name} (Confidence: ${Math.max(probabilities.team1WinProb, probabilities.team2WinProb, probabilities.drawProb).toFixed(1)}%)</p>
        <p><strong>Win Probabilities:</strong></p>
        <ul>
            <li>${team1Name}: ${probabilities.team1WinProb.toFixed(1)}%</li>
            <li>${team2Name}: ${probabilities.team2WinProb.toFixed(1)}%</li>
            <li>Draw: ${probabilities.drawProb.toFixed(1)}%</li>
        </ul>
    `;
    
    if (overUnderRec) {
        html += `
            <p><strong>Total Line Prediction:</strong> ${overUnderRec.recommendation} (Probability: ${overUnderRec.probOver.toFixed(1)}%)</p>
            <p>EV without odds: ${overUnderRec.evWithoutOdds.toFixed(2)}</p>
            <p>EV with odds (${totalOdds}): ${overUnderRec.evWithOdds.toFixed(2)}</p>
        `;
    }
    
    if (spreadRec) {
        html += `
            <p><strong>Point Spread Prediction:</strong> ${spreadRec.recommendation} (Probability: ${spreadRec.probCover.toFixed(1)}%)</p>
            <p>EV without odds: ${spreadRec.evWithoutOdds.toFixed(2)}</p>
            <p>EV with odds (${spreadDirection === 'team1' ? spreadOddsTeam1 : spreadOddsTeam2}): ${spreadRec.evWithOdds.toFixed(2)}</p>
        `;
    }
    
    document.getElementById('results').classList.remove('hidden');
    document.getElementById('prediction-results').innerHTML = html;
    window.scrollTo({ top: document.getElementById('results').offsetTop - 20, behavior: 'smooth' });
}

// Show toast message
function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast ${type}`;
    toast.classList.remove('hidden');
    setTimeout(() => toast.classList.add('hidden'), 3000);
}