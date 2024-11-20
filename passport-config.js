const localStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");

function initialize(passport, getUserByEmail){
    const authenticateUser = async (email, password,done ) =>{
        const user = getUserByEmail(email);
        if (user == null){
            return done(null, false, {message: "Email not in DB"})
        }
        try{
            if (await bcrypt.compare(password, user.password)){
                return done(null, user)
            }
            else{
                return done(null, false, {message: "Incorrect password"})
            }
        }
        catch(e){
            return done(e);
        }
    }
    passport.use(new localStrategy({usernameField: 'username'}), authenticateUser);
    passport.serializeuser((user, done) =>{});
    passport.deserializeuser((id, done) =>{})
}

module.exports = {initialize};