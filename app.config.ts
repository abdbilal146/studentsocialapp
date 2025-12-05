import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
    ...config,
    name: "Social app",
    slug: "com-socialmancer-app",
    version: "1.1.0",
    orientation: "portrait",
    owner: 'abdbilal146',
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    platforms: [
        "android",
        "ios"
    ],
    newArchEnabled: true,
    splash: {
        image: "./assets/splash-icon.png",
        resizeMode: "contain",
        backgroundColor: "#ffffff"
    },
    ios: {
        supportsTablet: true
    },
    android: {
        versionCode: 2,
        permissions: [
            "INTERNET",
            "WAKE_LOCK",
            "VIBRATE",
            "READ_MEDIA_IMAGES",
            "READ_MEDIA_VIDEO"
        ],
        adaptiveIcon: {
            "foregroundImage": "./assets/adaptive-icon.png",
            "backgroundColor": "#ffffff"
        },
        "edgeToEdgeEnabled": true,
        "predictiveBackGestureEnabled": false,
        "package": "com.socialmancer.app",
        "googleServicesFile": process.env.GOOGLE_SERVICES_JSON || "./google-services.json",

    },
    web: {
        "favicon": "./assets/favicon.png"
    },
    plugins: [
        "expo-router",
        "expo-font",
        "expo-notifications",
        [
            "react-native-google-mobile-ads",
            {
                "androidAppId": "ca-app-pub-3940256099942544~3347511713",
                "iosAppId": "ca-app-pub-3940256099942544~1458002511"
            }
        ],
        [
            "expo-av",
            {
                "microphonePermission": "Allow $(PRODUCT_NAME) to access your microphone."
            }
        ]
    ],
    notification: {
        icon: "./assets/icon.png",
        color: "#3F72AF"
    },
    scheme: "com.socialmancer.app",
    extra: {
        "router": {},
        "eas": {
            "projectId": "d110bf12-0296-4b67-9291-005f7c9be145"
        }
    }
});
