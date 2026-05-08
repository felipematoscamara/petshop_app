import {StyleSheet, View, Text, TouchableOpacity, Modal} from 'react-native'
import { useLocalSearchParams, router } from 'expo-router'
import { pets } from '../data/pets'
import Header from '../components/Header'
import { useFocusEffect } from 'expo-router'
import { useCallback, useState } from 'react'

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
            <Text>Pet não encontrado</Text>
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

      <Modal
        visible={menuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
        >
          <View style={stylesModal.overlay}>
          
            <View style={stylesModal.menu}>
          
              <Text style={stylesModal.title}>
                {petAtual.nome}
              </Text>
          
              <TouchableOpacity
                style={stylesModal.button}
                onPress={() => {
                  setMenuVisible(false);
                    router.push(`/pets/editar/${id}`);
                }}
              >
              <Text>Editar Pet</Text>
              </TouchableOpacity>
          
              <TouchableOpacity
                style={stylesModal.buttonDanger}
                  onPress={() => {
                    setMenuVisible(false);
                    excluirPet();
                }}
              >
              <Text style={{ color: "red" }}>Excluir Pet</Text>
              </TouchableOpacity>
          
              <TouchableOpacity
                style={stylesModal.button}
                onPress={() => setMenuVisible(false)}
              >
                <Text>Cancelar</Text>
              </TouchableOpacity>
          
            </View>
          
          </View>
          
        </Modal>

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

const stylesModal = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "center",
        alignItems: "center"
    },
    menu: {
        width: 260,
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 16
    },
    title: {
        fontSize: 16,
        fontWeight: "bold",
        marginBottom: 10
    },
    button: {
        padding: 12
    },
    buttonDanger: {
        padding: 12
    }
})