import { Collections, SubCollection } from "@/constants/Collections";
import { db } from "@/firebaseConfig";
import { addDoc, collection, deleteDoc, doc, onSnapshot, orderBy, query, serverTimestamp, setDoc } from "firebase/firestore";

export const listenToUserChats = (userId: string, callback: (chats: any[]) => void) => {
    const chatsRef = collection(db, "chats");

    return onSnapshot(chatsRef, (snapshot) => {
        const chats = snapshot.docs
            .filter(doc => doc.id.includes(userId))
            .map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        callback(chats);
    });
};

export const listenToMessages = (chatId: string, callback: (messages: any[]) => void) => {
    const q = query(
        collection(db, "chats", chatId, "messages"),
        orderBy("createdAt", "asc")
    );

    return onSnapshot(q, (snapshot) => {
        const messages = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data()
        }));
        callback(messages);
    });
};

export const sendMessage = async (chatId: string, userId: string, text: string, type: string, audiourl: string, duration: number) => {
    await setDoc(doc(db, "chats", chatId), {
        lastMessage: text,
        updatedAt: serverTimestamp()
    }, { merge: true });

    // Add the message to the subcollections
    if (type == 'text') {
        await addDoc(collection(db, "chats", chatId, "messages"), {
            type,
            text,
            senderId: userId,
            createdAt: serverTimestamp()
        });
    }

    if (type == 'audio') {
        await addDoc(collection(db, "chats", chatId, "messages"), {
            type,
            audiourl,
            duration,
            senderId: userId,
            createdAt: serverTimestamp()
        });
    }
};

export const deleteMessage = async (chatId: string, messageId: string) => {
    const collectionRef = collection(db, Collections.chats, chatId, SubCollection.messages)
    const messageRef = doc(collectionRef, messageId)
    try {
        await deleteDoc(messageRef)
    } catch (e) {
        console.log(e)
    }
}

export const deleteChat = async () => {

}
