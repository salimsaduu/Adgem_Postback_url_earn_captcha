import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const firebaseApp = initializeApp({
  projectId: "earn-captcha-bot-latest",
});
const db = getFirestore(firebaseApp);

export default async function handler(req, res) {
  try {
    const { player_id, payout, offer_name } = req.query;
    if (!player_id || !payout) return res.status(400).send("Missing parameters");

    const coins = Math.floor(parseFloat(payout) * 2000); // $1 = 2000 coins
    const userRef = db.collection("users").doc(player_id);
    const userSnap = await userRef.get();
    if (!userSnap.exists) return res.status(404).send("User not found");

    await userRef.update({
      balance: (userSnap.data().balance || 0) + coins,
      lastOffer: { name: offer_name || "AdGem Offer", coins, time: new Date().toISOString() },
    });

    await userRef.collection("offerHistory").add({
      offer: offer_name || "AdGem Offer",
      coins,
      source: "AdGem",
      createdAt: new Date(),
    });

    return res.status(200).send("OK");
  } catch (e) {
    console.error(e);
    return res.status(500).send("Server error");
  }
      }
