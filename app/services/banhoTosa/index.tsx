import { router, useFocusEffect, useLocalSearchParams } from 'expo-router'
import { StyleSheet, View, TouchableOpacity, Text, FlatList, ActivityIndicator } from 'react-native'
import { useCallback, useState } from 'react'
import Header from '@/app/components/Header'
import MessageModal from '@/app/components/MessageModal'
import MenuModal from '@/app/components/MenuModal'

// 1. IMPORTAR OS STORAGES (Ajuste os caminhos @/ se necessário)
import { buscarPets } from '@/app/storage/petsStorage'
import { buscarServicos, salvarServicos } from '@/app/storage/servicosStorage'

type Servico = {
  id: string
  idPet: string
  servico: string
  data: string
  pontos: number
}

export default function BanhoTosa() {
  const { id } = useLocalSearchParams()

  const [pet, setPet] = useState<any>(null)
  const [listaServicos, setListaServicos] = useState<Servico[]>([])
  const [loading, setLoading] = useState(true)

  const [menuVisible, setMenuVisible] = useState(false)
  const [servicoSelecionado, setServicoSelecionado] = useState<Servico | null>(null)

  const excluirServico = async () => {
    if (!servicoSelecionado) return

    const todosServicos = await buscarServicos()
   
    const novaListaGeral = todosServicos.filter(
      (s: Servico) => s.id !== servicoSelecionado.id
    )

    await salvarServicos(novaListaGeral)

    setListaServicos(novaListaGeral)
    setMenuVisible(false)
    setServicoSelecionado(null)
  }

  useFocusEffect(
    useCallback(() => {
      async function carregarDadosServicos() {
        setLoading(true)
        try {
          const [allPets, allServicos] = await Promise.all([
            buscarPets(),
            buscarServicos()
          ])

          const petEncontrado = allPets.find((p: any) => p.id === id)
          setPet(petEncontrado || null)
          setListaServicos(allServicos)
        } catch (error) {
          console.error("Erro ao carregar serviços:", error)
        } finally {
          setLoading(false)
        }
      }

      carregarDadosServicos()
    }, [id])
  )

  const servicosDoPet = listaServicos.filter(
    v => v.idPet === id
  )

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#015DAD" />
      </View>
    )
  }

  if (!pet) {
    return (
      <View style={styles.container}>
        <MessageModal
          visible={true}
          mensagem='Ops! Não conseguimos localizar os dados deste pet. Você será redirecionado para página home ;).'
          onClose={() => router.replace("/")}
        />
      </View>
    )
  }

  return (
    <View style={{ flex: 1 }}>
      <View>
        <Header titulo={`Serviços: ${pet.nome}`} />
      </View>

      <View style={styles.container}>
        <FlatList
          data={servicosDoPet}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.cardServico}
              onPress={() => {
                setServicoSelecionado(item)
                setMenuVisible(true)
              }}
            >
              <View style={styles.linhaTopo}>
                <Text style={styles.nomeServico}>{item.servico}</Text>
              </View>

              <Text>{new Date(item.data).toLocaleDateString('pt-BR')}</Text>
              <Text>Pontos: {item.pontos}</Text>
            </TouchableOpacity>
          )}
          contentContainerStyle={{ paddingBottom: 80 }}
          ListEmptyComponent={
            <Text style={styles.vazioTexto}>Nenhum serviço cadastrado para este pet</Text>
          }
        />

        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push(`/services/banhoTosa/novo?id=${pet.id}`)}
        >
          <Text style={styles.buttonText}>Novo Serviço</Text>
        </TouchableOpacity>
      </View>

      <MenuModal
        visible={menuVisible}
        onClose={() => {
          setMenuVisible(false)
          setServicoSelecionado(null)
        }}
        title={servicoSelecionado?.servico || "Serviço"}
        options={[
          {
            label: "Editar Serviço",
            onPress: () => {
              if (!servicoSelecionado) return
              setMenuVisible(false)
              router.push(`/services/banhoTosa/editar?id=${servicoSelecionado.id}`)
            }
          },
          {
            label: "Excluir Serviço",
            isDanger: true,
            onPress: () => {
              excluirServico()
            }
          }
        ]}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF",
    padding: 20
  },
  button: {
    position: "absolute",
    backgroundColor: "#015DAD",
    padding: 12,
    borderRadius: 6,
    alignItems: "center",
    bottom: 20,
    left: 20,
    right: 20
  },
  buttonText: {
    color: "#FFF",
    fontWeight: "600"
  },
  cardServico: {
    marginBottom: 12,
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#F5F5F5",
    borderWidth: 1,
    borderColor: "#E0E0E0"
  },
  linhaTopo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4
  },
  nomeServico: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333"
  },
  vazioTexto: {
    textAlign: "center",
    color: "#7F8C8D",
    marginTop: 20,
    fontStyle: "italic"
  }
})