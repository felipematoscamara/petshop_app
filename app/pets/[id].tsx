import {StyleSheet, View, Text, TouchableOpacity, Modal} from 'react-native'
import { useLocalSearchParams, router } from 'expo-router'
import { pets } from '../data/pets'
import Header from '../components/Header'
import { useFocusEffect } from 'expo-router'
import { useCallback, useState } from 'react'
import MessageModal from '../components/MessageModal'
import MenuModal from '../components/MenuModal'

export default function Details(){
    const {id} = useLocalSearchParams()

    const [menuVisible, setMenuVisible] = useState(false)
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
            
            <MessageModal
              visible={true}
              mensagem='Ops! Não conseguimos localizar os dados deste pet. Você será redirecionado para página home ;).'
              onClose={() => router.replace('/')}
            />

          </View>
        )
    }

    function abrirMenu() {
      setMenuVisible(true)
    }
    
    function excluirPet() {
      const index = pets.findIndex(p => p.id === id);
    
        if (index !== -1) {
          pets.splice(index, 1);
        }
    
      router.back();
    }
    
  return(
    <View style={{flex: 1}}>

      <MenuModal
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
        title={petAtual.nome}
        options={[
          {
            label: "Editar Pet",
            onPress: () => {
              router.push(`/pets/editar/${id}`)
            }
          },

          {
            label: "Excluir Pet",
            isDanger: true,
            onPress: () => {
              excluirPet()
            }
          }
        ]}
      />

          <View>
            <Header 
              titulo='Pet'
              onMenuPress={abrirMenu}
            />
          </View>

          <View style={styles.container}>

            <Text>{petAtual.nome}</Text>
            <Text>Espécie: {petAtual.especie}</Text>
            <Text>{petAtual.raca
              ? `Raça: ${petAtual.raca}`
              : 'Raça: Não informada'}
            </Text>
            <Text>{petAtual.nascimento
              ? 'Nascimento: ' + new Date(petAtual.nascimento).toLocaleDateString('pt-BR')
              : 'Nascimento: Não informado'}
            </Text>

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