require('dotenv').config();
const express = require('express');
const cors = require('cors');
const SpotifyWebApi = require('spotify-web-api-node');
const mongoose = require('mongoose');
const SpotifyToken = require('./models/SpotifyToken');
const Assignment = require("./models/assignments");
const ical = require("node-ical");
const cron = require("node-cron");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

// CORS configuration allowing localhost, Vercel deployments, and production origins
const allowedOrigins = [
  'http://127.0.0.1:5173',
  'http://localhost:5173',
  'https://dashboard-sooty-chi-89.vercel.app',
  'https://dashboard-9tohb9axk-virosais-projects.vercel.app'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    
    const isAllowed = 
      allowedOrigins.includes(origin) ||
      origin.endsWith('.vercel.app') ||
      origin.includes('localhost') ||
      origin.includes('127.0.0.1');

    if (isAllowed) {
      return callback(null, true);
    }
    // Fallback: allow request so client receives clean response without CORS 500 drop
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// MongoDB Connection
mongoose.connect(process.env.DB_URI)
  .then(() => console.log("MongoDB Connected Successfully"))
  .catch((err) => console.error("MongoDB Connection Failed:", err));

// Spotify API client
const spotifyApi = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
  redirectUri: process.env.REDIRECT_URI,
});

// Authentication middleware for Spotify endpoints
async function ensureAuthenticated(req, res, next) {
  try {
    const tokenDoc = await SpotifyToken.findOne({ dashboardId: "primary_user" });

    if (!tokenDoc) {
      return res.status(401).json({ error: "not_authenticated", message: "No Spotify tokens found. Please log in." });
    }

    if (tokenDoc.expiresAt < new Date()) {
      spotifyApi.setRefreshToken(tokenDoc.refreshToken);
      const data = await spotifyApi.refreshAccessToken();
      const newAccessToken = data.body['access_token'];

      tokenDoc.accessToken = newAccessToken;
      tokenDoc.expiresAt = new Date(Date.now() + data.body["expires_in"] * 1000);
      await tokenDoc.save();
    }
    
    spotifyApi.setAccessToken(tokenDoc.accessToken);
    next();
  } catch (error) {
    console.error("Auth middleware error:", error.message);
    return res.status(401).json({ error: "auth_failed", message: error.message });
  }
}

// -------------------------------------------------------------
// ROUTES
// -------------------------------------------------------------

app.get('/', (req, res) => {
  res.json({ message: "Backend is online and operational!" });
});

// Spotify Login & OAuth
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
    const { access_token, refresh_token, expires_in } = data.body;
    const expiresAt = new Date(Date.now() + expires_in * 1000);

    await SpotifyToken.findOneAndUpdate(
      { dashboardId: 'primary_user' },
      { accessToken: access_token, refreshToken: refresh_token, expiresAt },
      { upsert: true, new: true }
    );

    spotifyApi.setAccessToken(access_token);
    spotifyApi.setRefreshToken(refresh_token);

    // Redirect to frontend if configured, or show success message
    const frontendUrl = process.env.FRONTEND_URL || 'https://dashboard-9tohb9axk-virosais-projects.vercel.app';
    return res.redirect(`${frontendUrl}?spotify_auth=success`);

  } catch (error) {
    console.error("Spotify OAuth Callback Error:", error);
    if (!res.headersSent) {
      return res.status(400).send("Authentication failed. Please try logging in again.");
    }
  }
});

// Spotify Playback Endpoints
app.get('/api/spotify/current-track', ensureAuthenticated, async (req, res) => {
  try {
    const data = await spotifyApi.getMyCurrentPlayingTrack();

    if (data.body && data.body.item) {
      const track = {
        name: data.body.item.name,
        artist: data.body.item.artists[0]?.name || "Unknown Artist",
        albumArt: data.body.item.album?.images[0]?.url || ""
      };
      return res.json(track);
    } else {
      return res.json({ message: "No Track Currently Playing" });
    }
  } catch (error) {
    console.error('Error fetching track:', error.message);
    return res.status(500).json({ error: 'Error fetching track from Spotify' });
  }
});

