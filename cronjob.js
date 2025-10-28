import { config} from "./config.js";
import cron from  'node-cron'
import fs from 'fs'
import path from 'path'
import { fileURLToPath} from 'url'




// Get the backend base URL from config
// const BASE_URL = config.BACKEND_BASE_URL
const BASE_URL =  config.BACKEND_APP_API
const __filepath =  fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filepath);

const sendNotificationTask = async () =>{
    const controller = new AbortController()
    const signal = controller.signal
    const timeoutMs = 5000
    const timeout = setTimeout(()=> controller.abort() , timeoutMs)

    try{
        await fetch(`${BASE_URL}/api/send-notifications`, {signal})
        clearTimeout(timeout)
    } catch(err) {
        if(err.name === 'AbortError'){
            fs.appendFileSync(path.resolve(__dirname, 'log.txt'), `\n Fetch subscription from the database aborted due to timeout at ${new Date().toISOString()}`, 'utf-8', (err)=> {
                console.log('Error writing to log file', err)
            })
        } else {
            fs.appendFileSync(path.resolve(__dirname, 'log.txt'), `\n Error in running cron job at ${new Date().toISOString()}: ${err.message}`, 'utf-8', (err)=> {
                console.log('Error writing to log file', err)
            })
        }
    }
}

export const startCronJob = ()=>{
    cron.schedule('* * * * *', sendNotificationTask)
}

