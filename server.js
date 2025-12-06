// THIS IS THE BACKEND SERVER FILE FOR DEPLOYMENT
// You will deploy this file to Render/Heroku/AWS

import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

// Load Env Vars
const PORT = process.env.PORT || 3000;
const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || 'blue_cat'; 

// Updated with your specific Phone ID and Token
const WHATSAPP_PHONE_ID = process.env.WHATSAPP_PHONE_ID || '953379621182745'; 
const WHATSAPP_TOKEN = process.env.WHATSAPP_API_TOKEN || 'EAAa8eiEajHQBQEjXjkMZANqXXhh4CxDkaFRYAt5SiMlTv38SW1Clf6U5ELzcRn0Exjea8MdyMnf0l2s5bhEjZA11CLARV3ghyaNa5f3oqOBeKsI1GgnoWeVaTbTAWmZAFK3ngZBxbKQig8f72RhQ8PRAIWBcet86LnFAzIaZCrjlBSFZCMY8WQBiBK11nPLPyWtS7FQSoMUp01as3HHdpCgVVu3AWWZACGJEHXmNgoInbqqKlxeRNTB4dLoh90jgigZCNAVaOZAZCRD1GZB3qz0tWvOkgZDZD';

const app = express();
app.use(bodyParser.json());
app.use(cors());

// 1. WEBHOOK VERIFICATION (GET)
// Meta hits this endpoint to verify your server exists
app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode && token) {
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      console.log('WEBHOOK_VERIFIED');
      res.status(200).send(challenge);
    } else {
      res.sendStatus(403);
    }
  }
});

// 2. INCOMING MESSAGES (POST)
// Meta sends user messages here
app.post('/webhook', async (req, res) => {
  const body = req.body;

  console.log('Incoming Webhook:', JSON.stringify(body, null, 2));

  try {
    if (body.object) {
      if (
        body.entry &&
        body.entry[0].changes &&
        body.entry[0].changes[0].value.messages &&
        body.entry[0].changes[0].value.messages[0]
      ) {
        const phone_number_id = body.entry[0].changes[0].value.metadata.phone_number_id;
        
        // Verify it matches your phone ID
        if (phone_number_id !== WHATSAPP_PHONE_ID) {
             console.warn("Received webhook for unknown phone ID:", phone_number_id);
        }

        const from = body.entry[0].changes[0].value.messages[0].from; // User's phone
        const msg_body = body.entry[0].changes[0].value.messages[0].text.body; // Message text

        console.log(`Received message from ${from}: ${msg_body}`);

        // HERE WE CALL OUR AI AGENT LOGIC
        // await processUserMessage(from, msg_body);
        
        // For now, we just acknowledge receipt
        res.sendStatus(200);
      } else {
        res.sendStatus(404);
      }
    }
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.sendStatus(500);
  }
});

app.get('/', (req, res) => {
    res.send('WhatsApp Bot Server is Running! 🚀');
});

// Start Server
// app.listen(PORT, () => console.log(`Webhook is listening on port ${PORT}`));

// Export for testing if needed
export default app;
