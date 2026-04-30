import { router, useLocalSearchParams, useFocusEffect } from 'expo-router'
import { StyleSheet, View, TouchableOpacity, Text, FlatList } from 'react-native'
import { pets } from '../../data/pets'
import { vacinas } from '@/app/data/vacinas'
import { useState, useCallback } from 'react'

export default function CartaoDeVacinas(){
  const {id} = useLocalSearchParams()
  const pet = pets.find(p => p.id === id)
  const [listaVacinas, setListaVacinas] = useState(vacinas)

  useFocusEffect(
    useCallback(() => {
      setListaVacinas([...vacinas])
    }, [])
  )

  const vacinasDoPet = listaVacinas.filter(
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
        data={vacinasDoPet}
        keyExtractor={(item) => item.id}
        renderItem={({item}) => (
          <View style={{margin: 10}}>
            <Text>{item.vacina}</Text>
            <Text>{item.dose}</Text>
            <Text>{item.data}</Text>
            <Text>{item.proxima}</Text>
          </View>
        )}
        contentContainerStyle={{ paddingBottom: 50 }}

        ListEmptyComponent={
          <Text>Nenhuma vacina cadastrada</Text>
        }
      />


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
    position: "absolute",
    backgroundColor: '#015DAD',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
    bottom: 20,
    left: 20,
    right: 20
  },

  buttonText:{
    color: '#FFF'
  }
})