import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions, Image, TouchableOpacity, ScrollView, TextInput, FlatList, ActivityIndicator, Platform } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { Promotion, ImagePromotion as PromotionImage, UserData } from '../redux/types/types';
import { AppDispatch, RootState } from '../redux/store/store';
import { fetchPromotions } from '../redux/actions/promotionsActions';
import { RootStackParamList } from '../navigation/AppNavigator';
import Checkbox from 'expo-checkbox';
import Modal from 'react-native-modal';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { fetchAllCategories, fetchUserCategories } from '../redux/actions/categoryActions';
import DateTimePicker from '@react-native-community/datetimepicker';
import { getMemoizedPromotions } from '../redux/selectors/promotionSelectors';
import { getMemoizedAllCategories, getMemoizedUserCategories } from '../redux/selectors/categorySelectors';
import { getMemoizedUserData } from '../redux/selectors/userSelectors';
import { fetchUserFavorites } from '../redux/actions/userActions';
import PromotionCard from '../components/PromotionCard';
import Loader from '../components/Loader';
import SemicirclesOverlay from '../components/SemicirclesOverlay';
import PromotionCardVertical from '../components/PromotionCardVertical';
import { RefreshControl } from 'react-native';
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const API_URL = process.env.EXPO_PUBLIC_API_URL;
import Fontisto from '@expo/vector-icons/Fontisto';

