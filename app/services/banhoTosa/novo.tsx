import { useLocalSearchParams, router } from 'expo-router'
import { StyleSheet, TouchableOpacity, View, Text, Platform, TextInput, ActivityIndicator } from 'react-native'
import { useState, useEffect } from 'react'
import { buscarPets } from '@/app/storage/petsStorage'
import { buscarClientes, salvarClientes } from '@/app/storage/clientesStorage'
import { buscarServicos, salvarServicos } from '@/app/storage/servicosStorage'
import { gerarServicoId } from '@/app/data/servicos'
import Header from '@/app/components/Header'
import DateInput from '@/app/components/DateInput'
import MessageModal from '@/app/components/MessageModal'

export default function NovoServico() {
  const { id } = useLocalSearchParams()
  const idPet = Array.isArray(id) ? id[0] : String(id)

  const [pet, setPet] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const [messageVisible, setMessageVisible] = useState(false)
  const [mensagem, setMensagem] = useState('')

  const [banho, setBanho] = useState(false)
  const [tosa, setTosa] = useState(false)
  const [outro, setOutro] = useState(false)
  const [outroServico, setOutroServico] = useState('')
  const [pontosOutro, setPontosOutro] = useState('')
  const [data, setData] = useState<Date | null>(null)

  useEffect(() => {
    async function carregarDadosIniciais() {
      try {
        setLoading(true)
        const pets = (await buscarPets()) || []
        const petEncontrado = pets.find((p: any) => p.id === idPet)
        setPet(petEncontrado || null)
      } catch (error) {
        console.error('Erro ao carregar dados do pet:', error)
      } finally {
        setLoading(false)
      }
    }
    carregarDadosIniciais()
  }, [idPet])

  async function registrarServico() {
    if (!pet) return

    if (!data || (!banho && !tosa && !outro)) {
      setMensagem('Preencha os campos obrigatórios (*)')
      setMessageVisible(true)
      return
    }

    if (outro && !outroServico.trim()) {
      setMensagem('Digite o nome do serviço')
      setMessageVisible(true)
      return
    }

    if (outro && !pontosOutro.trim()) {
      setMensagem('Digite a quantidade de pontos')
      setMessageVisible(true)
      return
    }

    const pontosDigitados = Number(pontosOutro)
    if (outro && (isNaN(pontosDigitados) || pontosDigitados <= 0)) {
      setMensagem('Informe uma quantidade de pontos válida')
      setMessageVisible(true)
      return
    }

    try {
      const clientes = (await buscarClientes()) || []
      const clienteEncontrado = clientes.find((c: any) => c.id === pet.idCliente)

      if (!clienteEncontrado) {
        setMensagem('Ops! Não conseguimos localizar os dados do dono deste pet.')
        setMessageVisible(true)
        return
      }

      const servicos = (await buscarServicos()) || []

      let pontosAcumuladosNesseAtendimento = 0
      const dataISO = data.toISOString()

      if (banho) {
        const pontosBanho = 10
        servicos.push({
          id: gerarServicoId(),
          servico: 'Banho',
          data: dataISO,
          pontos: pontosBanho,
          idPet: pet.id,
          idCliente: clienteEncontrado.id
        })
        pontosAcumuladosNesseAtendimento += pontosBanho
      }

      if (tosa) {
        const pontosTosa = 15
        servicos.push({
          id: gerarServicoId(),
          servico: 'Tosa',
          data: dataISO,
          pontos: pontosTosa,
          idPet: pet.id,
          idCliente: clienteEncontrado.id
        })
        pontosAcumuladosNesseAtendimento += pontosTosa
      }

      if (outro) {
        servicos.push({
          id: gerarServicoId(),
          servico: 'Outro', 
          detalheOutro: outroServico.trim(), 
          data: dataISO,
          pontos: pontosDigitados,
          idPet: pet.id,
          idCliente: clienteEncontrado.id
        })
        pontosAcumuladosNesseAtendimento += pontosDigitados
      }

      const novaListaClientes = clientes.map((c: any) => {
        if (c.id === clienteEncontrado.id) {
          return {
            ...c,
            pontos: (c.pontos || 0) + pontosAcumuladosNesseAtendimento
          }
        }
        return c
      })

      await salvarServicos(servicos)
      await salvarClientes(novaListaClientes)

      router.back()
    } catch (error) {
      console.error('Erro ao registrar serviço:', error)
      setMensagem('Não foi possível salvar o atendimento. Tente novamente.')
      setMessageVisible(true)
    }
  }

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
          mensagem="Ops! Não conseguimos localizar os dados deste pet. Você será redirecionado para a página inicial."
          onClose={() => router.replace('/')} // Redirecionamento correto e seguro caso a URL falhe
        />
      </View>
    )
  }

  return (
    <View style={styles.mainContainer}>
      
      <Header titulo={`Novo Serviço: ${pet.nome}`} />

      <View style={styles.content}>
        <View style={styles.inputGroup}>
          <Text style={styles.fieldLabel}>SERVIÇOS *</Text>

          <View style={styles.optionContainer}>
            <TouchableOpacity
              style={[styles.optionButton, banho && styles.optionButtonSelected]}
              onPress={() => {
                const novoValor = !banho
                setBanho(novoValor)
                if (novoValor) {
                  setOutro(false)
                  setOutroServico('')
                  setPontosOutro('')
                }
              }}
              activeOpacity={0.85}
            >
              <Text style={[styles.optionText, banho && styles.optionTextSelected]}>
                Banho
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.optionButton, tosa && styles.optionButtonSelected]}
              onPress={() => {
                const novoValor = !tosa
                setTosa(novoValor)
                if (novoValor) {
                  setOutro(false)
                  setOutroServico('')
                  setPontosOutro('')
                }
              }}
              activeOpacity={0.85}
            >
              <Text style={[styles.optionText, tosa && styles.optionTextSelected]}>
                Tosa
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.optionButton, outro && styles.optionButtonSelected]}
              onPress={() => {
                const novoValor = !outro
                setOutro(novoValor)
                if (novoValor) {
                  setBanho(false)
                  setTosa(false)
                } else {
                  setOutroServico('')
                  setPontosOutro('')
                }
              }}
              activeOpacity={0.85}
            >
              <Text style={[styles.optionText, outro && styles.optionTextSelected]}>
                Outro
              </Text>
            </TouchableOpacity>
          </View>

          {outro && (
            <>
              <View style={{ marginTop: 12 }}>
                <TextInput
                  placeholder="Digite o nome do serviço"
                  placeholderTextColor={Colors.textSecundario}
                  style={styles.input}
                  value={outroServico}
                  onChangeText={setOutroServico}
                />
              </View>

              <View style={{ marginTop: 12 }}>
                <TextInput
                  placeholder="Quantidade de pontos"
                  placeholderTextColor={Colors.textSecundario}
                  style={styles.input}
                  value={pontosOutro}
                  onChangeText={setPontosOutro}
                  keyboardType="numeric"
                />
              </View>
            </>
          )}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.fieldLabel}>DATA DO SERVIÇO *</Text>
          <DateInput
            placeholder="Selecione uma data"
            value={data}
            onChange={setData}
            style={styles.input}
          />
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.button}
          onPress={registrarServico}
          activeOpacity={0.85}
        >
          <Text style={styles.buttonText}>Registrar Serviço</Text>
        </TouchableOpacity>
      </View>

      <MessageModal
        visible={messageVisible}
        mensagem={mensagem}
        onClose={() => setMessageVisible(false)}
      />
    </View>
  )
}
const Colors = {
  bg: '#FFFFFF',
  bgSecundario: '#F8FAFC',
  textPrincipal: '#1E293B',
  textSecundario: '#64748B',
  primary: '#007BFF',
  border: '#E2E8F0',
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: Colors.bgSecundario,
  },

  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
  },

  inputGroup: {
    marginBottom: 20,
  },

  fieldLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textSecundario,
    letterSpacing: 0.6,
    marginBottom: 6,
  },

  input: {
    backgroundColor: Colors.bg,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
  },

  optionContainer: {
    flexDirection: 'row',
    gap: 10,
  },

  optionButton: {
    flex: 1,
    backgroundColor: Colors.bg,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.02,
        shadowRadius: 4,
      },
      android: {
        elevation: 1,
      },
    }),
  },

  optionButtonSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },

  optionText: {
    color: Colors.textPrincipal,
    fontWeight: '700',
    fontSize: 14,
  },

  optionTextSelected: {
    color: '#FFF',
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