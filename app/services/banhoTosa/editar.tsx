import { StyleSheet, TouchableOpacity, View, Text, ActivityIndicator, Platform } from 'react-native'
import { useEffect, useState } from 'react'
import { useLocalSearchParams, router } from 'expo-router'
import Header from '@/app/components/Header'
import DateInput from '@/app/components/DateInput'
import MessageModal from '@/app/components/MessageModal'

import { buscarPets } from '@/app/storage/petsStorage'
import { buscarServicos, salvarServicos } from '@/app/storage/servicosStorage'
import { buscarClientes, salvarClientes } from '@/app/storage/clientesStorage'

export default function EditarServico() {
  const { id } = useLocalSearchParams()

  const servicoId = Array.isArray(id) ? id[0] : id

  const [loading, setLoading] = useState(true)
  const [servicoAtual, setServicoAtual] = useState<any>(null)
  const [pet, setPet] = useState<any>(null)
  const [cliente, setCliente] = useState<any>(null)

  const [banho, setBanho] = useState(false)
  const [tosa, setTosa] = useState(false)
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

        const sAtual = allServicos.find((s: any) => String(s.id) === String(servicoId))

        if (sAtual) {
          setServicoAtual(sAtual)
          setPet(allPets.find((p: any) => String(p.id) === String(sAtual.idPet)) || null)
          setCliente(allClientes.find((c: any) => String(c.id) === String(sAtual.idCliente)) || null)

          setData(new Date(sAtual.data))

          if (sAtual.servico === 'Banho') {
            setBanho(true)
            setTosa(false)
          }

          if (sAtual.servico === 'Tosa') {
            setTosa(true)
            setBanho(false)
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

    if (!data || (!banho && !tosa)) {
      setMensagem('Preencha os campos obrigatórios (*)')
      setMessageVisible(true)
      return
    }

    try {
      let novoServico = ''
      let novosPontos = 0

      // Impede que um serviço que já foi resgatado (zerado) volte a dar pontos ao ser editado
      const jaFoiResgatado = Number(servicoAtual.pontos || 0) === 0

      if (banho) {
        novoServico = 'Banho'
        novosPontos = jaFoiResgatado ? 0 : 10
      }

      if (tosa) {
        novoServico = 'Tosa'
        novosPontos = jaFoiResgatado ? 0 : 15
      }

      const [todosServicos, todosClientes, todosPets] = await Promise.all([
        buscarServicos(),
        buscarClientes(),
        buscarPets()
      ])

      // 1. Atualiza o serviço editado mantendo a estrutura da lista original
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

      // 2. Mapeia os pets do cliente atual para realizar a soma correta
      const petsDoCliente = todosPets.filter((p: any) => String(p.idCliente) === String(cliente.id))
      const idsPetsDoCliente = petsDoCliente.map((p: any) => String(p.id))

      // 3. Soma os pontos apenas dos serviços reais atrelados aos pets desse cliente específico
      const totalPontosAtualizados = servicosAtualizados
        .filter((s: any) => idsPetsDoCliente.includes(String(s.idPet)))
        .reduce((acc: number, curr: any) => acc + Number(curr.pontos || 0), 0)

      // 4. Grava o valor final diretamente no perfil do cliente
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
      <Header titulo="Editar Serviço" />

      <View style={styles.content}>
        <View style={styles.inputGroup}>
          <Text style={styles.fieldLabel}>SERVIÇO *</Text>

          <View style={styles.optionContainer}>
            <TouchableOpacity
              style={[
                styles.optionButton,
                banho && styles.optionButtonSelected
              ]}
              onPress={() => {
                setBanho(true)
                setTosa(false)
              }}
              activeOpacity={0.85}
            >
              <Text
                style={[
                  styles.optionText,
                  banho && styles.optionTextSelected
                ]}
              >
                Banho
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.optionButton,
                tosa && styles.optionButtonSelected
              ]}
              onPress={() => {
                setTosa(true)
                setBanho(false)
              }}
              activeOpacity={0.85}
            >
              <Text
                style={[
                  styles.optionText,
                  tosa && styles.optionTextSelected
                ]}
              >
                Tosa
              </Text>
            </TouchableOpacity>
          </View>
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