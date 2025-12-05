import { Button, ButtonIcon } from "@/components/ui/button";
import { Divider } from "@/components/ui/divider";
import { FormControl } from "@/components/ui/form-control";
import { ArrowRightIcon, SearchIcon, TrashIcon } from "@/components/ui/icon";
import { Input, InputField } from "@/components/ui/input";
import { auth } from "@/firebaseConfig";
import { DocumentData } from "firebase/firestore";
import { useEffect, useState } from "react";
import { StyleSheet, View, KeyboardAvoidingView, Platform, FlatList, Text, Dimensions, Pressable, BackHandler, SafeAreaView } from "react-native";
import Animated, { FadeIn, FadeOut, SlideInRight, SlideOutRight, FadeInDown, FadeInUp } from "react-native-reanimated";
import { Audio } from "expo-av"

const { height, width } = Dimensions.get("window")
import { Colors } from "@/constants/Colors";
import { HStack } from "@/components/ui/hstack";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { getAllFriends, getAllUsers, listenToUser } from "@/db/users";
import { deleteMessage, listenToMessages, listenToUserChats, sendMessage } from "@/db/chats";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useActionSheet } from "@/contexts/ActionSheetContext";
import { Spinner } from "@/components/ui/spinner";
import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import { onAuthStateChanged } from "firebase/auth";
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { Recording } from "expo-av/build/Audio";
import { uploadAudio } from "@/storage/audio";