const PromotionsScreen: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();
  const promotions = useSelector(getMemoizedPromotions);
  const categories = useSelector(getMemoizedAllCategories);
  const user_categories = useSelector(getMemoizedUserCategories);
  const user = useSelector(getMemoizedUserData) as UserData;
  const [filteredPromotions, setFilteredPromotions] = useState<Promotion[]>(promotions);
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [selectedCategoriesName, setSelectedCategoriesName] = useState<number[]>([]);
  const [keyword, setKeyword] = useState('');
  const [filterByPreferences, setFilterByPreferences] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const flatListRef = useRef<FlatList<any>>(null);
  const [isPreferencesHide, setIsPreferencesHide] = useState(false);
  const itemsPerPage = 5;
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isStartDate, setIsStartDate] = useState(true); 
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const isGuest = useSelector((state: RootState) => state.user.isGuest);
  const [modalAlertVisible, setModalAlertVisible] = useState(false);
  const [modalAlertMessage, setModaAlertMessage] = useState('');
  // console.log("promociones",promotions);


  // Función para recargar las promociones
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await dispatch(fetchPromotions());
    } catch (error) {
      console.error("Error al recargar promociones:", error);
    } finally {
      clearFilters()
      setIsRefreshing(false);
    }
  };
  // Función para cargar más promociones
  const loadMorePromotions = useCallback(() => {
    if (!loadingMore && page * itemsPerPage < filteredPromotions.length) {
      setLoadingMore(true);
      setPage(prevPage => prevPage + 1);
      setLoadingMore(false);
    }
  }, [loadingMore, page, filteredPromotions.length]);

  // Promociones a mostrar basado en la página actual
  const displayedPromotions = useMemo(() => {
    const start = (page - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return filteredPromotions.slice(0, end);
  }, [filteredPromotions, page]);
  // console.log("promociones mostradas",displayedPromotions.length);
  // Función para detectar cuando se ha llegado al final del listado
  const handleEndReached = useCallback(() => {
    loadMorePromotions();
  }, [loadMorePromotions]);
  // Renderizar cada tarjeta de promoción
  const renderItem = ({ item, index }: { item: Promotion; index: number }) => (
    <PromotionCard
      key={item.promotion_id}
      promotion={item}
      index={index}
      handlePress={handlePress}
    />
  );


  const filterByPreferencesFunction = useCallback((promotion: Promotion) => {

    if (!user_categories || user_categories.length === 0) {
      return topPromotions()
    }
    return promotion.categories.some(c => user_categories.map(uc => uc.id).includes(c.category_id));

  }, [user_categories]);

  const topPromotions = () => {
    if (!promotions || promotions.length === 0) {
      return [];
    }
    const sortedPromotions = promotions
      .sort((a, b) => {
        const discountA = a.discount_percentage ?? 0;
        const discountB = b.discount_percentage ?? 0;
        return discountB - discountA;
      });

    return sortedPromotions.slice(0, 3);
  };
  useEffect(() => {
    const applyFilters = () => {
      setLoading(true);
      let filtered = promotions;
      filtered = filtered.filter(filterByPreferencesFunction);
      setFilterByPreferences(filtered);
      setLoading(false);
    };
    applyFilters();
  }, [promotions]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        if (user?.user_id) {
          await dispatch(fetchUserCategories(user.user_id));
          await dispatch(fetchUserFavorites());
        }
        await dispatch(fetchAllCategories());
        await dispatch(fetchPromotions());
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [dispatch, user]);

  useEffect(() => {
    setFilteredPromotions(promotions);
  }, [promotions]);

  const handlePress = useCallback((promotion: Promotion) => {
    navigation.navigate('PromotionDetail', { promotionId: promotion.promotion_id });
  }, [navigation]);

  const formatDateString = useCallback((date: Date) => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  }, []);


  // const confirmStartDate = useCallback(() => {
  //   setShowStartDatePicker(false);
  // }, []);

  // const confirmEndDate = useCallback(() => {
  //   setShowEndDatePicker(false);
  // }, []);

  //categorias
  const toggleCategory = useCallback((categoryId: number) => {
    const categoryName = categories.find(cat => cat.category_id === categoryId)?.name;

    setSelectedCategories((prevSelectedCategories) => {
      if (prevSelectedCategories.includes(categoryId)) {
        setSelectedCategoriesName((prevSelectedCategoriesName: any) =>
          prevSelectedCategoriesName.filter((name: any) => name !== categoryName)
        );
        return prevSelectedCategories.filter(id => id !== categoryId);
      } else {
        setSelectedCategoriesName((prevSelectedCategoriesName: any) =>
          [...prevSelectedCategoriesName, categoryName]
        );
        return [...prevSelectedCategories, categoryId];
      }
    });
  }, [categories]);

  useEffect(() => {
    applyFilters();
  }, [keyword, startDate, endDate]);

  const applyFilters = useCallback(() => {
    setLoading(true);
    let filtered = promotions;
    if (selectedCategories.length > 0) {

      filtered = filtered.filter(promotion => {
        const categoryIds = promotion.categories.map(c => c.category_id);

        return selectedCategories.some(id => categoryIds.includes(id));
      });
    }

    if (keyword) {
      filtered = filtered.filter(promotion => promotion.title.toLowerCase().includes(keyword.toLowerCase()));
    }

    if (startDate) {
      filtered = filtered.filter(promotion =>
        new Date(promotion.start_date) >= startDate
      );
    }

    if (endDate) {
      filtered = filtered.filter(promotion =>
        new Date(promotion.expiration_date) <= endDate
      );
    }

    setFilteredPromotions(filtered);
    setPage(1)
    setLoading(false);
    setIsModalVisible(false);
  }, [filterByPreferences, user, user_categories, selectedCategories, keyword, startDate, endDate, promotions]);

  const clearFilters = useCallback(() => {
    setSelectedCategories([]);
    setSelectedCategoriesName([]);
    setKeyword('');
    setStartDate(null);
    setEndDate(null);
    setFilteredPromotions(promotions);
  }, [promotions]);

  const handlePressMore = () => {
    setIsPreferencesHide(!isPreferencesHide)
  };

  const handleArrowPress = () => {
    if (flatListRef && flatListRef.current) {
      flatListRef.current.scrollToOffset({
        offset: screenWidth * 0.8,
        animated: true,
      });
    }
  };



// console.log("loading y promociones",loading, promotions, displayedPromotions);
const handleStartDateChange = (_: any, selectedDate: Date | undefined) => {
  if (Platform.OS === 'android') {
    setShowModal(false);
  }
  if (selectedDate) {
    setStartDate(selectedDate);
  }
};

