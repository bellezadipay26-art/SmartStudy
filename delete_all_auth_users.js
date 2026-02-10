const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

async function deleteAllUsers(nextPageToken) {
  const result = await admin.auth().listUsers(1000, nextPageToken);
  const uids = result.users.map(u => u.uid);

  if (uids.length) {
    await admin.auth().deleteUsers(uids);
    console.log("Deleted users:", uids.length);
  }

  if (result.pageToken) return deleteAllUsers(result.pageToken);
}

deleteAllUsers().then(() => console.log("Done")).catch(console.error);
