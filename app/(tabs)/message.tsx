import { Button, ButtonIcon } from "@/components/ui/button";
import { FormControl } from "@/components/ui/form-control";
import { ArrowRightIcon, SearchIcon } from "@/components/ui/icon";
import { Input, InputField } from "@/components/ui/input";
import { auth, db } from "@/firebaseConfig";
import { listenMessages, sendMessage } from "@/utils/message";
import { collection, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";
import { StyleSheet, View, KeyboardAvoidingView, Platform, FlatList, Text, Dimensions, Pressable } from "react-native";


const { height, width } = Dimensions.get("window")

export default function Message() {
    const [getUsers, setUsers] = useState<any[]>()
    const [searchKeyWord, setSearchkeyWord] = useState<string>()
    const [filtredSearchList, setFiltredSearchList] = useState<any[]>()
    const [dialogScreenVisibility, setDialogScreenVisibility] = useState<boolean>(false)





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
            console.log(getUsers)
        })
        return () => users()
    }, [])

    useEffect(() => {
        console.log("Filtered List Updated:", filtredSearchList)
    }, [filtredSearchList])


    const onSearch = () => {
        const filtredUserData = getUsers?.filter((user) => {
            return user.email.includes(searchKeyWord!)
        })
        setFiltredSearchList(filtredUserData)
    }

    const showDialogScreen = (data?: any) => {
        setDialogScreenVisibility(true)
    }


    const renderSearchItem = ({ item }: { item: any }) => (
        <Pressable onPress={() => showDialogScreen()}>
            <View style={styles.renderSearchItemContainer}>
                <Text style={{ color: 'white', fontWeight: 600 }}>{item.email}</Text>
            </View>
        </Pressable>
    );

    return (
        <View style={styles.container}>
            {
                dialogScreenVisibility === false ? <View style={styles.searchContainer}>
                    <FormControl>
                        <Input>
                            <InputField onChangeText={setSearchkeyWord} value={searchKeyWord}></InputField>
                        </Input>
                    </FormControl>
                    <Button onPress={onSearch}>
                        <ButtonIcon as={SearchIcon}>
                        </ButtonIcon>
                    </Button>
                    {filtredSearchList && (
                        <FlatList

                            data={filtredSearchList}
                            keyExtractor={(item) => item.id}
                            renderItem={renderSearchItem}
                            style={{ maxHeight: 200 }}
                        />
                    )}
                </View> : <DialogScreen></DialogScreen>
            }

        </View>
    )
}



function DialogScreen() {
    const [text, setText] = useState("")
    const [messages, setMessages] = useState<any[]>([])
    const chatId = "general"



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
        <>
            <View style={styles.content}>
                <FlatList
                    data={messages}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <View style={{
                            padding: 10,
                            alignSelf: item.senderId === auth.currentUser?.uid ? 'flex-end' : 'flex-start',
                            backgroundColor: item.senderId === auth.currentUser?.uid ? '#3F72AF' : 'rgba(255, 255, 255, 0.1)',
                            borderRadius: 10,
                            margin: 5,
                            maxWidth: '80%'
                        }}>
                            <Text style={{ color: 'white' }}>{item.text}</Text>
                        </View>
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
        </>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#112D4E",
        justifyContent: "space-between",
    },
    searchContainer: {
        marginTop: height * 0.1,
        margin: 10,
        display: "flex",
        gap: 12
    },

    content: {
        flex: 1,
    },
    inputContainer: {
        display: "flex",
        flexDirection: "row",
        gap: 12,
        padding: 16,
        backgroundColor: "#112D4E",
        borderTopWidth: 1,
        borderTopColor: "rgba(255, 255, 255, 0.1)",
    },
    formControl: {
        width: "85%",
    },
    input: {
        borderColor: "#3F72AF",
        borderRadius: 20,
        backgroundColor: "rgba(255, 255, 255, 0.05)",
    },
    inputField: {
        color: "#F9F7F7",
    },
    renderSearchItemContainer: {
        backgroundColor: "#cccccc85",
        borderRadius: 12,
        padding: 10,
        margin: 5,
        borderBottomWidth: 1,
        height: 50,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderBottomColor: '#ccc',
    }
})