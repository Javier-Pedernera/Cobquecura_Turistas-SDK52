import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Image } from 'expo-image';

interface CustomCalloutProps {
  branch: any;
  handleRoutePress: () => void;
  isTouristPoint:boolean;
}
const API_URL = process.env.EXPO_PUBLIC_API_URL;
// `${API_URL}${branch.images[0].image_path}`
const CustomCallout: React.FC<CustomCalloutProps> = ({ branch, handleRoutePress, isTouristPoint }) => {
  // console.log("punto turistico", branch);
  const imageUrl = branch.branch_id
    ? `${API_URL}${branch.image_url}`
    : branch.images && branch.images.length > 0 && branch.images[0].image_path
      ? `${API_URL}${branch.images[0].image_path}`: undefined;

  const displayName = branch.branch_id
    ? branch.name
    : branch.title;
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

// console.log("imagen callout",imageUrl);

  return (
    <View style={styles.calloutContainer}>
      <View style={styles.calloutBack}>
        {Platform.OS === 'android' ? (
          <View style={styles.calloutImageAndroidCont}>
            <Image source={imageUrl && !imageUrl.endsWith("null")? { uri:  imageUrl }: require('../../assets/noimage.png')} style={styles.calloutImage} contentFit="cover" />
          </View>
        ) : (
          <View style={styles.calloutImageContainer}>
            <Image source={imageUrl && !imageUrl.endsWith("null")? { uri:  imageUrl }: require('../../assets/noimage.png')} style={styles.calloutImage} contentFit="cover"/>
          </View>
        )}
        <View style={styles.callout}>
          <Text style={styles.calloutTitle}>{displayName}</Text>
          <View style={styles.divider}></View>
          <View style={styles.ratingContainer}>
            {/* <Text style={styles.calloutDescription}>{branch.description}</Text> */}
            <View style={styles.starsContainer}>
              {renderStars(branch.average_rating)}
            </View>
          </View>
          <View style={styles.addressBttn}>
            <Text style={styles.calloutadress}>{branch.address}</Text>
            <TouchableOpacity style={styles.calloutButton} onPress={handleRoutePress}>
              <MaterialCommunityIcons name="directions" size={24} color="#336749" />
              <Text style={styles.calloutButtonText}>Cómo llegar?</Text>
            </TouchableOpacity>
          </View>
        </View>

      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  calloutContainer: {
    position: 'absolute',
    bottom: 150,
    left: 50,
    zIndex: 999,
    width: 250,
  },
  calloutBack: {
    height: 280,
    display: 'flex',
    justifyContent: 'center',
    alignContent: 'center',
    alignItems: 'center',
    padding: 10,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    elevation: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 1,
  },
  callout: {
    width: '90%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    alignContent: 'center',
  },
  calloutTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    // marginBottom: 5,
  },
  divider: {
    height: 1,
    width: '100%',
    backgroundColor: '#acd0d5',
    marginVertical: 5,
  },

  ratingContainer: {
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    // justifyContent:'space-evenly',
  },
  calloutDescription: {
    width: '60%',
    textAlign: 'left',
    fontSize: 14,
    color: 'gray',
    marginBottom: 0,
  },
  starsContainer: {
    width: '30%',
    display: 'flex',
    flexDirection: 'row',
  },
  calloutButton: {
    width: '35%',
    paddingVertical: 5,
    paddingHorizontal: 5,
    borderRadius: 5,
    alignItems: 'center',

  },
  calloutButtonText: {
    fontSize: 12,
    color: '#336749',
    marginBottom: 0,
    fontWeight:'500'
  },
  calloutImageContainer: {
    width: 150,
    height: 100,
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 5,
    backgroundColor: 'trasparent',
  },
  calloutImage: {
    width: '100%',
    height: '100%'
  },
  calloutImageAndroidCont: {
    marginBottom: 15,
    width: 200,
    height: 100,
    backgroundColor: 'white',
  },
  calloutImageAndroid: {
    backgroundColor: 'transparent',
    width: '100%',
    height: '100%',
  },
  addressBttn: {
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center'
  },
  calloutadress: {
    width: '68%',
    fontSize: 14,
    color: 'gray',
    marginBottom: 0,
  }
});

export default CustomCallout;
