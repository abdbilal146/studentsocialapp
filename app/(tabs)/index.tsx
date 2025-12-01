import { Button, ButtonIcon, ButtonText } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Fab, FabIcon } from "@/components/ui/fab";
import { FormControl, FormControlLabel, FormControlLabelText } from "@/components/ui/form-control";
import { HStack } from "@/components/ui/hstack";
import { EditIcon, FavouriteIcon, MessageCircleIcon } from "@/components/ui/icon";
import { Textarea, TextareaInput } from "@/components/ui/textarea";
import { VStack } from "@/components/ui/vstack";
import { useModal } from "@/contexts/ModalContext";
import { auth, db } from "@/firebaseConfig";
import { addDoc, arrayRemove, arrayUnion, collection, doc, getDoc, getDocs, onSnapshot, serverTimestamp, setDoc, updateDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Dimensions, ScrollView, StyleSheet, Text, View } from "react-native";

const { width, height } = Dimensions.get("window")


export default function Index() {
    const { openModal, setModalContent } = useModal()
    const [posts, setPosts] = useState<any[]>()

    const showModalF = () => {
        setModalContent(
            <ModalBody />
        )
        openModal()
        console.log("Hello")
    }

    useEffect(() => {
        const postRef = collection(db, "posts")

        const unsubscribe = onSnapshot(postRef, (snapshot) => {
            const postsData: any[] = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }))
            setPosts(postsData)
            console.log(postsData)
        })

        return () => unsubscribe()

    }, [])

    const addToFavorite = async (postId: any, likes: any[]) => {
        const posRef = doc(db, "posts", postId)
        const uid = auth.currentUser?.uid
        if (!uid) return

        try {
            if (likes.includes(uid)) {
                await updateDoc(posRef, {
                    likes: arrayRemove(uid)
                })
            } else {
                await updateDoc(posRef, {
                    likes: arrayUnion(uid)
                })
            }

        } catch (e) {
            console.log(e)
        }
    }

    return (
        <ScrollView>
            <View style={styles.body}>

                <View style={styles.postsContainerStyle}>
                    {posts?.map(post => {
                        let likes = post.likes || []
                        return <PostCard press={() => { addToFavorite(post.id, likes) }} key={post.id} content={post.content} likesCount={likes.length}></PostCard>
                    })}
                </View>

                <Fab style={styles.fabBtnStyle} placement="bottom right" isHovered={false} isDisabled={false} isPressed={false} onPress={showModalF}>
                    <FabIcon as={EditIcon} />
                </Fab>
            </View>
        </ScrollView>
    )
}


function ModalBody() {
    const textareaPlaceholder: string = "publier quelque chose"
    const buttonLabel: string = "Publier"
    const { closeModal } = useModal()
    const [textareaValue, setTextareaValue] = useState<string>()

    const addPost = async () => {
        try {

            const postRef = collection(db, "posts")
            const newPostRef = doc(postRef)

            await setDoc(newPostRef, {
                uid: auth.currentUser?.uid!,
                likes: [],
                createdAt: serverTimestamp(),
                content: textareaValue
            })


        } catch (e) {
            console.log(e)
        } finally {
            closeModal()
        }
    }

    return (
        <View style={styles.modalContainerStyle}>
            <FormControl style={styles.textAreaStyle}>
                <FormControlLabel>
                    <FormControlLabelText>Publier</FormControlLabelText>
                </FormControlLabel>
                <Textarea>
                    <TextareaInput onChangeText={setTextareaValue} value={textareaValue} placeholder={textareaPlaceholder}></TextareaInput>
                </Textarea>
            </FormControl>
            <Button onPress={addPost}>
                <ButtonText>{buttonLabel}</ButtonText>
            </Button>
        </View>

    )
}



function PostCard(props: any) {
    return (
        <Card style={styles.postCardStyle} variant="outline">
            <VStack style={styles.cardContainer}>
                <View style={styles.postCardTextContainer}>
                    <Text style={styles.postCardContentTextStyle}>{props.content}</Text>
                </View>
                <HStack style={styles.postCardActionsContainer}>
                    <Button variant="outline">
                        <ButtonIcon as={MessageCircleIcon}></ButtonIcon>
                    </Button>
                    <Button onPress={props.press} variant="outline">
                        <ButtonIcon as={FavouriteIcon}></ButtonIcon>
                        <ButtonText style={styles.favouriteNumberTextStyle}>{props.likesCount}</ButtonText>
                    </Button>
                </HStack>
            </VStack>
        </Card>
    )
}


const styles = StyleSheet.create({
    body: {
        flex: 1,
        backgroundColor: "#021018", // Deep rich blue/black
    },

    postsContainerStyle: {
        marginTop: height * 0.1,
        paddingHorizontal: 16,
    },
    modalContainerStyle: {
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 20,
    },
    fabBtnStyle: {
        width: width * 0.15,
        height: height * 0.07,
        borderRadius: 100,
        alignItems: "center",
        justifyContent: "center",
        marginRight: 15,
        marginBottom: 15,
        backgroundColor: "#3F72AF",
    },
    textAreaStyle: {
        width: "90%"
    },

    // Post Card 
    postCardStyle: {
        marginVertical: 8,
        backgroundColor: "#112D4E",
        borderRadius: 16,
        borderWidth: 0,
        padding: 16,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },

    postCardContentTextStyle: {
        color: "#F9F7F7",
        fontFamily: "sans-serif",
        fontSize: 16,
        lineHeight: 24,
    },

    cardContainer: {
        display: "flex",
        flexDirection: "column",
        gap: 12
    },

    postCardActionsContainer: {
        display: "flex",
        flexDirection: "row",
        justifyContent: "flex-end",
        alignItems: "center",
        width: "100%",
        gap: 16,
        borderTopWidth: 1,
        borderTopColor: "rgba(255,255,255,0.1)",
        paddingTop: 12,
        marginTop: 12,
    },
    postCardTextContainer: {
        width: "100%",
    },
    favouriteNumberTextStyle: {
        color: "#DBE2EF",
        fontWeight: "600",
        marginLeft: 4,
    }
})