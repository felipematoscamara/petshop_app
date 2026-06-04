import { router, useLocalSearchParams, useFocusEffect } from 'expo-router'
import { StyleSheet, View, TouchableOpacity, Text, FlatList, ActivityIndicator } from 'react-native'
import { useState, useCallback } from 'react'
import Header from '@/app/components/Header'
import MessageModal from '@/app/components/MessageModal'
import MenuModal from '@/app/components/MenuModal'
import { verificarStatusVacina } from '@/app/utils/verificarStatusVacina'
import { buscarPets } from '@/app/storage/petsStorage'
import { buscarVacinas, salvarVacinas } from '@/app/storage/vacinasStrorage'

type Vacina = {
  id: string
  idPet: string
  vacina: string
  dose: string
  data: string
  proxima?: string
}

function formatarData(data?: string) {
  if (!data) return ""
  const date = new Date(data)
  if (isNaN(date.getTime())) return ""
  return date.toLocaleDateString("pt-BR")
}

export default function CartaoDeVacinas() {
  const { id } = useLocalSearchParams()

  const [pet, setPet] = useState<any>(null)
  const [listaVacinas, setListaVacinas] = useState<Vacina[]>([])
  const [loading, setLoading] = useState(true)

  const [menuVisible, setMenuVisible] = useState(false)
  const [vacinaSelecionada, setVacinaSelecionada] = useState<Vacina | null>(null)

  useFocusEffect(
    useCallback(() => {
      async function carregarDadosVacinas() {
        setLoading(true)
        try {
          const [allPets, allVacinas] = await Promise.all([
            buscarPets(),
            buscarVacinas()
          ])

          const petEncontrado = allPets.find((p: any) => p.id === id)
          setPet(petEncontrado || null)
          setListaVacinas(allVacinas)
        } catch (error) {
          console.error("Erro ao carregar cartão de vacinas:", error)
        } finally {
          setLoading(false)
        }
      }

      carregarDadosVacinas()
    }, [id])
  )

  function obterUltimaVacinaDoTipo(idPet: string, nomeVacina: string) {
    const vacinasDoTipo = listaVacinas.filter(
      v => v.idPet === idPet && v.vacina === nomeVacina
    )

    if (vacinasDoTipo.length === 0) return null

    return vacinasDoTipo.reduce((maisRecente, atual) => {
      return new Date(atual.data).getTime() > new Date(maisRecente.data).getTime()
        ? atual
        : maisRecente
    })
  }

  const excluirVacina = async () => {
    if (!vacinaSelecionada) return

    try {
    
      const todasVacinas = await buscarVacinas()

      const novaListaGeral = todasVacinas.filter(
        (v: Vacina) => v.id !== vacinaSelecionada.id
      )

      await salvarVacinas(novaListaGeral)

      setListaVacinas(novaListaGeral)
      setMenuVisible(false)
      setVacinaSelecionada(null)
    } catch (error) {
      console.error("Erro ao excluir vacina:", error)
    }
  }

  const vacinasDoPet = listaVacinas.filter(
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
        <Header titulo={`Vacinas: ${pet.nome}`} />
      </View>

      <View style={styles.container}>
        <FlatList
          data={vacinasDoPet}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            const ultimaVacina = obterUltimaVacinaDoTipo(item.idPet, item.vacina)
            const ehMaisRecente = ultimaVacina?.id === item.id

            const status = ehMaisRecente
              ? verificarStatusVacina(item.proxima || "")
              : null

            return (
              <TouchableOpacity
                style={[
                  styles.cardVacina,
                  status === "atrasada" && styles.cardAtrasada,
                  status === "proxima" && styles.cardProxima
                ]}
                onPress={() => {
                  setVacinaSelecionada(item)
                  setMenuVisible(true)
                }}
              >
                <View style={styles.linhaTopo}>
                  <Text style={styles.nomeVacina}>{item.vacina}</Text>

                  {(status === "atrasada" || status === "proxima") && (
                    <Text style={styles.alerta}>⚠️</Text>
                  )}
                </View>

                <Text style={styles.infoTexto}>Dose: {item.dose}</Text>
                <Text style={styles.infoTexto}>Aplicada em: {formatarData(item.data)}</Text>
                {item.proxima && (
                  <Text style={styles.infoTexto}>Próxima dose: {formatarData(item.proxima)}</Text>
                )}
              </TouchableOpacity>
            )
          }}
          contentContainerStyle={{ paddingBottom: 80 }}
          ListEmptyComponent={
            <Text style={styles.vazioTexto}>Nenhuma vacina cadastrada para este pet</Text>
          }
        />

        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push(`/services/vacinas/novo?id=${pet.id}`)}
        >
          <Text style={styles.buttonText}>Nova Vacina</Text>
        </TouchableOpacity>
      </View>

      <MenuModal
        visible={menuVisible}
        onClose={() => {
          setMenuVisible(false)
          setVacinaSelecionada(null)
        }}
        title={vacinaSelecionada?.vacina || "Vacina"}
        options={[
          {
            label: "Editar Vacina",
            onPress: () => {
              if (!vacinaSelecionada) return
              setMenuVisible(false)
              router.push(`/services/vacinas/editar?id=${vacinaSelecionada.id}`)
            }
          },
          {
            label: "Excluir Vacina",
            isDanger: true,
            onPress: () => {
              excluirVacina()
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
    backgroundColor: '#015DAD',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
    bottom: 20,
    left: 20,
    right: 20
  },
  buttonText: {
    color: '#FFF',
    fontWeight: "600"
  },
  cardVacina: {
    marginBottom: 12,
    padding: 14,
    borderRadius: 8,
    backgroundColor: "#F5F5F5",
    borderWidth: 1,
    borderColor: "#E0E0E0"
  },
  cardAtrasada: {
    borderColor: "#D32F2F",
    backgroundColor: "#FFEBEE"
  },
  cardProxima: {
    borderColor: "#F9A825",
    backgroundColor: "#FFF8E1"
  },
  linhaTopo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6
  },
  nomeVacina: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333"
  },
  infoTexto: {
    fontSize: 14,
    color: "#555",
    marginTop: 2
  },
  alerta: {
    fontSize: 18
  },
  vazioTexto: {
    textAlign: "center",
    color: "#7F8C8D",
    marginTop: 20,
    fontStyle: "italic"
  }
})