export default function Message() {
    const [getFriends, setFriends] = useState<any[]>()
    const [searchKeyWord, setSearchkeyWord] = useState<string>("")
    const [filtredSearchList, setFiltredSearchList] = useState<any[]>()
    const [dialogScreenVisibility, setDialogScreenVisibility] = useState<boolean>(false)
    const [chatId, setChatid] = useState<string>()
    const [receiverId, setReceiverId] = useState<string>()
    const [messages, setMessages] = useState<any[]>()
    const params = useLocalSearchParams()
    const router = useRouter()


    useEffect(() => {
        if (params.chatId && params.receiverId) {
            setChatid(params.chatId as string)
            setReceiverId(params.receiverId as string)
            setDialogScreenVisibility(true)
        }
    }, [params.chatId, params.receiverId])


    useEffect(() => {
        let chatUnsub: (() => void) | undefined;

        const authUnsub = onAuthStateChanged(auth, (user) => {
            if (chatUnsub) {
                chatUnsub();
                chatUnsub = undefined;
            }

            if (user) {
                chatUnsub = listenToUserChats(user.uid, (messagesData) => {
                    setMessages(messagesData)
                })
            } else {
                setMessages([])
            }
        })

        return () => {
            authUnsub()
            if (chatUnsub) chatUnsub()
        }
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




    const onSearch = () => {
        if (searchKeyWord.length === 0 || !auth.currentUser?.uid) return

        getAllFriends(auth.currentUser?.uid, (usersData: any[]) => {
            const filtredUsers = usersData.filter((user) => {
                return user.email.includes(searchKeyWord!)
            })

            setFiltredSearchList(filtredUsers)

        })

    }

    const deleteSearch = () => {
        setSearchkeyWord("")
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
        <Animated.View entering={FadeInDown.delay(index * 80).springify()}>
            <Pressable onPress={() => showDialogScreen(item)}>
                <View style={styles.searchResultItem}>
                    <View style={styles.searchResultAvatar}>
                        <Ionicons name="person" size={18} color={Colors.primary} />
                    </View>
                    <View style={styles.searchResultInfo}>
                        <Text style={styles.searchResultEmail}>{item.email}</Text>
                        <Text style={styles.searchResultHint}>Appuyez pour démarrer une conversation</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={Colors.text} style={{ opacity: 0.4 }} />
                </View>
            </Pressable>
        </Animated.View>
    );

    const renderMessages = ({ item, index }: { item: any, index: number }) => {
        return <MessageItem item={item} index={index} onOpenChat={onOpenChat} />
    }

    return (
        <View style={styles.container}>
            {
                dialogScreenVisibility === false ? (
                    <Animated.View entering={FadeIn} style={styles.mainContainer}>
                        {/* Modern Header */}
                        <View style={styles.header}>
                            <Text style={styles.headerTitle}>Messages</Text>
                            <Text style={styles.headerSubtitle}>Discutez avec vos amis</Text>
                        </View>

                        {/* Modern Search Section */}
                        <View style={styles.searchSection}>
                            <View style={styles.searchInputWrapper}>
                                <Ionicons name="search" size={20} color={Colors.text} style={styles.searchIcon} />
                                <Input style={styles.modernSearchInput}>
                                    <InputField
                                        placeholder="Rechercher un ami..."
                                        placeholderTextColor="rgba(86, 86, 86, 0.5)"
                                        style={styles.modernInputField}
                                        onChangeText={setSearchkeyWord}
                                        value={searchKeyWord}
                                        onSubmitEditing={onSearch}
                                        returnKeyType="search"
                                    />
                                </Input>
                                {searchKeyWord.length > 0 && (
                                    <Pressable onPress={deleteSearch} style={styles.clearButton}>
                                        <Ionicons name="close-circle" size={20} color={Colors.text} />
                                    </Pressable>
                                )}
                            </View>
                            <Pressable style={styles.searchButton} onPress={onSearch}>
                                <Ionicons name="arrow-forward" size={20} color={Colors.white} />
                            </Pressable>
                        </View>

                        {/* Search Results */}
                        {filtredSearchList && filtredSearchList.length > 0 && (
                            <Animated.View entering={FadeInDown.springify()} style={styles.searchResultsContainer}>
                                <Text style={styles.sectionLabel}>Résultats de recherche</Text>
                                <FlatList
                                    data={filtredSearchList}
                                    keyExtractor={(item) => item.id}
                                    renderItem={renderSearchItem}
                                    style={{ maxHeight: 200 }}
                                    showsVerticalScrollIndicator={false}
                                />
                            </Animated.View>
                        )}

                        {/* Messages Section */}
                        <View style={styles.messagesSection}>
                            <View style={styles.messagesSectionHeader}>
                                <View style={styles.sectionLabelContainer}>
                                    <Ionicons name="chatbubbles" size={20} color={Colors.primary} />
                                    <Text style={styles.sectionTitle}>Conversations</Text>
                                </View>
                                {messages && messages.length > 0 && (
                                    <View style={styles.messageBadge}>
                                        <Text style={styles.messageBadgeText}>{messages.length}</Text>
                                    </View>
                                )}
                            </View>

                            {messages && messages.length > 0 ? (
                                <FlatList
                                    data={messages}
                                    keyExtractor={(item) => item.id}
                                    renderItem={renderMessages}
                                    showsVerticalScrollIndicator={false}
                                    contentContainerStyle={styles.messagesList}
                                />
                            ) : (
                                <View style={styles.emptyState}>
                                    <View style={styles.emptyIcon}>
                                        <Ionicons name="chatbubble-ellipses-outline" size={48} color={Colors.primary} />
                                    </View>
                                    <Text style={styles.emptyTitle}>Aucune conversation</Text>
                                    <Text style={styles.emptySubtitle}>Recherchez un ami pour commencer à discuter</Text>
                                </View>
                            )}
                        </View>
                    </Animated.View>
                ) : (
                    <DialogScreen chatId={chatId!} receiverId={receiverId!} onBack={() => {
                        setDialogScreenVisibility(false)
                        router.setParams({ chatId: "", receiverId: "" })
                    }}></DialogScreen>
                )
            }
        </View >
    )
}

function DialogScreen({ chatId, receiverId, onBack }: { chatId: string, receiverId: string, onBack: () => void }) {
    const [text, setText] = useState("")
    const [messages, setMessages] = useState<any[]>([])
    /* const [receiverPhotoProfile, setReceiverPhotoProfile] = useState<string>() */
    const [receiverData, setReceiverData] = useState<DocumentData>()
    const router = useRouter()
    const { openActionSheet, setBodyContent, closeActionSheet } = useActionSheet()
    const [btnSpinner, setBtnSpinner] = useState<boolean>(false)
    const [recording, setRecording] = useState<Recording>()




    useEffect(() => {
        const unsub = listenToUser(receiverId, (data) => {
            setReceiverData(data)
        })

        return () => unsub()
    }, [])

    useEffect(() => {
        const unsubscribe = listenToMessages(chatId, (msgs: any) => {
            setMessages(msgs)
        })
        return () => unsubscribe()
    }, [])


    const startRecording = async () => {
        try {
            const permission = await Audio.requestPermissionsAsync()

            if (permission.status !== 'granted') return

            await Audio.setAudioModeAsync({
                allowsRecordingIOS: true,
                playsInSilentModeIOS: true
            })

            const { recording } = await Audio.Recording.createAsync(
                Audio.RecordingOptionsPresets.HIGH_QUALITY
            )

            setRecording(recording);


        } catch (e) {
            console.log(e)
        }
    }

    const stopRecordingAndSend = async () => {
        try {
            await recording?.stopAndUnloadAsync()
            const uri = recording?.getURI()
            setRecording(undefined)

            const path = `voice_messages/${chatId}/${Date.now()}.m4a`;

            const audioUrl = await uploadAudio(path, uri)


            const { sound } = await Audio.Sound.createAsync({ uri });
            const status = await sound.getStatusAsync();

            if (!status.isLoaded) {
                console.error("Audio not loaded");
                return;
            }

            const duration = status.durationMillis! / 1000;

            const userId = auth.currentUser?.uid
            if (!userId) return


            await sendMessage(chatId, userId, '', 'audio', audioUrl, duration)

        } catch (e) {
            console.log(e)
        }
    }

    const onSend = async () => {
        if (text.trim().length === 0) return
        const userId = auth.currentUser?.uid
        if (!userId) return

        try {
            await sendMessage(chatId, userId, text, 'text', 'aud', 6)
            setText("")
        } catch (error) {
            console.error("Error sending message:", error)
        }
    }

    const navigateToASpecificRoute = (route: string, userId: string, profilePhotoUrl: string, familyName: string, name: string) => {
        router.push({
            pathname: route, params: {
                userId: userId,
                profilePhotoUrl: profilePhotoUrl,
                familyName: familyName,
                name: name
            }
        })
    }

    const _deleteMessage = async (messageId: string) => {

        try {
            setBtnSpinner(true)
            await deleteMessage(chatId, messageId)
        } catch (e) {
            console.log(e)
        } finally {
            setBtnSpinner(false)
            closeActionSheet()
        }
    }


    const openActionSheetAndSetTheContent = async (messageId: string) => {
        openActionSheet()
        setBodyContent(<>
            < View >
                <View style={styles.messageDrawerBodyContainerStyle}>
                    <Pressable style={styles.messageDrawerPressableItemStyle} onPress={() => { _deleteMessage(messageId) }}>{
                        btnSpinner ? <Spinner color={Colors.white} /> : <Text style={styles.messageDrawerPressableTextStyle}>Supprimer le Message</Text>
                    }</Pressable>
                </View>
            </View >
        </>)
    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
            >
                <Animated.View
                    entering={SlideInRight}
                    exiting={SlideOutRight}
                    style={{ flex: 1 }}
                >
                    {/* HEADER */}
                    <View style={styles.diaolgScreenHeader}>
                        <HStack style={styles.dialogScreenHeaderContentContainer}>
                            <Pressable onPress={onBack} style={{ marginRight: 10 }}>
                                <Ionicons name="arrow-back" size={24} color={Colors.white} />
                            </Pressable>
                            <View style={styles.headerUserInfo}>
                                <Pressable
                                    onPress={() =>
                                        navigateToASpecificRoute(
                                            '/userprofile',
                                            receiverId,
                                            receiverData?.profilePictureUrl,
                                            receiverData?.familyName,
                                            receiverData?.name
                                        )
                                    }
                                >
                                    <Avatar style={styles.headerAvatar}>
                                        <AvatarImage
                                            source={{
                                                uri:
                                                    receiverData?.profilePictureUrl ||
                                                    'https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png',
                                            }}
                                        />
                                    </Avatar>
                                </Pressable>
                                <View style={styles.headerTextContainer}>
                                    <Text style={styles.headerName}>
                                        {receiverData
                                            ? `${receiverData.name || ''} ${receiverData.familyName || ''}`.trim() ||
                                            receiverData.email
                                            : 'Chargement...'}
                                    </Text>
                                    <Text style={styles.headerStatus}>En ligne</Text>
                                </View>
                            </View>
                        </HStack>
                    </View>

                    {/* MESSAGES */}
                    <View style={{ flex: 1 }}>
                        <FlatList
                            inverted
                            data={[...messages].reverse()}
                            keyExtractor={(item) => item.id}
                            contentContainerStyle={{ padding: 10 }}
                            renderItem={({ item, index }) => (
                                <Animated.View
                                    entering={FadeInUp.delay(index * 50)}
                                    style={{
                                        alignSelf:
                                            item.senderId === auth.currentUser?.uid
                                                ? 'flex-end'
                                                : 'flex-start',
                                        backgroundColor:
                                            item.senderId === auth.currentUser?.uid
                                                ? Colors.primary
                                                : 'rgba(107, 17, 17, 0.86)',
                                        padding: 12,
                                        borderRadius: 16,
                                        marginVertical: 4,
                                        maxWidth: '80%',
                                    }}
                                >
                                    <Text onLongPress={() => { openActionSheetAndSetTheContent(item.id) }} style={{ color: Colors.white, fontSize: 16 }}>
                                        {item.text}
                                    </Text>
                                </Animated.View>
                            )}
                        />
                    </View>

                    {/* INPUT EN BAS */}
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

                        {text.trim().length > 0 ? (
                            <Button
                                style={styles.iconButton}
                                onPress={onSend}
                            >
                                <ButtonIcon as={ArrowRightIcon} color={Colors.primary} />
                            </Button>
                        ) : (
                            <Button
                                style={styles.iconButton}
                                onPress={recording ? stopRecordingAndSend : startRecording}
                            >
                                <FontAwesome6 name="microphone" size={20} color={Colors.primary} />
                            </Button>
                        )}
                    </View>
                </Animated.View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    )
}

const MessageItem = ({ item, index, onOpenChat }: { item: any, index: number, onOpenChat: (item: any) => void }) => {
    const [receiverData, setReceiverData] = useState<DocumentData | null>(null);

    useEffect(() => {
        const chatId = item.id;
        const chatDataSplitted: any[] = chatId.split('_');
        const filteredChatDataSplitted = chatDataSplitted.filter(data => {
            return data !== auth.currentUser?.uid;
        });

        if (filteredChatDataSplitted.length > 0) {
            const unsubscribe = listenToUser(filteredChatDataSplitted[0], (data) => {
                setReceiverData(data || null);
            });

            return () => unsubscribe();
        }
    }, [item.id]);

    return (
        <Animated.View entering={FadeInDown.delay(index * 80).springify()}>
            <Pressable onPress={() => onOpenChat(item)} style={styles.messageItemPressable}>
                <View style={styles.messageItemContainer}>
                    <View style={styles.messageItemAvatarContainer}>
                        <Avatar style={styles.messageItemAvatar}>
                            <AvatarImage
                                source={{
                                    uri: receiverData?.profilePictureUrl || 'https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png'
                                }}
                            />
                        </Avatar>
                        <View style={styles.onlineIndicator} />
                    </View>
                    <View style={styles.messageItemContent}>
                        <Text style={styles.messageItemName}>
                            {receiverData ? `${receiverData.name || ""} ${receiverData.familyName || ""}`.trim() || receiverData.email : "Chargement..."}
                        </Text>
                        <Text style={styles.messageItemLastMessage} numberOfLines={1}>
                            {item.lastMessage}
                        </Text>
                    </View>
                    <View style={styles.messageItemRight}>
                        <Ionicons name="chevron-forward" size={18} color={Colors.text} style={{ opacity: 0.4 }} />
                    </View>

                </View>
            </Pressable>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.offWhite,
    },
    mainContainer: {
        flex: 1,
    },
    // Modern Header
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
    // Modern Search
    searchSection: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 16,
        gap: 12,
    },
    searchInputWrapper: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: Colors.white,
        borderRadius: 16,
        paddingHorizontal: 14,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.03,
        shadowRadius: 4,
        elevation: 2,
    },
    searchIcon: {
        opacity: 0.5,
        marginRight: 10,
    },
    modernSearchInput: {
        flex: 1,
        borderWidth: 0,
        backgroundColor: "transparent",
        height: 48,
    },
    modernInputField: {
        color: Colors.text,
        fontSize: 15,
    },
    clearButton: {
        padding: 4,
        opacity: 0.5,
    },
    searchButton: {
        width: 48,
        height: 48,
        borderRadius: 16,
        backgroundColor: Colors.primary,
        alignItems: "center",
        justifyContent: "center",
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    // Search Results
    searchResultsContainer: {
        marginHorizontal: 16,
        marginBottom: 16,
        backgroundColor: Colors.white,
        borderRadius: 16,
        padding: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.03,
        shadowRadius: 4,
        elevation: 2,
    },
    sectionLabel: {
        fontSize: 12,
        fontWeight: "600",
        color: Colors.text,
        opacity: 0.5,
        textTransform: "uppercase",
        letterSpacing: 0.5,
        marginBottom: 8,
        paddingHorizontal: 4,
    },
    searchResultItem: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 12,
        paddingHorizontal: 8,
        borderBottomWidth: 1,
        borderBottomColor: Colors.offWhite,
    },
    searchResultAvatar: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: `${Colors.primary}15`,
        alignItems: "center",
        justifyContent: "center",
    },
    searchResultInfo: {
        flex: 1,
        marginLeft: 12,
    },
    searchResultEmail: {
        fontSize: 15,
        fontWeight: "600",
        color: Colors.text,
    },
    searchResultHint: {
        fontSize: 12,
        color: Colors.text,
        opacity: 0.5,
        marginTop: 2,
    },
    // Messages Section
    messagesSection: {
        flex: 1,
        paddingHorizontal: 16,
    },
    messagesSectionHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 12,
    },
    sectionLabelContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: Colors.darkBlue,
    },
    messageBadge: {
        backgroundColor: Colors.primary,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    messageBadgeText: {
        fontSize: 12,
        fontWeight: "700",
        color: Colors.white,
    },
    messagesList: {
        paddingBottom: 20,
    },
    // Empty State
    emptyState: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingBottom: 100,
    },
    emptyIcon: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: `${Colors.primary}10`,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 20,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: "700",
        color: Colors.darkBlue,
        marginBottom: 8,
    },
    emptySubtitle: {
        fontSize: 14,
        color: Colors.text,
        opacity: 0.6,
        textAlign: "center",
        paddingHorizontal: 40,
    },
    // Message Item
    messageItemPressable: {
        marginBottom: 8,
    },
    messageItemContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: Colors.white,
        borderRadius: 16,
        padding: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.03,
        shadowRadius: 4,
        elevation: 2,
    },
    messageItemAvatarContainer: {
        position: "relative",
    },
    messageItemAvatar: {
        width: 52,
        height: 52,
        borderRadius: 16,
    },
    onlineIndicator: {
        position: "absolute",
        bottom: 2,
        right: 2,
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: "#4CAF50",
        borderWidth: 2,
        borderColor: Colors.white,
    },
    messageItemContent: {
        flex: 1,
        marginLeft: 12,
    },
    messageItemName: {
        fontSize: 16,
        fontWeight: "600",
        color: Colors.darkBlue,
    },
    messageItemLastMessage: {
        fontSize: 14,
        color: Colors.text,
        opacity: 0.6,
        marginTop: 2,
    },
    messageItemRight: {
        paddingLeft: 8,
    },
    // Dialog Screen Header
    diaolgScreenHeader: {
        marginTop: height * 0.1,
        backgroundColor: Colors.primary,
        paddingVertical: 16,
        paddingHorizontal: 16,
        borderRadius: 24,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 8,
    },
    dialogScreenHeaderContentContainer: {
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-start",
    },
    headerUserInfo: {
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        gap: 14,
    },
    headerAvatar: {
        width: 56,
        height: 56,
        borderRadius: 28,
        borderWidth: 3,
        borderColor: "rgba(255, 255, 255, 0.3)",
    },
    headerTextContainer: {
        display: "flex",
        flexDirection: "column",
        gap: 2,
    },
    headerName: {
        fontSize: 18,
        fontWeight: "700",
        color: Colors.white,
        letterSpacing: 0.3,
    },
    headerStatus: {
        fontSize: 13,
        fontWeight: "500",
        color: "rgba(255, 255, 255, 0.75)",
    },
    content: {
        flex: 1,
        marginTop: height * 0.1,
        margin: 15
    },
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: Colors.primary,
        borderTopWidth: 1,
        borderTopColor: "rgba(255, 255, 255, 0.1)",
    },
    formControl: {
        flex: 1,
    },
    input: {
        borderWidth: 0,
        borderRadius: 24,
        backgroundColor: Colors.white,
        height: 48,
    },
    inputField: {
        color: Colors.black,
        fontSize: 16,
        paddingHorizontal: 12,
    },
    iconButton: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: Colors.white,
        alignItems: "center",
        justifyContent: "center",
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
        fontWeight: "600"
    },

    // message drawer

    messageDrawerBodyContainerStyle: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20
    },

    messageDrawerPressableItemStyle: {
        backgroundColor: Colors.error,
        width: "100%",
        height: 50,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 12
    },
    messageDrawerPressableTextStyle: {
        fontSize: 16,
        fontWeight: "600",
        color: Colors.white
    }
})
