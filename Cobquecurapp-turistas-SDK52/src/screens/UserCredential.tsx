import { View, Text, StyleSheet, Image, Dimensions } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { useSelector } from 'react-redux';
import { UserData } from '../redux/types/types';
import * as Animatable from 'react-native-animatable';
import { getMemoizedUserData } from '../redux/selectors/userSelectors';

const { width } = Dimensions.get('window');
const API_URL = process.env.EXPO_PUBLIC_API_URL;
const UserCredential: React.FC = () => {
  const user = useSelector(getMemoizedUserData) as UserData;

  if (!user) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No user data available</Text>
      </View>
    );
  }

  const userId = user?.user_id?.toString() || '';

  return (
    <View style={styles.background}>
      <View style={styles.credentialContainer}>
      <View style={styles.container}>
      <View style={[styles.semicircle, styles.semicircle1]} />
      <View style={[styles.semicircle, styles.semicircle2]} />
      <View style={[styles.semicircle, styles.semicircle3]} />
    </View>
        <View style={styles.imageContainer}>
          {user.image_url?
           <Image
            source={{ uri: `${API_URL}${user.image_url}` || 'https://via.placeholder.com/150' }}
            style={styles.image}
          />:
          <Image source={require('../../assets/noImageAvailable.png')} style={styles.image} />
        }
         
        </View>
        <View style={styles.infoContainer}>
          <Text style={styles.name}>
            {user.first_name} {user.last_name}
          </Text>
          <Text style={styles.email}>{user.email}</Text>
        <View style={styles.divider} />
        </View>
          
        <Animatable.View animation="bounceIn" duration={1500} style={styles.qrCard}>
          {userId ? (
            <QRCode value={`${userId}-${user.email}`} size={width * 0.4} color='rgb(0, 122, 140)' />
          ) : (
            <Text style={styles.emptyText}>No QR Code available</Text>
          )}
        </Animatable.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff'
  },
  credentialContainer: {
    width: width * 0.85,
    backgroundColor: '#f7f7f7',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
    elevation: 5,
    overflow:'hidden'
  },
  imageContainer: {
    borderColor: 'rgb(172, 208, 213)',
    borderWidth: 0.3,
    borderRadius: 60,
    marginBottom: 20,
  },
  image: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  infoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1c242b',
    textAlign: 'center',
  },
  email: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    marginTop: 5,
  },
  qrCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
    elevation: 5,
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  emptyText: {
    fontSize: 18,
    color: '#888',
  },
    divider: {
      width:width*0.8,
      marginTop:20,
      height: 1,
      backgroundColor: 'rgb(172, 208, 213)',
      marginHorizontal: 15,
    },
    container: {
      position: 'absolute',
      overflow:'hidden',
      zIndex: -1,
      // left: 0,
      right: -50,
      height: 210,
      top:-50,
      justifyContent: 'center',
      alignItems: 'center',
      width:width
    },
    semicircle: {
      width: width, // Ajusta el ancho de los semicírculos
      height: '100%', // La mitad del ancho para crear un semicírculo
      borderRadius: 100,
      position: 'absolute',
    },
    semicircle1: {
      width:width,
      backgroundColor: '#007A8C',
      top: -100,
    },
    semicircle2: {
      width: '90%',
      left:50,
      backgroundColor: 'rgba(0, 120, 138, 0.6)',
      top: -40,
    },
    semicircle3: {
      width: '80%',
      left:100,
      backgroundColor: 'rgba(0, 122, 140, 0.2)',
      top: -15,
    },
});

export default UserCredential;
