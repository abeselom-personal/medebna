export const verifyRoles = (allowedRole) => {
    return (req, res, next) => {
        if (!req.user || !req.user.type) {
            return res.status(401).json({ message: "You are not authorized" });
        }

        if (req.user.type !== allowedRole) {
            return res.status(403).json({ message: "You are not a privileged user" });
        }

        next();
    };
};

