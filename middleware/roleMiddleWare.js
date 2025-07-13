const isAdmin = async (req, res, next) => {
    if (req.user.type === 'admin') {
        next(); 
    } else {
        res.status(403).json({ message: 'Access forbidden. Admin role required.' });
    }
};

const isCar = async (req, res, next) => {
    if (req.user.type === 'car') {
        next(); 
    } else {
        res.status(403).json({ message: 'Access forbidden. Car role required.' });
    }
};

const isEvent = async (req, res, next) => {
    if (req.user.type === 'event') {
        next(); 
    } else {
        res.status(403).json({ message: 'Access forbidden. Event role required.' });
    }
};

const isHotel = async (req, res, next) => {
    if (req.user.type === 'hotel') {
        next(); 
    } else {
        res.status(403).json({ message: 'Access forbidden. Hotel role required.' });
    }
};

module.exports = { isAdmin, isCar, isHotel, isEvent };
