import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
    ...config,
    name: "Expo",
    slug: "Expo",
    version: "1.0.0",
    orientation: "portrait",
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
        adaptiveIcon: {
            "foregroundImage": "./assets/adaptive-icon.png",
            "backgroundColor": "#ffffff"
        },
        "edgeToEdgeEnabled": true,
        "predictiveBackGestureEnabled": false,
        "package": "com.student.app",
        "googleServicesFile": process.env.GOOGLE_SERVICES_JSON || "./google-services.json"
    },
    web: {
        "favicon": "./assets/favicon.png"
    },
    plugins: [
        "expo-router",
        "expo-font",
        "expo-notifications",
        "react-native-google-mobile-ads"
    ],
    notification: {
        icon: "./assets/icon.png",
        color: "#3F72AF"
    },
    scheme: "studentsocialapp",
    extra: {
        "router": {},
        "eas": {
            "projectId": "174fa273-1d40-4270-bb78-22d56af66545"
        }
    }
});
