import { View, Text, ImageBackground, StyleSheet, TouchableOpacity, Image, Dimensions } from 'react-native';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Platform } from 'react-native';

const { width: screenWidth } = Dimensions.get('window');

const LandingPage: React.FC = () => {
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();

 

  return (
    <ImageBackground
      source={require('../../assets/images/fondo.jpeg')}
      style={styles.background}
    >
      <View style={styles.logoContainer}>
        {/* <Text style={styles.logo}>Tu Logo Aquí</Text> */}
        {/* Puedes reemplazar el Text con una imagen si tienes un logo en imagen */}
        <Image source={require('../../assets/logo.png')} style={styles.logoImage} />
        {/* <Image source={require('./path-to-your-logo.png')} style={styles.logoImage} /> */}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardText}>Listo para disfrutar </Text>
        <Text style={styles.cardTextGreen}>Cobquecura </Text>
        <View  style={styles.cardTextContainer}>
          <Text style={styles.cardText3}>y de las mejores</Text>
        <Text style={styles.cardTextGreen4}>promociones?</Text>
        </View>
                  
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Login',{})}>
         <Text style={styles.buttonText}>Disfruta los descuentos aquí  </Text>
         <Ionicons name="storefront-outline" size={24} color="#f6f6f6" />
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    position: 'absolute',
    top: Platform.select({ ios: '20%', android: '18%' }),
    alignItems: 'center',
    width: Platform.select({ ios: 120, android: 100 }),
    height: Platform.select({ ios: 120, android: 100 }),
  },
  logo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  logoImage:{
    width: '100%',
    height: '100%',
  },
  card: {
    backgroundColor: '#f6f6f6',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    width: screenWidth,
    position: 'absolute',
    height:Platform.select({ ios: '30%', android: '35%' }),
    bottom: 0,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -5,
    },
    shadowOpacity: 0.8,
    shadowRadius: 5,
    elevation: 5
  },
  cardTextContainer:{
    width:screenWidth*0.9,
    display:'flex',
    flexDirection:'row',
    justifyContent:'center',
    alignItems:'center',
    alignSelf:'center',
    marginBottom:5
  },
  cardText: {
    fontFamily: 'Inter-Regular-400', 
    fontSize: screenWidth*0.06,
    fontWeight: Platform.select({ ios: '900', android: '800' }),
    lineHeight: 30,
    textAlign: 'center',
    color: 'rgb(51, 103, 73)',
    width:screenWidth,
    marginBottom:5
  },
  cardTextGreen:{
    fontFamily: 'Inter-Regular-400', 
    fontSize: screenWidth*0.07,
    fontWeight: Platform.select({ ios: '900', android: '800' }),
    lineHeight: 30,
    textAlign: 'center',
    color: '#007A8C',
    width:screenWidth,
  },
  cardText3:{
    fontFamily: 'Inter-Regular-400', 
    fontSize: screenWidth*0.04,
    fontWeight: Platform.select({ ios: '900', android: '800' }),
    lineHeight: 30,
    textAlign:'right',
    color: 'rgb(51, 103, 73)',
    width:screenWidth*0.38,
  },
  cardTextGreen4:{
    fontFamily: 'Inter-Regular-400', 
    fontSize: screenWidth*0.05,
    fontWeight: Platform.select({ ios: '900', android: '800' }),
    lineHeight: 30,
    marginLeft:6,
    textAlign: 'left',
    color: '#007A8C',
    width:screenWidth*0.38,
  },
  button: {
    marginTop:20,
    backgroundColor: '#007a8c',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    display:'flex',
    flexDirection:'row',
    justifyContent:'space-evenly',
    width:'90%',
    minHeight:48,
    alignItems:'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Inter-Regular-400',
  },
});

export default LandingPage;
