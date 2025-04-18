const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {

    const { authorization } = req.headers;

    if (!authorization) {
        return next(new Error('Not Authenticated'));
    }

    if (process.env.AUTH_SECRET && authorization === process.env.AUTH_SECRET) {

        req.user = {
            username: 'internal-api',
            key: authorization,
        };

        return next();
    }

    if (process.env.MNI_JWT_PUBLIC_KEY) {

        try {

            let token = authorization.split(' ')[1];

            // Decode the base64 public key and format it as PEM
            const publicKeyBase64 = process.env.MNI_JWT_PUBLIC_KEY;
            const publicKey = Buffer.from(publicKeyBase64, 'base64').toString('utf8');

            // Add PEM headers if they don't exist
            const formattedPublicKey = publicKey.includes('-----BEGIN') ? publicKey : 
                `-----BEGIN PUBLIC KEY-----\n${publicKeyBase64}\n-----END PUBLIC KEY-----`;

            const decoded = jwt.verify(token, formattedPublicKey);

            req.user = decoded;

            return next();

        } catch (error) {
            console.error(error);
        }
    }

    next(new Error('Not Authenticated'));
};

module.exports = {
    authenticate
};
