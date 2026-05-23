import { Ionicons } from "@expo/vector-icons";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ActivityIndicator, View } from "react-native";
import { colors } from "../theme";
import { useAuth } from "../context/AuthContext";
import type { AppTabParamList, AuthStackParamList } from "./types";
import { ChatScreen } from "../screens/ChatScreen";
import { HomeScreen } from "../screens/HomeScreen";
import { LoginScreen } from "../screens/LoginScreen";
import { MonitorScreen } from "../screens/MonitorScreen";
import { ProfileScreen } from "../screens/ProfileScreen";
import { SignupScreen } from "../screens/SignupScreen";
import { ToolsScreen } from "../screens/ToolsScreen";

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const Tabs = createBottomTabNavigator<AppTabParamList>();

function AppTabs() {
  return (
    <Tabs.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.line,
          height: 70,
          paddingBottom: 10,
          paddingTop: 8
        },
        tabBarHideOnKeyboard: true,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "800"
        },
        tabBarIcon: ({ color, size }) => {
          const iconName = {
            Home: "grid-outline",
            Monitor: "pulse-outline",
            Chat: "chatbubble-ellipses-outline",
            Tools: "medkit-outline",
            Profile: "person-circle-outline"
          }[route.name] as keyof typeof Ionicons.glyphMap;
          return <Ionicons color={color} name={iconName} size={size} />;
        }
      })}
    >
      <Tabs.Screen name="Home" component={HomeScreen} />
      <Tabs.Screen name="Monitor" component={MonitorScreen} />
      <Tabs.Screen name="Chat" component={ChatScreen} />
      <Tabs.Screen name="Tools" component={ToolsScreen} />
      <Tabs.Screen name="Profile" component={ProfileScreen} />
    </Tabs.Navigator>
  );
}

function AuthFlow() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Signup" component={SignupScreen} />
    </AuthStack.Navigator>
  );
}

export function RootNavigator() {
  const { loading, session } = useAuth();

  if (loading) {
    return (
      <View style={{ alignItems: "center", backgroundColor: colors.background, flex: 1, justifyContent: "center" }}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  return <NavigationContainer>{session ? <AppTabs /> : <AuthFlow />}</NavigationContainer>;
}
