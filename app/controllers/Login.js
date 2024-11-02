const openid = require('openid');
const express = require('express');

const jwt = require('jsonwebtoken');
const SteamAPI = require('steamapi');

const router = express.Router();

const steam = new SteamAPI(process.env.STEAM_API_KEY);

router.get('/', async (req, res) => {
    let verifyURL = new URL(process.env.API_URL + '/login/verify');

    // We can use these to redirect the user back to the correct page after login
    verifyURL.searchParams.append('origin', req.query.origin);
    verifyURL.searchParams.append('rememberMe', req.query.rememberMe);
    verifyURL.searchParams.append('userLinkToken', req.query.userLinkToken);

    console.log(verifyURL.toString());
    const relyingParty = new openid.RelyingParty(verifyURL.toString(), null, true, true, []);

    // Send the user to steam, consider sending back HTML
    let authUrl = await new Promise(function (resolve, reject) {
        relyingParty.authenticate('https://steamcommunity.com/openid', false, function (err, authURL) {
            if (err)
                return reject(err);

            return resolve(authURL);
        });
    })

    if (!authUrl) {
        throw new Error('Invalid auth URL');
    }

    res.redirect(authUrl);
});

router.get('/verify', async (req, res) => {
    const verifyURL = new URL(process.env.API_URL + '/login/verify');
    
    const origin = req.query.origin;
    const rememberMe = req.query.rememberMe;

    const relyingParty = new openid.RelyingParty(verifyURL.toString(), null, true, true, []);

    let identifier = await new Promise(function (resolve, reject) {
        relyingParty.verifyAssertion(req, function (err, result) {
            if (err)
                return reject(err);

            if (!/^https?:\/\/steamcommunity\.com\/openid\/id\/\d+$/.test(result.claimedIdentifier))
                return reject(new Error("Claimed identifier is not valid"));

            return resolve(result.claimedIdentifier)
        });
    });

    let steamId = identifier.replace('https://steamcommunity.com/openid/id/', '');

    // Update steam data
    let steamData;

    try {
        steamData = await steam.get(`/ISteamUser/GetPlayerSummaries/v2?steamids=${steamId}`)
        steamData = steamData.response.players[0];
    } catch (e) {
        context.log(e);
    }

    const token = jwt.sign({
        steamId,
        steamData,
    }, Buffer.from(process.env.BASE64_JWT_SIGNING_TOKEN, 'base64'), {
        algorithm: 'HS256',
        expiresIn: process.env.JWT_SESSION_EXPIRY || '7d',
        audience: process.env.JWT_AUDIENCE, 
        issuer: process.env.JWT_ISSUER,
    });

    console.log(origin);
    // Setting correct return URL
    let returnUrl = origin || process.env.FRONTEND_URL;
    if (!returnUrl || returnUrl === 'undefined' || returnUrl === 'null') {
        // They do not want to be redirected, return the token
        res.json({
            token,
            steamData,
        });
    } else {
        // Updating return URL with token
        returnUrl += `?token=${token}&rememberMe=${rememberMe}`
        res.redirect(returnUrl);
    }
});


module.exports = router;