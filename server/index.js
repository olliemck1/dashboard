require('dotenv').config();
const express = require('express');
const cors = require('cors');
const SpotifyWebAPi = require('spotify-web-api-node');
const formidable = require('formidable')
const app = express();
const PORT = 5000;
const mongoose = require('mongoose');
const SpotifyToken = require('./models/SpotifyToken')
const Assignment = require("./models/assignments");
const assignments = require('./models/assignments');
app.use(express.json())
app.use(cors({origin: 'http://localhost:5173'})); 

mongoose.connect(process.env.DB_URI)
  .then(() => console.log("Success"))
  .catch((err)=> console.error("Failed",err));


app.listen(PORT, () => {
  console.log(`Server is running! Open your browser to http://127.0.0.1:${PORT}`);
});

const spotifyApi = new SpotifyWebAPi({
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
  redirectUri: process.env.REDIRECT_URI,
});

app.get('/login', (req, res) => {
  const scopes = [
    'user-read-currently-playing',
    'user-read-playback-state',
    'user-modify-playback-state'
  ];

  res.redirect(spotifyApi.createAuthorizeURL(scopes));
});

app.get('/callback', async (req, res) => {
  const code = req.query.code;

  try {
    const data = await spotifyApi.authorizationCodeGrant(code);
    const {access_token, refresh_token, expires_in } = data.body;
    const expiresAt = new Date(Date.now() + expires_in *1000);

    await SpotifyToken.findOneAndUpdate(
      {dashboardId: 'primary_user'},
      {accessToken: access_token, refreshToken: refresh_token, expiresAt},
      {upsert: true, new: true}
    );

    spotifyApi.setAccessToken(access_token)
    spotifyApi.setRefreshToken(refresh_token)

    return res.send("Success! Tokens saved");

  } catch(error) {
    console.error("Callback Error", error);
    res.status(500).send('error during authentication')

    if (!res.headersSent) {
      return res.status(400).send("Authentication failed, login again")
    }
  }

  spotifyApi.authorizationCodeGrant(code)
    .then(data => {
      const accessToken = data.body['access_token'];
      const refreshToken = data.body['refresh_token'];
      const expiresIn = data.body['expires_in'];

      console.log('Access Token:', accessToken);
      console.log('Refresh Token:', refreshToken);
      console.log('Expires In:', expiresIn);

      spotifyApi.setAccessToken(accessToken);
      spotifyApi.setRefreshToken(refreshToken);

      res.send('Success! You can close the window now.');
    })
    .catch(error => {
      console.error('Error retrieving access token:', error);
      res.status(500).json({ error });
    });
  });



app.get('/', (req, res) => {
  res.json({ message: "Backend is online!" });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

app.get('/api/spotify/current-track', ensureAuthenticated, async (req,res) => {

  try {
    const data = await spotifyApi.getMyCurrentPlayingTrack();

    if (data.body && data.body.item) {
      const track ={
        name: data.body.item.name,
        artist: data.body.item.artists[0].name,
        albumArt: data.body.item.album.images[0].url
      };
      res.json(track);
    } else {
      res.json({ message: "No Track Currently Playing"});

    } 
  }   catch (error) {
      console.error('Error fetching track', error);
      res.status(500).send('Error Fetching Track From Spotify');
    }
  });

async function ensureAuthenticated(req, res, next) {
  const tokenDoc = await SpotifyToken.findOne({dashboardId:"primary_user"});

  if (!tokenDoc) return res.status(401).send("No Tokens Found");

  if (tokenDoc.expiresAt < new Date()) {
    spotifyApi.setRefreshToken(tokenDoc.refreshToken);
    const data = await spotifyApi.refreshAccessToken();
    const newAccessToken = data.body['access_token'];

    tokenDoc.accessToken = newAccessToken;
    tokenDoc.expiresAt = new Date(Date.now() + data.body["expires_in"]*1000);
    await tokenDoc.save();
  } else {
    spotifyApi.setAccessToken(tokenDoc.accessToken)
  }
  next();
}



app.get("/api/assignments", async (req, res) => {
  try {
    const assignments = await Assignment.find({dashboardID: "primary_user"}).sort({ dueDate: 1});
    res.json(assignments);
  } catch(err) {
    res.status(500).json({error: "failed to fetch assignments"});
  }
});

app.post("/api/assignments", async (req, res) => {
  try {
    const newAssignment = new Assignment(req.body);
    await newAssignment.save();
    res.status(201).json(newAssignment);
  } catch(err) {
      console.error("Validation Error:", err.message); 
      res.status(400).json({ error: "failed to create assignment", details: err.message });
    }
});

app.put("/api/assignments/:id", async (req,res) =>{
  try {
    const updatedAssignment = await Assignment.findByIdAndUpdate(
      req.params.id,
      req.body,
      {new: true}
    );
    res.json(updatedAssignment);

  }catch(err) {
    res.status(400).json({error: "failed to update assignment"})
  }
});

app.delete("/api/assignments/:id", async (req, res) =>{
  try {
    await Assignment.findByIdAndDelete(req.params.id);
    res.json({message: "Assignment Deleted"})

  } catch(err) {
    res.status(400).json({error: "failed to delete assignment"})
  }
})
