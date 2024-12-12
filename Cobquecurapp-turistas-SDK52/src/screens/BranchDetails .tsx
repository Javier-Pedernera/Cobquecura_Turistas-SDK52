import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, Alert, TouchableOpacity } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { getMemoizedPromotions } from '../redux/selectors/promotionSelectors';
import { NavigationProp, useNavigation, useRoute } from '@react-navigation/native';
import PromotionCardSmall from '../components/PromotionCardSmall';
import { RootStackParamList } from '../navigation/AppNavigator';
import { Ionicons } from '@expo/vector-icons';
import { getMemoizedBranchRatingsWithMetadata } from '../redux/selectors/branchSelectors';
import { AppDispatch } from '../redux/store/store';
import * as Location from 'expo-location';
import MapSingle from '../components/MapSingle';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Image } from 'expo-image';

const { width } = Dimensions.get('window');
const API_URL = process.env.EXPO_PUBLIC_API_URL;

type RouteParams = {
  branch: {
    branch_id: number;
    name: string;
    description: string;
    address: string;
    image_url?: string;
    latitude: number;
    longitude: number;
  };
};

const BranchDetails = () => {
  const route = useRoute();
  const dispatch: AppDispatch = useDispatch();
  const { branch } = route.params as RouteParams;
  const promotions = useSelector(getMemoizedPromotions);
  const ratings = useSelector(getMemoizedBranchRatingsWithMetadata);
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const [currentPosition, setCurrentPosition] = useState<{ latitude: number; longitude: number } | null>(null);
  const [routeSelected, setRouteSelected] = useState(false);
  const [routeLoading, setRouteLoading] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<any>(null);
  const [destination, setDestination] = useState<{ latitude: number, longitude: number } | null>(null);

  const filteredPromotions = promotions.filter(promotion => promotion.branch_id === branch.branch_id);

  useEffect(() => {
   if(!currentPosition){ const requestLocationPermission = async () => {
    setRouteLoading(true)
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permiso denegado', 'Se requiere permiso de ubicación para mostrar tu ubicación actual.');
        return;
      }
      const location = await Location.getCurrentPositionAsync({});
      setCurrentPosition({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
      setRouteLoading(false)

    };
    requestLocationPermission();}
  }, [currentPosition]);

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

  const handlePress = useCallback(
    (promotion: any) => {
      const promotionId = promotion.promotion_id
      navigation.navigate('PromotionDetail', { promotionId });
    },
    [navigation]
  );

  const handleMapPress = () => {
    setSelectedBranch(null);
  };

  const handleGetDirections = () => {
    // console.log("presiono boton", currentPosition);
    
    if (branch && currentPosition) {
      setRouteLoading(true)
      setRouteSelected(true)
      setDestination({
        latitude: branch.latitude,
        longitude: branch.longitude,
      });
    }
  };

  const handleGoBack = () => {
    setSelectedBranch(false);
    setCurrentPosition(null);
    setRouteLoading(false);
    setRouteSelected(false);
    setDestination(null);
    navigation.navigate('MainTabs', { screen: 'Store' });
  };

  const imageUrl = branch.image_url
  ? `${API_URL}${branch.image_url}`
  : null;
  console.log(imageUrl);
  return (
    <ScrollView style={styles.container}>
      {imageUrl ? 
        <Image source={{ uri: imageUrl }} style={styles.image} /> :
        <View style={styles.noimageView}>
          <Image source={require('../../assets/noimage.png')} style={styles.noimage} alt={branch.name}/>
        </View>
      }
      <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
            <MaterialIcons name="arrow-back-ios-new" size={24} color="#007a8c" />
          </TouchableOpacity>
      <View style={styles.container2}>
        <View style={styles.header}>
          <View style={styles.ratingContainerTitle}>
            <Text style={styles.title}>{branch.name}</Text>
            <View style={styles.stars}>{renderStars(ratings.average_rating)}</View>
          </View>
          
        </View>
        <Text style={styles.description}>{branch.description}</Text>
        <Text style={styles.addressTitle}>Dirección:</Text>
        <Text style={styles.address}>{branch.address}</Text>

        {/* Aquí se integra el MapSingle */}
        <MapSingle
          ratings={ratings}
          branch={branch}
          currentPosition={currentPosition}
          destination={destination}
          routeSelected={routeSelected}
          selectedBranch={selectedBranch}
          handleMapPress={handleMapPress}
          handleGetDirections={handleGetDirections}
          setSelectedBranch={setSelectedBranch}
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

        <View style={styles.promotionsContainer}>
          <Text style={styles.promotionsTitle}>Promociones disponibles</Text>
          {filteredPromotions.length > 0 ? (
            filteredPromotions.map((promotion, index) => (
              <PromotionCardSmall
                key={promotion.promotion_id}
                promotion={promotion}
                index={index}
                handlePress={handlePress}
              />
            ))
          ) : (
            <Text>No hay promociones disponibles para esta sucursal.</Text>
          )}
        </View>
      </View>
    </ScrollView>
  );
};


const styles = StyleSheet.create({
    container: {
        padding: 0,
      },
      container2: {
        padding: 20,
      },
  header: {
    marginBottom: 10,
  },
  title: {
    fontSize: width*0.06,
    width: width*0.7,
    fontWeight: 'bold',
    color:'#007a8c'
  },
  stars:{
    width: width*0.042,
    display: 'flex',
    flexDirection: 'row',
    alignItems:'center',
    justifyContent:'flex-end',
  },
  addressTitle:{
    fontSize: width*0.035,
    color: '#333',
    paddingTop: 20,
  },
  address: {
    fontSize: width*0.035,
    color: '#336749',
    paddingTop: 3,
    fontWeight:'600'
  },
  description: {
    fontSize: width*0.040,
    color: '#336749',
    fontWeight: 'bold', 
    textAlign:'center'
  },
  ratingContainerTitle: {
    marginVertical: 10,
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    alignItems:'center',
    marginBottom:20,
    justifyContent: 'space-between'
  },
  image: {
    width: '100%',
    height: 180,
    borderRadius: 0,
    marginTop: 0
  },
  noimageView:{
    height: 180,
    width: '100%',
    display:'flex',
    justifyContent:'center',
    alignItems:'center'
  },
  noimage:{
    width: '70%',
    height: '70%',
    borderRadius: 0,
    marginTop: 0,
  },
  backButton: {
    position: 'absolute',
    width: 45,
    top: 20,
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
  map: {
    width: '100%',
    height: 200,
    marginTop: 20,
  },
  promotionsContainer: {
    marginTop: 20,
    marginBottom:50
  },
  promotionsTitle: {
    marginVertical:20,
    fontSize: 14,
    color:'rgb(0, 122, 140)',
    fontWeight: 'bold',
  },
  promotionItem: {
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginBottom: 10,
  },
});

export default BranchDetails;
