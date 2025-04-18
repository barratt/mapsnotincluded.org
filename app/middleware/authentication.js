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

            const decoded = jwt.verify(token, Buffer.from(process.env.MNI_JWT_PUBLIC_KEY, 'base64'));
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
