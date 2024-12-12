import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Platform, Dimensions, ActivityIndicator } from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import CustomCallout from '../components/CustomCallout';
import { Ionicons } from '@expo/vector-icons';



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

//console.log("branch en el mapa",branch.latitude, branch.longitude);
//console.log("destino",destination);
//console.log("branch seleccionadaen el mapa",selectedBranch, routeSelected);
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
  

  console.log("selected branch en el mapa___________", branch);

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
            <MaterialCommunityIcons name="map-marker" size={40} color="#007a8c" />
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
            <MaterialCommunityIcons name="map-marker-radius" size={screenWidth * 0.1} color="#007a8c" />
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
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: screenWidth * 0.03,
    borderRadius: screenWidth * 0.02, 
    alignItems: 'center',
  },
  callout: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  calloutImageContainer: {
    width: 120,
    height: 90,
    paddingTop: 20,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  calloutImage: {
    width: screenWidth * 0.33, 
    height: screenHeight * 0.1, 
    borderRadius: screenWidth * 0.01, 
    marginBottom: screenHeight * 0.01, 
  },
  calloutTitle: {
    fontSize: screenWidth * 0.04, 
    fontWeight: 'bold',
  },
  calloutButton: {
    backgroundColor: '#007a8c',
    marginTop: screenHeight * 0.01, 
    padding: screenWidth * 0.02, 
    borderRadius: screenWidth * 0.02,
  },
  calloutButtonText: {
    color: '#fff',
    fontSize: screenWidth * 0.03,
  },
  divider: {
    height: 1,
    width: '100%',
    backgroundColor: 'gray',
    opacity: 0.5,
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
});

export default MapSingle;