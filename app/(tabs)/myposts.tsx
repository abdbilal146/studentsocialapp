import { Dimensions, FlatList, StyleSheet, Text, View } from "react-native"
import { PostCard } from "."
import { useEffect, useState } from "react"
import { auth } from "@/firebaseConfig"
import { useActionSheet } from "@/contexts/ActionSheetContext"
import { deletePost, listenToUserPosts, togglePostLike } from "@/db/posts"
import { Colors } from "@/constants/Colors"
import Animated, { FadeInDown, Layout } from "react-native-reanimated"
import { Ionicons } from "@expo/vector-icons"

const { height, width } = Dimensions.get("window")

export default function MyPosts() {

    const [posts, setPosts] = useState<any[]>([])
    const { closeActionSheet } = useActionSheet()
    const [deletePostBtnSpinner, setDeletePostBtnSpinner] = useState<boolean>(false)


    useEffect(() => {
        const uid = auth.currentUser?.uid
        if (!uid) return

        const unsubscribe = listenToUserPosts(uid, (userPosts) => {
            setPosts(userPosts)
        })

        return () => unsubscribe()

    }, [])

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
            setDeletePostBtnSpinner(true)
            await deletePost(postId)
        } catch (e) {
            console.log(e)
        } finally {
            closeActionSheet()
            setDeletePostBtnSpinner(false)
        }
    }

    const renderPostItem = ({ item, index }: { item: any, index: number }) => {
        let likes = item.likes || []
        return (
            <Animated.View
                entering={FadeInDown.delay(index * 100).springify()}
                layout={Layout.springify()}
                style={styles.postWrapper}
            >
                <PostCard
                    deleteBtnVisibility={true}
                    btnSpinner={deletePostBtnSpinner}
                    onDeletePostPress={() => { deletePostFunc(item.id) }}
                    press={() => { addToFavorite(item.id, likes) }}
                    content={item.content}
                    likesCount={likes.length}
                />
            </Animated.View>
        )
    }

    return (
        <View style={styles.container}>
            {/* Modern Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Mes Posts</Text>
                <Text style={styles.headerSubtitle}>Gérez vos publications</Text>
            </View>

            <FlatList
                data={posts}
                keyExtractor={(item) => item.id}
                renderItem={renderPostItem}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="images-outline" size={64} color={Colors.text} style={{ opacity: 0.3 }} />
                        <Text style={styles.emptyText}>Vous n'avez encore rien posté.</Text>
                        <Text style={styles.emptySubText}>Partagez votre premier moment !</Text>
                    </View>
                }
            />
        </View>
    )
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.offWhite,
    },
    header: {
        paddingTop: height * 0.08,
        paddingBottom: 16,
        paddingHorizontal: 20,
        backgroundColor: Colors.white,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
    },
    headerTitle: {
        fontSize: 32,
        fontWeight: "800",
        color: Colors.darkBlue,
        letterSpacing: -0.5,
    },
    headerSubtitle: {
        fontSize: 14,
        color: Colors.text,
        opacity: 0.6,
        marginTop: 4,
    },
    listContent: {
        padding: 16,
        paddingBottom: 100,
    },
    postWrapper: {
        marginBottom: 16,
    },
    emptyContainer: {
        alignItems: "center",
        justifyContent: "center",
        marginTop: height * 0.15,
        gap: 12,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: "600",
        color: Colors.text,
        marginTop: 10,
    },
    emptySubText: {
        fontSize: 14,
        color: "#999",
    }
})