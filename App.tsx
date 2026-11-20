import React from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthProvider } from './src/storage/AuthContext';
import { ProgressProvider } from './src/storage/ProgressContext';
import { RootStackParamList } from './src/navigation/types';
import HomeScreen from './src/screens/HomeScreen';
import GameScreen from './src/screens/GameScreen';
import WinScreen from './src/screens/WinScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import AuthScreen from './src/screens/AuthScreen';
import AccountScreen from './src/screens/AccountScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: '#0a0a0a',
    card: '#0a0a0a',
    text: '#f2f2ed',
    border: '#0a0a0a',
  },
};

export default function App() {
  return (
    <AuthProvider>
      <ProgressProvider>
        <NavigationContainer theme={theme}>
          <Stack.Navigator
            initialRouteName="Home"
            screenOptions={{ headerShown: false, animation: 'slide_from_right' }}
          >
            <Stack.Screen name="Home" component={HomeScreen} />
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
