import express from 'express'
import { createUserRouter } from './routes/api.js'
import { corsMiddleware } from './middlewares/cors.js'

export const createApp = ({userModel}) =>{
    const app = express()
    const PORT = process.env.PORT ?? 1234
    
    app.disable('x-powered-by')
    app.use(corsMiddleware())
    app.use(express.json())
    app.use('/v1', createUserRouter({userModel}))
    app.get('/', (req, res)=>{
        res.status(200).json({message:'hola'})
    })
    app.listen(PORT, () =>{
        console.log(`Server listening at http://localhost:${PORT}`)
    })
}