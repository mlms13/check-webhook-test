const bodyParser = require('body-parser')
const express = require('express')
const crypto = require('crypto')

const port = process.env.PORT ?? 8080
const webhookToken = process.env.WEBHOOK_TOKEN

const app = express()

// If we want to read the request body, we have to use a bodyParser. As far as I
// understand, even if we use .text() or .raw(), we won't get the actual body if
// the `Content-Type` header is `application/json`.
app.use(bodyParser.json())

let hashRequestBodyWithToken = (token, body) =>
  crypto.createHmac("sha256", token).update(body).digest("hex")

const ensureAuthenticCheckSignature = (req, res, next) => {
  const signature = req.get("Check-Signature")

  if (req.body == null) {
    return res.status(400).send("Expected request to have a body")
  }

  if (signature == null) {
    return res.status(400).send("Required Check-Signature header was not present")
  }

  // We can't pass actual JSON into the `crypto.createHmac(...).update()`
  // function (it throws an exception). Instead, we have to give it either a
  // string or a buffer.
  //
  // The problem is, when we stringify the body, it also strips spaces, meaning
  // the body no longer matches the original body that Check used for hashing.
  const hash = hashRequestBodyWithToken(webhookToken, JSON.stringify(req.body))

  if (hash.toLowerCase() !== signature.toLowerCase()) {
    const msg =
      "Could not authenticate Check-Signature"
      + "\n  Check Signature: " + signature.toLowerCase()
      + "\n  Our Signature: " + hash.toLowerCase()
      + "\n  Request Body: " + JSON.stringify(req.body)

    console.error(msg)
    return res.status(403).send(msg)
  }

  next()
}

const handleAuthenticWebhook = (req, res) =>
  res.sendStatus(204)

app.post('/webhook', [ensureAuthenticCheckSignature, handleAuthenticWebhook])

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
