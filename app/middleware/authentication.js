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

    if (process.env.BASE64_JWT_SIGNING_TOKEN) {
        try {
            let token = authorization.split(' ')[1];

            const decoded = jwt.verify(token, Buffer.from(process.env.BASE64_JWT_SIGNING_TOKEN, 'base64'));
            req.user = decoded;
            return next();
        } catch (e) {
            console.error(e);
        }
    }

    next(new Error('Not Authenticated'));
};

module.exports = {
    authenticate
};
