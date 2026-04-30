import {StyleSheet, View, Text, TouchableOpacity} from 'react-native'
import { useLocalSearchParams, router } from 'expo-router'
import { pets } from '../data/pets'

export default function Details(){
    const {id} = useLocalSearchParams()
    const pet = pets.find(p => p.id === id)

    if(!pet){
        return(
          <View style={styles.container}>
            <Text>Pet não encontrado</Text>
          </View>
        )
    }
    
    return(
        <View style={styles.container}>
            <Text>Nome: {pet.nome}</Text>
            <Text>Espécie: {pet.especie}</Text>
            <Text>Raça: {pet.raca}</Text>
            <Text>Nascimento: {pet.nascimento}</Text>

            <TouchableOpacity
              onPress={() => router.push(`/services/vacinas?id=${pet.id}`)}
            >
              <Text>Cartão de vacinas</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push(`/services/banhoTosa?id=${pet.id}`)}
            >
              <Text>Banho e Tosa</Text>
            </TouchableOpacity>

            <Text>ID: {pet.id}</Text>
        </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF",
    padding: 20
  }
})