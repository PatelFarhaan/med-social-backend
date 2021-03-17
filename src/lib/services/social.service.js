const { OAuth2Client } = require('google-auth-library')
const {
  googleLogin: { clientId: googleClientId }
  // linkedinLogin: { clientId: linkedinClientId, clientSecret: linkedinClientSecret, callbackUrl: linkedinCallbackUrl },
  // twitterLogin: { clientId: twitterClientId, clientSecret: twitterClientSecret, frotendCallbackUrl: twitterFrontendCallbackUrl }
} = require('../../../config/config')

// GOOGLE
const googleClient = new OAuth2Client(googleClientId)

const googleTokenVerify = async token =>
  googleClient.verifyIdToken({
    idToken: token,
    audience: googleClientId
  })

// // LINKEDIN
// const handshake = async (code, ores) => {
//   // set all required post parameters
//   const data = querystring.stringify({
//     grant_type: 'authorization_code',
//     code,
//     redirect_uri: linkedinCallbackUrl,
//     client_id: linkedinClientId,
//     client_secret: linkedinClientSecret
//   })
//   const options = {
//     host: 'www.linkedin.com',
//     path: '/oauth/v2/accessToken',
//     protocol: 'https:',
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/x-www-form-urlencoded',
//       'Content-Length': Buffer.byteLength(data)
//     }
//   }
//   let body = ''
//   const req = http.request(options, res => {
//     res.setEncoding('utf8')
//     res.on('data', chunk => {
//       body += chunk
//     })
//     res.on('end', () => {
//       console.warn("body", JSON.parse(body))
//       // once the access token is received store in DB
//       // insertTodb(JSON.parse(body), id => {
//       //   // need to find better way and proper authetication for the user
//       //   ores.redirect(`http://localhost:3000/dashboard/${id}`)
//       // })
//     })
//     req.on('error', e => {
//       console.log(`problem with request: ${e.message}`)
//     })
//   })
//   req.write(body)
//   req.end()
// }
// const insertTodb = async (token, callback) => {
//   console.log("token", token)
//   MongoClient.connect(url, function (err, db) {
//       var collection = db.collection('documents');
//       collection.insertOne(
//           token
//           , function (err, result) {
//               //assert.equal(err, null);
//                console.log("Inserted " +  result.result.n + " documents into the collection ", result.ops[0]._id);
//               callback(result.ops[0]._id);// is there a better way?
//           });
//   });
// }

module.exports = {
  googleClient,
  googleTokenVerify
}
