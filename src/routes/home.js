import express from 'express';

const home  =  express.Router();

home.route('/').get((req, res) => {
    const err = req.query.err;
    res.render('home', {error: err?true:false});
});

export default home;