const axios = require('axios');

const FIREBASE_URL = 'https://bongocricscore-default-rtdb.firebaseio.com/score.json';
const CRICKET_SOURCE = 'https://cric-score-api.vercel.app/matches';

async function fetchAndSaveScore() {
    try {
        const response = await axios.get(CRICKET_SOURCE);
        const liveMatches = response.data; 

        let matchName = "No Live Match Available";
        let currentScore = "0/0 (0.0 Overs)";

        if (liveMatches && liveMatches.length > 0) {
            matchName = liveMatches[0].title;
            currentScore = liveMatches[0].currentScore || "Match starting soon...";
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

setInterval(fetchAndSaveScore, 30000);
fetchAndSaveScore();

