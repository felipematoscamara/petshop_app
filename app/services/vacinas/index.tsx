import { router, useLocalSearchParams, useFocusEffect } from 'expo-router'
import { StyleSheet, View, TouchableOpacity, Text, FlatList, ActivityIndicator, Platform } from 'react-native'
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

type StatusTipo = 'atrasada' | 'proxima' | 'em-dia' | 'sem-vacina'

function formatarData(data?: string) {
  if (!data) return ''

  let date: Date;
  if (data.includes('-') && !data.includes('T')) {
    const [ano, mes, dia] = data.split('-').map(Number);
    date = new Date(ano, mes - 1, dia);
  } else {
    date = new Date(data);
  }

  if (isNaN(date.getTime())) return ''
  return date.toLocaleDateString('pt-BR')
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
  warning: '#F59E0B',
  warningLight: '#FEF3C7',
  success: '#10B981',
  successLight: '#D1FAE5',

  accent: '#EFF6FF',
  accentBorder: '#DBEAFE',
}

export default function CartaoDeVacinas() {
  const { id } = useLocalSearchParams()

  const [pet, setPet] = useState<any>(null)
  const [listaVacinas, setListaVacinas] = useState<Vacina[]>([])
  const [loading, setLoading] = useState(true)

  const [menuVisible, setMenuVisible] = useState(false)
  const [confirmModalVisible, setConfirmModalVisible] = useState(false)
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
          console.error('Erro ao carregar cartão de vacinas:', error)
        } finally {
          setLoading(false)
        }
      }

      carregarDadosVacinas()
    }, [id])
  )

  function obtenerUltimaVacinaDoTipo(idPet: string, nomeVacina: string) {
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

  function obtenerStatusVacina(vacina: Vacina): StatusTipo {
    const ultimaVacina = obtenerUltimaVacinaDoTipo(vacina.idPet, vacina.vacina)

    if (!ultimaVacina || ultimaVacina.id !== vacina.id) return 'sem-vacina'

    const status = verificarStatusVacina(vacina.proxima || '')

    if (status === 'atrasada') return 'atrasada'
    if (status === 'proxima') return 'proxima'
    return 'em-dia'
  }

  function obtenerEstiloStatus(status: StatusTipo) {
    switch (status) {
      case 'atrasada':
        return { texto: 'Atrasada', cor: Colors.danger, bg: Colors.dangerLight }
      case 'proxima':
        return { texto: 'Próxima', cor: Colors.warning, bg: Colors.warningLight }
      case 'em-dia':
        return { texto: 'Em Dia', cor: Colors.success, bg: Colors.successLight }
      default:
        return { texto: 'Histórico', cor: Colors.textSecundario, bg: Colors.bgSecundario }
    }
  }

  const excluirVacina = async () => {
    if (!vacinaSelecionada) return

    try {
      const todasVacinas = await buscarVacinas()

      const novaListaGeral = todasVacinas.filter(
        (v: Vacina) => String(v.id) !== String(vacinaSelecionada.id)
      )

      await salvarVacinas(novaListaGeral)

      setListaVacinas(novaListaGeral)
      setConfirmModalVisible(false)
      setMenuVisible(false)
      setVacinaSelecionada(null)
    } catch (error) {
      console.error('Erro ao excluir vacina:', error)
    }
  }

  const vacinasDoPet = listaVacinas
    .filter(v => v.idPet === id)
    .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())

  const vacinasAtivas = vacinasDoPet.filter(v => obtenerStatusVacina(v) !== 'sem-vacina')
  const totalVacinas = vacinasDoPet.length

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
          mensagem='Ops! Não conseguimos localizar os dados deste pet. Você será redirecionado para página home ;).'
          onClose={() => router.replace('/')}
        />
      </View>
    )
  }

  return (
    <View style={styles.mainContainer}>
      <Header titulo={`Vacinas: ${pet.nome}`} />

      <View style={styles.content}>
        <View style={styles.profileCard}>
          <View style={styles.profileHeaderRow}>
            <Text style={styles.petNome} numberOfLines={2}>
              {pet.nome}
            </Text>

            <View style={styles.pointsBadge}>
              <Text style={styles.pointsText}>
                🛡️ {totalVacinas} vacinas
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>VACINAS ATIVAS</Text>
            <Text style={styles.infoValue}>{vacinasAtivas.length}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>ID DO PET</Text>
            <Text style={styles.infoValue}>{pet.id}</Text>
          </View>
        </View>

        <Text style={styles.tituloSecao}>Cartão de Vacinas</Text>

        <FlatList
          data={vacinasDoPet}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 120 }}
          ListEmptyComponent={
            <View style={styles.emptyStateContainer}>
              <Text style={styles.vazioTexto}>
                Nenhuma vacina cadastrada para este pet.
              </Text>
            </View>
          }
          renderItem={({ item }) => {
            const status = obtenerStatusVacina(item)
            const configStatus = obtenerEstiloStatus(status)

            return (
              <TouchableOpacity
                activeOpacity={0.75}
                style={[
                  styles.cardVacina,
                  status === 'atrasada' && styles.cardAtrasada,
                  status === 'proxima' && styles.cardProxima,
                  status === 'em-dia' && styles.cardEmDia,
                ]}
                onPress={() => {
                  setVacinaSelecionada(item)
                  setMenuVisible(true)
                }}
              >
                <View style={styles.cardTop}>
                  <Text style={styles.nomeVacina} numberOfLines={2}>
                    {item.vacina}
                  </Text>

                  <View style={[styles.statusBadge, { backgroundColor: configStatus.bg }]}>
                    <Text style={[styles.statusText, { color: configStatus.cor }]}>
                      {configStatus.texto}
                    </Text>
                  </View>
                </View>

                <View style={styles.dividerCard} />

                <View style={styles.infoRowCard}>
                  <Text style={styles.cardLabel}>Dose</Text>
                  <Text style={styles.cardValue}>{item.dose}</Text>
                </View>

                <View style={styles.infoRowCard}>
                  <Text style={styles.cardLabel}>Aplicada em</Text>
                  <Text style={styles.cardValue}>{formatarData(item.data)}</Text>
                </View>

                {item.proxima && (
                  <View style={styles.infoRowCard}>
                    <Text style={styles.cardLabel}>Próxima dose</Text>
                    <Text style={styles.cardValue}>{formatarData(item.proxima)}</Text>
                  </View>
                )}
              </TouchableOpacity>
            )
          }}
        />
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push(`/services/vacinas/novo?id=${pet.id}`)}
          activeOpacity={0.85}
        >
          <Text style={styles.buttonText}>Nova Vacina</Text>
        </TouchableOpacity>
      </View>

      <MenuModal
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
        title={vacinaSelecionada?.vacina || 'Vacina'}
        options={[
          {
            label: 'Editar Vacina',
            onPress: () => {
              if (!vacinaSelecionada) return
              setMenuVisible(false)
              router.push(`/services/vacinas/editar?id=${vacinaSelecionada.id}`)
            }
          },
          {
            label: 'Excluir Vacina',
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
          setVacinaSelecionada(null)
        }}
        title={`Excluir ${vacinaSelecionada?.vacina || 'vacina'}?`}
        options={[
          {
            label: 'Confirmar Exclusão',
            isDanger: true,
            onPress: () => excluirVacina()
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
    marginVertical: 12,
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
  cardVacina: {
    backgroundColor: Colors.bg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 10,
  },
  cardAtrasada: {
    borderColor: Colors.danger,
    backgroundColor: Colors.dangerLight,
  },
  cardProxima: {
    borderColor: Colors.warning,
    backgroundColor: Colors.warningLight,
  },
  cardEmDia: {
    borderColor: Colors.success,
    backgroundColor: Colors.successLight,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
  },
  nomeVacina: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrincipal,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  infoRowCard: {
    marginBottom: 8,
  },
  cardLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textSecundario,
    letterSpacing: 0.6,
    marginBottom: 2,
  },
  cardValue: {
    fontSize: 14,
    color: Colors.textPrincipal,
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