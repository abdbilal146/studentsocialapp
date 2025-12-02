import { Button, ButtonIcon } from "@/components/ui/button";
import { Divider } from "@/components/ui/divider";
import { FormControl } from "@/components/ui/form-control";
import { ArrowRightIcon, SearchIcon, TrashIcon } from "@/components/ui/icon";
import { Input, InputField } from "@/components/ui/input";
import { auth, db } from "@/firebaseConfig";
import { listenMessages, sendMessage } from "@/utils/message";
import { collection, doc, DocumentData, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";
import { StyleSheet, View, KeyboardAvoidingView, Platform, FlatList, Text, Dimensions, Pressable, BackHandler, ScrollView } from "react-native";
import Animated, { FadeIn, FadeOut, SlideInRight, SlideOutRight, FadeInDown, FadeInUp, Layout } from "react-native-reanimated";

const { height, width } = Dimensions.get("window")
import { Colors } from "@/constants/Colors";
import { HStack } from "@/components/ui/hstack";
import { Avatar, AvatarImage } from "@/components/ui/avatar";

export default function Message() {
    const [getUsers, setUsers] = useState<any[]>()
    const [searchKeyWord, setSearchkeyWord] = useState<string>()
    const [filtredSearchList, setFiltredSearchList] = useState<any[]>()
    const [dialogScreenVisibility, setDialogScreenVisibility] = useState<boolean>(false)
    const [chatId, setChatid] = useState<string>()
    const [receiverId, setReceiverId] = useState<string>()
    const [messages, setMessages] = useState<any[]>()

    useEffect(() => {
        const userRef = collection(db, "users")
        const users = onSnapshot(userRef, (snapshot) => {
            const usersData: any[] = snapshot.docs.map(doc => {
                return {
                    id: doc.id,
                    ...doc.data()
                }
            })
            setUsers(usersData)
        })
        return () => users()
    }, [])

    useEffect(() => {
        console.log("Filtered List Updated:", filtredSearchList)
    }, [filtredSearchList])

    useEffect(() => {
        const backAction = () => {
            if (dialogScreenVisibility) {
                setDialogScreenVisibility(false)
                return true
            }
            return false
        }

        const backHandler = BackHandler.addEventListener(
            "hardwareBackPress",
            backAction
        )

        return () => backHandler.remove()
    }, [dialogScreenVisibility])

    useEffect(() => {
        const messageRef = collection(db, "chats")
        const unsubscribe = onSnapshot(messageRef, (snapshot) => {
            const messagesData: any[] = snapshot.docs
                .filter(doc => doc.id.includes(auth.currentUser?.uid!))
                .map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }))

            setMessages(messagesData)

            console.log("messages data:", messagesData)
        })
        return () => unsubscribe()
    }, [])

    const onSearch = () => {
        const filtredUserData = getUsers?.filter((user) => {
            return user.email.includes(searchKeyWord!)
        })
        setFiltredSearchList(filtredUserData)
    }

    const deleteSearch = () => {
        setFiltredSearchList([])
    }

    const showDialogScreen = (data?: any) => {
        const currentUserId = auth.currentUser?.uid
        if (!currentUserId) return
        const sortedIds = [currentUserId, data.id].sort().join("_")
        setChatid(sortedIds)
        setReceiverId(data.id)
        setDialogScreenVisibility(true)
    }

    const onOpenChat = (chatData: any) => {
        setChatid(chatData.id)
        const chatDataSplitted: any[] = chatData.id.split('_')
        const filtredchatDataSplitted = chatDataSplitted.filter(data => {
            return data !== auth.currentUser?.uid
        })
        setReceiverId(filtredchatDataSplitted[0])
        setDialogScreenVisibility(true)
    }

    const renderSearchItem = ({ item, index }: { item: any, index: number }) => (
        <Animated.View entering={FadeInDown.delay(index * 100).springify()}>
            <Pressable onPress={() => showDialogScreen(item)}>
                <View style={styles.renderSearchItemContainer}>
                    <Text style={{ color: Colors.text, fontWeight: 600 }}>{item.email}</Text>
                </View>
            </Pressable>
        </Animated.View>
    );

    const renderMessages = ({ item, index }: { item: any, index: number }) => (
        <Animated.View entering={FadeInDown.delay(index * 100).springify()}>
            <Pressable onPress={() => onOpenChat(item)}>
                <View style={styles.renderSearchItemContainer}>
                    <Text style={{ color: Colors.text, fontWeight: 600 }}>{item.lastMessage}</Text>
                </View>
            </Pressable>
        </Animated.View>
    )

    return (
        <View style={styles.container}>
            {
                dialogScreenVisibility === false ? <Animated.View entering={FadeIn} style={styles.searchContainer}>
                    <FormControl>
                        <Input style={styles.searchFieldStyle}>
                            <InputField placeholder="rechercher un ami" style={styles.inputField} onChangeText={setSearchkeyWord} value={searchKeyWord}></InputField>
                        </Input>
                    </FormControl>
                    <View style={styles.searchBtnContainerStyle}>
                        <Button style={styles.searchBtn} onPress={onSearch}>
                            <ButtonIcon fill={Colors.primary} color={Colors.white} as={SearchIcon}>
                            </ButtonIcon>
                        </Button>
                        <Button onPress={deleteSearch} style={styles.searchBtn}>
                            <ButtonIcon fill={Colors.primary} color={Colors.white} as={TrashIcon}></ButtonIcon>
                        </Button>
                    </View>

                    {filtredSearchList && (
                        <FlatList
                            data={filtredSearchList}
                            keyExtractor={(item) => item.id}
                            renderItem={renderSearchItem}
                            style={{ maxHeight: 200 }}
                        />
                    )}

                    <View style={styles.dividerContainer}>
                        <Divider style={styles.dividerStyle}></Divider>
                        <Text style={styles.dividerTextStyle}>Messages</Text>
                        <Divider style={styles.dividerStyle}></Divider>
                    </View>

                    <FlatList
                        data={messages}
                        keyExtractor={(item) => item.id}
                        renderItem={renderMessages}
                        style={{ maxHeight: 200 }}
                    />
                </Animated.View> : <DialogScreen chatId={chatId!} receiverId={receiverId!}></DialogScreen>
            }
        </View >
    )
}

