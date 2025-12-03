import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Feather from '@expo/vector-icons/Feather';

export default function TabsLayout() {
  const homeIcon = () => <Ionicons size={25} name="home" color={"#565656"} />
  const personIcon = () => <Ionicons size={25} name="person" color={"#565656"} />

  const searchIcon = () => <Ionicons size={25} name="search" color={"#565656"} />

  const postsIcon = () => <MaterialCommunityIcons size={25} name="post" color={"#565656"} />

  const messageIcon = () => <Feather size={25} name="send" color={"#565656"} />

  const notificationsIcon = () => <Ionicons size={25} name="notifications" color={"#565656"}></Ionicons>

  return (
    <Tabs
      screenOptions={{
        tabBarInactiveTintColor: "white",
        tabBarActiveTintColor: "black",
        tabBarStyle: {
          backgroundColor: "white", //#112D4E
          paddingTop: 6,
          height: 80
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
        },
        headerShown: false,
      }}>
      <Tabs.Screen

        name="index"
        options={{
          tabBarIcon: homeIcon,
          title: "Accueil",

        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          tabBarIcon: searchIcon,
          title: "Recherche",
        }}
      />
      <Tabs.Screen
        name="myposts"
        options={{
          tabBarIcon: postsIcon,
          title: "Mes Publi",
        }}
      />
      <Tabs.Screen
        name="message"
        options={{
          tabBarIcon: messageIcon,
          title: "Messages",
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          tabBarIcon: notificationsIcon,
          title: "Notifications",
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          tabBarIcon: personIcon,
          title: "Compte",
        }}
      />
    </Tabs>
  );
}
