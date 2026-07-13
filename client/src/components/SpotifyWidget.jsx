import {useEffect, useState} from 'react';


function SpotifyWidget() {
    const [track, setTrack] = useState(null);
    const [loading, setLoading] = useState(true);
    const handlePlayback = async (action) => {
        const method = action === 'play' || action === 'pause' ? 'PUT' : 'POST';
        
        try {
        const response = await fetch(`/api/spotify/${action}`, {
            method: method,
        });

        // NEW: Force it to read the response from the backend
        const data = await response.json(); 
        
        if (!response.ok) {
            // If the status is 400, 403, 404, etc., print it in bright red!
            console.error(`Spotify API Error (${response.status}):`, data);
        } else {
            console.log(`Success: ${action}`, data);
        }

        } catch (error) {
        console.error(`Network Error on ${action}:`, error);
        }
    };
    useEffect(() => {

        fetch("http://127.0.0.1:5000/api/spotify/current-track")
        .then((res) => {
            if (res.status === 401) {
                setTrack({ error:"Please log in"});
                return;
            }
            return res.json();
    })
        .then((data) => {
            setTrack(data);
            setLoading(false);
        })
        .catch((err) => console.error("Error Fetcing Track:",err));
    },[]);

    if (loading) return <div>Loading Music...</div>;
    if (!track|| !track.name) return <div>No Music Playing</div>

    return (
        <div className="spotify-widget" style={{ border: '1px solid #ccc', padding: '10px', borderRadius: '8px'}}>
            <img src={track.albumArt} alt="Album Art" style={{width: '100px'}}/>
            <h3>{track.name}</h3>
            <p>{track.artist}</p>
            <div className='playback-controls' style={{display:"flex", gap:"10px", marginTop:"10px"}}>
                <button onClick={() => handlePlayback("previous")}>⏮️</button>
                <button onClick={() => handlePlayback('pause')}>⏸️</button>
                <button onClick={() => handlePlayback('play')}>▶️</button>
                <button onClick={() => handlePlayback('next')}>⏭️</button>
            </div>
        </div>
    );
}




export default SpotifyWidget;