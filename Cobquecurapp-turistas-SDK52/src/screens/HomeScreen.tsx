import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, ActivityIndicator, Animated } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getUserData } from '../utils/storage';
import { RootStackParamList } from '../navigation/AppNavigator';
import { StackNavigationProp } from '@react-navigation/stack';
import { AppDispatch, RootState } from '../redux/store/store';
import { useDispatch, useSelector } from 'react-redux';
import { UserData, TouristPoint } from '../redux/types/types';
import { logOut, setUser } from '../redux/reducers/userReducer';
import { fetchPromotions } from '../redux/actions/promotionsActions';
import { RFPercentage } from "react-native-responsive-fontsize";
import Carousel from 'react-native-reanimated-carousel';
import { getMemoizedAccessToken, getMemoizedUserData } from '../redux/selectors/userSelectors';
import { getMemoizedPromotions } from '../redux/selectors/promotionSelectors';
import { fetchBranches } from '../redux/actions/branchActions';
import { fetchTouristPoints } from '../redux/actions/touristPointActions';
import { getMemoizedTouristPoints } from '../redux/selectors/touristPointSelectors';
import { Ionicons } from '@expo/vector-icons';
import TermsModal from '../components/TermsModal';
import axios from 'axios';
import { getUserInfo } from '../redux/actions/userActions';
import { Image } from 'expo-image';
import ExitoModal from '../components/ExitoModal';
import ErrorModal from '../components/ErrorModal';

const { width: screenWidth } = Dimensions.get('window');
const screenHeight = Dimensions.get('window').height;
type homeScreenProp = StackNavigationProp<RootStackParamList, 'Home'>;
const API_URL = process.env.EXPO_PUBLIC_API_URL;

const HomeScreen = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation<homeScreenProp>();
  const userData = useSelector(getMemoizedUserData) as UserData;
  const promotions = useSelector(getMemoizedPromotions).slice(0, 3);
  const accessToken = useSelector(getMemoizedAccessToken);
  const isLoggedIn = !!accessToken;
  const [loading, setLoading] = useState(true);
  const opacity = useRef(new Animated.Value(0)).current;
  const touristPoints = useSelector(getMemoizedTouristPoints) as TouristPoint[];
  const [currentTerms, setCurrentTerms] = useState<any>(undefined);
  const [isModalTermsVisible, setModalTermsVisible] = useState(false);
  const [modalSuccessVisible, setModalSuccessVisible] = useState(false);
  const [modalSuccessMessage, setModalSuccessMessage] = useState('');
  const [modalMessage, setModalMessage] = useState('');
  const [modalErrorVisible, setModalErrorVisible] = useState(false);
  // console.log("promociones en home", promotions.length);
