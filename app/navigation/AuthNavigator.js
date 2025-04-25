import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/LoginScreen';
import SignUpScreen from '../screens/SignUpScreen';
import GenderScreen from '../screens/GenderScreen';
import DateOfBirthScreen from '../screens/DateOfBirthScreen';
import AgeScreen from '../screens/AgeScreen';
import WeightScreen from '../screens/WeightScreen';
import HeightScreen from '../screens/HeightScreen';
import BeltScreen from '../screens/BeltScreen';
import AddressScreen from '../screens/AddressScreen';
import ProfScreen from '../screens/ProfScreen';
import MatchesScreen from '../screens/matches/MatchesScreen';

const Stack = createNativeStackNavigator();

export default function AuthNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="SignUp" component={SignUpScreen} />
      <Stack.Screen
        name="Gender"
        component={GenderScreen}
        options={{
          gestureEnabled: false,
        }}
      />
      <Stack.Screen name="DateOfBirth" component={DateOfBirthScreen} />
      <Stack.Screen name="Age" component={AgeScreen} />
      <Stack.Screen name="Weight" component={WeightScreen} />
      <Stack.Screen name="Height" component={HeightScreen} />
      <Stack.Screen name="Belt" component={BeltScreen} />
      <Stack.Screen name="Address" component={AddressScreen} />
      <Stack.Screen name="Profile" component={ProfScreen} />
      <Stack.Screen name="Macthes" component={MatchesScreen} />
    </Stack.Navigator>
  );
}