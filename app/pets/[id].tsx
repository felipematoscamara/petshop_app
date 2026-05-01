import {StyleSheet, View, Text, TouchableOpacity} from 'react-native'
import { useLocalSearchParams, router } from 'expo-router'
import { pets } from '../data/pets'
import Header from '../components/Header'
import { Alert } from 'react-native'
import { useFocusEffect } from 'expo-router'
import { useCallback, useState } from 'react'

export default function Details(){
    const {id} = useLocalSearchParams()

    const [petAtual, setPetAtual] = useState(pets.find(p => p.id === id));

    useFocusEffect(
      useCallback(() => {
          const petEncontrado = pets.find(p => p.id === id)
          if (petEncontrado) {
              setPetAtual({ ...petEncontrado })
          }
      }, [id])
    )
    
    if(!petAtual){
        return(
          <View style={styles.container}>
            <Text>Pet não encontrado</Text>
          </View>
        )
    }

    function abrirMenu(){
      Alert.alert(
        petAtual.nome,
        "Selecione uma ação:",
        [

          {
            text: "Editar",
            onPress: () => router.push(`/pets/editar/${id}`)
          },

          {
            text: "Excluir",
            style: "destructive",
            onPress: excluirPet
          },

          {
            text: "Cancelar",
            style: "cancel"
          }
        ]
      )
    }

    function excluirPet(){
      Alert.alert(
        "Comfirmar",
        "Tem Certeza que deseja excluir este pet?",
        [
          {text: "Não", style: "cancel"},
          {
            text: "Sim",
            style: "destructive",
            onPress: ()=> {
              const index = pets.findIndex(p => p.id === id)

              if(index !== -1){
                pets.splice(index, 1)
              }

              router.back()
            }
          }
        ]
      )
    }
    
    return(
        <View style={{flex: 1}}>

          <View>
            <Header 
              titulo='Pet'
              onMenuPress={abrirMenu}
            />
          </View>

          <View style={styles.container}>

            <Text>Nome: {petAtual.nome}</Text>
            <Text>Espécie: {petAtual.especie}</Text>
            <Text>Raça: {petAtual.raca}</Text>
            <Text>Nascimento: {petAtual.nascimento}</Text>

            <TouchableOpacity
              onPress={() => router.push(`/services/vacinas?id=${petAtual.id}`)}
            >
              <Text>Cartão de vacinas</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push(`/services/banhoTosa?id=${petAtual.id}`)}
            >
              <Text>Banho e Tosa</Text>
            </TouchableOpacity>

            <Text>ID: {petAtual.id}</Text>

          </View>
          
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