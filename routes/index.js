import { config } from "../config.js";
import webPush from 'web-push'
import express from 'express'
import {db} from '../db.js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url';

const __filepath = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filepath);

export const router = express.Router()
const vapidKeys = {
    publicKey: config.VAPID_PUBLIC_KEY,
    privateKey: config.VAPID_PRIVATE_KEY
}

// setting the VAPID keys
webPush.setVapidDetails(
    'mailto: linahmuhonjaimbari@gmail.com',
    vapidKeys.publicKey,
    vapidKeys.privateKey
)
const filepath =
router.get('/send-notifications', async (req, res) => {
    try {
        // console.log('This is directory:', fs.__dirname)
        const [rows] = await db.execute("SELECT * FROM subscriptions");
        rows.forEach((row) => {
            // sendNotification(row)
            const subscriptionBody = {
                endpoint: row.endpoint,
                keys: {
                    p256dh: row.p256dh,
                    auth: row.auth
                }
            }
            const dataToSend = JSON.stringify({
                    title: 'Chat Clean up Notice',
                    body: 'Please be notified that chats at least 30days old will be deleted in less than 24 hours'
                }
            )
            webPush.sendNotification(subscriptionBody, dataToSend)
                .then((response) => {
                    fs.writeFileSync(path.resolve(__dirname, '../log.txt'), `\n notification send successfully to: ${row.user} at ${new Date().toISOString()}`, 'utf-8', (err)=>{
                        console.log('Error writing to log file', err)
                    })
                })
                // delete any stale subscription from the database
                .catch((err) => {
                    if(err.statusCode === 401 || err.statusCode === 410) {
                        db.query('DELETE FROM subscriptions WHERE endpoint = ?', [row.endpoint])
                    }
                })
        })
    } catch (err) {
        fs.writeFileSync(path.resolve(__dirname, '../log.txt'), `\n Error in sending notifications at ${new Date().toISOString()}: ${err.message}`, 'utf-8', (err)=>{
            console.log('Error writing to log file', err)
        })
    }
})

// unsubscribe the user from push notifications
router.delete('/unsubscribe', async (req, res) => {
    try {
        const {endpoint} = req.body
        if (!endpoint) {
            return res.status(400).json({message: 'Missing request body'})
        }
        await db.query('DELETE FROM subscriptions WHERE endpoint = ?', [endpoint])
        console.log('Unsubscribed successfully for endpoint:', endpoint)
        res.status(200).json({message: 'Unsubscribed successfully'})
    } catch (err) {
        console.log('Error in unsubscribing', err)
        res.status(500).json({message: 'Failed to unsubscribe'})
    }
})


router.post('/subscriptions', async (req, res) => {
    console.log(req.body)
    try {
        const subscription = req.body;

        const {endpoint, keys, user} = subscription

        const [rows] = await db.execute(
            "INSERT INTO subscriptions (user, endpoint, p256dh, auth) VALUES (?, ?, ?, ?)", [user, endpoint, keys.p256dh, keys.auth]);
        res.status(201).json({message: "Subscription saved successfully"})
    } catch (e) {
        console.log("Failed to save subscription", e)
        res.status(500).json({error: "Failed to save subscription"})
    }
})

router.get('/test', async (req, res) =>{
  try{
      // res.end('Hello there testing is working...')
      res.status(200).json({message: 'API is working'})

  } catch (err) {
        res.status(500).json({message: 'Server error'})
  }
})

