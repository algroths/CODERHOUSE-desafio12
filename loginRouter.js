const { Router } = require('express');
const session = require('express-session')
const FileStore = require('session-file-store')(session)

const loginRouter = Router()

loginRouter.use(session({
    store: new FileStore({ path: './sessiones', ttl: 10 }),
    secret: 'qwerty',
    resave: true,
    saveUninitialized: true
}))

loginRouter.get('', (req, res) => {
    if (req.session.contador) {

        return res.render('index', req.session.user)
    }

    req.session.contador = 1
    return res.render('login')
})

const logout = (req, res, next) => {
    res.render('logout', req.session.user)
    next()
}

loginRouter.get('/logout', logout, (req, res) => {

    res.redirect('/login')
})

loginRouter.post('', (req, res) => {

    const session = req.session
    req.session.user = req.body


    return res.render('index', req.session.user)
})

module.exports = loginRouter