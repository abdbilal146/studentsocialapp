import { onDocumentCreated } from "firebase-functions/v2/firestore";
import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getMessaging } from "firebase-admin/messaging";

initializeApp();

export const sendNewMessageNotification = onDocumentCreated(
    "chats/{chatId}/messages/{messageId}",
    async (event) => {
        const snapshot = event.data;
        if (!snapshot) return;

        const messageData = snapshot.data();
        const senderId: string = messageData.senderId;
        const text: string = messageData.text || "Vous avez un nouveau message";
        const chatId: string = event.params.chatId;

        if (!senderId) return;

        const participants = chatId.split("_");
        if (participants.length !== 2) return;

        const receiverId = senderId === participants[0] ? participants[1] : participants[0];
        if (receiverId === senderId) return;

        const userDoc = await getFirestore().collection("users").doc(receiverId).get();
        if (!userDoc.exists) return;

        const fcmToken = userDoc.get("fcmToken") as string | undefined;
        if (!fcmToken?.trim()) {
            console.log("Pas de token FCM valide pour", receiverId);
            return;
        }

        const message = {
            token: fcmToken,
            notification: { title: "Nouveau message", body: text },
            data: { chatId, type: "new_message" },
            android: { priority: "high" as const, },
            apns: { payload: { aps: { sound: "default", badge: 1 } } },
        };

        try {
            const response = await getMessaging().send(message);
            console.log("Notification envoyée !", response);
        } catch (error: any) {
            console.error("Erreur FCM:", error.errorInfo?.code || error.message);
        }
    }
);