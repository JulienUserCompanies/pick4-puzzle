import React, { useEffect } from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { setAudioModeAsync } from 'expo-audio';
import { AuthProvider } from './src/storage/AuthContext';
import { ProgressProvider } from './src/storage/ProgressContext';
import { RootStackParamList } from './src/navigation/types';
import SplashScreen from './src/screens/SplashScreen';
import Onboarding1Screen from './src/screens/Onboarding1Screen';
import Onboarding2Screen from './src/screens/Onboarding2Screen';
import HomeScreen from './src/screens/HomeScreen';
import LevelsScreen from './src/screens/LevelsScreen';
import DailyScreen from './src/screens/DailyScreen';
import LeaderboardScreen from './src/screens/LeaderboardScreen';
import StatisticsScreen from './src/screens/StatisticsScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import GameScreen from './src/screens/GameScreen';
import WinScreen from './src/screens/WinScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import AuthScreen from './src/screens/AuthScreen';
import AccountScreen from './src/screens/AccountScreen';
import { colors } from './src/theme';

const Stack = createNativeStackNavigator<RootStackParamList>();

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.bg,
    card: colors.bg,
    text: colors.ink,
    border: colors.bg,
  },
};

export default function App() {
  useEffect(() => {
    // Short game SFX should still play when the phone's silent switch is on
    // (players expect a tap/win sound even with ringer off) but shouldn't
    // duck or interrupt whatever music they're already playing.
    setAudioModeAsync({ playsInSilentMode: true, interruptionMode: 'mixWithOthers' });
  }, []);

  return (
    <AuthProvider>
      <ProgressProvider>
        <NavigationContainer theme={theme}>
          <Stack.Navigator
            initialRouteName="Splash"
            screenOptions={{ headerShown: false, animation: 'slide_from_right' }}
          >
            <Stack.Screen name="Splash" component={SplashScreen} options={{ animation: 'fade' }} />
            <Stack.Screen name="Onboarding1" component={Onboarding1Screen} />
            <Stack.Screen name="Onboarding2" component={Onboarding2Screen} />
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="Levels" component={LevelsScreen} />
            <Stack.Screen name="Daily" component={DailyScreen} />
            <Stack.Screen name="Leaderboard" component={LeaderboardScreen} options={{ animation: 'fade' }} />
            <Stack.Screen name="Statistics" component={StatisticsScreen} options={{ animation: 'fade' }} />
            <Stack.Screen name="Profile" component={ProfileScreen} options={{ animation: 'fade' }} />
            <Stack.Screen name="Game" component={GameScreen} />
            <Stack.Screen name="Win" component={WinScreen} options={{ animation: 'fade' }} />
            <Stack.Screen name="Settings" component={SettingsScreen} options={{ animation: 'slide_from_bottom' }} />
            <Stack.Screen name="Auth" component={AuthScreen} options={{ animation: 'slide_from_bottom' }} />
            <Stack.Screen name="Account" component={AccountScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </ProgressProvider>
    </AuthProvider>
  );
}
