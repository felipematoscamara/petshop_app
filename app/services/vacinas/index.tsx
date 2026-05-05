import { router, useLocalSearchParams, useFocusEffect } from 'expo-router'
import { StyleSheet, View, TouchableOpacity, Text, FlatList, Modal } from 'react-native'
import { pets } from '../../data/pets'
import { vacinas } from '@/app/data/vacinas'
import { useState, useCallback } from 'react'
import Header from '@/app/components/Header'

export default function CartaoDeVacinas(){
  const {id} = useLocalSearchParams()
  const pet = pets.find(p => p.id === id)

  const [listaVacinas, setListaVacinas] = useState(vacinas)
  const [menuVisible, setMenuVisible] = useState(false)
  const [vacinaSelecionada, setVacinaSelecionada] = useState<Vacina | null>(null)

  type Vacina = {
    id: string
    idPet: string
    vacina: string
    dose: string
    data: string
    proxima: string
  }


  const excluirVacina = () => {
    if (!vacinaSelecionada) return

    const novaLista = listaVacinas.filter( 
      v => v.id !== vacinaSelecionada.id
    )

    vacinas.length = 0
    vacinas.push(...novaLista)

    setListaVacinas(novaLista)
    setMenuVisible(false)
    setVacinaSelecionada(null)
  }

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
    <View style={{flex: 1}}>    

      <View>
        <Header titulo='Cartão de Vacinas'/>
      </View>

      <View style={styles.container}>

        <FlatList
          data={vacinasDoPet}
          keyExtractor={(item) => item.id}
          renderItem={({item}) => (
            <TouchableOpacity
              style={{margin: 10}}
              onPress={() => {
                setVacinaSelecionada(item)
                setMenuVisible(true)
              }}
            >
              <Text>{item.vacina}</Text>
              <Text>{item.dose}</Text>
              <Text>{item.data}</Text>
              <Text>{item.proxima}</Text>
            </TouchableOpacity>
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

      <Modal
        visible={menuVisible}
        transparent
        animationType='fade'
        onRequestClose={() => setMenuVisible(false)}
      >
        <View style={stylesModal.overlay}>

          <View style={stylesModal.menu}>

            <Text style={stylesModal.title}>
              {vacinaSelecionada
                ? `${vacinaSelecionada.vacina} - ${vacinaSelecionada.data}`
                : ''
              }
            </Text>

            <TouchableOpacity
              style={stylesModal.button}
              onPress={() => {
                if (!vacinaSelecionada) return
                setMenuVisible(false)
                router.push({
                  pathname: "/services/vacinas/editar",
                  params: { id: vacinaSelecionada.id }
                })
              }}
              >
              <Text>Editar Vacina</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={stylesModal.button}
              onPress={() => {
                setMenuVisible(false)
                excluirVacina()
              }}
              >
              <Text style={{color: 'red'}}>Excluir Vacina</Text>
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