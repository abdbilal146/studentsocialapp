import * as functions from "firebase-functions/v1";
import * as admin from "firebase-admin";

admin.initializeApp();

export const sendNewMessageNotification = functions.firestore
    .document("chats/{chatId}/messages/{messageId}")
    .onCreate(async (snap: any, context: any) => {

        const msg = snap.data();
        const senderId = msg.senderId;
        const text = msg.text || "";
        const chatId = context.params.chatId;

        // Extraire participants depuis chatId
        const [userA, userB] = chatId.split("_");
        const receiverId = senderId === userA ? userB : userA;

        // Récupérer le token du receiver
        const receiverDoc = await admin.firestore()
            .collection("users")
            .doc(receiverId)
            .get();

        if (!receiverDoc.exists) return null;
        const token = receiverDoc.data()?.fcmToken;
        if (!token) return null;

        // Nom de l’envoyeur (optionnel)
        let senderName = "New message";
        const senderDoc = await admin.firestore()
            .collection("users")
            .doc(senderId)
            .get();
        if (senderDoc.exists) senderName = senderDoc.data()?.name || senderName;

        // Payload notification
        const payload = {
            notification: {
                title: senderName,
                body: text.length > 40 ? text.substring(0, 40) + "..." : text
            },
            data: { chatId, senderId }
        };

        return admin.messaging().sendToDevice(token, payload);
    });
