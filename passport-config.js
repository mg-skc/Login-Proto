const LocalStrategy = require('passport-local').Strategy
const bcrypt = require ('bcrypt')


//timestamp 21.32 ish some before  https://youtu.be/-RCnNyD0L-s?t=1292
//create get user by email and get user by ID functions and pass results into the section below...
function initialize(passport, getUserByEmail, getUserById) {
    const authenticateUser = async (email, password, done) => {
        const user = getUserByEmail(email)
        if (user == null) {
            return done(null, false, {message: 'No user with that email'})
        }
    try {
        if (await bcrypt.compare(password, user.password)) {
            return done(null, user)
        } else {
            return done(null, false, {message: 'Password incorrect'})
        }
        } catch (e) {
            return done(e)
      }
    }

    

    passport.use(new LocalStrategy({usernameField: 'email'}, 
    authenticateUser))
    //Need to change this to the real ID we'll be using...likely email or auto assigned ID
    passport.serializeUser((user, done) => done(null, user.id))
    passport.deserializeUser((id, done) => {
        return done(null, getUserById(id))
    }
    )}

    module.exports = initialize