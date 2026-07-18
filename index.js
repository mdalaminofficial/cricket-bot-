const axios = require('axios');
const http = require('http');

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
            const liveMatch = result.data[0];
            matchName = liveMatch.name || "Live Match";
            
            if (liveMatch.score && liveMatch.score.length > 0) {
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

// --- FREE RENDER PORT TRICK ---
// This code creates a dummy server to prevent Render's port scan timeout error
const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Cricket Bot is Running Perfectly!\n');
});
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Dummy server listening on port ${PORT}`);
});
