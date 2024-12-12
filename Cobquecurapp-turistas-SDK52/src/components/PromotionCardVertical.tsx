import React, { useState, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Promotion, ImagePromotion as PromotionImage } from '../redux/types/types';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '../redux/store/store';
import { addFavoriteAction, removeFavoriteAction } from '../redux/actions/userActions';
import { getMemoizedFavorites } from '../redux/selectors/userSelectors';
import * as Animatable from 'react-native-animatable';
import type { View as AnimatableView } from 'react-native-animatable';
import { formatDateToDDMMYYYY } from '../utils/formatDate';
import { Image } from 'expo-image'; 

const { width: screenWidth } = Dimensions.get('window');
const API_URL = process.env.EXPO_PUBLIC_API_URL;
interface PromotionCardProps {
  promotion: Promotion;
  index: number;
  handlePress: (promotion: Promotion) => void;
}

const PromotionCard: React.FC<PromotionCardProps> = ({ promotion, index, handlePress }) => {
  const dispatch: AppDispatch = useDispatch();
  const userFavorites = useSelector(getMemoizedFavorites);
  const [loadingImg, setLoadingImg] = useState(false);
  const heartRefs = useRef<Animatable.View[]>([]);
  const isFavorite = userFavorites.includes(promotion.promotion_id);

  const handleImageLoadStart = () => setLoadingImg(true);
  const handleImageLoadEnd = () => setLoadingImg(false);
 
  const handleFavoritePress = useCallback(() => {
    if (isFavorite) {
      dispatch(removeFavoriteAction(promotion.promotion_id));
    } else {
      dispatch(addFavoriteAction(promotion));
      animateHeart(index);
    }
  }, [dispatch, isFavorite, promotion, index]);

  const animateHeart = (index: number) => {
    if (heartRefs.current[index]?.rubberBand) {
      heartRefs.current[index].rubberBand(1000);
    }
  };
// Función para truncar el texto a 40 palabras
const truncateTitle = (title: string, maxWords: number) => {
  const words = title.split(' ');
  if (words.length > maxWords) {
    return words.slice(0, maxWords).join(' ') + '...';
  }
  return title;
};
  return (
    <TouchableOpacity
      key={promotion.promotion_id}
      style={styles.promotionCard}
      onPress={() => handlePress(promotion)}
    >
      <View style={styles.discountContainer}>
          <Image
            source={require('../../assets/discountTicket.png')}
            style={styles.discountImage}
          />
          <Text style={styles.discountText}>{promotion.discount_percentage}</Text>
      </View>
      <View style={styles.carouselItem}>
        <View style={styles.carouselImageContainer}>
        {promotion.images.length ?
          <Image
            source={{ uri:`${API_URL}${promotion.images[0].image_path}` }}
            style={styles.carouselImage}
            onLoadStart={handleImageLoadStart}
            onLoadEnd={handleImageLoadEnd}
          /> :
          <Image
            source={require('../../assets/noimage.png')}
            style={styles.carouselImage}
            onLoadStart={handleImageLoadStart}
            onLoadEnd={handleImageLoadEnd}
          />
        }
        </View>
      </View>
      <View style={styles.promotionContent}>
        <View style={styles.promotionInfo}>
          <Text style={styles.promotionTitle}>{truncateTitle( promotion.title, 6)}</Text>
          
          <View style={styles.divider} />
          <Text style={styles.promotionDates}>
            Desde: {formatDateToDDMMYYYY(promotion.start_date)}
          </Text>
          <Text style={styles.promotionDates}>
            Hasta: {formatDateToDDMMYYYY(promotion.expiration_date)}
          </Text>
        </View>
      </View>
        <View style={styles.favoriteContainer}>
          <Animatable.View ref={(ref: AnimatableView | null) => {
            heartRefs.current[index] = ref as Animatable.View;
          }}>
            <TouchableOpacity onPress={handleFavoritePress}>
              <MaterialCommunityIcons
                name={isFavorite ? 'cards-heart' : 'cards-heart-outline'}
                size={25}
                color={isFavorite ? '#007a8c' : '#007a8c'}
                style={styles.star}
              />
            </TouchableOpacity>
          </Animatable.View>
        </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  promotionCard: {
    display:'flex',
    flexDirection:'column',
    backgroundColor: '#fff',
    marginRight:5,
    borderRadius: 10,
    marginTop:15,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 2,
    padding: 5,
    position: 'relative',
    borderWidth: 1, // Añadido para el borde del ticket
    borderColor: '#ddd',
    minWidth: 160,
    maxWidth:160,
    maxHeight:240
    // borderStyle: 'dotted', // Para simular perforaciones
  },
  discountContainer: {
    // backgroundColor: '#FF6347',
    // borderRadius: 10,
    paddingVertical: 0,
    // paddingHorizontal: 5,
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 1,
  },
  discountText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
    position: 'absolute',
    top: 45,
    right:25
  },
  discountImage: {
    right:0,
    width: 50, 
    height: 100,
    position: 'absolute',
  },
  promotionContent: {
    height:150,
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 5,
    marginTop: 5,
  },
  promotionInfo: {
    height:170,
    width:'100%'
  },
  promotionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: 'rgba(51, 103, 73,0.9)',
    fontFamily: 'Inter-Regular-400',
    minHeight:60,
    width:'100%'
  },
  promotionDates: {
    marginTop: 1,
    fontSize: 12,
    color: '#888',
  },
  favoriteContainer: {
    position:'absolute',
    top: 12,
    left:12,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(172, 208, 213,0.5)',
    marginTop: 5,
  },
  carouselItem: {
    height: 110,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f2f2f2',
  },
  carouselImageContainer:{
    width:'100%',
    height:110

  },
  carouselImage: {
    width: 'auto',
    height: 110,
    resizeMode: 'cover',
  },
  star: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 0.5,
    elevation: 1,
  },
 
});

export default React.memo(PromotionCard);
