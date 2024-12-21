import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, ActivityIndicator, Text, TouchableOpacity, Dimensions, Alert, TouchableWithoutFeedback, Platform, Image } from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import * as Location from 'expo-location';
import { useDispatch, useSelector } from 'react-redux';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import CustomCallout from '../components/CustomCallout';
import MapViewDirections from 'react-native-maps-directions';
import { getMemoizedBranches } from '../redux/selectors/branchSelectors';
import Loader from '../components/Loader';
import { Ionicons } from '@expo/vector-icons';
import { getMemoizedTouristPoints } from '../redux/selectors/touristPointSelectors';
import { fetchTouristPoints } from '../redux/actions/touristPointActions';
import { AppDispatch } from '../redux/store/store';
import { Svg,Circle, Path, Defs, Mask, G } from 'react-native-svg';

const CustomMarker = () => (
  <Svg
    width={40}
    height={50}
    viewBox="0 0 100 125"
  >
    <Path
      d="M50,7.78C34,7.78,21.02,19.26,21.02,36.77c0,24.43,28.99,34.26,28.99,59.26c0-25,28.99-35.35,28.99-59.26C78.99,19.26,66.01,7.78,50,7.78zM68.68,33.5c-0.09,1.16-1.37,2.93-3.09,2.93c-0.29,0-0.44-0.05-0.85,1.17c0,0-0.06,14.22-0.06,15.21c0,0.99-0.74,1.54-1.6,1.54c-5.21,0.01-21.29,0.04-26.3,0.05c-0.85,0-1.49-0.66-1.49-1.59c0-0.94-0.02-15.21-0.02-15.21c-0.41-1.22-0.57-1.18-0.86-1.18c-1.72,0-3.01-1.76-3.1-2.92l-0.04-0.55l0.04,0c0,0-0.01-0.08,0-0.13c0.04-0.11,0.12-0.19,0.21-0.26l4.22-10.91c0.07-0.21,0.26-0.35,0.47-0.35l27.58,0c0.21,0,0.4,0.14,0.47,0.34l4.28,10.96c0.06,0.05,0.11,0.11,0.14,0.19c0.02,0.06,0.01,0.16,0.01,0.16l0.04,0l-0.05,0.55zM60.35,36.43c-1.13,0-2.01-0.76-2.54-1.61c-0.54,0.85-1.47,1.61-2.6,1.61c-1.14,0-2.07-0.76-2.6-1.61c-0.54,0.85-1.47,1.61-2.61,1.61c-1.13,0-2.06-0.76-2.6-1.61c-0.53,0.85-1.46,1.61-2.59,1.61s-2.05-0.76-2.59-1.61c-0.53,0.85-1.44,1.61-2.57,1.61c-1,0-1.93-0.59-2.34-1.31l0,10.11l25.38,0l0-10.11c-0.41,0.72-1.34,1.31-2.34,1.31zM62.47,32.95l-3.08-10.84l-2.95,0l1.85,10.84l4.18,0zM51.36,22.11l-2.83,0l-0.61,10.84l4.03,0l-0.59-10.84zM43.58,22.11l-2.97,0l-3.05,10.84l4.13,0l1.89-10.84z"
      fill="#007a8c"
    />
  </Svg>
);
const TouristCustomMarker = () => (
  <Svg
    viewBox="0 0 500 670"
    width={40}
    height={40}
  >
    <Defs>
      <Mask id="IconifyId193df337c999539023">
        <Path fill="#fff" d="M0 0h26v26H0z" />
        <G fill="#000" fillRule="evenodd" clipRule="evenodd">
          <Path d="M9.172 8.232L8.762 9.5H7.5A2.5 2.5 0 0 0 5 12v6a2.5 2.5 0 0 0 2.5 2.5h11A2.5 2.5 0 0 0 21 18v-6a2.5 2.5 0 0 0-2.5-2.5h-1.263l-.409-1.268a2.5 2.5 0 0 0-2.38-1.732h-2.897a2.5 2.5 0 0 0-2.38 1.732M7.5 10.5h1.99l.633-1.96a1.5 1.5 0 0 1 1.428-1.04h2.898a1.5 1.5 0 0 1 1.427 1.04l.633 1.96H18.5A1.5 1.5 0 0 1 20 12v6a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 6 18v-6a1.5 1.5 0 0 1 1.5-1.5" />
          <Path d="M10 14.5a3 3 0 1 0 6 0a3 3 0 0 0-6 0m5 0a2 2 0 1 1-4 0a2 2 0 0 1 4 0" />
        </G>
      </Mask>
    </Defs>
    <G fill="none" transform="matrix(17.998825, 0, 0, 18.195911, 10.059265, 7.497118)">
      <Circle
        cx="13"
        cy="13"
        r="13"
        mask="url(#IconifyId193df337c999539023)"
        fill="rgb(0, 118, 135)"
      />
    </G>
    <Path
      d="M 135.794 424.035 C 135.794 424.035 182.817 466.545 205.507 530.214 C 223.909 581.851 230.49 665.136 240.841 644.379 C 263.24 599.464 270.365 552.661 300.932 512.527 C 321.396 485.657 367.667 439.408 367.667 439.408"
      stroke="transparent"
      fill="rgb(0, 118, 135)"
    />
  </Svg>
);
const initialRegion = {
  latitude: -36.133852565671226,
  longitude: -72.79750640571565,
  latitudeDelta: 0.035,
  longitudeDelta: 0.02,
};

