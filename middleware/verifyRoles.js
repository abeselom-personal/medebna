export const checkRole = (allowedRoles) => {
    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

    return (req, res, next) => {
        if (!req.user || !req.user.type) {
            return res.status(401).json({ message: "You are not authorized" });
        }

        if (!roles.includes(req.user.type)) {
            return res.status(403).json({ message: "You are not a privileged user" });
        }

        next();
    };
};

