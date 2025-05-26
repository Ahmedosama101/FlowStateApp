import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import MainPage from '../screens/MainPage';
import MatchesScreen from '../screens/matches/MatchesScreen';
import ExploreScreen from '../screens/explore/ExploreScreen';
import BookingScreen from '../screens/booking/BookingScreen';
import ProfileStackNavigator from './ProfileStackNavigator';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

const Tab = createBottomTabNavigator();

export default function MainNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          switch (route.name) {
            case 'Explore':
              iconName = 'search';
              break;
            case 'Matches':
              iconName = 'users';
              break;
            case 'Home':
              iconName = 'home';
              break;
            case 'Booking':
              iconName = 'calendar';
              break;
            case 'Profile':
              iconName = 'user';
              break;
            default:
              iconName = 'circle';
          }

          return (
            <View
              style={{
                padding: 5,
                borderRadius: 30,
                backgroundColor: focused ? '#0C2252' : 'transparent',
              }}
            >
              <Icon name={iconName} size={size} color={focused ? '#FFFFFF' : color} />
            </View>
          );
        },
        tabBarStyle: {
          height: 90,
          backgroundColor: '#0C2252',
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          position: 'absolute',
          overflow: 'hidden',
        },
        tabBarShowLabel: false, // Hide labels to show only icons
        tabBarActiveTintColor: '#FFFFFF',
        tabBarInactiveTintColor: '#8E8E93',
      })}
      initialRouteName="Home"
    >
      <Tab.Screen name="Home" component={MainPage} />
      <Tab.Screen name="Explore" component={ExploreScreen} />
      <Tab.Screen name="Matches" component={MatchesScreen} />
      <Tab.Screen name="Booking" component={BookingScreen} />
      <Tab.Screen name="Profile" component={ProfileStackNavigator} />
    </Tab.Navigator>
  );
}