// console.log("puntos turisticos en home", touristPoints);
  
  const video = React.useRef(null);

  useEffect(() => {
    dispatch(fetchTouristPoints());
    dispatch(fetchBranches());
    dispatch(fetchPromotions());
    checkUserLoggedIn();
    fetchCurrentTerms();
  }, [dispatch]);
  
  useEffect(() => {
    if (userData?.terms && currentTerms !== undefined && userData.terms?.version !== currentTerms?.version) {
      setModalTermsVisible(true);
    }
    if (userData?.terms === null){
      setModalTermsVisible(true);
    }
  }, [userData, currentTerms]);

  const checkUserLoggedIn = async () => {
    const storedUserData = await getUserData();
    if (storedUserData) {
      dispatch(setUser(storedUserData));
      // navigation.navigate('Home');
    }
  };

  const handlePress = (touristPoint: TouristPoint) => {
    if (isLoggedIn) {
      navigation.navigate('TouristDetailScreen', { touristPoint });
    } else {
      navigation.navigate('Login',{});
    }
  };
  const handleImageLoadStart = () => setLoading(true);

  const handleImageLoadEnd = () => {
    setLoading(false);
    Animated.timing(opacity, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  };
  const renderStarRating = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Ionicons
          key={i}
          name={i <= rating ? 'star' : i - rating <= 0.5 ? 'star-half' : 'star-outline'}
          size={12}
          color="#007a8c"
        />
      );
    }
    return stars;
  };

  const showErrorModal = (message: string) => {
    setModalMessage(message);
    setModalErrorVisible(true);
  };
  const showSuccessModal = (message: string) => {
    setModalSuccessMessage(message);
    setModalSuccessVisible(true);
  };
  //Terminos y condiciones:
  const fetchCurrentTerms = async () => {
    try {
      const response = await axios.get(`${API_URL}/terms`);
      // console.log("respuesta del back", response);
      
      setCurrentTerms(response.data);
    } catch (error) {
      console.error('Error al obtener los términos:', error);
    }
  };

  const handleAcceptTerms = async () => {
    try {
      await axios.put(`${API_URL}/users/${userData.user_id}/accept-terms`);
      await dispatch(getUserInfo(accessToken))
      setModalTermsVisible(false);
      showSuccessModal('Has aceptado los términos y condiciones.');
    } catch (error) {
      console.error('Error al aceptar los términos:', error);
    }
  };
  const handleCancelTerms = async () => {
    await dispatch(logOut()); 
    setModalTermsVisible(false);
    showErrorModal('Has rechazado los términos y condiciones.');
    navigation.navigate('Login',{});
  };
  const renderItem = ({ item }: { item: TouristPoint }) => (
    <TouchableOpacity style={styles.carouselItem} onPress={() => handlePress(item)}>
      <View style={styles.promotionContent}>
        <Text style={styles.promotionTitle}>{item.title}</Text>
        <View style={styles.discountContainer}>
          {renderStarRating(item.average_rating || 0)}
        </View>
        <View style={styles.divider} />
      </View>
      {loading && (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#007a8c" />
        </View>
      )}
      <Animated.View style={{ opacity }}>
        <Image
          source={{ uri: `${API_URL}${item.images[0]?.image_path}` }}
          style={styles.carouselImage}
          contentFit="cover"
          placeholder="blur"
          onLoadStart={handleImageLoadStart}
          onLoadEnd={handleImageLoadEnd}
          // placeholder={require('../../assets/noimage.png')} 
        />
      </Animated.View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
 <ExitoModal
      visible={modalSuccessVisible}
      message={modalSuccessMessage}
      onClose={() => {
        setModalSuccessVisible(false);
      }}
    />
    <ErrorModal
        visible={modalErrorVisible}
        message={modalMessage}
        onClose={() => setModalErrorVisible(false)}
      />
      <View style={styles.upperSection}>
        <Image
          source={{ uri: 'https://res.cloudinary.com/dbwmesg3e/image/upload/v1721915163/TurismoApp/imagenes/letrero-cobquecura-1_ebnygx.jpg' }}
          style={styles.backgroundImage}

        />
        <View style={styles.textContainer}>
          <Text style={styles.title}>Bienvenido a la Cámara de Comercio de Cobquecura</Text>
        </View>
      </View>

      {touristPoints.length ?
        <View style={styles.lowerSection}>
          <Carousel
            loop
            width={screenWidth}
            height={screenWidth / 2}
            autoPlay={true}
            autoPlayInterval={5000}
            data={touristPoints}
            scrollAnimationDuration={2000}
            mode="parallax"
            modeConfig={{
              parallaxScrollingScale: 0.8,
              parallaxScrollingOffset: 50,
            }}
            renderItem={renderItem}
            style={styles.carousel}
            panGestureHandlerProps={{
              activeOffsetX: [-10, 10],
            }}
          />
        </View> : <View style={styles.lowerSection}>
          {/* <ActivityIndicator size="large" color="#acd0d5" /> */}
          <Text style={styles.textNotPoints}>No hay puntos turisticos cargados aún</Text>
        </View>
      }
      {/* Modal para aceptar los términos y condiciones */}
      {currentTerms && 
      <View style={styles.Terms}>
        <TermsModal
          isVisible={isModalTermsVisible}
          toggleModal={() => setModalTermsVisible(false)}
          acceptTerms={handleAcceptTerms}
          termsText={currentTerms?.content}
          onCancel={handleCancelTerms}
          newTerms={true}
        />
      </View>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: '100%',
    display: 'flex',

  },
  upperSection: {
    flex: 0.8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
  },
  containerVideo: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  video: {
    width: 320,
    height: 180,
  },
  textContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  title: {
    fontSize: RFPercentage(2.5),
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 80,
  },
  description: {
    fontSize: RFPercentage(2),
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
  },
  authButtons: {
    position: "absolute",
    bottom: 0,
    // marginBottom:-50,
    // marginTop:40,
    marginBottom: 33,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    width: '100%',
  },
  button: {
    borderColor: '#007a8c',
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    width: '60%',
    // marginBottom: 5,
    // marginTop:15
  },
  buttonText: {
    color: '#007a8c',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonSecondary: {
    borderColor: '#007a8c',
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    width: '40%',
  },
  buttonSecondaryText: {
    color: '#007a8c',
    fontSize: 16,
    fontWeight: 'bold',
  },
  lowerSection: {
    flex: 1,
    alignContent: 'center',
    justifyContent: 'center',
    alignItems: 'center',
  },
  carouselItem: {
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    paddingTop: 55,
  },
  carouselImage: {
    width: screenWidth,
    height: 200,
    borderRadius: 10,
  },
  carousel: {
    height: "100%",
    marginTop: 20,
    alignContent: 'flex-start',
    justifyContent: 'center',
    alignItems: 'flex-start',
    zIndex: 1,
    width: screenWidth
  },
  promotionContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
  },
  promotionTitle: {
    color: '#333',

    fontSize: RFPercentage(2.7),
    fontWeight: 'bold',
    marginBottom: 10,
    width: '80%'
  },
  discountContainer: {
    display:'flex',
    flexDirection:'row',
    backgroundColor: '#f6f6f6',
    borderRadius: 20,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  discountText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  gradientBackground: {
    flex: 1,
  },
  gradientOverlay: {
    position: 'absolute',
    width: screenWidth,
    height: screenHeight,
    opacity: 0.5,
  },
  topLeft: {
    top: 0,
    left: 0,
    width: screenWidth * 0.5,
    height: screenHeight * 0.5,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    width: screenWidth * 0.5,
    height: screenHeight * 0.5,
  },
  gradient: {
    flex: 1,
  },
  loaderContainer: {
    position: 'absolute',
    bottom: screenHeight * -0.08,
    justifyContent: 'center',
    alignItems: 'center',
    height: 300,
  },
  loader: {
    position: 'absolute',
    bottom: screenHeight * 0.2,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  divider: {
    height: 1, 
    backgroundColor: 'rgb(172, 208, 213)',
    marginVertical: 10, 
  },
  Terms:{
    borderRadius:10
  },
  textNotPoints:{
    textAlign:'center',
    color:'#333',
    fontWeight:'bold'
  }
});

export default HomeScreen;


// verde: #007a8c rgb(0, 122, 140)
//       verde claro: #acd0d5 rgb(172, 208, 213)
//       gris: #f6f6f6 rgb(246, 246, 246)