//authorisation middleware
function authorise(req, res, next) {
    console.log('do authorise')
    if(req.params.username){
        if(req.session.user){
            console.log("Attempt to authorise " + req.session.user.username + " to " + req.params.username)
            if (req.session.user.username === req.params.username) {
                console.log("success!")
                return next();
            }
        }
        req.session.error = 'Access denied!';
        console.log("Access denied!")
        return res.redirect('/login');
    }
    return next()
}
module.exports = authorise;
