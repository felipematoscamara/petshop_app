import { router, useFocusEffect, useLocalSearchParams } from 'expo-router'
import { StyleSheet, View, TouchableOpacity, Text, FlatList } from 'react-native'
import { pets } from '@/app/data/pets'
import { useCallback, useState } from 'react'
import { servicos } from '@/app/data/servicos'
import Header from '@/app/components/Header'
import MessageModal from '@/app/components/MessageModal'
import MenuModal from '@/app/components/MenuModal'

type Servico = {
  id: string
  idPet: string
  servico: string
  data: string
  pontos: number
}

export default function BanhoTosa() {
  const { id } = useLocalSearchParams()
  const pet = pets.find(p => p.id === id)

  const [listaServicos, setListaServicos] = useState(servicos)
  const [menuVisible, setMenuVisible] = useState(false)
  const [servicoSelecionado, setServicoSelecionado] = useState<Servico | null>(null)

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
    }, [id])
  )

  const servicosDoPet = listaServicos.filter(
    v => v.idPet === id
  )

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
        <Header titulo='Serviços' />
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
  },

  cardServico: {
    marginBottom: 12,
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#F5F5F5"
  },

  linhaTopo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4
  },

  nomeServico: {
    fontSize: 16,
    fontWeight: "600"
  }
})