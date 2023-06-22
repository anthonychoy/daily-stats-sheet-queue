const express = require('express')
const app = express()
const port = 3000
const path = require('path');
const axios = require('axios');
const bodyParser = require('body-parser');
require('dotenv').config();

let isProcessing = false;

// Middleware setup
app.use(bodyParser.json()); // Parse JSON request bodies
app.use(bodyParser.urlencoded({ extended: true })); // Parse URL-encoded request bodies

// Render Html File
app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, 'templates/index.html'));
});

app.post('/start', async (req, res) => {

  if (isProcessing) {
    res.send('Queue ongoing, please wait.');
  } else {
    isProcessing = true;
    res.send('Starting queue.');

    const leads = req.body.leads;

    if (leads) {
      const updateLeadStatus = async (leadId) => {
        const result = await axios.put(
          'https://api.close.com/api/v1/lead/' + leadId + '/',
          {
              status_id: 'stat_Nsh5KfSCPA6JKGhLPExQu5vdjiF4ot8rU2zOlbtF4uB'
          },
          {
            auth: {
              username: process.env['USERNAME'],
              password: '',
            },
          }
        );
    
        return result;
      };
  
      for (const leadId of leads) {
        console.log('Updating lead ', leadId)
        try {
          await updateLeadStatus(leadId);
        } catch (err) {
          console.log('Error on updating: ', leadId)
        }
        console.log('Waiting for 1 minute');
        await new Promise(r => setTimeout(r, 60000));
      }
    } else {
      console.log('No leads for now.')
    }

    console.log('DONE!!')
    isProcessing = false;
  }
});

app.listen(port, () => {
  console.log('Listening at port ', port)
})