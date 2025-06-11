const jwt = require('jsonwebtoken');
const login = require('../models/login');
module.exports = {
    isadmin: async (req, res, next) => {
        const token = req.headers["token"];
        if (token)
        {
            try {
                const decoded = jwt.verify(token,'mysecretkey123');

                const user = await login.findOne( {_id: decoded.id, status: true} );
                if (!user) {
                    return res.status(401).json({
                        status: false,
                        message: "User not found"
                    });
                }
                
console.log("ashish")
                if (user.role !== 'admin') {
                    return res.status(403).json({
                        status: false,
                        message: "Access denied, admin only"
                    });
                }

                req.user = user; // Attach user to request object for further use

               
                
            } catch (error) {
                return res.status(401).json({
                    status: false,
                    message: "Invalid token"
                });
            }
        }
        else
        {
            return res.status(401).json({
                status: false,
                message: "invalid token"
            });
        }
        next();
    }
    ,

    isuser: async (req, res, next) => {
        const token = req.headers["token"];
        if (token)
        {
            try {
                const decoded = jwt.verify(token,'mysecretkey123');

                const user = await login.findOne( {_id: decoded.id, status: true} );
                if (!user) {
                    return res.status(401).json({
                        status: false,
                        message: "User not found"
                    });
                }

                req.user = user; // Attach user to request object for further use

            } catch (error) {
                return res.status(401).json({
                    status: false,
                    message: "Invalid token"
                });
            }
        }
        else
        {
            return res.status(401).json({
                status: false,
                message: "invalid token"
            });
        }
        next();
    }
}


