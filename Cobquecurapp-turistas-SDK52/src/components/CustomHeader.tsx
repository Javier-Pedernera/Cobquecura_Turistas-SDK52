import React from 'react';
import { View, Text, Image, StyleSheet, Platform, StatusBar, TouchableOpacity, Dimensions } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { UserData } from '../redux/types/types';
import { logoutUser } from '../services/authService';
import { SimpleLineIcons } from '@expo/vector-icons';
import { getMemoizedUserData } from '../redux/selectors/userSelectors';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { RFPercentage } from 'react-native-responsive-fontsize';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const API_URL = process.env.EXPO_PUBLIC_API_URL;
const CustomHeader: React.FC = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const user = useSelector(getMemoizedUserData);
  if (!user) return null;

  const handleLogout = () => {
    dispatch(logoutUser() as any);
  };
  const goToProfile = () => {
    navigation.navigate('MainTabs', { screen: 'Perfil' });
  };
  return (
    <View style={styles.headerContainer}>
      <Text style={styles.userName}>Hola, {user.first_name}</Text>
      <TouchableOpacity style={styles.imageCont} onPress={goToProfile}>
        <View style={styles.avatarContainer}>
          {user?.image_url ? (
            <Image source={{ uri: `${API_URL}${user.image_url}` }} style={styles.avatar} />
          ) : (
            <Image source={require('../../assets/noImageAvailable.png')} style={styles.avatar} />
          )}
        </View>
      </TouchableOpacity>
      {/* <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
        <SimpleLineIcons name="logout" size={RFPercentage(3)} color="#fff" />
      </TouchableOpacity> */}
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    // width: screenWidth * 0.95,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between', 
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 40, 
    padding: screenWidth * 0.03,
    backgroundColor: '#007a8c',
    height: screenHeight * 0.12, 
  },
  imageCont: {
    width: screenWidth * 0.2, 
  },
  avatarContainer: {
    width: screenWidth * 0.12,
    height: screenWidth * 0.12, 
    borderRadius: (screenWidth * 0.12) / 2,
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: '#fff', 
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  userName: {
    color: '#fff',
    fontSize: RFPercentage(2.3), 
    fontWeight: 'bold',
    width: screenWidth * 0.7,
    paddingLeft: screenWidth * 0.05,
    textAlign: 'left',
  },
  logoutButton: {
    paddingVertical: screenHeight * 0.01, // Padding vertical basado en la altura de la pantalla
    paddingHorizontal: screenWidth * 0.03, // Padding horizontal basado en el ancho de la pantalla
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default CustomHeader;
