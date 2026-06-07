import { StyleSheet, View, Text, TouchableOpacity, ActivityIndicator, Platform } from 'react-native'
import { useLocalSearchParams, router, useFocusEffect } from 'expo-router'
import Header from '../components/Header'
import { useCallback, useState } from 'react'
import MessageModal from '../components/MessageModal'
import MenuModal from '../components/MenuModal'
import { buscarPets, salvarPets } from '../storage/petsStorage'

const Colors = {
  bg: '#FFFFFF',
  bgSecundario: '#F8FAFC',

  textPrincipal: '#1E293B',
  textSecundario: '#64748B',

  primary: '#007BFF',
  border: '#E2E8F0',

  danger: '#EF4444',
}


function formatarNascimento(data?: string) {
  if (!data) return 'Não informado'
  let date: Date;
  if (data.includes('-') && !data.includes('T')) {
    const [ano, mes, dia] = data.split('-').map(Number);
    date = new Date(ano, mes - 1, dia);
  } else {
    date = new Date(data);
  }

  if (isNaN(date.getTime())) return 'Não informado'
  return date.toLocaleDateString('pt-BR')
}

export default function Details() {
  const { id } = useLocalSearchParams()

  const [menuVisible, setMenuVisible] = useState(false)
  const [confirmModalVisible, setConfirmModalVisible] = useState(false)
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
      <View
        style={[
          styles.mainContainer,
          {
            justifyContent: 'center',
            alignItems: 'center',
          },
        ]}
      >
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    )
  }

  if (!petAtual) {
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

  function abrirMenu() {
    setMenuVisible(true)
  }

  async function excluirPet() {
    const listaPets = await buscarPets()
    const novaLista = listaPets.filter((p: any) => p.id !== id)

    await salvarPets(novaLista)

    setConfirmModalVisible(false)
    setMenuVisible(false)
    router.back()
  }

  return (
    <View style={styles.mainContainer}>
      <MenuModal
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
        title={petAtual.nome}
        options={[
          {
            label: 'Editar Pet',
            onPress: () => {
              setMenuVisible(false)
              router.push(`/pets/editar/${id}`)
            },
          },
          {
            label: 'Excluir Pet',
            isDanger: true,
            onPress: () => {
              setMenuVisible(false)
              setConfirmModalVisible(true)
            },
          },
        ]}
      />

      <MenuModal
        visible={confirmModalVisible}
        onClose={() => setConfirmModalVisible(false)}
        title={`Excluir ${petAtual.nome}?`}
        options={[
          {
            label: 'Confirmar Exclusão',
            isDanger: true,
            onPress: () => excluirPet(),
          },
        ]}
      />

      <Header
        titulo="Pet"
        onMenuPress={abrirMenu}
      />

      <View style={styles.content}>
        <View style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <Text style={styles.nomePet}>
              {petAtual.nome}
            </Text>

            <View style={styles.petBadge}>
              <Text style={styles.petBadgeText}>
                🐾 Pet
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>ESPÉCIE</Text>
            <Text style={styles.infoValue}>
              {petAtual.especie || 'Não informada'}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>RAÇA</Text>
            <Text style={styles.infoValue}>
              {petAtual.raca || 'Não informada'}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>SEXO</Text>
            <Text style={styles.infoValue}>
              {petAtual.sexo || 'Não informado'}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>NASCIMENTO</Text>
            <Text style={styles.infoValue}>
              {formatarNascimento(petAtual.nascimento)}
            </Text>
          </View>
        </View>

        <Text style={styles.tituloSecao}>
          Serviços
        </Text>

        <TouchableOpacity
          activeOpacity={0.75}
          onPress={() => router.push(`/services/vacinas?id=${petAtual.id}`)}
          style={styles.serviceCard}
        >
          <View style={styles.serviceContent}>
            <Text style={styles.serviceTitle}>
              🛡️ Cartão de Vacinas
            </Text>

            <Text style={styles.serviceArrow}>
              →
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.75}
          onPress={() => router.push(`/services/banhoTosa?id=${petAtual.id}`)}
          style={styles.serviceCard}
        >
          <View style={styles.serviceContent}>
            <Text style={styles.serviceTitle}>
              🧼 Banho e Tosa
            </Text>

            <Text style={styles.serviceArrow}>
              →
            </Text>
          </View>
        </TouchableOpacity>

        <Text style={styles.idTexto}>
          ID: {petAtual.id}
        </Text>
      </View>

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

  profileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },

  nomePet: {
    flex: 1,
    fontSize: 22,
    fontWeight: '700',
    color: Colors.textPrincipal,
  },

  petBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },

  petBadgeText: {
    color: Colors.primary,
    fontSize: 13,
    fontWeight: '700',
  },

  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 14,
  },

  infoRow: {
    marginBottom: 14,
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

  serviceCard: {
    backgroundColor: Colors.bg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 10,
  },

  serviceContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  serviceTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrincipal,
  },

  serviceArrow: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.primary,
  },

  idTexto: {
    textAlign: 'center',
    marginTop: 24,
    color: Colors.textSecundario,
    fontSize: 11,
    letterSpacing: 0.5,
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