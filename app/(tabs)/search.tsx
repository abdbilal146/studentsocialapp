import { Input, InputField } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { StyleSheet, View, FlatList, Text, Dimensions, Pressable } from "react-native";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { Colors } from "@/constants/Colors";
import { BannerAd, BannerAdSize, TestIds } from "react-native-google-mobile-ads";
import { Ionicons } from "@expo/vector-icons";
import { getAllUsers } from "@/db/users";
import { useRouter } from "expo-router";

const { height } = Dimensions.get("window");

export default function Search() {
    const [searchKeyWord, setSearchkeyWord] = useState<string>("");
    const [filtredSearchList, setFiltredSearchList] = useState<any[]>();
    const router = useRouter()
    const [allUsers, setAllUsers] = useState<any[]>()
    const [filtredUsers, setFiltredUsers] = useState<any[]>()



    const onSearch = () => {
        getAllUsers((users: any[]) => {
            setAllUsers(users);

            const filtered = users.filter((item) =>
                item.email.includes(searchKeyWord)
            );

            setFiltredUsers(filtered);
            setFiltredSearchList(filtered);
        });
    };

    const deleteSearch = () => {
        setSearchkeyWord("");
        setFiltredSearchList([]);
    };

    const navigateToASpecificRoute = (route: string, userId: string) => {
        router.push({
            pathname: route,
            params: {
                userId: userId
            }
        })
    }

    const renderSearchItem = ({ item, index }: { item: any, index: number }) => (
        <Animated.View entering={FadeInDown.delay(index * 80).springify()}>
            <Pressable onPress={() => {
                navigateToASpecificRoute('/userprofile', item.uid)
            }}>
                <View style={styles.searchResultItem}>
                    <View style={styles.searchResultAvatar}>
                        <Ionicons name="person" size={18} color={Colors.primary} />
                    </View>
                    <View style={styles.searchResultInfo}>
                        <Text style={styles.searchResultEmail}>{item.email}</Text>
                        <Text style={styles.searchResultHint}>Appuyez pour voir le profil</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={Colors.text} style={{ opacity: 0.4 }} />
                </View>
            </Pressable>
        </Animated.View>
    );

    return (
        <View style={styles.container}>
            {/* Modern Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Recherche</Text>
                <Text style={styles.headerSubtitle}>Trouvez des amis ou du contenu</Text>
            </View>

            {/* Modern Search Section */}
            <View style={styles.searchSection}>
                <View style={styles.searchInputWrapper}>
                    <Ionicons name="search" size={20} color={Colors.text} style={styles.searchIcon} />
                    <Input style={styles.modernSearchInput}>
                        <InputField
                            placeholder="Rechercher..."
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

            {/* Banner Ad */}
            <Animated.View
                entering={FadeInUp.delay(300).springify()}
                style={styles.bannerContainer}
            >
                <View style={styles.bannerWrapper}>
                    <Text style={styles.bannerLabel}>📢 Sponsorisé</Text>
                    <BannerAd
                        unitId={TestIds.BANNER}
                        size={BannerAdSize.BANNER}
                        requestOptions={{
                            requestNonPersonalizedAdsOnly: true,
                        }}
                        onAdFailedToLoad={(error) => console.log("Ad failed to load:", error)}
                    />
                </View>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.offWhite,
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
    // Banner Ad Styles
    bannerContainer: {
        marginHorizontal: 16,
        marginTop: 8,
    },
    bannerWrapper: {
        backgroundColor: Colors.white,
        borderRadius: 16,
        paddingVertical: 12,
        paddingHorizontal: 16,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.03,
        shadowRadius: 4,
        elevation: 2,
    },
    bannerLabel: {
        fontSize: 11,
        fontWeight: "500",
        color: Colors.text,
        opacity: 0.6,
        marginBottom: 8,
        alignSelf: "flex-start",
    },
});