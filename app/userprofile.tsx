import { Avatar, AvatarBadge, AvatarImage } from "@/components/ui/avatar";
import { Button, ButtonText } from "@/components/ui/button";
import { Divider } from "@/components/ui/divider";
import { HStack } from "@/components/ui/hstack";
import { Colors } from "@/constants/Colors";
import { deletePost, listenToUserPosts, togglePostLike } from "@/db/posts";
import { addfriend, listenToUser, removeFriendFromList } from "@/db/users";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Dimensions, ScrollView, StyleSheet, Text, View } from "react-native";
import { PostCard } from "./(tabs)";
import { auth } from "@/firebaseConfig";
import { useActionSheet } from "@/contexts/ActionSheetContext";


const { height, width } = Dimensions.get("window")


export default function UserProfile() {
    const params = useLocalSearchParams()
    const [userInfo, setUserInfo] = useState<any>()
    const [currentUserInfo, setCurrentUserInfo] = useState<any>()
    const [userPosts, setUserPosts] = useState<any[]>()
    const { closeActionSheet } = useActionSheet()

    useEffect(() => {
        if (!params.userId) return;

        const retrievUserData = listenToUser(params.userId as string, (data) => {
            setUserInfo(data)
            console.log("User data retrieved:", data)
        })

        return () => retrievUserData()

    }, [params.userId])


    useEffect(() => {
        if (!params.userId) return

        const retrieveUserPosts = listenToUserPosts(params.userId as string, (data) => {
            setUserPosts(data)
        })

        return () => retrieveUserPosts()
    }, [params.userId])


    useEffect(() => {
        if (!auth.currentUser?.uid) return;

        const retrievUserData = listenToUser(auth.currentUser.uid, (data) => {
            setCurrentUserInfo(data)
            console.log("currentUser:", data)
        })

        return () => retrievUserData()

    }, [auth.currentUser?.uid])




    const addToFavorite = async (postId: any, likes: any[]) => {
        const uid = auth.currentUser?.uid
        if (!uid) return

        try {
            await togglePostLike(postId, uid, likes)
        } catch (e) {
            console.log(e)
        }
    }

    const deletePostFunc = async (postId: string) => {
        try {
            /* setDeletePostBtnSpinner(true) */
            await deletePost(postId)
        } catch (e) {
            console.log(e)
        } finally {
            closeActionSheet()
            /* setDeletePostBtnSpinner(false) */
        }
    }

    const addFriendToList = async () => {
        if (auth.currentUser?.uid) {
            await addfriend(userInfo.uid, auth.currentUser?.uid)
        }
    }

    const _removeFriendFromList = async () => {
        if (auth.currentUser?.uid) {
            await removeFriendFromList(userInfo.uid, auth.currentUser?.uid)
        }
    }


    return (
        <ScrollView >
            <View style={styles.userProfileContainer}>
                <View style={styles.userProfileHeader}>
                    <View>
                        <Avatar size="2xl">
                            <AvatarImage
                                source={{
                                    uri: userInfo?.profilePictureUrl || "https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png"
                                }}
                            >

                            </AvatarImage>
                            <AvatarBadge></AvatarBadge>
                        </Avatar>
                    </View>
                    <Text style={styles.useProfileNameTextStyle}>{userInfo?.name} {userInfo?.familyName}</Text>
                </View>

                <Divider style={styles.divider}>

                </Divider>
                <HStack>
                    <Button onPress={async () => {
                        if (!currentUserInfo?.friends?.includes(userInfo.uid)) {
                            await addFriendToList()
                        }
                        else {
                            await _removeFriendFromList()
                        }
                    }} style={styles.useProfileBtn}>
                        <ButtonText style={styles.useProfileBtnText}>
                            {currentUserInfo?.friends?.includes(userInfo.uid) ? "Ami ( Cliquer pour retirer)" : "Ajouter comme ami"}
                        </ButtonText>
                    </Button>
                </HStack>

                <Divider style={styles.divider}>

                </Divider>



                <View style={styles.postsContainer}>

                    {userPosts?.map(post => {
                        let likes = post.likes || []
                        return <PostCard btnSpinner={false} onDeletePostPress={() => { deletePostFunc(post.id) }} press={() => { addToFavorite(post.id, likes) }} key={post.id} content={post.content} likesCount={likes.length}></PostCard>
                    })}

                </View>

            </View>


        </ScrollView>
    )
}


const styles = StyleSheet.create({
    userProfileContainer: {
        backgroundColor: Colors.white,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: height * 0.03
    },

    userProfileHeader: {
        backgroundColor: Colors.border,
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
        paddingTop: 40,
        padding: 20
    },

    divider: {
        width: width * 0.9,
        backgroundColor: Colors.text,
        height: 0.5
    },

    useProfileNameTextStyle: {
        fontSize: 20,
        fontWeight: 600,
        color: Colors.white
    },

    useProfileBtn: {
        height: height * 0.04,
        width: width * 0.5,
        backgroundColor: Colors.border,
        borderRadius: 12,
    },

    useProfileBtnText: {
        fontWeight: 600,
        color: Colors.white
    },

    postsContainer: {
        display: "flex",
        flexDirection: "column",
        gap: 15,
        margin: 20
    }


})