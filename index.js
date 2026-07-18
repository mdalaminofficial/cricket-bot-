const axios = require('axios');
const http = require('http');

// আপনার দেওয়া ফায়ারবেস রুট ডিরেক্টরি ইউআরএল
const FIREBASE_URL = 'https://bongocricscore-default-rtdb.firebaseio.com/.json';
// আপনার অফিশিয়াল CricAPI সোর্স
const CRICKET_SOURCE = 'https://api.cricapi.com/v1/currentMatches?apikey=67024afe-a52d-4eaa-b2b9-e13cb9e44efb&offset=0';

async function updateFirebaseScores() {
    try {
        const response = await axios.get(CRICKET_SOURCE);
        const result = response.data;

        if (result && result.data) {
            // সকল চলমান ম্যাচ প্রফেশনাল ফরম্যাটে সাজানো হচ্ছে
            const liveMatches = result.data.map(match => {
                let currentScore = "Match starting soon...";
                if (match.score && match.score.length > 0) {
                    currentScore = match.score.map(s => `${s.inning}: ${s.r}/${s.w} (${s.o} Ov)`).join(' vs ');
                }

                // ম্যাচ টাইপ আন্তর্জাতিক নাকি স্থানীয় তা নির্ধারণ
                let type = "league";
                const nameLower = (match.name || "").toLowerCase();
                if (nameLower.includes("vs") && (nameLower.includes("india") || nameLower.includes("bangladesh") || nameLower.includes("pakistan") || nameLower.includes("australia") || nameLower.includes("england") || nameLower.includes("south africa") || nameLower.includes("west indies") || nameLower.includes("new zealand") || nameLower.includes("sri lanka") || nameLower.includes("afghanistan") || nameLower.includes("ireland") || nameLower.includes("t20i") || nameLower.includes("odi") || nameLower.includes("test"))) {
                    type = "international";
                }

                return {
                    id: match.id,
                    name: match.name || "Live Match",
                    matchType: type,
                    status: match.status || "Live",
                    venue: match.venue || "TBD",
                    date: match.date || "Today",
                    score: currentScore,
                    teams: match.teams || ["Team A", "Team B"]
                };
            });

            // ফায়ারবেসে সরাসরি ডেটা পুশ
            await axios.put(FIREBASE_URL, {
                matches: liveMatches,
                lastUpdated: new Date().toISOString()
            });

            console.log(`Successfully synced ${liveMatches.length} matches to Firebase Root!`);
        }
    } catch (error) {
        console.error("Firebase update failed:", error.message);
    }
}

// ফ্রি লিমিট (১০০ হিট/দিন) বাঁচানোর জন্য প্রতি ১৫ মিনিট পর পর আপডেট হবে
setInterval(updateFirebaseScores, 900000);
updateFirebaseScores();

// Render Free Port Scan Bypass Trick
const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('BongoCric Core Engine is Active\n');
});
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
});
