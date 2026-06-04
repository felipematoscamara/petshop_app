import { StyleSheet, View, Text, TouchableOpacity, ActivityIndicator } from 'react-native'
import { useLocalSearchParams, router } from 'expo-router'
import Header from '../components/Header'
import { useFocusEffect } from 'expo-router'
import { useCallback, useState } from 'react'
import MessageModal from '../components/MessageModal'
import MenuModal from '../components/MenuModal'
import { buscarPets, salvarPets } from '../storage/petsStorage'

export default function Details() {
  const { id } = useLocalSearchParams()

  const [menuVisible, setMenuVisible] = useState(false)
  const [petAtual, setPetAtual] = useState<any>(null)
  const [loading, setLoading] = useState(true) 

  useFocusEffect(
    useCallback(() => {
      async function carregarPet() {
        setLoading(true)
        const listaPets = await buscarPets()
        const petEncontrado = listaPets.find((p: any) => p.id === id)
        
        if (petEncontrado) {
          setPetAtual({ ...petEncontrado })
        } else {
          setPetAtual(null)
        }
        setLoading(false)
      }

      carregarPet()
    }, [id])
  )

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#015DAD" />
      </View>
    )
  }

 
  if (!petAtual) {
    return (
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
    
  async function excluirPet() {
    const listaPets = await buscarPets()
    const novaLista = listaPets.filter((p: any) => p.id !== id)
    
    await salvarPets(novaLista)
    
    setMenuVisible(false)
    router.back()
  }
    
  return (
    <View style={{ flex: 1 }}>
      <MenuModal
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
        title={petAtual.nome}
        options={[
          {
            label: "Editar Pet",
            onPress: () => {
              setMenuVisible(false)
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
        <Text style={styles.nomePet}>{petAtual.nome}</Text>
        <Text>Espécie: {petAtual.especie}</Text>
        <Text>
          {petAtual.raca ? `Raça: ${petAtual.raca}` : 'Raça: Não informada'}
        </Text>
        <Text>
          {petAtual.nascimento
            ? 'Nascimento: ' + new Date(petAtual.nascimento).toLocaleDateString('pt-BR')
            : 'Nascimento: Não informado'}
        </Text>

        <TouchableOpacity
          onPress={() => router.push(`/services/vacinas?id=${petAtual.id}`)}
          style={styles.botaoServico}
        >
          <Text style={styles.textoBotao}>🛡️ Cartão de vacinas</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push(`/services/banhoTosa?id=${petAtual.id}`)}
          style={styles.botaoServico}
        >
          <Text style={styles.textoBotao}>🧼 Banho e Tosa</Text>
        </TouchableOpacity>

        <Text style={styles.idTexto}>ID: {petAtual.id}</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF",
    padding: 20
  },
  nomePet: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333'
  },
  botaoServico: {
    backgroundColor: '#F5F5F5',
    padding: 15,
    borderRadius: 8,
    marginTop: 15,
    borderWidth: 1,
    borderColor: '#E0E0E0'
  },
  textoBotao: {
    fontSize: 16,
    fontWeight: '500',
    color: '#015DAD'
  },
  idTexto: {
    marginTop: 30,
    color: '#999',
    fontSize: 12
  }
})