import {StyleSheet, View, Text} from 'react-native'
import { useLocalSearchParams } from 'expo-router'
import { pets } from '../data/pets'

export default function Details(){
    const {id} = useLocalSearchParams()
    const pet = pets.find(p => p.id == id)

    if(!pet){
        return <Text>Pet não encontrado</Text>
    }
    
    return(
        <View style={styles.container}>
            <Text>Nome: {pet.nome}</Text>
            <Text>Tipo: {pet.especie}</Text>
            <Text>Nascimento: {pet.nascimento}</Text>
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