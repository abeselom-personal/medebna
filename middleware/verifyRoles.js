export const checkRole = (allowedRoles) => {
    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];


    return (req, res, next) => {

        console.log(req.user)
        if (!req.user || !req.user.role) {
            return res.status(401).json({ message: "You are not authorized" });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ message: "You are not a privileged user" });
        }

        next();
    };
};