const handleEndDateChange = (_: any, selectedDate: Date | undefined) => {
  if (selectedDate) {
    setEndDate(selectedDate);
  }
  if (Platform.OS === 'android') {
    setShowModal(false);
  }
};

const openModal = (isStart:boolean) => {
  setIsStartDate(isStart);
  setShowModal(true);
};

const closeModal = () => {
  setShowModal(false);
};

const confirmDate = () => {
  closeModal();
};
  const keyExtractorForPreferences = (item: Promotion, index: number) => `${item.promotion_id}-pref-${index}`;
  const keyExtractorForDisplayedPromotions = (item: Promotion, index: number) => `${item.promotion_id}-disp-${index}`;

  if (isGuest) {
    return (
      <View style={styles.gradient}>
        <SemicirclesOverlay />
        <Fontisto name="shopping-sale" size={30} color="rgba(0, 122, 140,1)" style={styles.iconSale}/>
        <Text style={styles.message}>Para aprovechar los descuentos regístrate en nuestra app.</Text>
      </View>
    );
  }
  return (
    !promotions.length ?
      <View style={styles.gradient}>
        {loading? <Loader />:
        <>
        <SemicirclesOverlay />
        <Text style={styles.notProm}>No hay promociones disponibles aún</Text>
        <Loader />
        </>
        }
      </View>
      : <View style={styles.gradient}>
        {loading && <Loader />}
        <SemicirclesOverlay />
        <TextInput
          style={styles.inputLarge}
          placeholder="Buscar promociones"
          value={keyword}
          onChangeText={setKeyword}
          placeholderTextColor="#888"
        />
        <View style={styles.cardContainer}>
          <View style={styles.perforationLeft}></View>
          <View style={styles.perforationRight}></View>
          <View style={styles.btns}>
            <View style={styles.textFilterCont}>
              <Text style={styles.textFilter}>
                <Text style={styles.textFilterName}>
                  <MaterialCommunityIcons name="form-textbox-password" size={screenWidth*0.035} color="#acd0d5" /> Palabra clave:
                </Text>
                {keyword ? keyword : ' -'}
              </Text>
              <Text style={styles.textFilter}>
                <Text style={styles.textFilterName}>
                  <MaterialCommunityIcons name="calendar-arrow-right" size={screenWidth*0.035} color="#acd0d5" /> Inicio:
                </Text>
                {startDate ? formatDateString(startDate) : ' -'}
              </Text>
              <Text style={styles.textFilter}>
                <Text style={styles.textFilterName}>
                  <MaterialCommunityIcons name="calendar-arrow-left" size={screenWidth*0.035} color="#acd0d5" /> Fin:
                </Text>
                {endDate ? formatDateString(endDate) : ' -'}
              </Text>
              <Text style={styles.textFilter}>
                <Text style={styles.textFilterName}>
                  <MaterialCommunityIcons name="playlist-check" size={screenWidth*0.035} color="#acd0d5" /> Categorías:
                </Text>
                {selectedCategoriesName.length > 0
                  ? (
                    <>
                      {selectedCategoriesName.slice(0, 3).map((c, index) => (
                        <Text key={index}>{c}{index < 2 && selectedCategoriesName.length > 3 ? ', ' : ' '}</Text>
                      ))}
                      {selectedCategoriesName.length > 3 && <Text>...</Text>}
                    </>
                  )
                  : <Text> -</Text>
                }
              </Text>
              <Text style={styles.textFilterMainTitle}>Filtros de cupones</Text>
            </View>
            <MaterialCommunityIcons style={styles.couponImage} name="ticket-percent-outline" size={20} color="rgba(0, 122, 140,0.8)" />
          </View>
          <View style={styles.dottedLine} />
        </View>
        <View style={styles.filterIconsContainer}>


        <TouchableOpacity onPress={() => openModal(true)} style={styles.iconTextFilter}>
        <MaterialCommunityIcons name="calendar-start" size={screenWidth*0.06} color="#336749" style={styles.filterIcon} />
        <Text style={styles.filterIconText}>Inicio</Text>
      </TouchableOpacity>

      {/* Botón de fecha de fin */}
      <TouchableOpacity onPress={() => openModal(false)} style={styles.iconTextFilter}>
        <MaterialCommunityIcons name="calendar-end" size={screenWidth*0.06} color="#336749" style={styles.filterIcon} />
        <Text style={styles.filterIconText}>Fin</Text>
      </TouchableOpacity>

      {/* Modal para seleccionar la fecha */}
      <Modal isVisible={showModal} 
      onBackdropPress={closeModal} 
      onBackButtonPress={closeModal}
      animationIn="slideInUp"
      animationOut="slideOutDown"
      >
        <View style={Platform.OS == "ios"? styles.modalContentDate:null}>
          <DateTimePicker
            value={isStartDate ? (startDate ?? new Date()) : (endDate ?? new Date())}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={isStartDate ? handleStartDateChange : handleEndDateChange}
            minimumDate={!isStartDate && startDate ?startDate:undefined }
            maximumDate={isStartDate && endDate ? endDate : undefined }
          />
          {Platform.OS === 'ios' && (
            <TouchableOpacity onPress={confirmDate} style={styles.confirmButton}>
              <Text style={styles.confirmButtonText}>Confirmar fecha</Text>
            </TouchableOpacity>
          )}
        </View>
      </Modal>
          <TouchableOpacity onPress={() => setIsModalVisible(true)} style={styles.iconTextFilter}>
            <MaterialCommunityIcons name="format-list-checks" size={screenWidth*0.06} color="#336749" style={styles.filterIcon} />
            <Text style={styles.filterIconText}>Categorías</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconTextFilter} onPress={clearFilters}>
            <MaterialCommunityIcons name="filter-remove-outline" size={screenWidth*0.06} color="#336749" style={styles.filterIcon} />
            <Text style={styles.filterIconText}>Limpiar</Text>
          </TouchableOpacity>
        </View>

        {/* FlatList principal para promociones */}
        <FlatList
          ListHeaderComponent={
            <>
              {!isPreferencesHide && (
                <View style={styles.misPrefe}>
                  <Text style={styles.titlepreferne}>Promociones según tus preferencias</Text>
                  {loading && <Loader />}
                  <FlatList
                    horizontal
                    data={filterByPreferences}
                    keyExtractor={keyExtractorForPreferences}
                    renderItem={({ item, index }) => (
                      <PromotionCardVertical
                        promotion={item}
                        index={index}
                        handlePress={handlePress}
                      />
                    )}
                    showsHorizontalScrollIndicator={false}
                    ref={flatListRef}
                  />
                  {filterByPreferences.length > 2 && (
                    <TouchableOpacity style={styles.arrowButton} onPress={handleArrowPress}>
                      <MaterialCommunityIcons name="arrow-right" size={30} color="rgba(0, 122, 140,0.5)" />
                    </TouchableOpacity>
                  )}
                </View>
              )}
              <View style={styles.otrasPromos}>
                {isPreferencesHide ? (
                  <TouchableOpacity>
                    <Text style={styles.vermaspref} onPress={handlePressMore}>Mostrar según mis preferencias...</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity style={styles.otherPromotionsbtn}>
                    <Text style={styles.otherPromotionsTitle}>Otras Promociones</Text>
                    <Text style={styles.vermas} onPress={handlePressMore}>ver todas...</Text>
                  </TouchableOpacity>
                )}
              </View>
            </>
          }
          data={displayedPromotions}
          renderItem={renderItem}
          keyExtractor={keyExtractorForDisplayedPromotions}
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            loadingMore ? <ActivityIndicator size="large" color="#acd0d5" /> : null
          }
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              colors={['#007a8b']} // color android
              tintColor="#007a8b"  // color en iOS
            />
          }
        />

        {/* Modal para categorías */}
        <Modal isVisible={isModalVisible} style={styles.modal}>
          <View style={styles.modalContent}>
            <FlatList
              data={categories}
              keyExtractor={(item) => item.category_id.toString()}
              numColumns={2}
              renderItem={({ item }) => (
                <View style={styles.checkboxContainer}>
                  <Checkbox
                    style={styles.checkbox}
                    value={selectedCategories.includes(item.category_id)}
                    onValueChange={() => toggleCategory(item.category_id)}
                  />
                  <Text style={styles.label}>{item.name}</Text>
                </View>
              )}
            />
            <TouchableOpacity style={styles.filteraplyButton} onPress={applyFilters}>
              <Text style={styles.filterButtonText}>Aplicar categorías</Text>
            </TouchableOpacity>
            {/* <TouchableOpacity style={styles.closeButton} onPress={() => setIsModalVisible(false)}>
              <Text style={styles.filterButtonText}>Cerrar</Text>
            </TouchableOpacity> */}
          </View>
        </Modal>
      </View>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  message:{
    fontSize:screenWidth*0.045,
    width:'85%',
    alignSelf:'center',
    marginTop:'5%',
    textAlign:'center',
    fontWeight:'700',
    color:'rgba(0, 122, 140,0.9)'
  },
  iconSale:{
    width:'85%',
    alignSelf:'center',
    marginTop:'60%',
    textAlign:'center',
    fontWeight:'700',
  },
  notProm:{
    color:'#333',
    textAlign:'center',
    marginTop: screenHeight*0.3
  },
  container: {
    flexGrow: 1,
    padding: 10,
    paddingTop:5
  },
  filters: {
    marginBottom: 5,
  },
  textFilterCont:{
    position:'absolute',
    top:-10,
    left:10
  },
  textFilter:{
    fontSize:screenWidth*0.03,
    color:'rgba(0, 122, 140,0.8)'
    },
    textFilterName:{
      fontSize:screenWidth*0.03,
      fontWeight:'500',
      color:'rgba(0, 122, 140,0.9)',
    },
    textFilterMainTitle:{
      display:'flex',
      width:200,
      flexDirection:'row',
      position:'absolute',
      left:50,
      bottom:-28,
      textAlign:'center',
      fontSize:12,
      fontWeight:'500',
      color:'rgba(0, 122, 140,0.5)'
    },
    couponImage:{
      position:'absolute',
      right:10
    },
  cardContainer: {
    alignSelf:'center',
    height:100,
    width: "90%",
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 12,
    paddingTop:15,
    position: 'relative',
    marginBottom: 8,
    marginTop: 8,
    overflow: 'hidden',
  },
  dottedLine: {
    position:'absolute',
    right:12,
    bottom:25,
    borderStyle: 'dotted',
    borderWidth: 1,
    borderRadius: 0,
    borderColor: 'rgba(0, 122, 140, 0.2)',
    marginTop: 15,
    borderTopWidth: 0,
    height: 1,
    width: '100%',
  },
  perforationLeft: {
    position: 'absolute',
    bottom: 15,
    left: -10,
    width: 20,
    height: 20,
    backgroundColor: 'rgba(0, 122, 140, 0.2)',
    borderRadius: 20,
  },
  perforationRight: {
    position: 'absolute',
    bottom: 15,
    right: -10,
    width: 20,
    height: 20,
    backgroundColor: 'rgba(0, 122, 140, 0.2)',
    borderRadius: 20,
  },
  btns: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  clearFiltersButton: {
    position:'absolute',
    right:0,
    top:0,
    flexDirection: 'row',
    backgroundColor: '#e0f7fa',
    padding: 7,
    borderRadius: 8,
    alignItems: 'center',
  },
  clearFiltersButtonText: {
    color: '#007a8c',
    marginLeft: 8,
  },
  filterButton: {
    flexDirection: 'row',
    backgroundColor: '#007a8c',
    padding: 7,
    borderRadius: 8,
    alignItems: 'center',
  },
  filterButtonText: {
    color: '#fff',
    marginLeft: 8,
  },
  filterIconsContainer: {
    width:'90%',
    alignSelf:'center',
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: screenWidth*0.01,
    marginBottom: 10,
  },
  iconContainer: {
    alignItems: 'center',
    backgroundColor:'rgb(172, 208, 213)',
    borderRadius:25,
    padding:10
  },
  iconText: {
    fontSize:screenWidth*0.03,
    color: '#007a8c',
  },
  filterIcon: {
    width:screenWidth*0.1,
    height:screenWidth*0.1,
    justifyContent:'center',
    alignItems: 'center',
    alignContent:'center',
    backgroundColor:'rgb(172, 208, 213)',
    borderRadius:25,
    padding:7
  },
  iconTextFilter:{
    
    width:screenWidth*0.22,
    alignItems: 'center',
  },
  filterIconText: {
    width:'100%',
    textAlign:'center',
    marginTop: 5,
    color: '#007a8c',
  },

  titlepreferne:{
    marginLeft:10,
    textAlign:'left',
    fontFamily: 'Inter-Regular-400',
    color:'rgb(0, 122, 140)',
    fontWeight:'700'
  },
  labelMisprefer: {
    color: '#007a8c',
    marginLeft: 8,
    fontWeight: 'bold'
  },
  misPrefe: {
    marginLeft:10
  },
  checkbox: {
    borderRadius: 8,
    borderColor: 'rgb(172, 208, 213)',
  },
  checkboxContainer: {
    height: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    width: '50%',
    paddingHorizontal: 5,
  },
  label: {
    marginLeft: 8,
  },
  input: {
    alignSelf: 'center',
    width: '70%',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 10,
    marginTop: 10,
    borderColor: 'rgba(49, 121, 187,0.5)',
    borderWidth: 1,
    color: "#000"
  },
  circles:{
    marginTop:0
  },
  inputLarge: {
        height: Platform.OS === 'ios'? 35: 35,
        alignSelf: 'center',
        width: '90%',
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 5,
        marginTop: 0,
        borderColor: 'rgb(172, 208, 213)',
        borderWidth: 1,
        color: "#000"
      },
    //   // verde: #007a8c rgb(0, 122, 140)
    //   //       verde claro: #acd0d5 rgb(172, 208, 213)
    //   //       gris: #f6f6f6 rgb(246, 246, 246)

  filteraplyButton: {
    width: '60%',
    alignSelf: 'center',
    backgroundColor: '#007a8c',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.4,
    shadowRadius: 1,
    elevation: 3,
  },
  promotionCard: {
    backgroundColor: 'rgba(255, 255, 255, 0)',
    borderRadius: 10,
    marginBottom: 25,
  },
  promotionContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
  },
  modal: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  modalContent: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  modalContentDate:{
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 10,
    borderRadius: 20,
  },
  closeButton: {
    width: '60%',
    alignSelf: 'center',
    backgroundColor: '#007a8c',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 1,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.4,
    shadowRadius: 1,
    elevation: 3,
  },
  containerDate: {
    padding: 20,
  },
  confirmButton: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#007a8c',
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  otherPromotionsbtn:{
    width: screenWidth*0.9,
    display:'flex',
    flexDirection:'row',
    justifyContent:'center',
    alignItems:'center',
     marginTop: 10,
  },
  otherPromotionsTitle: {
    width: screenWidth*0.5,
    paddingLeft:15,
    fontSize:screenWidth*0.045,
    fontWeight: 'bold',
   
    color: 'rgb(0, 122, 140)',
  },
  arrowButton: {
    position: 'absolute',
    right: 0,
    padding: 10,
    top:200
  },
  vermas:{
    width: screenWidth*0.5,
    paddingRight:10,
    textAlign:'right',
    fontSize:screenWidth*0.04,
    fontWeight: 'bold',
    marginVertical: 20,
    color: '#007a8c',
  },
  vermaspref:{
    width: screenWidth*0.7,
    paddingRight:10,
    textAlign:'right',
    fontSize:screenWidth*0.04,
    fontWeight: 'bold',
    marginVertical: 20,
    color: '#007a8c',
  },
  otrasPromos:{
    alignSelf:'center',
    width:'90%',
    display:'flex',
    flexDirection:'row',
    justifyContent:'space-between',
    alignContent:'center',
    alignItems:'baseline'
  }
});

export default PromotionsScreen;