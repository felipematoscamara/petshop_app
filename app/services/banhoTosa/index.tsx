import { router, useLocalSearchParams } from 'expo-router'
import {StyleSheet, View, TouchableOpacity, Text} from 'react-native'
import { pets } from '@/app/data/pets'
import { useState } from 'react'

export default function banhoTosa(){
  const {id} = useLocalSearchParams()
  const pet = pets.find(p => p.id === id)
  const [listaServicos, setListaServicos] = useState()

  return(
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push(`/services/banhoTosa/novo?id=${pet.id}`)}
      >
        <Text style={styles.buttonText}>Novo Serviço</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF",
    padding: 20
  },

  button:{
    position: "absolute",
    backgroundColor: "#015DAD",
    padding: 12,
    borderRadius: 6,
    alignItems: "center",
    bottom: 20,
    left: 20,
    right: 20
  },

  buttonText:{
    color: "#FFF",
  }
})