const GOOGLE_MAPS_APIKEY = process.env.EXPO_PUBLIC_API_KEYGOOGLE;
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const API_URL = process.env.EXPO_PUBLIC_API_URL;

const MapScreen: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch<AppDispatch>();
  const branches = useSelector(getMemoizedBranches);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [loading, setLoading] = useState(true);
  const [destination, setDestination] = useState<{ latitude: number; longitude: number } | null>(null);
  const [route, setRoute] = useState<boolean>(false);
  const [selectedBranch, setSelectedBranch] = useState<any>(null);
  const [routeLoading, setRouteLoading] = useState(false);
  const mapRef = useRef<MapView>(null);
  const touristPoints = useSelector(getMemoizedTouristPoints);
  const [showPOI, setShowPOI] = useState(true);
  // console.log("sucursales", branches);
  // console.log("api key==============", GOOGLE_MAPS_APIKEY);
  // console.log("localizacion del usuario", location);

  useEffect(() => {
    dispatch(fetchTouristPoints());
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.error('Permission to access location was denied');
        setLoading(false);
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
      setLoading(false);
    })();
  }, []);

  const handleMarkerPress = (branch: any) => {
    setSelectedBranch(branch);
    setRoute(false)
  };

  const handleRoutePress = (latitude: number, longitude: number) => {
    setDestination({ latitude, longitude });
    setRoute(true)
    setSelectedBranch(null);
    setRouteLoading(true);
  };

  const handleMapPress = () => {
    setSelectedBranch(null);
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <Loader />
      </View>
    );
  }

  if (!location || !branches) {
    return (
      <View style={styles.loaderContainer}>
        <Text style={styles.errorText}>Unable to fetch current location or branches</Text>
      </View>
    );
  }

  if (!GOOGLE_MAPS_APIKEY) {
    return (
      <View style={styles.loaderContainer}>
        <Text style={styles.errorText}>Google Maps API key is not defined</Text>
      </View>
    );
  }

  const centerMap = () => {
    if (mapRef.current && location) {
      mapRef.current.animateToRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.035,
        longitudeDelta: 0.02,
      });
    }
  };

  const goToInitialRegion = () => {
    if (mapRef.current) {
      mapRef.current.animateToRegion(initialRegion);
    }
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
  const mapStyle = showPOI ? [] : [
    {
      elementType: 'labels',
      stylers: [{ visibility: 'off' }],
    },
    {
      featureType: 'poi',
      stylers: [{ visibility: 'off' }],
    },
  ];
  return (
    <TouchableWithoutFeedback onPress={handleMapPress}>
      <View style={styles.container}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back-ios-new" size={24} color="'rgb(255, 255, 255)'" />
        </TouchableOpacity>
        <MapView
          ref={mapRef}
          style={styles.map}
          initialRegion={{
            latitude: -36.133852565671226,
            longitude: -72.79750640571565,
            latitudeDelta: 0.035,
            longitudeDelta: 0.02,
          }}
          customMapStyle={mapStyle}
          onPress={handleMapPress}
        >
          {branches.map((branch: any) => (
            <Marker
              key={branch.branch_id}
              coordinate={{
                latitude: branch.latitude ?? 0,
                longitude: branch.longitude ?? 0,
              }}
              onPress={() => handleMarkerPress(branch)}
            >
              {/* <MaterialCommunityIcons name="map-marker" size={40} color="#007a8c" /> */}
              {/* <MaterialCommunityIcons name="store-marker-outline" size={30} color="#007a8c" /> */}
              <CustomMarker />
              {Platform.OS === 'ios' && (
                <Callout style={route ? styles.calloutContainerHide : styles.calloutContainerIos} tooltip>
                  <View style={styles.callout}>
                    <View style={styles.calloutImageContainer}>
                      <Image
                        source={{ uri: `${API_URL}${branch.image_url}` }}
                        style={styles.calloutImage}
                      />
                    </View>
                    <Text style={styles.calloutTitle}>{branch.name}</Text>
                    <View style={styles.divider} />
                    <View style={styles.ratingContainer}>
                      {/* Aqui debo agregar las estrellas  */}
                      {renderStars(3.5)}
                    </View>
                    <Text style={styles.calloutDescription}>{branch.description}</Text>
                    <Text style={styles.calloutDescription}>{branch.address}</Text>
                    <TouchableOpacity
                      style={styles.calloutButton}
                      onPress={() => handleRoutePress(branch.latitude ?? 0, branch.longitude ?? 0)}
                    >
                      <Text style={styles.calloutButtonText}>Cómo llegar?</Text>
                    </TouchableOpacity>
                  </View>
                </Callout>
              )}
            </Marker>
          ))}
          {/* Mostrar puntos turísticos */}
          {touristPoints.map((touristPoint: any) => (
            <Marker
              key={touristPoint.id} // Asegúrate de usar el campo correcto como key
              coordinate={{
                latitude: touristPoint.latitude ?? 0,
                longitude: touristPoint.longitude ?? 0,
              }}
              onPress={() => handleMarkerPress(touristPoint)}
            >
              {/* <MaterialCommunityIcons name="map-marker-star-outline" size={40} color="#36a062" /> */}
              <TouristCustomMarker/>
              {Platform.OS === 'ios' && (
                <Callout style={route ? styles.calloutContainerHide : styles.calloutContainerIos} tooltip>
                  <View style={styles.callout}>
                    <View style={styles.calloutImageContainer}>
                    <Image
                      source={
                        touristPoint.images[0]?.image_path
                          ? { uri: `${API_URL}${touristPoint.images[0].image_path}` }
                          : require('../../assets/noimage.png')
                      }
                      style={styles.calloutImage}
                    />
                    </View>
                    <Text style={styles.calloutTitle}>{touristPoint.title}</Text>
                    <View style={styles.divider} />
                    <View style={styles.ratingContainer}>
                      {renderStars(touristPoint.average_rating)}
                    </View>
                    {/* <Text style={styles.calloutDescription}>{touristPoint.description}</Text> */}
                    <Text style={styles.calloutDescription}>{touristPoint.address}</Text>
                    <TouchableOpacity
                      style={styles.calloutButton}
                      onPress={() => handleRoutePress(touristPoint.latitude ?? 0, touristPoint.longitude ?? 0)}
                    >
                      <Text style={styles.calloutButtonText}>Cómo llegar?</Text>
                    </TouchableOpacity>
                  </View>
                </Callout>
              )}
            </Marker>
          ))}


          <Marker
            coordinate={{
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            }}
            title="Tu ubicación"
          >
            <MaterialCommunityIcons name="map-marker-account" size={40} color="#007a8c" />
          </Marker>
          {destination && location && (
            <MapViewDirections
              origin={{
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
              }}
              destination={destination}
              apikey={GOOGLE_MAPS_APIKEY!}
              strokeWidth={3}
              strokeColor="#007a8c"
              timePrecision="none"
              precision='high'
              onReady={() => {
                setRouteLoading(false);
              }}
              onError={(errorMessage) => {
                console.error('GMSDirections Error: ', errorMessage);
                Alert.alert('Error', 'No se pudo calcular la ruta.');
              }}
            />
          )}
        </MapView>
        {routeLoading && (
          <View style={styles.routeLoaderContainer}>
            <ActivityIndicator size="large" color="#00bdd6" />
          </View>
        )}
        {selectedBranch && Platform.OS === 'android' && (
          <View style={styles.calloutContainer}>
            <CustomCallout
              branch={selectedBranch}
              handleRoutePress={() => handleRoutePress(selectedBranch.latitude ?? 0, selectedBranch.longitude ?? 0)}
              isTouristPoint={false}
            />
          </View>
        )}
        <TouchableOpacity style={styles.centerButton} onPress={centerMap}>
          <MaterialCommunityIcons name="crosshairs-gps" size={24} color="#FFF" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.initialRegionButton} onPress={goToInitialRegion}>
          <MaterialIcons name="discount" size={24} color="#FFF" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.referButton} onPress={() => setShowPOI(prev => !prev)}>
          <MaterialCommunityIcons name="map-marker-remove-outline" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: '#fff',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  calloutContainerIos: {
    backgroundColor: 'rgba(255, 255, 255,0.7)'
  },
  calloutContainerHide: {
    display: "none"
  },
  callout: {
    flexDirection: 'column',
    alignItems: 'center',
    width: 200,
    padding: 10,
  },
  calloutImageContainer: {
    marginBottom: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  calloutImage: {
    width: 150,
    height: 100,
    borderRadius: 5,
  },
  calloutTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  divider: {
    height: 1,
    width: '100%',
    backgroundColor: 'rgba(206, 206, 206, 0.5)',
    marginVertical: 5,
  },
  ratingContainer: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  calloutDescription: {
    fontSize: 14,
    color: '#555',
    textAlign: 'center',
    marginBottom: 5,
  },
  calloutButton: {
    backgroundColor: '#007a8c',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  calloutButtonText: {
    color: '#fff',
  },
  calloutContainer: {
    position: 'absolute',
    bottom: 100,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  loaderContainer: {
    height: '100%',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    color: 'red',
  },
  centerButton: {
    position: 'absolute',
    zIndex: 1,
    bottom: 110,
    right: 20,
    backgroundColor: '#36a062',
    padding: 10,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  initialRegionButton: {
    position: 'absolute',
    zIndex: 1,
    bottom: 60,
    right: 20,
    backgroundColor: '#007a8c',
    padding: 10,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  referButton: {
    position: 'absolute',
    zIndex: 1,
    bottom: 30,
    left: 13,
    backgroundColor: '#336749',
    padding: 10,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  routeLoaderContainer: {
    backgroundColor:'rgba(61, 61, 61,0.6)',
    height:screenHeight,
    width:screenWidth,
    justifyContent:'center',
    position: 'absolute',
    // top: '50%',
    // left: '50%',
    // transform: [{ translateX: -25 }, { translateY: -25 }],
    zIndex: 3,
  },
  backButton: {
    position: 'absolute',
    // alignSelf:'center',
    zIndex: 1,
    width: 45,
    top: 30,
    height: 35,
    left: 10,
    backgroundColor: '#007a8c',
    padding: 5,
    borderRadius: 25,
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
});

export default MapScreen;
