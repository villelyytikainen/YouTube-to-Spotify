require('dotenv').config();

const spotify  = (function(){
    const SPOTIFY_AUTH_ENDPOINT = 'https://accounts.spotify.com/authorize';
    const REDIRECT_URI = 'http://localhost:5500/callback';
    const SCOPES = 'playlist-read-private user-library-modify';

    const clientId = process.env.CLIENTID;
    const clientSecret = process.env.CLIENTSECRET;

    return{
        async getToken(code) {

            const result = await fetch('https://accounts.spotify.com/api/token', {
                method: 'POST',
                mode: 'no-cors',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': 'Basic ' + Buffer.from(clientId + ':' + clientSecret).toString('base64')
                },
                body: {
                    'grant_type': 'client_credentials',
                    'code': `${code}`,
                    'redirect_uri': `${REDIRECT_URI}`}
            })

            const data = await result.json();
            return data.access_token;
        },

        getRefreshToken(req, res){
            const refresh_token = req.query.refresh_token;
            const authOptions = {
                url: 'https://accounts.spotify.com/api/token',
                headers: {
                    'Authorization': 'Bearer ' + Buffer.from(clientId + clientSecret).toString('base64')
                },
                form: {
                    grant_type: 'refresh_token',
                    refresh_token: refresh_token
                },
                json: true
            };
            return authOptions;
        },

        async getPlaylists(token){
        const playlists = await fetch('https://api.spotify.com/v1/me/playlists', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const items = playlists.json();
        return items;
    },

        getCode(req,res){
            let code = req.query.code;
            let authOptions = {
                url: 'https://accounts.spotify.com/api/token',
                form: {
                    code: code,
                    redirect_uri: REDIRECT_URI,
                    grant_type: 'authorization_code'
                },
                headers: {
                    'Authorization': 'Basic ' + Buffer.from(clientId + clientSecret).toString('base64')
                },
                json: true
            }
            return authOptions;
        },
    
        handleLogin() {
            return `${SPOTIFY_AUTH_ENDPOINT}?client_id=${clientId}&response_type=code&redirect_uri=${REDIRECT_URI}&scope=${SCOPES}&show_dialog=true`;
        },


        async getPlaylistItems(token, playlistId) {
            const playlistItems = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            const items = await playlistItems.json();
            return items;
        },

        async getTrack(token, id) {
            const result = fetch(`https://api.spotify.com/v1/tracks/${id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })

            const data = await result.json();
            return data.track;
        }
    }
})();

module.exports = spotify;