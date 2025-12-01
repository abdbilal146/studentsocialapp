import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Feather from '@expo/vector-icons/Feather';

export default function TabsLayout() {
  const homeIcon = () => <Ionicons size={30} name="home" color={"white"} />
  const personIcon = () => <Ionicons size={30} name="person" color={"white"} />

  const searchIcon = () => <Ionicons size={30} name="search" color={"white"} />

  const postsIcon = () => <MaterialCommunityIcons size={30} name="post" color={"white"} />

  const messageIcon = () => <Feather size={30} name="send" color={"white"} />

  return (
    <Tabs
      screenOptions={{
        tabBarInactiveTintColor: "white",
        tabBarActiveTintColor: "black",
        tabBarStyle: {
          backgroundColor: "#112D4E",
          paddingTop: 13,
          height: 100
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
          title: "Home",

        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          tabBarIcon: searchIcon,
          title: "Search",
        }}
      />
      <Tabs.Screen
        name="myposts"
        options={{
          tabBarIcon: postsIcon,
          title: "My Posts",
        }}
      />
      <Tabs.Screen
        name="message"
        options={{
          tabBarIcon: messageIcon,
          title: "Message",
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          tabBarIcon: personIcon,
          title: "Account",
        }}
      />
    </Tabs>
  );
}
