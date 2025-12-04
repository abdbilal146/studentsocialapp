import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button, ButtonSpinner, ButtonText } from "@/components/ui/button";
import { HStack } from "@/components/ui/hstack";
import { Colors } from "@/constants/Colors";
import { useActionSheet } from "@/contexts/ActionSheetContext";
import { acceptFriendInvitation, addfriend, listenToUser, removeFriendInvitation } from "@/db/users";
import { auth, db } from "@/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Dimensions, FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import Animated, { FadeInDown, Layout } from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";

const { height, width } = Dimensions.get("window")

export default function Notifications() {
    const [notifications, setNotifications] = useState<any[]>([])

    useEffect(() => {
        if (!auth.currentUser?.uid) return;

        const unsub = listenToUser(auth.currentUser?.uid, async (data) => {
            const rawNotifications: string[] = data?.notifications || [];

            const notificationPromises = rawNotifications.map(async (item: string) => {
                const [type, senderId] = item.split("_");
                try {
                    const userRef = doc(db, "users", senderId);
                    const userSnap = await getDoc(userRef);
                    return {
                        id: item,
                        type: type,
                        senderId: senderId,
                        senderData: userSnap.exists() ? userSnap.data() : null
                    };
                } catch (error) {
                    console.error("Error fetching sender:", error);
                    return null;
                }
            });

            const resolvedNotifications = await Promise.all(notificationPromises);
            const validNotifications = resolvedNotifications.filter(n => n !== null && n.senderData !== null);
            setNotifications(validNotifications);
        });

        return () => unsub();
    }, [auth.currentUser?.uid]);

    const renderNotificationItem = ({ item, index }: { item: any, index: number }) => {
        return (
            <Animated.View
                entering={FadeInDown.delay(index * 100).springify()}
                layout={Layout.springify()}
            >
                <NotificationCard
                    type={item.type}
                    senderId={item.senderId}
                    uri={item.senderData.profilePictureUrl}
                    name={item.senderData.name}
                    familyName={item.senderData.familyName}
                />
            </Animated.View>
        )
    }

    return (
        <View style={styles.container}>
            {/* Modern Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Notifications</Text>
                <Text style={styles.headerSubtitle}>Vos activités récentes</Text>
            </View>
            <FlatList
                data={notifications}
                keyExtractor={(item) => item.id}
                renderItem={renderNotificationItem}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="notifications-off-outline" size={48} color={Colors.text} style={{ opacity: 0.5 }} />
                        <Text style={styles.emptyText}>Aucune notification pour le moment</Text>
                    </View>
                }
            />
        </View>
    )
}

function NotificationCard(props: any) {
    const { openActionSheet, setBodyContent } = useActionSheet()

    const openModal = () => {
        openActionSheet()
        if (props.type === "friendRequest") {
            setBodyContent(<FriendRequestActionSheetBody senderId={props.senderId} />)
        }
    }

    const getNotificationText = () => {
        switch (props.type) {
            case "friendRequest":
                return "vous a envoyé une demande d'ami";
            default:
                return "Nouvelle notification";
        }
    }

    return (
        <Pressable onPress={openModal} style={({ pressed }) => [
            styles.cardContainer,
            pressed && styles.cardPressed
        ]}>
            <HStack style={styles.cardContent}>
                <Avatar size="md" style={styles.avatar}>
                    <AvatarImage
                        source={{
                            uri: props.uri || "https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png"
                        }}
                    />
                </Avatar>
                <View style={styles.textContainer}>
                    <Text style={styles.userName}>
                        {props.name} {props.familyName}
                    </Text>
                    <Text style={styles.notificationText}>
                        {getNotificationText()}
                    </Text>
                </View>
                {props.type === "friendRequest" && (
                    <View style={styles.iconContainer}>
                        <Ionicons name="person-add" size={20} color={Colors.primary} />
                    </View>
                )}
            </HStack>
        </Pressable>
    )
}

function FriendRequestActionSheetBody(props: any) {

    const { closeActionSheet } = useActionSheet()
    const [acceptLoader, setAcceptLoader] = useState<boolean>(false)
    const [refuseLoader, setRefuseLoader] = useState<boolean>(false)

    const _removeFriendInvitation = async () => {
        if (!auth.currentUser?.uid) return
        setRefuseLoader(true)
        try {
            await removeFriendInvitation(auth.currentUser?.uid, props.senderId)
        } catch (e) {
            console.log(e)
        } finally {
            closeActionSheet()
            setRefuseLoader(false)
        }


    }

    const _addFriend = async () => {
        if (!auth.currentUser?.uid) return
        setAcceptLoader(true)
        try {
            await acceptFriendInvitation(auth.currentUser?.uid, props.senderId)
        } catch (e) {
            console.log(e)
        } finally {
            closeActionSheet()
            setAcceptLoader(false)
        }


    }

    return (
        <View style={styles.actionSheetContainer}>
            <Text style={styles.actionSheetTitle}>Demande d'ami</Text>
            <Text style={styles.actionSheetSubtitle}>Souhaitez-vous accepter cette demande ?</Text>
            <HStack style={styles.buttonContainer}>
                <Button onPress={_addFriend} style={[styles.actionButton, styles.acceptButton]}>
                    {
                        acceptLoader ? <ButtonSpinner></ButtonSpinner> : <ButtonText style={styles.acceptButtonText}>Accepter</ButtonText>
                    }
                </Button>
                <Button onPress={_removeFriendInvitation} variant="outline" style={[styles.actionButton, styles.declineButton]}>
                    {refuseLoader ? <ButtonSpinner></ButtonSpinner> : <ButtonText style={styles.declineButtonText}>Refuser</ButtonText>}

                </Button>
            </HStack>
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
    cardContainer: {
        backgroundColor: Colors.white,
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
        borderWidth: 1,
        borderColor: "rgba(0,0,0,0.03)",
    },
    cardPressed: {
        transform: [{ scale: 0.98 }],
        backgroundColor: "#FAFAFA",
    },
    cardContent: {
        alignItems: "center",
        gap: 16,
    },
    avatar: {
        borderWidth: 2,
        borderColor: Colors.offWhite,
    },
    textContainer: {
        flex: 1,
        gap: 4,
    },
    userName: {
        fontSize: 16,
        fontWeight: "600",
        color: Colors.text,
    },
    notificationText: {
        fontSize: 14,
        color: "#888",
        lineHeight: 20,
    },
    iconContainer: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: Colors.transparentPrimary,
        alignItems: "center",
        justifyContent: "center",
    },
    emptyContainer: {
        alignItems: "center",
        justifyContent: "center",
        marginTop: height * 0.2,
        gap: 12,
    },
    emptyText: {
        fontSize: 16,
        color: "#999",
        fontWeight: "500",
    },
    // Action Sheet Styles
    actionSheetContainer: {
        width: "100%",
        alignItems: "center",
        padding: 20,
        gap: 16,
    },
    actionSheetTitle: {
        fontSize: 20,
        fontWeight: "700",
        color: Colors.darkBlue,
    },
    actionSheetSubtitle: {
        fontSize: 16,
        color: Colors.text,
        textAlign: "center",
        marginBottom: 10,
    },
    buttonContainer: {
        width: "100%",
        gap: 12,
        justifyContent: "center",
    },
    actionButton: {
        flex: 1,
        height: 48,
        borderRadius: 12,
    },
    acceptButton: {
        backgroundColor: Colors.primary,
    },
    acceptButtonText: {
        color: Colors.white,
        fontWeight: "600",
    },
    declineButton: {
        borderColor: Colors.error,
        borderWidth: 1,
    },
    declineButtonText: {
        color: Colors.error,
        fontWeight: "600",
    },
})
