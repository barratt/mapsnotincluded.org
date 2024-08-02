// Super simple authentication middleware. TODO: users?

const authenticate = (req, res, next) => {
    const { authorization } = req.headers;

    if (process.env.AUTH_SECRET && authorization !== process.env.AUTH_SECRET) {
        return res.status(403).json({ message: 'Unauthorized' });
    }

    next();
};

module.exports = {
    authenticate
};
