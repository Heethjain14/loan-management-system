const admin = require("firebase-admin");

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.applicationDefault(),
});
const db = admin.firestore();

async function migrateApplications() {
  const appsRef = db.collection("applications");
  const snapshot = await appsRef.get();

  for (const doc of snapshot.docs) {
    const data = doc.data();
    if (!data.numericId) continue; // Only migrate if numericId exists
    const newId = String(data.numericId);

    // Copy to new doc if not already present
    const newDocRef = appsRef.doc(newId);
    const newDoc = await newDocRef.get();
    if (!newDoc.exists) {
      await newDocRef.set(data);
      console.log(`Migrated application ${doc.id} -> ${newId}`);
    }

    // Delete old doc if ID is not numeric
    if (doc.id !== newId) {
      await doc.ref.delete();
      console.log(`Deleted old application ${doc.id}`);
    }
  }
  console.log("Migration complete.");
}

migrateApplications().catch(console.error);