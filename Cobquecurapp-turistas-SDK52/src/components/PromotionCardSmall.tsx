import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Promotion } from '../redux/types/types'; 
import { formatDateToDDMMYYYY } from '../utils/formatDate';
import { Image } from 'expo-image'; 
interface PromotionCardSmallProps {
  promotion: Promotion;
  index: number;
  handlePress: (promotion: Promotion) => void;
}
const API_URL = process.env.EXPO_PUBLIC_API_URL;
const { width: screenWidth } = Dimensions.get('window');

const PromotionCardSmall: React.FC<PromotionCardSmallProps> = ({ promotion, handlePress }) => {


  return (
    <TouchableOpacity style={styles.card} onPress={() => handlePress(promotion)}>
      <Text style={styles.title}>{promotion.title}</Text>
      <View style={styles.content}>
        <View style={styles.imageContainer}>
          {promotion.images[0]?.image_path ?
            <Image source={{ uri: `${API_URL}${promotion.images[0]?.image_path}` }} style={styles.image} />:<Image source={require('../../assets/noimage.png')} style={styles.image} />
          }
        </View>
        <View style={styles.detailsContainer}>
          <Text style={styles.promotionDates}>
            Desde: {formatDateToDDMMYYYY(promotion.start_date)}
          </Text>
          <Text style={styles.promotionDates}>
            Hasta: {formatDateToDDMMYYYY(promotion.expiration_date)}
          </Text>
          <Text style={styles.promotionDates}>
            Disponibles: {promotion.available_quantity ? promotion.available_quantity : 'Sin límite'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    
  },
  title: {
    fontWeight: 'bold',
    fontSize: 17,
    color:'rgb(0, 122, 140)',
    marginBottom: 5,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent:'space-between',
    width:'100%'
  },
  imageContainer: {
    width: '30%',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  image: {
    width: '100%', 
    height: 50, 
    borderRadius: 5,
  },
  detailsContainer: {
    width:'60%'
  },
  promotionDates: {
    fontSize: screenWidth * 0.035,
    color: 'rgb(0, 122, 140)',
    marginBottom: 2,
  },
});

export default PromotionCardSmall;