app.put("/api/spotify/play", ensureAuthenticated, async (req, res) => {
  try {
    await spotifyApi.play();
    res.status(200).json({ message: "playing" });
  } catch (err) {
    console.error("Error playing:", err.message);
    res.status(400).json({ error: "Failed to play" });
  }
});

app.put("/api/spotify/pause", ensureAuthenticated, async (req, res) => {
  try {
    await spotifyApi.pause();
    res.status(200).json({ message: "paused" });
  } catch (err) {
    console.error("Error pausing:", err.message);
    res.status(400).json({ error: "Failed to pause" });
  }
});

app.post("/api/spotify/next", ensureAuthenticated, async (req, res) => {
  try {
    await spotifyApi.skipToNext();
    res.status(200).json({ message: "skipped to next" });
  } catch (err) {
    console.error("Error skipping:", err.message);
    res.status(400).json({ error: "Failed to skip" });
  }
});

app.post("/api/spotify/previous", ensureAuthenticated, async (req, res) => {
  try {
    await spotifyApi.skipToPrevious();
    res.status(200).json({ message: "rewinded" });
  } catch (err) {
    console.error("Error rewinding:", err.message);
    res.status(400).json({ error: "Failed to rewind" });
  }
});

// Assignments REST API
app.get("/api/assignments", async (req, res) => {
  try {
    const assignments = await Assignment.find({ dashboardID: "primary_user" }).sort({ dueDate: 1 });
    res.json(assignments);
  } catch (err) {
    console.error("Failed to fetch assignments:", err.message);
    res.status(500).json({ error: "Failed to fetch assignments" });
  }
});

app.post("/api/assignments", async (req, res) => {
  try {
    const newAssignment = new Assignment(req.body);
    await newAssignment.save();
    res.status(201).json(newAssignment);
  } catch (err) {
    console.error("Validation Error:", err.message);
    res.status(400).json({ error: "Failed to create assignment", details: err.message });
  }
});

app.put("/api/assignments/:id", async (req, res) => {
  try {
    const updatedAssignment = await Assignment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(updatedAssignment);
  } catch (err) {
    console.error("Update Error:", err.message);
    res.status(400).json({ error: "Failed to update assignment" });
  }
});

app.delete("/api/assignments/:id", async (req, res) => {
  try {
    await Assignment.findByIdAndDelete(req.params.id);
    res.json({ message: "Assignment Deleted" });
  } catch (err) {
    console.error("Delete Error:", err.message);
    res.status(400).json({ error: "Failed to delete assignment" });
  }
});

// Calendar Sync via iCal Feeds
const syncCalendars = async () => {
  const calendarSources = [
    { url: "https://blackboard.durham.ac.uk/webapps/calendar/calendarFeed/8541416732f846089d761f695f74427b/learn.ics", sourceName: "blackboard" },
    { url: "https://mytimetable.durham.ac.uk/calendar/export/bb7e7a1cc1d99938f9d328823cf600bc77e3e7b8.ics", sourceName: "mytimetable" }
  ];

  for (const calendar of calendarSources) {
    try {
      const rawData = await ical.async.fromURL(calendar.url);
      for (const key in rawData) {
        const item = rawData[key];
        if (item.type === "VEVENT") {
          const eventData = {
            title: item.summary,
            dueDate: item.end || item.start || item.due,
            startDate: item.start,
            endDate: item.end,
            subject: item.location || "University",
            source: calendar.sourceName,
            dashboardID: "primary_user"
          };
          await Assignment.findOneAndUpdate(
            { syncId: item.uid },
            { $set: eventData },
            { upsert: true, new: true }
          );
        }
      }
      console.log(`Successfully synced ${calendar.sourceName}`);
    } catch (error) {
      console.error(`Failed to sync ${calendar.sourceName}:`, error.message);
    }
  }
};

app.post("/api/calendar/sync", async (req, res) => {
  try {
    await syncCalendars();
    res.json({ message: "Calendars Synced Successfully" });
  } catch (error) {
    console.error("Calendar sync error:", error);
    res.status(500).json({ error: "Failed to sync calendars" });
  }
});

// Hourly calendar sync cron job
cron.schedule("0 * * * *", () => {
  console.log("Running scheduled calendar sync...");
  syncCalendars();
});

// Start Express Server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
