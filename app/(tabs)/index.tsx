import { Button, ButtonIcon, ButtonText } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Divider } from "@/components/ui/divider";
import { Fab, FabIcon } from "@/components/ui/fab";
import { FormControl, FormControlLabel, FormControlLabelText } from "@/components/ui/form-control";
import { HStack } from "@/components/ui/hstack";
import { EditIcon, FavouriteIcon, MessageCircleIcon, ThreeDotsIcon } from "@/components/ui/icon";
import { Textarea, TextareaInput } from "@/components/ui/textarea";
import { VStack } from "@/components/ui/vstack";
import { useActionSheet } from "@/contexts/ActionSheetContext";
import { useDrawer } from "@/contexts/DrawerContext";
import { useModal } from "@/contexts/ModalContext";
import { auth, db } from "@/firebaseConfig";
import { addDoc, arrayRemove, arrayUnion, collection, doc, getDoc, getDocs, onSnapshot, serverTimestamp, setDoc, updateDoc } from "firebase/firestore";
import { Fragment, useEffect, useState } from "react";
import { Dimensions, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Colors } from "@/constants/Colors";

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
        <>
            <ScrollView style={styles.body}>
                <View style={styles.body}>

                    <View style={styles.postsContainerStyle}>
                        {posts?.map(post => {
                            let likes = post.likes || []
                            return <Fragment key={post.id}><PostCard press={() => { addToFavorite(post.id, likes) }} content={post.content} likesCount={likes.length}></PostCard><Divider style={styles.postDividerBottomStyle}></Divider></Fragment>
                        })}
                    </View>


                </View>
            </ScrollView>
            <Fab style={styles.fabBtnStyle} placement="bottom right" isHovered={false} isDisabled={false} isPressed={false} onPress={showModalF}>
                <FabIcon as={EditIcon} />
            </Fab>

        </>
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


function DrawerBody() {
    return (
        <View>
            <Pressable><Text>Supprimer l'annonce</Text></Pressable>
        </View>
    )
}



export function PostCard(props: any) {
    const { openActionSheet, setBodyContent } = useActionSheet()

    const showDrawer = () => {
        setBodyContent(<DrawerBody></DrawerBody>)
        openActionSheet()
    }
    return (
        <Card style={styles.postCardStyle} variant="outline">
            <VStack style={styles.cardContainer}>

                <View style={styles.threedDotsBtnStyleContainer}>
                    <Button onPress={() => { showDrawer() }} style={{ backgroundColor: 'transparent' }}>
                        <ButtonIcon color="black" as={ThreeDotsIcon}></ButtonIcon>
                    </Button>
                </View>

                <View style={styles.postCardTextContainer}>
                    <Text style={styles.postCardContentTextStyle}>{props.content}</Text>
                </View>
                <HStack style={styles.postCardActionsContainer}>
                    <Button style={{ backgroundColor: 'transparent' }} >
                        <ButtonIcon as={MessageCircleIcon}></ButtonIcon>
                    </Button>
                    <Button style={{ backgroundColor: 'transparent' }} onPress={props.press} >
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
        backgroundColor: Colors.white, // Deep rich blue/black #021018
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
        marginTop: height * 0.1,
        marginRight: 15,
        marginBottom: 15,
        backgroundColor: Colors.primary,
    },
    textAreaStyle: {
        width: "90%"
    },

    // Post Card 
    postCardStyle: {
        marginVertical: 8,
        backgroundColor: Colors.white,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: Colors.lightBlue,
        padding: 16,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 3,
    },

    postCardContentTextStyle: {
        color: Colors.text, //#F9F7F7
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
        borderTopColor: Colors.lightBlue,
        paddingTop: 12,
        marginTop: 12,
    },
    postCardTextContainer: {
        width: "100%",
    },
    favouriteNumberTextStyle: {
        color: Colors.text,
        fontWeight: "600",
        marginLeft: 4,
    },
    threedDotsBtnStyleContainer: {
        display: "flex",
        flexDirection: "row",
        justifyContent: "flex-end"
    },
    postDividerBottomStyle: {
        backgroundColor: Colors.lightBlue,
        height: 1,
        width: "90%",
        alignSelf: "center",
        marginVertical: 8,
        opacity: 0.5
    }
})