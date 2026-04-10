import {StyleSheet, Text, TouchableOpacity, View} from 'react-native'
import { Link, router } from 'expo-router'
import { clientes } from './data/clientes'

export default function ClientesPage(){
  return(
    <View style={styles.container}>
      
        <TouchableOpacity
            style={styles.button}
            onPress={() => router.push("/clientes/novo")}
            >
            <Text style={styles.buttonText}>Novo Cliente</Text>
        </TouchableOpacity>

    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFF",
    flex: 1,
    alignItems: "center",
  },

  button:{
    backgroundColor: "#015DAD",
    padding: 12,
    borderRadius: 8
  },

  buttonText:{
    color: "#fff"
  }

})