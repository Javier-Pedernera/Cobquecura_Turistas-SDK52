import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, FlatList, StyleSheet, TextInput, TouchableOpacity, Image, ScrollView, Dimensions, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../redux/store/store';
import { addNewRating, fetchRatings, fetchTouristPointById, fetchTouristPoints, updateExistingRating } from '../redux/actions/touristPointActions';
import { Rating, TouristPoint, UserData } from '../redux/types/types';
import { getMemoizedUserData } from '../redux/selectors/userSelectors';
import Loader from '../components/Loader';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { getMemoizedRatings, getMemoizedSelectedTouristPoint } from '../redux/selectors/touristPointSelectors';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import MapSingle from '../components/MapSingle';
import { clearRatingsTouristPoint, clearSelectedTouristPoint } from '../redux/reducers/touristPointReducer';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const API_URL = process.env.EXPO_PUBLIC_API_URL;
type TouristDetailScreenRouteProp = RouteProp<RootStackParamList, 'TouristDetailScreen'>;
type TouristDetailScreenNavigationProp = StackNavigationProp<RootStackParamList, 'TouristDetailScreen'>;
interface TouristDetailScreenProps {
  route: TouristDetailScreenRouteProp;
  navigation: TouristDetailScreenNavigationProp;
}

const TouristDetailScreen: React.FC<TouristDetailScreenProps> = ({ route, navigation }) => {
  const { touristPoint } = route.params;
  const dispatch: AppDispatch = useDispatch();
  const [newRating, setNewRating] = useState(0);
  const [newComment, setNewComment] = useState('');
  const [editingRatingId, setEditingRatingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingRating, setLoadingRating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const user = useSelector(getMemoizedUserData) as UserData;
  const ratings = useSelector(getMemoizedRatings);
  const selectedTouristPoint = useSelector(getMemoizedSelectedTouristPoint);
  const [currentPosition, setCurrentPosition] = useState<{ latitude: number, longitude: number } | null>(null);
  const [routeSelected, setRouteSelected] = useState<boolean>(false);
  const [selectedPoint, setSelectedPoint] = useState<any>(null);
  const [routeLoading, setRouteLoading] = useState(false);
  const [destination, setDestination] = useState<{ latitude: number, longitude: number } | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(`${API_URL}${touristPoint.images[0]?.image_path}` || null);
  const isGuest = useSelector((state: RootState) => state.user.isGuest);
//`${API_URL}${touristPoint.images[0]?.image_path}`
  // console.log("id para editar",editingRatingId);
  // console.log("punto turistico elegido", selectedTouristPoint);
  console.log("todos las valoraciones",ratings);

  useEffect(() => {
    // Obtener datos actualizados del punto turístico
    dispatch(fetchTouristPointById(touristPoint.id));
  }, [dispatch, touristPoint.id]);

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
    const fetchData = async () => {
      try {
        // console.log("hace el dispach?");
        // console.log("pt id?", touristPoint.id);
        if(touristPoint)
        dispatch(fetchRatings(touristPoint.id));
      } catch (error) {
        setError('Failed to fetch ratings');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [touristPoint.id, dispatch]);
  // const handleRoutePress = (latitude: number, longitude: number) => {
  //   setDestination({ latitude, longitude });
  //   setRoute(true)
  //   setSelectedBranch(null);
  //   setRouteLoading(true);
  // };
  const handleGetDirections = () => {
    if (selectedTouristPoint && currentPosition) {
      setRouteLoading(true)
      setRouteSelected(true)
      setDestination({
        latitude: selectedTouristPoint.latitude,
        longitude: selectedTouristPoint.longitude,
      });
    }
  };
  const handleAddRating = async() => {
    // console.log("agrega valoracion???");
    setLoadingRating(true)
    const rating = {
      rating: newRating,
      comment: newComment,
      tourist_id: user.user_id,

    };
    // console.log(rating);
    if(selectedTouristPoint){
      await dispatch(addNewRating(rating, selectedTouristPoint.id));
      await dispatch(fetchRatings(touristPoint.id));
      await dispatch(fetchTouristPointById(touristPoint.id));
      await dispatch(fetchTouristPoints());
    }
    setNewRating(0);
    setNewComment('');
    setLoadingRating(false)
  };

  const handleUpdateRating = async() => {
    if (editingRatingId !== null) {
      setLoadingRating(true)
      const updatedRating = {
        rating: newRating,
        comment: newComment,
      };

      await dispatch(updateExistingRating(editingRatingId, updatedRating));
      await dispatch(fetchTouristPointById(touristPoint.id));
      await dispatch(fetchTouristPoints());
      setEditingRatingId(null);
      setNewRating(0);
      setNewComment('');
      setLoadingRating(false)
    }
  };
  const renderStarRating = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Ionicons
          key={i}
          name={i <= rating ? 'star' : i - rating <= 0.5 ? 'star-half' : 'star-outline'}
          size={12}
          color="#FFD700"
        />
      );
    }
    return stars;
  };


  if (loading) {
    return <Loader/>;
  }

  if (error) {
    return <Text>{error}</Text>;
  }
  const handleMapPress = () => {
    setSelectedPoint(null);
  };
  const handleBack = async() => {
    await dispatch(clearSelectedTouristPoint())
    await dispatch(clearRatingsTouristPoint())
    navigation.goBack()
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView style={styles.container}>
      {!selectedTouristPoint && <Loader/>}
        <View style={styles.container}>
        {selectedImage && (
            <Image source={{ uri: selectedImage }} style={styles.image} />
          )}
          <TouchableOpacity onPress={ handleBack } style={styles.backButton}>
            <MaterialIcons name="arrow-back-ios-new" size={24} color="#007a8c" />
          </TouchableOpacity>
          <View style={styles.thumbnailContainer}>
            {selectedTouristPoint && selectedTouristPoint.images && selectedTouristPoint.images.length > 1 && selectedTouristPoint.images.map(image => (
              <TouchableOpacity key={image.id} onPress={() => setSelectedImage(`${API_URL}${image?.image_path}`)}>
                <Image source={{ uri: `${API_URL}${image?.image_path}`}} style={styles.thumbnail} />
              </TouchableOpacity>
            ))}
            
          </View>
          <View style={styles.container2}>
            <Text style={styles.title}>{selectedTouristPoint?.title}</Text>
            {/* <Text style={styles.averageRating}>Valoracion:</Text> */}
            <Text> {renderStarRating(selectedTouristPoint?.average_rating ?? 0)}</Text>

          </View>
          <Text style={styles.description}>{selectedTouristPoint?.description}</Text>
        </View>


        {/* Mapa */}
        <View style={styles.descriptiontitleMapCont}>
          {selectedTouristPoint && selectedTouristPoint.latitude !== null && selectedTouristPoint.longitude !== null && (
            <View style={styles.descriptiontitleMap}>
              <Text style={styles.descriptiontitleMap}>Ubicación:</Text>
              <MapSingle
                branch={selectedTouristPoint}
                currentPosition={currentPosition}
                destination={destination}
                routeSelected={routeSelected}
                selectedBranch={selectedPoint}
                ratings={ratings}
                handleMapPress={handleMapPress}
                handleGetDirections={handleGetDirections}
                setSelectedBranch={setSelectedPoint}
                routeLoading={routeLoading}
                setRouteLoading={setRouteLoading}
                touristPoint={true}
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
        <View style={styles.ValorContainer} >
          <Text style={styles.valoracionesTitle}>Valoraciones:</Text>
          {ratings && ratings.length ? ratings?.filter(rating => rating.tourist_point_id === selectedTouristPoint?.id).map((rating) => (
            <View key={rating.id} style={styles.ratingContainer}>
              <View style={styles.userCont}>
              {rating.tourist_image_url ? (
                        <Image
                          source={{ uri: `${API_URL}${rating.tourist_image_url}` }}
                          style={styles.userImage} 
                        />
                      ) : (
                        <Image source={require('../../assets/noimage.png')} style={styles.userImage} />
                      )}
              <Text style={styles.userName}>{rating.tourist_first_name}</Text>
              </View>
              <Text>{renderStarRating(rating.rating)}</Text>
              <Text style={styles.comment}>{rating.comment}</Text>
              
              
              {/* <Text style={styles.averageRating}>Valoracion:</Text> */}
              {!isGuest&& rating.tourist_id === user?.user_id && (
                <TouchableOpacity onPress={() => {
                  setEditingRatingId(rating.id);
                  setNewRating(rating.rating);
                  setNewComment(rating.comment);
                }}>
                  <Text style={styles.editButton}>Edit</Text>
                </TouchableOpacity>
              )}
            </View>
          )):<Text>No hay comentarios aún... </Text>}
          {!isGuest&&<View style={styles.newRatingContainer}>
            <Text style={styles.valoracionesTitle}>Tu valoración:</Text>
            <View style={styles.starsContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity key={star} onPress={() => setNewRating(star)}>
                  <Ionicons name={star <= newRating ? 'star' : 'star-outline'} size={24} color="#FFD700" />
                </TouchableOpacity>
              ))}
            </View>
            <TextInput
              placeholder="Comparte tu experiencia"
              value={newComment}
              onChangeText={setNewComment}
              style={styles.input}
              multiline
            />
            <TouchableOpacity onPress={editingRatingId === null ? handleAddRating : handleUpdateRating} style={styles.button} disabled={loadingRating}>
              {loadingRating? <Text style={styles.buttonText}>{editingRatingId === null ? 'Enviando valoración...' : 'Actualizando valoración...'}</Text>: <Text style={styles.buttonText}>{editingRatingId === null ? 'Enviar valoración' : 'Actualizar valoración'}</Text>}
            </TouchableOpacity>
          </View>}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  flat: {
    // overflow: 'hidden',  
    width: screenWidth,

  },
  container: {
    // padding: 16,
    overflow: 'hidden',
    width: "100%",
    backgroundColor: '#fff',
  },
  container2: {
    display: 'flex',
    justifyContent: 'space-between',
    alignContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    width: "100%",
    paddingHorizontal: 16,

  },
  newRatingContainer: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  backButton: {
    position: 'absolute',
    width: 45,
    top: 50,
    height: 40,
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
  title: {
    width:screenWidth*0.7,
    fontSize: screenWidth * 0.06,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  description: {
    padding: 16,
    fontSize: screenWidth * 0.040,
    marginBottom: 8,
  },
  image: {
    width: screenWidth,
    height: screenHeight * 0.25, 
    borderRadius: 8,
    marginBottom: 16,
  },
  thumbnailContainer: {
    flexDirection: 'row',
    marginVertical: 5,
    paddingLeft:7
  },
  thumbnail: {
    width: 50,
    height: 50,
    marginRight: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  averageRating: {
    width:screenWidth*0.2,
    fontSize: screenWidth * 0.05,
    fontWeight: 'bold',
    marginRight:50,
    marginVertical: 8,
  },
  starsContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 16,
  },
  ratingContainer: {
    marginBottom: 15,
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
  },
  comment: {
    fontSize: 16,
    marginVertical: 5,
  },
  userCont:{
    display:'flex',
    flexDirection:'row',
    marginBottom:10,
    justifyContent:'flex-start',
    alignContent:'flex-end',
    alignItems:'flex-end'
  },
  userName:{
    fontSize: screenWidth*0.035,
    color:'#333'
  },
  userImage:{
    width: 30, 
    height: 30, 
    borderRadius: 20, 
    marginRight: 10,
  },
  editButton: {
    color: '#007a8c',
    marginTop: 8,
    fontWeight: 'bold',
  },
  input: {
    padding: screenWidth * 0.03,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#007a8c',
    padding: screenWidth * 0.03,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom:40
  },
  buttonText: {
    color: '#fff',
    fontSize: screenWidth * 0.045,
    fontWeight: 'bold',
  },
  descriptiontitleMapCont: {
    maxHeight: screenHeight * 0.6,
  },
  descriptiontitleMap: {
    padding: 10,
    fontSize: 14,
    color: '#555',
  },
  ValorContainer: {
    padding: 10,
  },
  valoracionesTitle:{
    width:screenWidth*0.9,
    fontSize: screenWidth * 0.04,
    color:'#333',
    fontWeight: 'bold',
    marginBottom: 8,
  }
});

export default TouristDetailScreen;
