module.exports = function(req, res, next) {
    console.log('Reguest URL:', req.originalURL);
    next();
}