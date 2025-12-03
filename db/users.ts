import { db } from "@/firebaseConfig";
import { collection, deleteDoc, doc, onSnapshot, setDoc, updateDoc, serverTimestamp, arrayUnion, arrayRemove } from "firebase/firestore";
import { Collections } from "@/constants/Collections";

export const listenToUser = (userId: string, callback: (data: any) => void) => {
    const userRef = doc(db, Collections.users, userId);
    return onSnapshot(userRef, (snapshot) => {
        if (snapshot.exists()) {
            callback(snapshot.data());
        } else {
            callback(null);
        }
    });
};

export const getAllUsers = (callback: (users: any[]) => void) => {
    const usersRef = collection(db, Collections.users);
    return onSnapshot(usersRef, (snapshot) => {
        const users = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        callback(users);
    });
};

export const getUsersWithIds = (userIds: any[], callback: (users: any[]) => void) => {

    getAllUsers((allUsers) => {
        if (!allUsers) return
        const filteredUsers = allUsers.filter(user => userIds.includes(user.id));
        callback(filteredUsers);
    });
};


export const getAllFriends = (currentUserId: string, callback: (users: any[]) => void) => {
    listenToUser(currentUserId, (data) => {
        if (!data.friends) return
        let friends: any[] = data.friends
        getUsersWithIds(friends, (data) => {
            callback(data)
        })
    })
}

export const createUser = async (userId: string, email: string | null) => {
    await setDoc(doc(db, Collections.users, userId), {
        uid: userId,
        email: email,
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp()
    });
};

export const updateUser = async (userId: string, data: any) => {
    const userRef = doc(db, Collections.users, userId);
    await updateDoc(userRef, data);
};

export const deleteUserDocument = async (userId: string) => {
    const userRef = doc(db, Collections.users, userId);
    await deleteDoc(userRef);
};


export const addfriend = async (userId: string, currentUserId: string) => {
    const userRef = doc(db, Collections.users, userId);
    await updateDoc(userRef, {
        notifications: arrayUnion("friendRequest" + "_" + currentUserId),
        friendRequests: arrayUnion(currentUserId)
    })
}

export const removeFriendFromList = async (userId: string, currentUserId: string) => {

    const currentUserRef = doc(db, Collections.users, currentUserId)

    await updateDoc(currentUserRef, {
        friends: arrayRemove(userId),
    })


    const userRef = doc(db, Collections.users, userId);

    await updateDoc(userRef, {
        friends: arrayRemove(currentUserId),
    })

}



export const removeFriendInvitation = async (currentUserId: string, senderId: string) => {
    const userRef = doc(db, Collections.users, currentUserId)
    await updateDoc(userRef, {
        notifications: arrayRemove("friendRequest" + "_" + senderId),
        friendRequests: arrayRemove(senderId)
    })

}


export const acceptFriendInvitation = async (currentUserId: string, senderId: string) => {
    const userRef = doc(db, Collections.users, currentUserId)
    await updateDoc(userRef, {
        friends: arrayUnion(senderId),
        acceptedfriendInvitations: arrayUnion(senderId),
        friendRequests: arrayRemove(senderId),
        notifications: arrayRemove("friendRequest" + "_" + senderId),
    })

    const senderUserRef = doc(db, Collections.users, senderId)

    await updateDoc(senderUserRef, {
        friends: arrayUnion(currentUserId),
    })

}
