const verifyRole = (...allowedRole) => {
    return (req, res, next) => {

        if (!req.user || !req.user.type) {
            return res.status(401).json({ message: "You are not authorized" });
        }

        if (!allowedRole.includes(req.user.type)) {
            return res.status(403).json({ message: "You are not a privileged user" });
        }

        next();
    };
};

export default verifyRole;
