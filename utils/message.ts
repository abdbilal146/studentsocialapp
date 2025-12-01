import { db } from "@/firebaseConfig"
import { addDoc, collection, onSnapshot, orderBy, query, serverTimestamp } from "firebase/firestore"

export const sendMessage = async (chatId: any, userId: any, text: any) => {
    await addDoc(collection(db, "chats", chatId, "messages"), {
        text,
        senderId: userId,
        createdAt: serverTimestamp()
    })
}

export const listenMessages = (chatId: any, callback: any) => {
    const q = query(
        collection(db, "chats", chatId, "messages"),
        orderBy("createdAt", "asc")
    )

    return onSnapshot(q, (snapshot) => {
        const messages = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data()
        }))
        callback(messages)
    })
}