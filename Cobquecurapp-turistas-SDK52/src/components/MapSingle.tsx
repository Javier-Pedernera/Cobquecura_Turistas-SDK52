import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Platform, Dimensions, ActivityIndicator, Linking, Alert } from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import CustomCallout from '../components/CustomCallout';
import { Ionicons } from '@expo/vector-icons';
import { Svg,Circle, Path } from 'react-native-svg';

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

const GOOGLE_MAPS_APIKEY = process.env.EXPO_PUBLIC_API_KEYGOOGLE;
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface MapComponentProps {
  branch: any | null;
  currentPosition: { latitude: number, longitude: number } | null;
  destination: { latitude: number, longitude: number } | null;
  routeSelected: boolean;
  selectedBranch: any;
  handleMapPress: () => void;
  handleGetDirections: () => void;
  setSelectedBranch: (branch: any) => void;
  routeLoading: boolean;
  setRouteLoading: (loading: boolean) => void;
  ratings: any;
  touristPoint: boolean;
  scrollEnabled:boolean;
  zoomEnabled:boolean;
  rotateEnabled:boolean;
  pitchEnabled:boolean;
  setDestination:any;
  setRouteSelected: any; 
}

const MapSingle: React.FC<MapComponentProps> = ({
  ratings,
  branch,
  currentPosition,
  destination,
  routeSelected,
  selectedBranch,
  handleMapPress,
  handleGetDirections,
  setSelectedBranch,
  routeLoading,
  setRouteLoading,
  touristPoint,
  scrollEnabled,
  zoomEnabled,
  rotateEnabled,
  pitchEnabled,
  setDestination,
  setRouteSelected 
}) => {

// console.log("branch en el mapa",branch);
// console.log("destino",destination);
console.log("branch seleccionada en el mapa",selectedBranch);
//console.log("branch",branch);
const API_URL = process.env.EXPO_PUBLIC_API_URL;


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
  
  const openAppleMaps = (latitude: number, longitude: number) => {
    const destination = `${latitude},${longitude}`;
    Linking.openURL(`maps://?daddr=${destination}&dirflg=d`).catch((err) => {
      Alert.alert('Error', 'No se pudo abrir Apple Maps.');
      console.error(err);
    });
  };
  
  const CustomAppleMapsButton = ({ latitude, longitude }: { latitude: number; longitude: number }) => {
    if (Platform.OS !== 'ios') return null;
  
    return (
      <TouchableOpacity
        style={styles.button}
        onPress={() => openAppleMaps(latitude, longitude)}
      >
        <Text style={styles.buttonText}>Ir con</Text>
        <View style={styles.appleMaps}>
        <MaterialCommunityIcons name="apple" size={16} color="#898989" style={styles.icon}/>
        <Text style={styles.buttonText}>Maps</Text>
        </View>
      </TouchableOpacity>
    );
  };
  // console.log("selected branch en el mapa___________", branch);

  return (
    <View style={styles.mapContainer}>
      
      <MapView
        style={styles.map}
        region={{
          latitude: branch?.latitude || 0,
          longitude: branch?.longitude || 0,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
        onPress={handleMapPress}
        scrollEnabled={scrollEnabled}
        zoomEnabled={zoomEnabled}
        rotateEnabled={rotateEnabled} 
        pitchEnabled={pitchEnabled} 
      >
        
        {branch && (
          <Marker
            coordinate={{ latitude: branch.latitude, longitude: branch.longitude }}
            onPress={() => setSelectedBranch(branch)}
          >
            <CustomMarker />
            {/* <MaterialCommunityIcons name="map-marker" size={40} color="#007a8c" /> */}
            {Platform.OS === 'ios' && (
              <Callout style={routeSelected ? styles.calloutContainerHide : styles.calloutContainerIos} tooltip>
                <View style={styles.callout}>
                  <View style={styles.calloutImageContainer}>
                  <Image
                    source={
                      touristPoint && branch.images && branch.images[0] && branch.images[0].image_path
                        ? { uri: `${API_URL}${encodeURI(branch.images[0].image_path)}` }
                        : branch.image_url
                        ? { uri: `${API_URL}${encodeURI(branch.image_url)}` }
                        : require('../../assets/noimage.png')
                    }
                    style={styles.calloutImage}
                  />
                  </View>
                  <Text style={styles.calloutTitle}>{touristPoint? branch.title : branch.name}</Text>
                  <View style={styles.divider}></View>
                  <View style={styles.ratingContainer}>
                    {touristPoint? renderStars(branch.average_rating): renderStars(ratings.average_rating)}
                  </View>
                  {/* <Text style={styles.calloutDescription}>{branch.description}</Text> */}
                  <Text style={styles.calloutDescription}>{branch.address}</Text>
                  <TouchableOpacity style={styles.calloutButton} onPress={handleGetDirections}>
                    <Text style={styles.calloutButtonText}>¿Cómo llegar?</Text>
                  </TouchableOpacity>
                </View>
              </Callout>
            )}
          </Marker>
        )}
        {currentPosition && (
          <Marker coordinate={currentPosition} title="Mi ubicación" pinColor="blue">
            {/* <MaterialCommunityIcons name="map-marker-account-outline" size={24} color="black" /> */}
            <MaterialCommunityIcons name="map-marker-account" size={screenWidth * 0.1} color="#04b9d1" />
          </Marker>
        )}
        {destination && currentPosition && (
          <MapViewDirections
            origin={{
              latitude: currentPosition.latitude,
              longitude: currentPosition.longitude,
            }}
            destination={destination}
            apikey={GOOGLE_MAPS_APIKEY!}
            strokeWidth={3}
            strokeColor="#007a8c"
            timePrecision="none"
            precision="high"
            onStart={() => setRouteLoading(true)}
            onReady={() => setRouteLoading(false)}
          />
        )}
        {Platform.OS === 'ios' && branch &&(
  <CustomAppleMapsButton
    latitude={branch.latitude}
    longitude={branch.longitude}
  />
)}
      </MapView>
      {routeLoading && (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color="#64C9ED" />
        </View>
      )}
      {selectedBranch && !routeSelected && Platform.OS === 'android' && (
        <View style={styles.calloutContainer}>
          <CustomCallout branch={selectedBranch} handleRoutePress={handleGetDirections} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  mapContainer: {
    padding: 1,
  },
  map: {
    width: '100%',
    height: screenHeight * 0.5, 
    marginTop: screenHeight * 0.02, 
  },
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: screenHeight * 0.01, 
  },
  calloutContainerHide: {
    display: 'none',
  },
  calloutContainerIos: {
    width: screenWidth * 0.5, 
    height: screenWidth * 0.6,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    // padding: screenWidth * 0.03,
    borderRadius: screenWidth * 0.02, 
    alignItems: 'center',
    justifyContent:'center'
  },
  callout: {
    width:'100%',
    height:'100%',
    flexDirection: 'column',
    alignItems: 'center',
    alignContent:'center',
    justifyContent: 'space-between',

  },
  calloutImageContainer: {
    // width: 120,
    // height: 90,
    // paddingTop: 20,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width:'90%',
    height:'30%',
  },
  calloutImage: {
    width: '90%', 
    height: '100%', 
    borderRadius: screenWidth * 0.01, 
    marginTop: screenHeight * 0.02, 
  },
  calloutTitle: {
    fontSize: screenWidth * 0.04, 
    marginTop: screenHeight * 0.02, 
    fontWeight: 'bold',
  },
  calloutButton: {
    backgroundColor: '#007a8c',
    marginTop: screenHeight * 0.01, 
    padding: screenWidth * 0.02, 
    borderRadius: screenWidth * 0.02,
    marginBottom: screenHeight * 0.01, 
  },
  calloutButtonText: {
    color: '#fff',
    fontSize: screenWidth * 0.03,
  },
  divider: {
    height: 1,
    width: '90%',
    backgroundColor: '#007a8c',
    opacity: 0.3,
    marginVertical: screenHeight * 0.01,
  },
  calloutDescription: {
    textAlign: 'center',
    fontSize: screenWidth * 0.03,
    color: 'gray',
    marginBottom: 0,
  },
  calloutContainer: {
    width: screenWidth * 0.5,
    position: 'absolute',
    bottom: screenHeight * 0.02,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  loader: {
    position: 'absolute',
    top: '50%',
    left: '45%',
  },
  button: {
    flexDirection: 'column',
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    position:'absolute',
    right:10,
    bottom:10
  },
  icon: {
    marginRight:5,
    width: 14,
    height: 14,
  },
  buttonText: {
    color: '#898989',
    fontSize: 14,
    fontWeight: 'bold',
  },
  appleMaps:{
    flexDirection: 'row',
    justifyContent:'center',
    alignContent:'center',
    alignItems:'baseline'
  }
});

export default MapSingle;