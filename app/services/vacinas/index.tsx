import { router, useLocalSearchParams } from 'expo-router'
import {StyleSheet, View, TouchableOpacity, Text} from 'react-native'
import { pets } from '../../data/pets'

export default function CartaoDeVacinas(){
  const {id} = useLocalSearchParams()
  const pet = pets.find(p => p.id == id)

  return(
    <View style={styles.container}>

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push(`/services/vacinas/novo?id=${pet.id}`)}
      >
        <Text style={styles.buttonText}>Nova Vacina</Text>
      </TouchableOpacity>
      
    </View>
  )
}

const styles = StyleSheet.create({
  container:{
    flex: 1,
    backgroundColor: "#FFF",
    padding: 20
  },

  button:{
    backgroundColor: '#015DAD',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center'
  },

  buttonText:{
    color: '#FFF'
  }
})