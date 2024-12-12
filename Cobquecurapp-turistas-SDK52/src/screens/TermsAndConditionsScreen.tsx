import React from 'react';
import { View, Text, ScrollView, StyleSheet, Dimensions } from 'react-native';
import { useSelector } from 'react-redux';
import { getMemoizedUserData } from '../redux/selectors/userSelectors';
import { UserData } from '../redux/types/types';
import RenderHTML from 'react-native-render-html';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

const { width: screenWidth } = Dimensions.get('window');

const TermsAndConditionsScreen: React.FC = () => {
 
  const user = useSelector(getMemoizedUserData) as UserData;
  const tagsStyles = {
    h1: { fontSize: screenWidth*0.05, marginBottom: 5, color:'#336749' },
    h2: { fontSize: screenWidth*0.05, marginBottom: 8,color:'#336749' },
    p: { fontSize: screenWidth*0.038, lineHeight: 20 }
  };


  const formatDate = (dateString: string) => {
  const cleanedDateString = dateString.replace(' -0300', '-03:00');
  const date = new Date(cleanedDateString);
  if (isNaN(date.getTime())) {
    return 'Fecha inválida'; 
  }
  const options: Intl.DateTimeFormatOptions = { 
    day: '2-digit', 
    month: 'long', 
    year: 'numeric', 
    hour: '2-digit', 
    minute: '2-digit', 
    hour12: false
  };

  return date.toLocaleString('es-ES', options);
};

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <Text style={styles.title}>Términos y Condiciones</Text>
        {/* Renderizamos el contenido HTML de los términos */}
        <View style={styles.termsContainer}>
        <RenderHTML
          contentWidth={screenWidth * 0.8}
          source={{ html: user?.terms?.content ?? '' }}
          tagsStyles={tagsStyles} 
        />
        </View>

        {/* Información de aceptación */}
        {user && user.terms_accepted_at && (
            <View style={styles.statusCont}>
               <Text style={styles.status}>
            Términos aceptados 
          </Text> 
          <Text style={styles.status}><MaterialCommunityIcons name="check-circle-outline" size={20} color="#007a8c" /> {user && user.terms_accepted_at? formatDate(user.terms_accepted_at) :''}
          </Text> 
          <Text style={styles.status}>(Versión: {user.terms?.version})
          </Text> 
            </View>
          
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f9f9f9',
  },
  scrollView: {
    marginBottom: 20,
  },
  title: {
    color: '#336749',
    fontSize: screenWidth*0.06,
    textAlign:'center',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  termsContainer: {
    marginBottom: 20,
  },
  content: {
    fontSize: screenWidth*0.05,
    lineHeight: 24,
    textAlign: 'justify',
  },
  status: {
    display:'flex',
    flexDirection:'row',
    justifyContent:'center',
    alignContent:'center',
    marginTop: 10,
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#007a8c',
  },
  statusCont: {
    display:'flex',
    flexDirection:'column',
    justifyContent:'center',
    alignContent:'center',
    marginTop: 20,
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#007a8c',
  },
});

export default TermsAndConditionsScreen;