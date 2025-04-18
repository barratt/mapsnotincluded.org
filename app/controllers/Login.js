const openid = require('openid');
const express = require('express');

const jwt = require('jsonwebtoken');

const router = express.Router();

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

    // Reconstruct the exact verify URL that was used in the initial request
    // This is important for OpenID verification to work correctly

    const verifyURL = new URL(process.env.API_URL + '/login/verify');

    // Add all query parameters from the original request to ensure the URL matches exactly
    for (const [key, value] of Object.entries(req.query)) {
        if (key !== 'openid.mode' && key !== 'openid.ns' && !key.startsWith('openid.')) {
            verifyURL.searchParams.append(key, value);
        }
    }

    console.log('Verify URL:', verifyURL.toString());

    const origin = req.query.origin;
    const rememberMe = req.query.rememberMe;
    const userLinkToken = req.query.userLinkToken;

    const relyingParty = new openid.RelyingParty(verifyURL.toString(), null, true, true, []);

    let identifier;

    try {
        identifier = await new Promise(function (resolve, reject) {

            relyingParty.verifyAssertion(req, function (err, result) {

                if (err) {
                    console.error('OpenID verification error:', err);
                    return reject(err);
                }

                if (!result || !result.claimedIdentifier) {
                    console.error('Invalid result from OpenID verification');
                    return reject(new Error("Invalid result from OpenID verification"));
                }

                if (!/^https?:\/\/steamcommunity\.com\/openid\/id\/\d+$/.test(result.claimedIdentifier)) {
                    console.error('Claimed identifier is not valid:', result.claimedIdentifier);
                    return reject(new Error("Claimed identifier is not valid"));
                }

                return resolve(result.claimedIdentifier);
            });
        });

    } catch (error) {

        console.error('Error during OpenID verification:', error.message || error);

        return res.status(400).json({error: 'Authentication failed', details: error.message || 'Unknown error'});
    }

    let steamId = identifier.replace('https://steamcommunity.com/openid/id/', '');

    // Decode the base64 private key and format it as PEM
    const privateKeyBase64 = process.env.MNI_JWT_PRIVATE_KEY;
    const privateKey = Buffer.from(privateKeyBase64, 'base64').toString('utf8');

    // Add PEM headers if they don't exist
    const formattedPrivateKey = privateKey.includes('-----BEGIN') ? privateKey :
        `-----BEGIN PRIVATE KEY-----\n${privateKeyBase64}\n-----END PRIVATE KEY-----`;

    const token = jwt.sign(
        {
            steamId
        },
        formattedPrivateKey,
        {
            algorithm: 'RS256',
            audience: 'mapsnotincluded',
            issuer: 'mapsnotincluded'
        }
    );

    console.log('Origin:', origin);

    // Setting correct return URL
    let returnUrl = origin || process.env.FRONTEND_URL;

    // Validate the return URL
    if (!returnUrl || returnUrl === 'undefined' || returnUrl === 'null') {
        console.log('No valid return URL, returning JSON response');
        // They do not want to be redirected, return the token
        return res.json({ token });
    }

    try {

        // Validate that the returnUrl is a valid URL
        new URL(returnUrl);

        // Check if the URL already has query parameters
        const hasQueryParams = returnUrl.includes('?');
        const separator = hasQueryParams ? '&' : '?';

        // Updating return URL with token
        returnUrl += `${separator}token=${encodeURIComponent(token)}`;

        // Add rememberMe parameter if it exists
        if (rememberMe !== undefined) {
            returnUrl += `&rememberMe=${encodeURIComponent(rememberMe)}`;
        }

        // Add userLinkToken parameter if it exists
        if (userLinkToken !== undefined) {
            returnUrl += `&userLinkToken=${encodeURIComponent(userLinkToken)}`;
        }

        console.log('Redirecting to:', returnUrl);

        return res.redirect(returnUrl);

    } catch (error) {

        console.error('Invalid return URL format:', returnUrl, error);

        return res.status(400).json({
            error: 'Invalid return URL format',
            token
        });
    }
});

module.exports = router;
