# Personal Dashboard

## The Challenge
Keeping on top of academic deadlines often means managing fragmented information. Between shifting project requirements, scattered to-do lists, and keeping a focus during study sessions, it’s easy for things to slip through the cracks. I needed a way to consolidate these tasks into a single view that keeps me organized without the overhead of complex, bloated productivity software.

## The Solution
I built this dashboard as a centralized command center. It bridges the gap between my academic workflow and my focus environment. By integrating my task management with my daily study media, I can spend less time organizing and more time working.

### Key Features
* **Academic Tracker:** A full-stack CRUD system for managing assignments, prioritizing deadlines, and tracking resource links.
* **Spotify Focus Integration:** Real-time playback tracking that creates a seamless environment for study sessions.
* **Persistent Architecture:** Built on MongoDB Atlas to ensure my data is synced and accessible from any machine.

## Technical Stack
* **Frontend:** React (Vite)
* **Backend:** Node.js & Express
* **Database:** MongoDB Atlas (Mongoose ODM)
* **Auth/API:** Spotify Web API (OAuth 2.0)

## How It Works
* **API Integration:** The dashboard interfaces with the Spotify API to handle authentication and media metadata.
* **Data Management:** I’m using a custom REST API to handle assignment data, featuring server-side sorting by due date so the most urgent tasks are always at the top of my list.
