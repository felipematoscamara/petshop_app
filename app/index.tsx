//Tela inicial
import {StyleSheet, Text, View} from 'react-native'
import { Link } from 'expo-router'

export default function HomePage(){
  return(
    
    <View style={styles.container}>

      <Link href="/pets">Pets</Link>
      <Link href="/clientes">Clientes</Link>

    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    flex: 1,
    alignItems: "center",
    justifyContent: "center"
  }
})