import { useEffect, useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, Platform, ActivityIndicator, TextInput } from 'react-native'
import { useLocalSearchParams, router } from 'expo-router'
import Header from '@/app/components/Header'
import DateInput from '@/app/components/DateInput'
import MessageModal from '@/app/components/MessageModal'
import { buscarServicos, salvarServicos } from '@/app/storage/servicosStorage'
import { buscarPets } from '@/app/storage/petsStorage'
import { buscarClientes, salvarClientes } from '@/app/storage/clientesStorage'

function criarDateLocal(dataRaw?: string): Date | null {
  if (!dataRaw) return null
  const dataLimpa = dataRaw.includes('T') ? dataRaw.split('T')[0] : dataRaw
  const [ano, mes, dia] = dataLimpa.split('-').map(Number)
  return new Date(ano, mes - 1, dia)
}

export default function EditarServico() {
  const { id } = useLocalSearchParams()
  const servicoId = Array.isArray(id) ? id[0] : String(id ?? '')

  const [loading, setLoading] = useState(true)
  const [servicoAtual, setServicoAtual] = useState<any>(null)
  const [pet, setPet] = useState<any>(null)
  const [cliente, setCliente] = useState<any>(null)

  const [banho, setBanho] = useState(false)
  const [tosa, setTosa] = useState(false)
  const [outro, setOutro] = useState(false)
  const [outroServico, setOutroServico] = useState('')
  const [pontosOutro, setPontosOutro] = useState('')
  const [data, setData] = useState<Date | null>(null)

  const [messageVisible, setMessageVisible] = useState(false)
  const [mensagem, setMensagem] = useState('')

  useEffect(() => {
    async function carregarDadosServico() {
      try {
        setLoading(true)

        const [allServicos, allPets, allClientes] = await Promise.all([
          buscarServicos(),
          buscarPets(),
          buscarClientes()
        ])

        const listaServicosSegura = allServicos || []
        const listaPetsSegura = allPets || []
        const listaClientesSegura = allClientes || []

        const sAtual = listaServicosSegura.find(
          (s: any) => String(s.id) === String(servicoId)
        )

        if (sAtual) {
          setServicoAtual(sAtual)

          const petEncontrado =
            listaPetsSegura.find((p: any) => String(p.id) === String(sAtual.idPet)) || null
          setPet(petEncontrado)

          const clienteEncontrado =
            listaClientesSegura.find((c: any) => String(c.id) === String(sAtual.idCliente)) || null
          setCliente(clienteEncontrado)

          setData(criarDateLocal(sAtual.data))

          if (sAtual.servico === 'Banho') {
            setBanho(true)
            setTosa(false)
            setOutro(false)
            setOutroServico('')
            setPontosOutro('')
          } else if (sAtual.servico === 'Tosa') {
            setTosa(true)
            setBanho(false)
            setOutro(false)
            setOutroServico('')
            setPontosOutro('')
          } else {
            setOutro(true)
            setBanho(false)
            setTosa(false)
            setOutroServico(String(sAtual.servico || ''))
            setPontosOutro(String(sAtual.pontos ?? ''))
          }
        }
      } catch (error) {
        console.error('Erro ao carregar dados do serviço:', error)
      } finally {
        setLoading(false)
      }
    }

    carregarDadosServico()
  }, [servicoId])

  async function salvarServico() {
    if (!servicoAtual || !cliente) return

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
      const servicoZerado = Number(servicoAtual.pontos || 0) === 0

      let novoServico = ''
      let novosPontos = 0

      if (banho) {
        novoServico = 'Banho'
        novosPontos = servicoZerado ? 0 : 10
      } else if (tosa) {
        novoServico = 'Tosa'
        novosPontos = servicoZerado ? 0 : 15
      } else if (outro) {
        novoServico = outroServico.trim()
        novosPontos = servicoZerado ? 0 : pontosDigitados
      }

      const todosServicos = (await buscarServicos()) || []
      const todosClientes = (await buscarClientes()) || []
      const todosPets = (await buscarPets()) || []

      const servicosAtualizados = todosServicos.map((s: any) => {
        if (String(s.id) === String(servicoAtual.id)) {
          return {
            ...s,
            servico: novoServico,
            data: data.toISOString(),
            pontos: novosPontos
          }
        }
        return s
      })

      const petsDoCliente = todosPets.filter(
        (p: any) => String(p.idCliente) === String(cliente.id)
      )

      const idsPetsDoCliente = petsDoCliente.map((p: any) => String(p.id))

      const totalPontosAtualizados = servicosAtualizados
        .filter((s: any) => idsPetsDoCliente.includes(String(s.idPet)))
        .reduce((acc: number, curr: any) => acc + Number(curr.pontos || 0), 0)

      const clientesAtualizados = todosClientes.map((c: any) => {
        if (String(c.id) === String(cliente.id)) {
          return {
            ...c,
            pontos: totalPontosAtualizados
          }
        }
        return c
      })

      await Promise.all([
        salvarServicos(servicosAtualizados),
        salvarClientes(clientesAtualizados)
      ])

      router.back()
    } catch (error) {
      console.error('Erro ao atualizar o serviço:', error)
      setMensagem('Ops! Não foi possível salvar as alterações.')
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

  if (!servicoAtual || !pet || !cliente) {
    return (
      <View style={styles.mainContainer}>
        <MessageModal
          visible={true}
          mensagem="Ops! Não conseguimos localizar os dados deste serviço. Você será redirecionado."
          onClose={() => router.replace('/')}
        />
      </View>
    )
  }

  return (
    <View style={styles.mainContainer}>
      
      <Header titulo={`Editar Serviço: ${pet.nome}`} />

      <View style={styles.content}>
        <View style={styles.inputGroup}>
          <Text style={styles.fieldLabel}>SERVIÇO *</Text>

          <View style={styles.optionContainer}>
            <TouchableOpacity
              style={[styles.optionButton, banho && styles.optionButtonSelected]}
              onPress={() => {
                setBanho(true)
                setTosa(false)
                setOutro(false)
                setOutroServico('')
                setPontosOutro('')
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
                setTosa(true)
                setBanho(false)
                setOutro(false)
                setOutroServico('')
                setPontosOutro('')
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
                setOutro(true)
                setBanho(false)
                setTosa(false)
                setOutroServico('')
                setPontosOutro('')
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
          onPress={salvarServico}
          activeOpacity={0.85}
        >
          <Text style={styles.buttonText}>Salvar Alterações</Text>
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
  border: '#E2E8F0'
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: Colors.bgSecundario
  },

  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 24
  },

  inputGroup: {
    marginBottom: 20
  },

  fieldLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textSecundario,
    letterSpacing: 0.6,
    marginBottom: 6
  },

  input: {
    backgroundColor: Colors.bg,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12
  },

  optionContainer: {
    flexDirection: 'row',
    gap: 10
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
        shadowRadius: 4
      },
      android: {
        elevation: 1
      }
    })
  },

  optionButtonSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary
  },

  optionText: {
    color: Colors.textPrincipal,
    fontWeight: '700',
    fontSize: 14
  },

  optionTextSelected: {
    color: '#FFF'
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
    borderTopColor: Colors.border
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
    elevation: 3
  },

  buttonText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 16,
    letterSpacing: 0.3
  }
})