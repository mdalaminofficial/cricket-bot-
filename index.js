const axios = require('axios');
const http = require('http');

const FIREBASE_URL = 'https://bongocricscore-default-rtdb.firebaseio.com/score.json';
// Using the high-quality cricapi source with the API Key
const CRICKET_SOURCE = 'https://api.cricapi.com/v1/currentMatches?apikey=67024afe-a52d-4eaa-b2b9-e13cb9e44efb&offset=0';

async function fetchAndSaveAllMatches() {
    try {
        const response = await axios.get(CRICKET_SOURCE);
        const result = response.data;

        if (result && result.data) {
            // Mapping all matches with detailed structure
            const matchesArray = result.data.map(match => {
                let formattedScore = "Match starting soon...";
                if (match.score && match.score.length > 0) {
                    formattedScore = match.score.map(s => `${s.inning}: ${s.r}/${s.w} (${s.o} Ov)`).join(' vs ');
                }

                return {
                    id: match.id,
                    name: match.name || "Unknown Match",
                    matchType: match.matchType || "league", // international / league / domestic
                    status: match.status || "Live",
                    venue: match.venue || "TBD",
                    date: match.date || "",
                    score: formattedScore,
                    teams: [match.teams[0] || "Team A", match.teams[1] || "Team B"]
                };
            });

            // Push entire database payload
            await axios.put(FIREBASE_URL, {
                matches: matchesArray,
                lastUpdated: new Date().toISOString()
            });

            console.log(`Successfully updated ${matchesArray.length} matches in Firebase!`);
        }
    } catch (error) {
        console.error("Failed to sync matches:", error.message);
    }
}

// Keeping a safe interval for your 100 hits/day limit (runs every 15 minutes)
setInterval(fetchAndSaveAllMatches, 900000);
fetchAndSaveAllMatches();

// --- RENDER DUMMY PORT TRICK ---
const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('BongoCric Advanced Score Engine Running...\n');
});
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
