const axios = require('axios');

// Firebase URL
const FIREBASE_URL = 'https://bongocricscore-default-rtdb.firebaseio.com/score.json';

// Alternative FREE Reliable Cricket API Source
const CRICKET_SOURCE = 'https://api.cricapi.com/v1/currentMatches?apikey=a5fb1db2-d6ba-4e94-8ab3-ccfba79603d6&offset=0';

async function fetchAndSaveScore() {
    try {
        const response = await axios.get(CRICKET_SOURCE);
        const result = response.data; 

        let matchName = "No Live Match Available";
        let currentScore = "0/0 (0.0 Overs)";

        if (result && result.data && result.data.length > 0) {
            // Find the first match that is live or has scores
            const liveMatch = result.data[0];
            matchName = liveMatch.name || "Live Match";
            
            if (liveMatch.score && liveMatch.score.length > 0) {
                // Get latest score from the match array
                const scoreInfo = liveMatch.score[0];
                currentScore = `${scoreInfo.inning}: ${scoreInfo.r}/${scoreInfo.w} (${scoreInfo.o} Ov)`;
            } else {
                currentScore = "Match starting soon...";
            }
        }

        await axios.put(FIREBASE_URL, {
            matchName: matchName,
            currentScore: currentScore,
            lastUpdated: new Date().toISOString()
        });

        console.log("Database updated successfully!");
    } catch (error) {
        console.error("Update failed:", error.message);
    }
}

// Automatically runs every 30 seconds
setInterval(fetchAndSaveScore, 30000);
fetchAndSaveScore();
