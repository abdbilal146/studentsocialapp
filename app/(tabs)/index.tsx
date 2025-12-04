import { Button, ButtonIcon, ButtonText } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Divider } from "@/components/ui/divider";
import { Fab, FabIcon } from "@/components/ui/fab";
import { FormControl } from "@/components/ui/form-control";
import { HStack } from "@/components/ui/hstack";
import { EditIcon, FavouriteIcon, MessageCircleIcon, PaperclipIcon, ThreeDotsIcon } from "@/components/ui/icon";
import { Textarea, TextareaInput } from "@/components/ui/textarea";
import { VStack } from "@/components/ui/vstack";
import { useActionSheet } from "@/contexts/ActionSheetContext";
import { auth } from "@/firebaseConfig";
import { createPost, listenToAllPosts, togglePostLike } from "@/db/posts";
import { useEffect, useState } from "react";
import { Dimensions, FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { Colors } from "@/constants/Colors";
import { Spinner } from "@/components/ui/spinner";
import Animated, { FadeInDown, Layout } from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import AdMob from "@/components/ui/AdMob";

const { width, height } = Dimensions.get("window")

// Ad insertion frequency: show ad after every X posts (like Twitter)
const AD_FREQUENCY = 4;

// Type for feed items
type FeedItem = { type: 'post'; data: any } | { type: 'ad'; id: string };

export default function Index() {
    const { openActionSheet, setBodyContent } = useActionSheet()
    const [posts, setPosts] = useState<any[]>([])

    const showModalF = () => {
        setBodyContent(
            <ModalBody />
        )
        openActionSheet()
    }

    useEffect(() => {
        const unsubscribe = listenToAllPosts((postsData) => {
            setPosts(postsData)
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

    // Create feed with ads inserted between posts (like Twitter)
    const getFeedWithAds = (): FeedItem[] => {
        const feedItems: FeedItem[] = [];
        let adCounter = 0;

        posts.forEach((post, index) => {
            feedItems.push({ type: 'post', data: post });

            // Insert ad after every AD_FREQUENCY posts
            if ((index + 1) % AD_FREQUENCY === 0 && index < posts.length - 1) {
                feedItems.push({ type: 'ad', id: `ad-${adCounter}` });
                adCounter++;
            }
        });

        return feedItems;
    };

    const renderFeedItem = ({ item, index }: { item: FeedItem, index: number }) => {
        // Render ad
        if (item.type === 'ad') {
            return (
                <Animated.View
                    entering={FadeInDown.delay(index * 80).springify()}
                    style={styles.postWrapper}
                >
                    <AdMob />
                </Animated.View>
            );
        }

        // Render post
        const post = item.data;
        const likes = post.likes || [];

        return (
            <Animated.View
                entering={FadeInDown.delay(index * 80).springify()}
                layout={Layout.springify()}
                style={styles.postWrapper}
            >
                <PostCard
                    deleteBtnVisibility={false}
                    btnSpinner={false}
                    onDeletePostPress={() => { console.log("Delete functionality restricted on feed") }}
                    press={() => { addToFavorite(post.id, likes) }}
                    content={post.content}
                    likesCount={likes.length}
                />
            </Animated.View>
        );
    };

    const feedData = getFeedWithAds();

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Fil d'actualité</Text>
                <Text style={styles.headerSubtitle}>Découvrez les dernières publications</Text>
            </View>

            <FlatList
                data={feedData}
                keyExtractor={(item) => item.type === 'ad' ? item.id : item.data.id}
                renderItem={renderFeedItem}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="newspaper-outline" size={64} color={Colors.text} style={{ opacity: 0.3 }} />
                        <Text style={styles.emptyText}>Aucune publication pour le moment.</Text>
                        <Text style={styles.emptySubText}>Soyez le premier à publier !</Text>
                    </View>
                }
            />

            <Fab
                style={styles.fabBtnStyle}
                placement="bottom right"
                onPress={showModalF}
            >
                <FabIcon as={EditIcon} color={Colors.white} />
            </Fab>
        </View>
    )
}


function ModalBody() {
    const textareaPlaceholder: string = "Partagez vos pensées, idées ou actualités..."
    const buttonLabel: string = "Publier"
    const imageButtonLabel: string = "Ajouter une photo"
    const { closeActionSheet } = useActionSheet()
    const [textareaValue, setTextareaValue] = useState<string>("")
    const maxCharacters = 500

    const addPost = async () => {
        if (!textareaValue || textareaValue.trim().length === 0) return

        try {
            await createPost(auth.currentUser?.uid!, textareaValue)
        } catch (e) {
            console.log(e)
        } finally {
            closeActionSheet()
        }
    }

    return (
        <View style={styles.modalContainerStyle}>
            <View style={styles.modalHeaderContainer}>
                <View style={styles.modalHeaderIconContainer}>
                    <EditIcon color={Colors.primary} />
                </View>
                <Text style={styles.modalHeaderTitle}>Créer une publication</Text>
                <Text style={styles.modalHeaderSubtitle}>Partagez quelque chose avec votre communauté</Text>
            </View>

            <FormControl style={styles.textAreaStyle}>
                <Textarea style={styles.modernTextarea}>
                    <TextareaInput
                        onChangeText={setTextareaValue}
                        value={textareaValue}
                        placeholder={textareaPlaceholder}
                        style={styles.textareaInput}
                        maxLength={maxCharacters}
                        multiline
                        numberOfLines={6}
                    />
                </Textarea>
                <View style={styles.characterCountContainer}>
                    <Text style={styles.characterCountText}>
                        {textareaValue?.length || 0} / {maxCharacters}
                    </Text>
                </View>
            </FormControl>

            <Button
                onPress={addPost}
                style={styles.modernPublishButton}
                isDisabled={!textareaValue || textareaValue.trim().length === 0}
            >
                <ButtonText style={styles.publishButtonText}>{buttonLabel}</ButtonText>
                <ButtonIcon as={EditIcon} color={Colors.white} />
            </Button>

            <Button
                onPress={addPost}
                style={[styles.modernPublishButton, { marginTop: 12, backgroundColor: Colors.lightBlue }]}
                isDisabled={!textareaValue || textareaValue.trim().length === 0}
            >
                <ButtonText style={[styles.publishButtonText, { color: Colors.primary }]}>{imageButtonLabel}</ButtonText>
                <ButtonIcon as={PaperclipIcon} color={Colors.primary} />
            </Button>
        </View>
    )
}

export function PostCard({ content, press, likesCount, onDeletePostPress, btnSpinner, deleteBtnVisibility }: { content: string, press: () => void, likesCount: number, onDeletePostPress: () => void, btnSpinner: boolean, deleteBtnVisibility: boolean }) {
    const { openActionSheet, setBodyContent } = useActionSheet()

    const showDrawer = () => {
        setBodyContent(<PostDrawerBody deleteBtnVisibility={deleteBtnVisibility} btnSpinner={btnSpinner} onDeletePostPress={onDeletePostPress} ></PostDrawerBody>)
        openActionSheet()
    }
    return (
        <Card style={styles.postCardStyle} variant="outline">
            <VStack style={styles.cardContainer}>

                <View style={styles.threedDotsBtnStyleContainer}>
                    <Button onPress={() => { showDrawer() }} style={{ backgroundColor: 'transparent' }}>
                        <ButtonIcon color={Colors.text} as={ThreeDotsIcon}></ButtonIcon>
                    </Button>
                </View>

                <View style={styles.postCardTextContainer}>
                    <Text style={styles.postCardContentTextStyle}>{content}</Text>
                </View>
                <HStack style={styles.postCardActionsContainer}>
                    <Button style={{ backgroundColor: 'transparent' }} >
                        <ButtonIcon as={MessageCircleIcon} color={Colors.text}></ButtonIcon>
                    </Button>
                    <Button style={{ backgroundColor: 'transparent' }} onPress={press} >
                        <ButtonIcon as={FavouriteIcon}></ButtonIcon>
                        <ButtonText style={styles.favouriteNumberTextStyle}>{likesCount}</ButtonText>
                    </Button>
                </HStack>
            </VStack>
        </Card>
    )
}


function PostDrawerBody({ onDeletePostPress, btnSpinner, deleteBtnVisibility }: { onDeletePostPress: () => void, btnSpinner: boolean, deleteBtnVisibility: boolean }) {
    return (
        <View style={styles.postDrawerBodyContainerStyle}>
            {
                deleteBtnVisibility && <Pressable style={styles.postDrawerPressableItemStyle} onPress={() => { onDeletePostPress() }}>{
                    btnSpinner ? <Spinner color={Colors.white} /> : <Text style={styles.postDrawerPressableTextStyle}>Supprimer l'annonce</Text>
                }</Pressable>
            }
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
    },
    // FAB
    fabBtnStyle: {
        backgroundColor: Colors.primary,
        shadowColor: Colors.primary,
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    // Modal
    modalContainerStyle: {
        width: "100%",
        paddingHorizontal: 20,
        paddingVertical: 24,
    },
    modalHeaderContainer: {
        alignItems: "center",
        marginBottom: 24,
        gap: 8,
    },
    modalHeaderIconContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: `${Colors.primary}15`,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 8,
    },
    modalHeaderTitle: {
        fontSize: 24,
        fontWeight: "700",
        color: Colors.text,
        textAlign: "center",
    },
    modalHeaderSubtitle: {
        fontSize: 14,
        fontWeight: "400",
        color: Colors.text,
        opacity: 0.6,
        textAlign: "center",
    },
    textAreaStyle: {
        width: "100%",
        marginBottom: 12,
    },
    modernTextarea: {
        minHeight: 150,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: Colors.lightBlue,
        backgroundColor: Colors.offWhite,
        padding: 12,
    },
    textareaInput: {
        fontSize: 16,
        color: Colors.text,
        lineHeight: 24,
    },
    characterCountContainer: {
        alignItems: "flex-end",
        marginTop: 8,
        paddingRight: 4,
    },
    characterCountText: {
        fontSize: 12,
        color: Colors.text,
        opacity: 0.5,
        fontWeight: "500",
    },
    modernPublishButton: {
        backgroundColor: Colors.primary,
        marginTop: 20,
        borderRadius: 12,
        paddingVertical: 14,
        paddingHorizontal: 24,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        shadowColor: Colors.primary,
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
        height: 56
    },
    publishButtonText: {
        fontSize: 16,
        fontWeight: "700",
        color: Colors.white,
    },

    // Post Card 
    postCardStyle: {
        backgroundColor: Colors.white,
        borderRadius: 20,
        borderWidth: 0,
        padding: 16,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
    },

    postCardContentTextStyle: {
        color: Colors.text,
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
        borderTopColor: Colors.offWhite,
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
    postDrawerBodyContainerStyle: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20
    },
    postDrawerPressableItemStyle: {
        backgroundColor: Colors.error,
        width: "100%",
        height: 50,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 12
    },
    postDrawerPressableTextStyle: {
        fontSize: 16,
        fontWeight: "600",
        color: Colors.white
    }
})