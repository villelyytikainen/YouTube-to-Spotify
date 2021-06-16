const express = require('express');
const spotify = require('./spotify')
const path = require('path');
const request = require('request');
const querystring = require('querystring');

const app = express();
const hostname = '127.0.0.1';
const port = 5500;

app.use(express.static(__dirname + '/public'));
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/index.html'));
});
app.get('/login', (req, res)=>{
    res.redirect(spotify.handleLogin())
})
app.get('/callback', (req, res) => {
    const authOptions = spotify.getCode(req,res);
    console.log('callback')

    request.post(authOptions, (error, response, body) =>{
        if(!error && response.statusCode === 200){
            const access_token = body.access_token;
            const refresh_token = body.refresh_token;

            const options = {
                url: 'https://api.spotify.com/v1/me',
                headers: {
                    'Authorization': 'Bearer ' + access_token
                },
                json: true
            };
            request.get(options, (error, response, body) =>{
                console.log(body);
            });
            res.redirect('/#' + 
            querystring.stringify({
                access_token: access_token,
                refresh_token: refresh_token
            }));
        }
        else{
            res.redirect('/#' + 
            querystring.stringify({
                error: 'invalid_token'
            }));
        }
    })
});

app.get('/refresh_token', (req,res) => {
    const authOptions = spotify.getRefreshToken(req,res);
    request.post(authOptions, function (error, response, body) {
        if (!error && response.statusCode === 200) {
            var access_token = body.access_token;
            res.send({
                'access_token': access_token
            });
        }
    });
})

app.listen(port, () => {
    console.log(`Server running at ${hostname}:${port}`)
})
