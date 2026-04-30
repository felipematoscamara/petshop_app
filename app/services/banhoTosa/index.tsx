import { router, useFocusEffect, useLocalSearchParams } from 'expo-router'
import {StyleSheet, View, TouchableOpacity, Text, FlatList} from 'react-native'
import { pets } from '@/app/data/pets'
import { useCallback, useState } from 'react'
import { servicos } from '@/app/data/servicos'

export default function banhoTosa(){
  const {id} = useLocalSearchParams()
  const pet = pets.find(p => p.id === id)
  const [listaServicos, setListaServicos] = useState(servicos)

  useFocusEffect(
    useCallback(() => {
      setListaServicos([...servicos])
    }, [])
  )

  const servicosDoPet = listaServicos.filter(
    v => v.idPet === id
  )

  if(!pet){
    return(
      <View style={styles.container}>
        <Text>Pet não encontrado</Text>
      </View>
    )
  }

  return(
    <View style={styles.container}>

      <FlatList
        data={servicosDoPet}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={{margin: 10}}>
            <Text>{item.servico}</Text>
            <Text>{new Date(item.data).toLocaleString('pt-BR')}</Text>
            <Text>Pontos: {item.pontos}</Text>
          </View>
        )}
        contentContainerStyle={{ paddingBottom: 50 }}
      />
      

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