const express = require('express')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const bcrypt = require('bcrypt')
const cors = require('cors')

require('dotenv').config()

const isValidPostUserRequest = require('./src/validators/isValidPostUserRequest')
const getUserWithoutPassword = require('./src/utils/getUserWithoutPassword')
const { UserModel } = require('./src/models')

mongoose.connect(
    `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}/${process.env.DB_NAME}?retryWrites=true&w=majority`,
    { useNewUrlParser: true, useUnifiedTopology: true },
    () => {
        console.log('connected')
    }
)

const db = mongoose.connection
db.on('error', console.error.bind(console, 'connection error:'))
db.once('open', function () {
    const app = express()

    const port = 8080
    const saltRounds = 10

    app.use(bodyParser.json())
    app.use(cors())

    app.post('/user', async (req, res) => {
        const { login, password, email } = req.body

        if (isValidPostUserRequest(req.body)) {
            const existedUser = await UserModel.findOne({
                name: login,
            }).exec()

            if (existedUser) {
                res.send({
                    error: true,
                    errorMessage: 'user with same login/email already exist',
                })
            }

            const hash = await bcrypt.hash(password, saltRounds)
            const createdUser = await UserModel.create({
                name: login,
                password: hash,
                email,
            })

            if (createdUser) {
                res.send({
                    error: false,
                    data: getUserWithoutPassword(createdUser),
                })
            }
        } else {
            console.log('wrong reqBody')
        }
    })

    app.post('/auth', async (req, res) => {
        const { login, password } = req.body

        const existedUser = await UserModel.findOne({
            name: login,
        }).exec()
        if (existedUser) {
            const authorized = await bcrypt.compare(
                password,
                existedUser.password
            )

            if (authorized) {
                console.log('success login', login)
                res.send({
                    data: getUserWithoutPassword(existedUser),
                })
            } else {
                res.send({
                    error: true,
                    errorMessage: 'wrong login/password',
                })
            }
        } else {
            res.send({
                error: true,
                errorMessage: 'user with same login/email not exist',
            })
        }
    })

    app.get('/', (req, res) => {
        res.send({ data: 'OK' })
    })

    app.listen(port, () => {
        console.log(`app start on port ${port}`)
    })
})
