import { Text, View } from "react-native";
import { BannerAd, BannerAdSize, TestIds } from "react-native-google-mobile-ads";



export default function AdMob() {
    return (

        <View style={{ padding: 10, alignItems: 'center' }}>

            <BannerAd
                unitId={TestIds.BANNER}
                size={BannerAdSize.MEDIUM_RECTANGLE}
                requestOptions={{
                    requestNonPersonalizedAdsOnly: true,
                }}
                onAdFailedToLoad={(error) => console.log("Ad failed to load:", error)}
            />

            <Text style={{ opacity: 0.6, marginTop: 5 }}>Sponsored</Text>
        </View>

    )
}