function DialogScreen({ chatId, receiverId }: { chatId: string, receiverId: string }) {
    const [text, setText] = useState("")
    const [messages, setMessages] = useState<any[]>([])
    /* const [receiverPhotoProfile, setReceiverPhotoProfile] = useState<string>() */
    const [receiverData, setReceiverData] = useState<DocumentData>()

    console.log("reciveridis", receiverId)



    useEffect(() => {
        const usersColle = collection(db, 'users')
        const receiverRef = doc(usersColle, receiverId)

        const unsub = onSnapshot(receiverRef, (snapshot) => {
            if (snapshot.exists()) {
                setReceiverData(snapshot.data())
            }
        })

        return () => unsub()
    }, [])

    useEffect(() => {
        const unsubscribe = listenMessages(chatId, (msgs: any) => {
            setMessages(msgs)
        })
        return () => unsubscribe()
    }, [])

    const onSend = async () => {
        if (text.trim().length === 0) return
        const userId = auth.currentUser?.uid
        if (!userId) return

        try {
            await sendMessage(chatId, userId, text)
            setText("")
        } catch (error) {
            console.error("Error sending message:", error)
        }
    }

    return (
        <Animated.View entering={SlideInRight} exiting={SlideOutRight} style={{ flex: 1 }}>
            <View style={styles.diaolgScreenHeader}>
                <HStack style={styles.dialogScreenHeaderContentContainer}>
                    <Text>{receiverData ? `${receiverData.name || ""} ${receiverData.familyName || ""}`.trim() || receiverData.email : "Chargement..."}</Text>
                    <Avatar>
                        <AvatarImage
                            source={{
                                uri: receiverData?.profilePictureUrl
                            }}
                        ></AvatarImage>
                    </Avatar>
                </HStack>
                <Divider></Divider>
            </View>
            <View style={styles.content}>
                <FlatList
                    data={messages}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item, index }) => (
                        <Animated.View entering={FadeInUp.delay(index * 50)} style={{
                            padding: 10,
                            alignSelf: item.senderId === auth.currentUser?.uid ? 'flex-end' : 'flex-start',
                            backgroundColor: item.senderId === auth.currentUser?.uid ? Colors.primary : 'rgba(255, 255, 255, 0.1)',
                            borderRadius: 10,
                            margin: 5,
                            maxWidth: '80%'
                        }}>
                            <Text style={{ color: Colors.white }}>{item.text}</Text>
                        </Animated.View>
                    )}
                />
            </View>
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                keyboardVerticalOffset={100} // Adjust based on tab bar height
            >
                <View style={styles.inputContainer}>
                    <FormControl style={styles.formControl}>
                        <Input style={styles.input}>
                            <InputField
                                placeholder="Message..."
                                placeholderTextColor="#9BA4B5"
                                style={styles.inputField}
                                value={text}
                                onChangeText={setText}
                                onSubmitEditing={onSend}
                                returnKeyType="send"
                            />
                        </Input>
                    </FormControl>
                    <Button onPress={onSend}>
                        <ButtonIcon as={ArrowRightIcon}></ButtonIcon>
                    </Button>
                </View>
            </KeyboardAvoidingView>
        </Animated.View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.white,
        justifyContent: "space-between",
    },
    searchContainer: {
        marginTop: height * 0.1,
        margin: 10,
        display: "flex",
        gap: 12
    },
    searchFieldStyle: {
        height: 40,
        borderRadius: 10,
        borderColor: Colors.primary,

    },
    searchBtnContainerStyle: {
        display: "flex",
        flexDirection: "row",
        width: "100%",
        gap: "5%",
        alignItems: "center",
        justifyContent: "center"
    },
    searchBtn: {
        width: "45%",
        backgroundColor: Colors.primary
    },
    diaolgScreenHeader: {
        marginTop: height * 0.1

    },
    dialogScreenHeaderContentContainer: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        paddingBottom: 10,
        marginRight: 10,
        marginLeft: 10
    },
    content: {
        flex: 1,
        marginTop: height * 0.1,
        margin: 15
    },
    inputContainer: {
        display: "flex",
        flexDirection: "row",
        gap: 12,
        padding: 16,
        backgroundColor: Colors.primary,
        borderTopWidth: 1,
        borderTopColor: "rgba(255, 255, 255, 0.1)",
    },
    formControl: {
        width: "85%",
    },
    input: {
        borderColor: Colors.primary,
        borderRadius: 20,
        backgroundColor: "rgba(255, 255, 255, 0.05)",
    },
    inputField: {
        color: Colors.text,
    },
    renderSearchItemContainer: {
        backgroundColor: "transparent",
        borderRadius: 12,
        padding: 10,
        margin: 5,
        borderBottomWidth: 1,
        height: 70,
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        borderBottomColor: '#ccc',
    },
    // Divider

    dividerContainer: {
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 6
    },
    dividerStyle: {
        width: "40%"
    },
    dividerTextStyle: {
        color: Colors.black,
        fontWeight: 600
    }
})