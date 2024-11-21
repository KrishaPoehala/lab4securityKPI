const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const port = 3001;

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const AUTH0_DOMAIN = 'https://dev-ebhi8uutpsnhugsw.us.auth0.com';
const AUTH0_CLIENT_ID = 'pZhqL9saYkC6huJBiUuWQaNbBFi2rRzT';
const AUTH0_CLIENT_SECRET = 'jvcF87YL1lID686d0JbqQ_N5ngnlJIjFUua52eI4VJDu7DaaIk_PFuSHiOmD5XqO';
const AUTH0_AUDIENCE = 'https://dev-ebhi8uutpsnhugsw.us.auth0.com/api/v2/';
const AUTH0_TOKEN_URL = `${AUTH0_DOMAIN}/oauth/token`;

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/index.html'));
});

app.post('/api/register', async (req, res) => {
    const { login, password, username } = req.body;

    try {
        const authTokenResponse = await axios.post(AUTH0_TOKEN_URL, {
            client_id: AUTH0_CLIENT_ID,
            client_secret: AUTH0_CLIENT_SECRET,
            audience: AUTH0_AUDIENCE,
            grant_type: 'client_credentials',
        });

        const managementAccessToken = authTokenResponse.data.access_token;

        const userResponse = await axios.post(
            `${AUTH0_DOMAIN}/api/v2/users`,
            {
                email: login,
                password,
                connection: 'Username-Password-Authentication',
            },
            {
                headers: {
                    Authorization: `Bearer ${managementAccessToken}`,
                },
            }
        );

        res.json({ message: 'User registered successfully', user: userResponse.data });
    } catch (error) {
        console.error(error.response?.data || error.message);
        res.status(500).json({ error: 'Failed to register user' });
    }
});

app.post('/api/login', async (req, res) => {
    const { login, password } = req.body;

    try {
        const tokenResponse = await axios.post(AUTH0_TOKEN_URL, {
            client_id: AUTH0_CLIENT_ID,
            client_secret: AUTH0_CLIENT_SECRET,
            audience: AUTH0_AUDIENCE,
            grant_type: 'password',
            username: login,
            password: password,
        });

        res.json({ accessToken: tokenResponse.data.access_token });
    } catch (error) {
        console.error(error.response?.data || error.message);
        res.status(401).json({ error: 'Login failed' });
    }
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
