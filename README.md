# Readme

1. `npm install`
2. `PORT=3344 node index.js`
3. `ngrok http 3344`
4. POST ngrok URL + `/webhook` to Check's `/webhook_configs`
5. Note the `key` returned by Check
6. kill the node server and re-run with `PORT=3344 WEBHOOK_TOKEN=<key> node index.js`
7. Trigger a test ping from the Check side
