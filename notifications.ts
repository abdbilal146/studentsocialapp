import * as Notifications from "expo-notifications"
import * as Device from "expo-device"
import { collection, doc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "./firebaseConfig";


export async function registerForPushNotificationsAsync() {
    if (!Device.isDevice) return null

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus


    if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync()
        finalStatus = status
    }

    if (finalStatus !== "granted") return null

    const tokenData = await Notifications.getExpoPushTokenAsync()
    return tokenData.data
}


export async function saveToken(collectionName: string, userId: string) {
    const token = await registerForPushNotificationsAsync()
    if (!token) return

    const usersCollection = collection(db, collectionName)
    const userRef = doc(usersCollection, userId)

    await updateDoc(userRef, {
        fcmToken: token
    })
}