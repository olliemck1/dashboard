import {useEffect, useState} from 'react';

function SpotifyWidget() {
    const [track, setTrack] = useState(null);
    const [loading, setLoading] = useState(true);

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
        </div>
    );
}

export default SpotifyWidget;