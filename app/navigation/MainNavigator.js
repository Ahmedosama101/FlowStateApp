import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import MainPage from '../screens/MainPage';
import MatchesScreen from '../screens/matches/MatchesScreen';
import ExploreScreen from '../screens/explore/ExploreScreen';
import BookingScreen from '../screens/booking/BookingScreen';
import ProfileStackNavigator from './ProfileStackNavigator';
import { SafeAreaView } from 'react-native-safe-area-context';

const Tab = createBottomTabNavigator();

export default function MainNavigator() {
  return (
    <Tab.Navigator
      initialRouteName="Home"
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
            <View style={{ 
              padding: 5,
              borderRadius: 50,
              backgroundColor: focused ? '#BBD4F9' : 'transparent' 
            }}>
              <Icon name={iconName} size={size} color={color} />
            </View>
          );
        },
        tabBarActiveTintColor: '#007BFF',
        tabBarInactiveTintColor: '#8E8E93',
        tabBarStyle: {
          height: 80,
          paddingBottom: 8,
          paddingTop: 8,
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#E5E5EA',
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontFamily: 'Raleway-Medium',
        },
      })}
    >
      <Tab.Screen 
        name="Explore" 
        component={ExploreScreen}
        options={{
          tabBarLabel: 'Explore'
        }}
      />
      <Tab.Screen 
        name="Matches" 
        component={MatchesScreen}
        options={{
          tabBarLabel: 'Matches'
        }}
      />
      <Tab.Screen 
        name="Home" 
        component={MainPage}
        options={{
          tabBarLabel: 'Home'
        }}
      />
      <Tab.Screen 
        name="Booking" 
        component={BookingScreen}
        options={{
          tabBarLabel: 'Booking'
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileStackNavigator}
        options={{
          tabBarLabel: 'Profile'
        }}
      />
    </Tab.Navigator>    
  );
}