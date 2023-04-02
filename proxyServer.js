var express = require('express');
var cors = require('cors');
const axios = require('axios');
const cheerio = require('cheerio');

var app = express();

app.use(cors());

const WIKI_URL = 'https://leagueoflegends.fandom.com/wiki';
const VERSION_URL = 'https://ddragon.leagueoflegends.com/api/versions.json';

const COMDRAGON_BASE_URL = 'https://raw.communitydragon.org/'
const COMDRAGON_DATA = '/game/data/characters/'
const DDRAGON_BASE_URL = 'http://ddragon.leagueoflegends.com/cdn/'
const CHAMP_DATA = '/data/en_US/champion/';
const ALL_CHAMP_DATA = '/data/en_US/champion.json';
const PROFILE_IMAGE = '/img/profileicon/';
const API_URL = 'https://na1.api.riotgames.com';
const REGION_URL = 'https://americas.api.riotgames.com';
const MATCH_ID_ENDPOINT = '/lol/match/v5/matches/by-puuid/';
const MATCH_INFO_ENDPOINT = '/lol/match/v5/matches/';
const SUMMONER_BY_NAME = '/lol/summoner/v4/summoners/by-name/';

// It's in the name
function getPlayerPUUID(playerName) {
    return axios.get(API_URL + SUMMONER_BY_NAME + playerName + "?api_key=" + API_KEY)
        .then(response => {
            console.log(response.data);
            return response.data.puuid;
        }).catch(err => err);
}

// Get latest patch version
function getVersion() {
    let API_CALL = VERSION_URL;
    return axios.get(API_CALL)
        .then(response => {
            //console.log(response.data);
            return response.data[0];
        }).catch(err => err);
}

// GET past 5 games
// GET localhost:4000/past5Games
app.get('/past5Games', async (req, res) => {
    const playerName = req.query.username;
    // PUUID
    const PUUID = await getPlayerPUUID(playerName);
    const API_CALL = REGION_URL + MATCH_ID_ENDPOINT + PUUID + "/ids" + "?api_key=" + API_KEY;

    // get API_CALL
    // gives list of game ids
    const gameIDs = await axios.get(API_CALL)
        .then(response => response.data)
        .catch(err => err);

    // List of gameID strings
    console.log(gameIDs);

    // loop thru ids
    // get match info based on id
    var matchDataArray = [];
    for (let i = 0; i < gameIDs.length - 15; i++) {
        const matchID = gameIDs[i];
        const matchData = await axios.get(REGION_URL + MATCH_INFO_ENDPOINT + matchID + "?api_key=" + API_KEY)
            .then(response => response.data)
            .catch(err => err)
        matchDataArray.push(matchData);
    }

    // save above info in array, give array as json response to user
    // [Game1Obj, Game2Obj, ...]
    res.json(matchDataArray);
})

// GET data for specific champ
// GET localhost:4000/champInfo
app.get('/champInfo', async (req, res) => {
    const champName = req.query.champName;

    if (champName != 'none') {
        const VERSION = await getVersion();

        // Make request for specified champ
        const API_CALL = DDRAGON_BASE_URL + VERSION + CHAMP_DATA + champName + ".json";
        const champData = await axios.get(API_CALL)
            .then(response => response.data)
            .catch(err => err);
    
        //console.log(champData.data[champName]);
        // Give champ data as response
        res.json(champData.data[champName]);
    }
})

// Get latest patch version
// GET localhost:4000/version
app.get('/version', async (req, res) => {
    // Make request
    const VERSION = await getVersion();
    // Give version number
    res.json(VERSION);
})

// Get spell data from Community Dragon
// GET localhost:4000/spellInfo
app.get('/spellInfo', async (req, res) => {
    let champName = req.query.champName.toLowerCase();
    console.log(champName);
    //champName = champName.toLowerCase();
    let VERSION = await getVersion();
    VERSION = VERSION.slice(0, 4);
    // Make request
    const API_CALL = COMDRAGON_BASE_URL + VERSION + COMDRAGON_DATA + champName + "/" + champName + ".bin.json";
    console.log(API_CALL);
    const spellData = await axios.get(API_CALL)
        .then(response => response.data)
        .catch(err => err);

    //console.log(spellData);
    // Give champ data as response
    res.json(spellData);
})

// GET all champ data
// GET localhost:4000/allChamps
app.get('/allChamps', async (req, res) => {
    //const champName = req.query.champName;
    const VERSION = await getVersion();

    // Make request for all champs
    const API_CALL = DDRAGON_BASE_URL + VERSION + ALL_CHAMP_DATA;
    const champData = await axios.get(API_CALL)
        .then(response => response.data)
        .catch(err => err);


    console.log(champData.data[0]);
    // Give champ data as response
    res.json(champData.data);
})

app.listen(4000, function () {
    console.log("Server started on port 4000");
});