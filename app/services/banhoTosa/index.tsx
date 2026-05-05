import { router, useFocusEffect, useLocalSearchParams } from 'expo-router'
import {StyleSheet, View, TouchableOpacity, Text, FlatList, Modal} from 'react-native'
import { pets } from '@/app/data/pets'
import { useCallback, useState } from 'react'
import { servicos } from '@/app/data/servicos'
import Header from '@/app/components/Header'
import { vacinas } from '@/app/data/vacinas'

export default function banhoTosa(){
  const {id} = useLocalSearchParams()
  const pet = pets.find(p => p.id === id)

  const [listaServicos, setListaServicos] = useState(servicos)
  const [menuVisible, setMenuVisible] = useState(false)
  const [servicoSelecionado, setServicoSelecionado] = useState<Servico | null>(null)

  type Servico = {
    id: string
    idPet: string
    servico: string
    data: string
    pontos: number
  }

  const excluirServico = () => {
    if (!servicoSelecionado) return

    const novaLista = listaServicos.filter(
      s => s.id !== servicoSelecionado.id
    )

    servicos.length = 0
    servicos.push(...novaLista)

    setListaServicos(novaLista)
    setMenuVisible(false)
    setServicoSelecionado(null)
  }

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
    <View style={{flex: 1}}>

      <View>
        <Header titulo='Serviços'/>
      </View>

      <View style={styles.container}>

        <FlatList
          data={servicosDoPet}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={{margin: 10}}
              onPress={() => {
                setServicoSelecionado(item)
                setMenuVisible(true)
              }}
            >
              <Text>{item.servico}</Text>
              <Text>{new Date(item.data).toLocaleString('pt-BR')}</Text>
              <Text>Pontos: {item.pontos}</Text>
            </TouchableOpacity>
          )}
          contentContainerStyle={{ paddingBottom: 50 }}

          ListEmptyComponent={
            <Text>Nenhum serviço cadastrado</Text>
          }
        />

        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push(`/services/banhoTosa/novo?id=${pet.id}`)}
        >
          <Text style={styles.buttonText}>Novo Serviço</Text>
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
              {servicoSelecionado
                ? `${servicoSelecionado.servico} - ${new Date(servicoSelecionado.data).toLocaleDateString('pt-BR')}`
                : ''
              }
            </Text>

            <TouchableOpacity
              style={stylesModal.button}
              onPress={() => {
                if (!servicoSelecionado) return
                setMenuVisible(false)
                router.push({
                  pathname: "/services/banhoTosa/editar",
                  params: { id: servicoSelecionado.id}
                })
              }}
            >
              <Text>Editar Serviço</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={stylesModal.button}
              onPress={() => {
                setMenuVisible(false)
                excluirServico()
              }}
            >
              <Text style={{color: 'red'}}>Excluir Serviço</Text>
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