import { View, ActivityIndicator, StyleSheet } from 'react-native';

const Loader: React.FC = () => {
  return (
    <View style={styles.loaderContainer}>
      <ActivityIndicator size="large" color="rgb(0, 122, 140)" />
    </View>
  );
};

const styles = StyleSheet.create({
  loaderContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    zIndex: 1000,
  },
});

export default Loader;