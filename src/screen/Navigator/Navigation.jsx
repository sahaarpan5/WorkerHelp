import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import WelcomeScreen from '../Common/WelcomeScreen';
import LoginScreen from '../Common/LoginScreen';
import DashboardScreen from '../Common/DashboardScreen';
import OnboardingScreen from '../Common/OnboardingScreen';
import SignupScreen from '../Common/SignupScreen';
import JobDetailsScreen from '../Common/JobDetailsScreen';
import WalletScreen from '../Common/WalletScreen';
import ProfileScreen from '../Common/ProfileScreen';
import ScheduleScreen from '../Common/ScheduleScreen';
import RatingsScreen from '../Common/RatingsScreen';
import EarningsScreen from '../Common/EarningsScreen';
import SettingsScreen from '../Common/SettingsScreen';




const Stack = createNativeStackNavigator();

const Navigation = () => {

  return (
    <SafeAreaProvider >

      <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="WelcomeScreen">
        <Stack.Screen name="WelcomeScreen" component={WelcomeScreen} />
        <Stack.Screen name="LoginScreen" component={LoginScreen} />
        <Stack.Screen name="DashboardScreen" component={DashboardScreen} />
        <Stack.Screen name="OnboardingScreen" component={OnboardingScreen} />
        <Stack.Screen name="SignupScreen" component={SignupScreen} />
        <Stack.Screen name="JobDetailsScreen" component={JobDetailsScreen} />
        <Stack.Screen name="WalletScreen" component={WalletScreen} />
        <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
        <Stack.Screen name="ScheduleScreen" component={ScheduleScreen} />
         <Stack.Screen name="RatingsScreen" component={RatingsScreen} />
          <Stack.Screen name="EarningsScreen" component={EarningsScreen} />
          <Stack.Screen name="SettingsScreen" component={SettingsScreen} />
      </Stack.Navigator>

    </SafeAreaProvider>


  );
};

export default Navigation;