import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, ActivityIndicator, Modal, Alert, TextInput, Platform, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { Image } from 'expo-image';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Share } from 'react-native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { AppDispatch } from '../redux/store/store';
import { useDispatch, useSelector } from 'react-redux';
import { getMemoizedBranches, getMemoizedBranchRatingsWithMetadata } from '../redux/selectors/branchSelectors';
import { Branch, ImagePromotion, Promotion } from '../redux/types/types';
import { getMemoizedFavorites, getMemoizedUserData } from '../redux/selectors/userSelectors';
import { addFavoriteAction, removeFavoriteAction } from '../redux/actions/userActions';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Carousel from 'react-native-reanimated-carousel';
import QRCode from 'react-native-qrcode-svg';
import { Ionicons } from '@expo/vector-icons';
import { ScrollView } from 'react-native-gesture-handler';
import { addRating, clearBranchRatingsAction, fetchBranchRatings } from '../redux/actions/branchActions';
import * as Location from 'expo-location';
import MapSingle from '../components/MapSingle';
import { getMemoizedSelectedPromotion } from '../redux/selectors/promotionSelectors';
import { fetchPromotionById } from '../redux/actions/promotionsActions';
import CryptoES from 'crypto-es';
import { KeyboardAvoidingView } from 'react-native';

type PromotionDetailScreenRouteProp = RouteProp<RootStackParamList, 'PromotionDetail'>;
const { width } = Dimensions.get('window');
const { width: screenWidth } = Dimensions.get('window');
const screenHeight = Dimensions.get('window').height;

