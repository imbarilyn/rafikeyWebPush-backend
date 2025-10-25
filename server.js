import { config } from './config.js';
import express from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'
import { router } from './routes/index.js';
import { startCronJob } from "./cronjob.js";



const app  = express()
app.use(cors())
app.use(bodyParser.json())
app.use('/api', router )
const port = config.SERVER_PORT || 4000


// basic diagnostics to catch why the process exits
process.on('exit', (code) => {
    console.log(`Process exit event with code: ${code}`)
})
process.on('uncaughtException', (err) => {
    console.error('uncaughtException:', err && err.stack ? err.stack : err)
})
process.on('unhandledRejection', (reason) => {
    console.error('unhandledRejection:', reason)
})


app.listen(port, ()=>{
    console.log(`Server is running on port ${port}`)
    startCronJob()
})


