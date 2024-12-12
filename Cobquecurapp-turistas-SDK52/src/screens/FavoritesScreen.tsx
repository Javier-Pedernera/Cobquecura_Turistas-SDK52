import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, Image, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { AppDispatch, RootState } from '../redux/store/store';
import { fetchPromotions } from '../redux/actions/promotionsActions';
import { Promotion } from '../redux/types/types';
import { RootStackParamList } from '../navigation/AppNavigator';
import { getMemoizedPromotions } from '../redux/selectors/promotionSelectors';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { getMemoizedFavorites } from '../redux/selectors/userSelectors';
import { fetchUserFavorites, removeFavoriteAction } from '../redux/actions/userActions';
import Checkbox from 'expo-checkbox';

const { width: screenWidth } = Dimensions.get('window');
const screenHeight = Dimensions.get('window').height;
const API_URL = process.env.EXPO_PUBLIC_API_URL;

const FavoritesScreen: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const promotions = useSelector(getMemoizedPromotions);
  const userFavorites = useSelector(getMemoizedFavorites);
  const [loading, setLoading] = useState(true);
  const [showOnlyAvailable, setShowOnlyAvailable] = useState(false);
  const [filteredFavorites, setFilteredFavorites] = useState<Promotion[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      await Promise.all([dispatch(fetchPromotions()), dispatch(fetchUserFavorites())]);
      setLoading(false);
    };
    fetchData();
  }, [dispatch]);

  useEffect(() => {
    setLoading(true);
    const filterFavorites = () => {
      const favorites = promotions.filter(promotion => userFavorites.includes(promotion.promotion_id));
      setFilteredFavorites(favorites);
    };
    filterFavorites();
    setLoading(false);
  }, [promotions, userFavorites]);

  const handlePress = useCallback((promotion: Promotion) => {
    navigation.navigate('PromotionDetail', { promotionId: promotion.promotion_id  });
  }, [navigation]);

  const handleRemoveFavorite = (promotionId: number) => {
    Alert.alert(
      "Eliminar favorito",
      "¿Estás seguro de que deseas eliminar esta promoción de tus favoritos?",
      [
        {
          text: "Cancelar",
          style: "cancel"
        },
        {
          text: "Eliminar",
          onPress: () => {
            dispatch(removeFavoriteAction(promotionId));
            setFilteredFavorites(prevFavorites => prevFavorites.filter(promo => promo.promotion_id !== promotionId));
          },
          style: "destructive"
        }
      ],
      { cancelable: true }
    );
  };

  const isPromotionAvailable = (promotion: Promotion) => {
    const today = new Date();
    return promotion.available_quantity! > 0 && new Date(promotion.expiration_date) >= today;
  };

  const displayedFavorites = showOnlyAvailable
    ? filteredFavorites.filter(isPromotionAvailable)
    : filteredFavorites;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.filterContainer}>
        <Checkbox
          value={showOnlyAvailable}
          onValueChange={setShowOnlyAvailable}
          style={styles.checkbox}
        />
        <Text style={styles.checkboxLabel}>Mostrar solo disponibles</Text>
      </View>
      <View style={styles.divider1} />
      {loading ? (
        <ActivityIndicator style={styles.loader} size="large" color="#64C9ED" />
      ) : (
        displayedFavorites.length ? (
          displayedFavorites.map((promotion) => (
            <TouchableOpacity
              key={promotion.promotion_id}
              style={styles.promotionCard}
              onPress={() => handlePress(promotion)}
            >
              <View style={styles.promotionContent}>
                <Image
                  source={isPromotionAvailable(promotion) ? { uri: `${API_URL}${promotion.images[0].image_path}`  } : require('../../assets/no_disponible.png')}
                  style={isPromotionAvailable(promotion)? styles.promotionImage: styles.promotionImageNo}
                />
                <View style={styles.promotionContentText}>
                  <Text style={styles.promotionTitle}>{promotion.title}</Text>
                  <Text style={styles.promotionDates}>Desde: {promotion.start_date}</Text>
                  <Text style={styles.promotionDates}>Hasta: {promotion.expiration_date}</Text>
                  <Text style={styles.discountText}>{promotion.discount_percentage}%</Text>
                </View>
                <TouchableOpacity style={styles.deleteBtn} onPress={() => handleRemoveFavorite(promotion.promotion_id)}>
                  <MaterialIcons name="delete" size={24} color="#cc0c0c" />
                </TouchableOpacity>
              </View>
              <View style={styles.divider} />
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.favtextcont}>
            <Text style={styles.favtext}>Agrega tus promociones favoritas.</Text>
          </View>
        )
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    display: 'flex',
    flexDirection: 'column'
  },
  filterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    alignSelf: 'center',
  },
  checkbox: {
    marginRight: 8,
    borderRadius: 25,
    width:15,
    height:15,
    color:'rgb(0, 122, 140)',
    borderColor:'rgb(0, 122, 140)',
  },
  checkboxLabel: {
    fontSize: 16,
    color:'rgb(0, 122, 140)'
  },
  promotionCard: {
    width: '95%',
    flexDirection: 'column',
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
    alignContent: 'center',
    alignSelf: 'center'
  },
  promotionImage: {
    borderRadius: 5,
    width: "30%",
    height: 100,
    marginRight: 16,
  },
  promotionImageNo:{
    alignSelf:'center',
    borderRadius: 5,
    width: "30%",
    height: 60,
    marginRight: 16,
  },
  promotionContent: {
    display: 'flex',
    flexDirection: 'row',
  },
  promotionContentText: {
    width: "70%",
    flexDirection: 'column',
    flexWrap: 'wrap',
    
  },
  promotionTitle: {
    width: "100%",
    fontSize: 14,
    fontWeight: 'bold',
    flexWrap: 'wrap',
    textAlign: 'left',
    color:'rgb(51, 103, 73)'
  },
  promotionDates: {
    fontSize: 14,
    color: 'rgb(0, 122, 140)',
  },
  discountText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'green',
  },
  deleteBtn: {
    position: 'absolute',
    bottom: 5,
    right: 15,
  },
  divider1: {
    height: 1,
    width: '100%',
    backgroundColor: 'rgb(0, 122, 140)',
    marginBottom: 10,
    padding: 0.8,
  },
  loader: {
    position: 'absolute',
    width: screenWidth,
    height: screenHeight * 0.7
  },
  divider: {
    height: 1,
    width: '100%',
    backgroundColor: 'rgba(0, 122, 140,0.3)',
    marginTop: 10,
    padding: 0.8,
  },
  favtext: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#14160d',
    flexWrap: 'wrap',
    textAlignVertical: 'center',
    textAlign: 'center'
  },
  favtextcont: {
    display: 'flex',
    justifyContent: 'center',
    width: "100%",
    height: screenHeight * 0.4,
  }
});

export default FavoritesScreen;
