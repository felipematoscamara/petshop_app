import { router, useFocusEffect, useLocalSearchParams } from 'expo-router'
import { StyleSheet, View, TouchableOpacity, Text, FlatList, ActivityIndicator, Platform } from 'react-native'
import { useCallback, useState } from 'react'
import Header from '@/app/components/Header'
import MessageModal from '@/app/components/MessageModal'
import MenuModal from '@/app/components/MenuModal'
import { buscarPets } from '@/app/storage/petsStorage'
import { buscarServicos, salvarServicos } from '@/app/storage/servicosStorage'

type Servico = {
  id: string
  idPet: string
  servico: string
  data: string
  pontos: number
}

const Colors = {
  bg: '#FFFFFF',
  bgSecundario: '#F8FAFC',
  textPrincipal: '#1E293B',
  textSecundario: '#64748B',
  primary: '#007BFF',
  border: '#E2E8F0',
  danger: '#EF4444',
  dangerLight: '#FEE2E2',
  accent: '#EFF6FF',
  accentBorder: '#DBEAFE',
}

export default function BanhoTosa() {
  const { id } = useLocalSearchParams()

  const [pet, setPet] = useState<any>(null)
  const [listaServicos, setListaServicos] = useState<Servico[]>([])
  const [loading, setLoading] = useState(true)

  const [menuVisible, setMenuVisible] = useState(false)
  const [confirmModalVisible, setConfirmModalVisible] = useState(false)
  const [servicoSelecionado, setServicoSelecionado] = useState<Servico | null>(null)

  const excluirServico = async () => {
    if (!servicoSelecionado) return

    try {
      const todosServicos = await buscarServicos()

      const novaListaGeral = todosServicos.filter(
        (s: Servico) => String(s.id) !== String(servicoSelecionado.id)
      )

      await salvarServicos(novaListaGeral)

      setListaServicos(novaListaGeral)
      setConfirmModalVisible(false)
      setMenuVisible(false)
      setServicoSelecionado(null)
    } catch (error) {
      console.error('Erro ao excluir serviço:', error)
    }
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
          console.error('Erro ao carregar serviços:', error)
        } finally {
          setLoading(false)
        }
      }

      carregarDadosServicos()
    }, [id])
  )

  const servicosDoPet = listaServicos
    .filter(v => v.idPet === id)
    .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())

  if (loading) {
    return (
      <View style={[styles.mainContainer, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    )
  }

  if (!pet) {
    return (
      <View style={styles.mainContainer}>
        <MessageModal
          visible={true}
          mensagem="Ops! Não conseguimos localizar os dados deste pet. Você será redirecionado para página home ;)."
          onClose={() => router.replace('/')}
        />
      </View>
    )
  }

  return (
    <View style={styles.mainContainer}>
      <Header titulo={`Serviços: ${pet.nome}`} />

      <View style={styles.content}>
        <View style={styles.profileCard}>
          <View style={styles.profileHeaderRow}>
            <Text style={styles.petNome} numberOfLines={2}>
              {pet.nome}
            </Text>

            <View style={styles.pointsBadge}>
              <Text style={styles.pointsText}>
                🧼 Serviços
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>TOTAL DE SERVIÇOS</Text>
            <Text style={styles.infoValue}>{servicosDoPet.length}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>ID DO PET</Text>
            <Text style={styles.infoValue}>{pet.id}</Text>
          </View>
        </View>

        <Text style={styles.tituloSecao}>Histórico</Text>

        <FlatList
          data={servicosDoPet}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 120 }}
          ListEmptyComponent={
            <View style={styles.emptyStateContainer}>
              <Text style={styles.vazioTexto}>
                Nenhum serviço cadastrado para este pet.
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              activeOpacity={0.75}
              style={styles.cardServico}
              onPress={() => {
                setServicoSelecionado(item)
                setMenuVisible(true)
              }}
            >
              <View style={styles.cardServicoTop}>
                <Text style={styles.nomeServico}>{item.servico}</Text>

                <View style={styles.serviceBadge}>
                  <Text style={styles.serviceBadgeText}>
                    {item.pontos} pts
                  </Text>
                </View>
              </View>

              <View style={styles.dividerCard} />

              <Text style={styles.cardInfo}>
                Data: {new Date(item.data).toLocaleDateString('pt-BR')}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.button}
          activeOpacity={0.85}
          onPress={() => router.push(`/services/banhoTosa/novo?id=${pet.id}`)}
        >
          <Text style={styles.buttonText}>Novo Serviço</Text>
        </TouchableOpacity>
      </View>

      <MenuModal
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
        title={servicoSelecionado?.servico || 'Serviço'}
        options={[
          {
            label: 'Editar Serviço',
            onPress: () => {
              if (!servicoSelecionado) return
              setMenuVisible(false)
              router.push(`/services/banhoTosa/editar?id=${servicoSelecionado.id}`)
            }
          },
          {
            label: 'Excluir Serviço',
            isDanger: true,
            onPress: () => {
              setMenuVisible(false)
              setConfirmModalVisible(true)
            }
          }
        ]}
      />

      <MenuModal
        visible={confirmModalVisible}
        onClose={() => {
          setConfirmModalVisible(false)
          setServicoSelecionado(null)
        }}
        title={`Excluir ${servicoSelecionado?.servico || 'serviço'}?`}
        options={[
          {
            label: 'Confirmar Exclusão',
            isDanger: true,
            onPress: () => excluirServico()
          }
        ]}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: Colors.bgSecundario,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  profileCard: {
    backgroundColor: Colors.bg,
    borderRadius: 16,
    padding: 18,
    marginTop: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 1,
  },
  profileHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  petNome: {
    flex: 1,
    fontSize: 22,
    fontWeight: '700',
    color: Colors.textPrincipal,
    marginRight: 10,
  },
  pointsBadge: {
    backgroundColor: Colors.accent,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.accentBorder,
  },
  pointsText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 14,
  },
  dividerCard: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 10,
  },
  infoRow: {
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textSecundario,
    letterSpacing: 0.6,
    marginBottom: 3,
  },
  infoValue: {
    fontSize: 15,
    color: Colors.textPrincipal,
    fontWeight: '500',
  },
  tituloSecao: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    color: Colors.textSecundario,
    marginTop: 24,
    marginBottom: 10,
    paddingLeft: 4,
  },
  cardServico: {
    backgroundColor: Colors.bg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 10,
  },
  cardServicoTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
  },
  nomeServico: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrincipal,
  },
  serviceBadge: {
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  serviceBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecundario,
  },
  cardInfo: {
    fontSize: 14,
    color: Colors.textSecundario,
    fontWeight: '500',
  },
  emptyStateContainer: {
    backgroundColor: Colors.bg,
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    marginTop: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  vazioTexto: {
    color: Colors.textSecundario,
    fontSize: 14,
    textAlign: 'center',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.bg,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  button: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  buttonText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 16,
    letterSpacing: 0.3,
  },
})