const PromotionDetailScreen: React.FC = () => {
  const route = useRoute<PromotionDetailScreenRouteProp>();
  const navigation = useNavigation();
  const dispatch: AppDispatch = useDispatch();
  const branches = useSelector(getMemoizedBranches);
  const userFavorites = useSelector(getMemoizedFavorites);
  const ratings = useSelector(getMemoizedBranchRatingsWithMetadata);
  const user = useSelector(getMemoizedUserData);
  const promotion = useSelector(getMemoizedSelectedPromotion);
  const { promotionId } = route.params;
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [branch, setBranch] = useState<Branch | null>(null);
  const [currentPosition, setCurrentPosition] = useState<{ latitude: number, longitude: number } | null>(null);
  const [destination, setDestination] = useState<{ latitude: number, longitude: number } | null>(null);
  const [routeSelected, setRouteSelected] = useState<boolean>(false);
  const [selectedBranch, setSelectedBranch] = useState<any>(null);
  const [routeLoading, setRouteLoading] = useState(false);
  const [newRating, setNewRating] = useState<number>(0);
  const [newComment, setNewComment] = useState<string>('');
  // console.log("newRating",newRating);
  // console.log("newComment",newComment);
  const API_URL = process.env.EXPO_PUBLIC_API_URL;
   // `${API_URL}${promotion.images[0].image_path}`

  console.log("id de promocion descripcion ",promotionId);
  // console.log("ratings en descripcion ",ratings);
  // console.log("branch en descripcion ",branch);
  // console.log("promocion en detallesssss ",promotion)
  // Verificar si el ID está encriptado
  const isEncrypted = (id: string) => {
    const base64Regex = /^[A-Za-z0-9+/=]+$/;
    return id.startsWith("U2FsdGVkX1") && base64Regex.test(id); 
  };

  // Desencriptar ID
  const decryptId = (encryptedId: string): string => {
    const secretKey = process.env.EXPO_PUBLIC_API_SECRET_KEY || '';
    const decrypted = CryptoES.AES.decrypt(encryptedId, secretKey);
    return decrypted.toString(CryptoES.enc.Utf8);
  };

  useEffect(() => {
    let idToFetch: string = promotionId.toString();
    console.log("id para hacer el fetch",idToFetch);
    
    setBranch(null)
    try {
      console.log("esta encriptado ", isEncrypted(idToFetch));
      // Verifica si el ID está encriptado
      if (isEncrypted(idToFetch)) {
        idToFetch = decryptId(idToFetch);
        // console.log(idToFetch);
      }
      const idAsNumber = parseInt(idToFetch, 10);
      console.log("id as number",idAsNumber);
      
    if (isNaN(idAsNumber)) {
      throw new Error("El ID proporcionado no es un número válido.");
    }
    // Despachar la acción para cargar la promoción
     dispatch(fetchPromotionById(idAsNumber));
    } catch (error) {
      console.error("Error al procesar el ID de la promoción:", error);
      Alert.alert("Error", "Hubo un problema al cargar la promoción.");
    }
  }, [dispatch, promotionId]);

  useEffect(() => {
    // console.log("Branches disponibles:", branches);
    // console.log("Promotion actual:", promotion);
    if (branches.length) {
      const branchProm = branches.find(branch => branch.branch_id == promotion?.branch_id) || null;
      setBranch(branchProm);
      if (branchProm) {
        dispatch(fetchBranchRatings(branchProm.branch_id));
      }
    }
  }, [branches, promotion, dispatch]);
  useEffect(() => {
    if (branch) {
      dispatch(fetchBranchRatings(branch.branch_id));
    }
  }, [branch]);


  useEffect(() => {
    const requestLocationPermission = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required to show your current location.');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      setCurrentPosition({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    };
    requestLocationPermission();
  }, []);

  useEffect(() => {
    return () => {
      setBranch(null); // Limpia el estado del branch al desmontar el componente
    };
  }, []);
  
// Función para encriptar el ID usando AES y una clave secreta
const encryptId = (id: any): string => {
  const secretKey = process.env.EXPO_PUBLIC_API_SECRET_KEY;
  if (!secretKey) {
    throw new Error("La clave secreta no está definida en las variables de entorno.");
  }
  const idString = id.toString();
  // Encriptar el ID
  const encrypted = CryptoES.AES.encrypt(idString, secretKey);
  // Devolver el resultado en formato string
  return encrypted.toString();
};

  const handleShare = async () => {
    try {

      const encryptedId = await encryptId(promotion?.promotion_id);
      const url = `https://seal-app-dx4lr.ondigitalocean.app/PromotionDetail/${encryptedId}`;
      // console.log("url compartida", url);
  
      await Share.share({
        message: `Mira esta promoción de ${branch?.name}: ${url}`,
        url: url
      });
  
    } catch (error) {
      console.error("Error al compartir:", error);
    }
  };

  //mapa
  const handleGetDirections = () => {
    // console.log("dentro de la funcion de buscar ruta____________________",branch,currentPosition);n+
    if (branch && currentPosition) {
      setRouteLoading(true)
      setRouteSelected(true)
      setDestination({
        latitude: branch.latitude,
        longitude: branch.longitude,
      });
    }
  };
  // _________________________________________________________________________________________
// Test directo de encriptamiento:
// const testEncryption = () => {
//   const id = "12345"; // Cambia por un ID válido
//   const encrypted = encryptId(id);
//   const isncrited = isEncrypted(encrypted)
//   const decrypted = decryptId(encrypted);
//   console.log("ID Original:", id);
//   console.log("Encriptado:", encrypted);
//   console.log("Esta encriptado?", isncrited);
//   console.log("Desencriptado:", decrypted);
// };
// useEffect(() => {
//   testEncryption();
// }, []);
// _________________________________________________________________________________________
  // Favoritos
  const isFavorite = (promotionId: number) => {
    return userFavorites.includes(promotionId);
  };

  const handleFavoritePress = (promotion: Promotion) => {
    if (isFavorite(promotion.promotion_id)) {
      dispatch(removeFavoriteAction(promotion.promotion_id));
    } else {
      dispatch(addFavoriteAction(promotion));
    }
  };

  const openModal = (imagePath: string) => {
    setSelectedImage(imagePath);
    setModalVisible(true);
  };

  const handleImageLoadStart = () => setLoading(true);
  const handleImageLoadEnd = () => setLoading(false);
  const closeModal = () => {
    setModalVisible(false);
    setSelectedImage(null);
  };

  const handleMapPress = () => {
    setSelectedBranch(null);
  };

  const handleBackPress = () => {
    setModalVisible(false);
    setLoading(true)
    setSelectedImage(null);
    setSelectedBranch(null)
    setBranch(null);
    setDestination(null);
    setRouteSelected(false);
    setRouteLoading(false);
    dispatch(clearBranchRatingsAction());
    setNewRating(0)
    setNewComment('')
    navigation.goBack();
  };

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Ionicons
          key={i}
          name={i <= rating ? 'star' : i - rating <= 0.5 ? 'star-half' : 'star-outline'}
          size={16}
          color="#FFD700"
        />
      );
    }
    return stars;
  };

  const renderItem = ({ item }: { item: ImagePromotion }) => (
    <View style={styles.carouselItem}>
      <Image source={{ uri: `${API_URL}${item.image_path}` }} style={styles.carouselImage} onLoadStart={handleImageLoadStart} onLoadEnd={handleImageLoadEnd} />
    </View>
  );
 
  const handleAddRating = () => {
    // Lógica para agregar la nueva valoración

    // Aquí puedes agregar la lógica para enviar la valoración a la API
    if (user?.user_id === undefined) {
      throw new Error("User ID is required");
    }
    const rating = {
      user_id: user.user_id,
      rating: newRating,
      comment: newComment,
      // branch_id: branch?.branch_id,
      // Agrega cualquier otro campo necesario
    };
    // console.log("agregar rating", rating);

    // Ejemplo de despachar una acción de Redux:
    if (branch && rating.user_id) {
      dispatch(addRating(branch.branch_id, rating))
    }
    // Limpiar los campos después de enviar
    setNewRating(0);
    setNewComment('');
  };

  return (
    <KeyboardAvoidingView
    style={{ flex: 1 }}
    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 20}
  >
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
          <MaterialIcons name="arrow-back-ios-new" size={24} color="#007a8c" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
          <MaterialCommunityIcons name="share-variant" size={24} color="#007a8c" />
        </TouchableOpacity>
        {promotion &&
        <TouchableOpacity style={styles.favoriteButton} onPress={() => handleFavoritePress(promotion)}>
          <MaterialCommunityIcons name={isFavorite(promotion.promotion_id) ? 'cards-heart' : 'cards-heart-outline'} size={24} color="#007a8c" />
        </TouchableOpacity>
      }
      </View>
      {loading && (
        <View style={styles.loaderImgLarge}>
          <ActivityIndicator size="large" color="#007a8c" />
        </View>
      )}
      {promotion && promotion.images?.length > 0 ?<Image
        source={{ uri: `${API_URL}${promotion.images[0].image_path}` }}
        style={styles.mainImage}
        onLoadStart={handleImageLoadStart}
        onLoadEnd={handleImageLoadEnd}
      />:
      <Image
        source={require('../../assets/noImageAvailable.png')} 
        style={styles.nomainImage}
        onLoadStart={handleImageLoadStart}
        onLoadEnd={handleImageLoadEnd}
      />}
      <View style={styles.thumbnailsContainer}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {promotion && promotion.images.length > 1 &&
          promotion.images.slice(1).map((item) => (
            <TouchableOpacity key={item.image_id} onPress={() => openModal(item.image_path)}>
              {loading && (
                <View style={styles.loader}>
                  <ActivityIndicator size="large" color="#007a8c" />
                </View>
              )}
              
              <Image source={{ uri: `${API_URL}${item.image_path}` }} style={styles.thumbnail} onLoadStart={handleImageLoadStart} onLoadEnd={handleImageLoadEnd} />
            </TouchableOpacity>
          ))
        }
        </ScrollView>
      </View>

      {/* Modal de imagenes */}
      <Modal visible={modalVisible} transparent={true} animationType="slide" onRequestClose={closeModal}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContainer2}>
            <Carousel
              loop
              width={screenWidth}
              height={screenWidth * 0.75}
              autoPlay={true}
              data={promotion? promotion.images: [] }
              scrollAnimationDuration={3000}
              mode="parallax"
              modeConfig={{
                parallaxScrollingScale: 0.8,
                parallaxScrollingOffset: 50,
              }}
              renderItem={renderItem}
              style={styles.carousel}
              // panGestureHandlerProps={{
              //   activeOffsetX: [-10, 10],
              // }}
            />
            <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
              <MaterialCommunityIcons name="close" size={24} color="#007a8c" />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <View style={styles.containerText}>
        {/* <View style={styles.TitleStars}> */}
          <Text style={styles.title}>{promotion?.title}</Text>
        <View style={styles.ratingContainerTitle}>
        <Text style={styles.starsContainer}>{renderStars(ratings.average_rating)} </Text>
        <Text style={styles.branchName}>{branch?.name}</Text>
          {/* {renderStars(ratings.average_rating)} */}
        </View>
        {/* </View>  */}
        
        <Text style={styles.descriptiontitle}>Descripción:</Text>
        <Text style={styles.description}>{promotion?.description}</Text>
        <View style={styles.qrCode}>
          <QRCode
            value={promotion?.qr_code}
            size={screenWidth * 0.5}
            color="#007a8c"
            backgroundColor="white"
          />
          <Text style={styles.dates}>Validez:</Text>
          <View style={styles.dates2}>
            <Text style={styles.dates}>Desde: {promotion?.start_date}</Text>
            <Text style={styles.dates}>Hasta: {promotion?.expiration_date}</Text>
          </View>
        </View>
      </View>
      <View style={styles.descriptiontitleMapCont}>
        {branch && branch.latitude !== null && branch.longitude !== null && (
          <View style={styles.descriptiontitleMap}>
            <Text style={styles.descriptiontitleMap}>Ubicación:</Text>
            <Text style={styles.descriptiontitleMap}>{branch.address}</Text>
            <MapSingle
              branch={branch}
              currentPosition={currentPosition}
              destination={destination}
              routeSelected={routeSelected}
              selectedBranch={selectedBranch}
              ratings={ratings}
              handleMapPress={handleMapPress}
              handleGetDirections={handleGetDirections}
              setSelectedBranch={setSelectedBranch}
              routeLoading={routeLoading}
              setRouteLoading={setRouteLoading}
              touristPoint={false}
              scrollEnabled={true}
              zoomEnabled={true}
              rotateEnabled={true}
              pitchEnabled={true}
              setDestination={setDestination}
              setRouteSelected={setRouteSelected}
            />
          </View>
        )}
      </View>
    
      {/* Sección de valoraciones */}
      <View style={styles.ratingsContainer}>
        <Text style={styles.sectionTitle}>Valoraciones:</Text>
        {ratings.ratings.map((rating) => (
          <View key={rating.id} style={styles.ratingItem}>
            <View style={styles.starsTextContainer}>
              <Text style={styles.starsContainer}>{renderStars(rating.rating)} </Text>
            </View>
            <Text style={styles.comment}>{rating.comment}</Text>
            {rating.first_name && <Text style={styles.commentDate}>{rating.first_name}</Text>}
            {rating.created_at && <Text style={styles.commentDate}>{new Date(rating.created_at).toLocaleDateString()}</Text>}

          </View>
        ))}
      </View>

      {/* Sección para agregar nueva valoración */}
      <View style={styles.newRatingContainer}>
        <Text style={styles.sectionTitle}>Escribe tu comentario:</Text>
        <View style={styles.starsContainer}>
          {[1, 2, 3, 4, 5].map((star) => (
            <TouchableOpacity key={star} onPress={() => setNewRating(star)}>
              <Ionicons name={star <= newRating ? 'star' : 'star-outline'} size={24} color="#FFD700" />
            </TouchableOpacity>
          ))}
        </View>
        <TextInput
          style={styles.input}
          placeholder="Comparte tu experiencia"
          value={newComment}
          onChangeText={setNewComment}
        />
        <TouchableOpacity onPress={handleAddRating} style={styles.button}>
          <Text style={styles.buttonText}>Enviar valoración</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
    </TouchableWithoutFeedback>
  </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    height: screenHeight,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    // padding: 16,
    // backgroundColor: '#007a8c',
  },
  iconButton: {
    padding: 8,
  },
  mainImage: {
    zIndex: -1,
    width: screenWidth,
    height: screenWidth * 0.75,
    resizeMode: 'cover',
  },
  nomainImage:{
    zIndex: -1,
    width: screenWidth,
    height: screenWidth * 0.75,
    resizeMode: 'contain',
  },
  thumbnailsContainer: {
    display: 'flex',
    flexDirection: 'row',
    marginTop: 16,
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  thumbnail: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 8,
  },
  backButton: {
    position: 'absolute',
    width: screenWidth * 0.11,
    top: 65,
    height: 35,
    left: 10,
    backgroundColor: 'rgb(255, 255, 255)',
    padding: 5,
    borderRadius: 5,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    alignContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 1,
    elevation: 3,
  },
  favoriteButton: {
    position: 'absolute',
    top: 65,
    width: screenWidth * 0.11,
    height: 35,
    right: 20,
    backgroundColor: 'rgb(255, 255, 255)',
    padding: 5,
    borderRadius: 5,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    alignContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 1,
    elevation: 3,
  },
  shareButton: {
    position: 'absolute',
    right: 20,
    top: 105,
    width: screenWidth * 0.11,
    height: 35,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    alignContent: 'center',
    backgroundColor: 'rgb(255, 255, 255)',
    padding: 5,
    borderRadius: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 1,
    elevation: 3,
  },
  loaderImgLarge: {
    position: 'absolute',
    top: '8%',
    left: '45%',
  },
  loader: {
    position: 'absolute',
    top: '18%',
    left: '48%',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    height: '100%',
  },
  modalContainer2: {
    height: '50%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    alignContent: 'center',
  },
  carousel: {
    width: screenWidth,
    height: screenWidth * 0.75,
  },
  carouselItem: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  carouselImage: {
    width: screenWidth,
    height: '100%',
    borderRadius: 5,
  },
  closeButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 50,
    padding: 15,
    color: '#007a8c',
  },
  ratingContainerTitle: {
    marginVertical: 20,
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent:'space-between',
    alignItems:'flex-start',
    alignContent:'center'
    // justifyContent: 'center'
  },
  qrCode: {
    height: screenHeight * 0.35,
    display: 'flex',
    marginTop: 20,
    width: '90%',
    justifyContent: 'center',
    flexDirection: 'column',
    alignItems: 'center',
    alignSelf: 'center',
    marginVertical: 20,
    
  },
  containerText: {
    paddingRight: 20,
    paddingLeft: 20,
  },
  TitleStars:{
    width:'100%',
    display:'flex',
  },
  title: {
    // width:screenWidth*0.7,
    fontSize: screenHeight*0.041,
    fontWeight: 'bold',
    color: '#007a8c',
    marginBottom: 10,
    textAlign: 'center',
  },

  branchName: {
    fontSize: screenHeight*0.025,
    fontWeight: 'bold',
    color:'#007a8c',
    textAlign: 'center',
    marginBottom: 10,
  },

  description: {
    fontSize: 16,
    color: '#555',
    marginBottom: 30,
  },
  descriptiontitle: {
    fontSize: 18,
    color: '#555',
    marginBottom: 10,
    fontWeight: 'bold',
  },
  dates2: {
    marginTop: -5,
    display: 'flex',
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-evenly',
    fontSize: 14,
    color: '#888',
    marginBottom: 10,
  },
  dates: {
    paddingTop: 15,
    fontSize: 14,
    color: 'rgb(51, 103, 73)',
  },
  descriptiontitleMapCont: {
    maxHeight: 600
  },
  descriptiontitleMap: {
    padding: 10,
    fontSize: 14,
    color: '#555',
  },

  ratingsContainer: {
    padding: 20,
  },
  ratingItem: {
    marginBottom: 10,
  },
  starsTextContainer: {
    display: 'flex',

  },
  starsContainer: {
    flexDirection: 'row',
  },
  comment: {
    fontSize: 16,
    color: '#555',
    marginTop: 5,
  },
  commentDate: {
    fontSize: 14,
    color: '#888',
    marginTop: 5,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  newRatingContainer: {

    padding: 20,
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginTop: 10,
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#007a8c',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 10
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default PromotionDetailScreen;
