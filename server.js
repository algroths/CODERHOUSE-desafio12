const express = require('express')

const productoRouter = require('./productoRouter')
const chatRouter = require('./chatRouter')
const loginRouter = require('./loginRouter')
const ContenedorMessages = require('./ContenedorMessages')

const { options } = require('./db/sqlite')
const knex = require('knex')(options)

const storeMessages = new ContenedorMessages(knex, 'messages')

const { Server: IOServer } = require('socket.io')
const { Server: HttpServer } = require('http')

const app = express()
const httpServer = new HttpServer(app)
const io = new IOServer(httpServer)

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use('/static', express.static(__dirname + '/public'))

app.use('/productos', productoRouter)
app.use('/chat', chatRouter)
app.use('/login', loginRouter)

app.set('view engine', 'ejs')





app.get('/', (req, res) => {
    return res.render('index')
})

app.use((err, req, res, next) => {
    return res.status(500).json({
        error: 'Error, no se encuentra el producto'
    })
})

const PORT = 8080

httpServer.listen(PORT, () => {
    console.log(`Servidor HTTP escuchando en puerto ${PORT}`)
})

io.on('connection', socket => {
    console.log(`Usuario conectado con ID: ${socket.id}`)

    io.sockets.emit('contentTable')
    io.sockets.emit('contentMessage')

    socket.on('inputMessage', data => {

        const now = new Date()
        const time = `${now.getHours()}:${(now.getMinutes() < 10 ? '0' : '') + now.getMinutes()}:${now.getSeconds()}`
        const date = `${now.getUTCDate()}/${now.getUTCMonth()}/${now.getUTCFullYear()}`

        const message = {
            email: data.email,
            text: data.text,
            created_at: `${date} ${time}`
        }

        io.sockets.emit('message', message)
        storeMessages.save(message)
    })
})




