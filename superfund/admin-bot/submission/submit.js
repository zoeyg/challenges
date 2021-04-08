const express = require('express');
const {PubSub} = require('@google-cloud/pubsub');

const app = express();
const port = process.env.PORT || 8080;
const topic = new PubSub({projectId: "shakticon-ctf"}).topic("admin-bot");

app.use(require('body-parser').urlencoded({ extended: false }));

app.post('/submit-url', (req, res) => {
  try {
    topic.publish(Buffer.from(req.body.url, 'utf8'));
  } catch (e) {
    console.log(e);
    return res.redirect(`/?msg=${encodeURIComponent('Error: ' + e)}&url=${encodeURIComponent(req.body.url)}`);
  }
  return res.redirect(`/?msg=${encodeURIComponent('url successfully submitted')}&url=${encodeURIComponent(req.body.url)}`);
});

app.use('/', express.static('public'));

app.listen(port, () => {
  console.log(`listening on port ${port}`);
});