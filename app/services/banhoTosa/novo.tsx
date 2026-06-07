import { useLocalSearchParams, router } from 'expo-router'
import { StyleSheet, TouchableOpacity, View, Text, Platform } from 'react-native'
import { useState } from 'react'
import { buscarPets } from '@/app/storage/petsStorage'
import { buscarClientes, salvarClientes } from '@/app/storage/clientesStorage'
import { buscarServicos, salvarServicos } from '@/app/storage/servicosStorage'
import { gerarServicoId } from '@/app/data/servicos'
import Header from '@/app/components/Header'
import DateInput from '@/app/components/DateInput'
import MessageModal from '@/app/components/MessageModal'

export default function NovoServico() {
  const { id } = useLocalSearchParams()

  const [messageVisible, setMessageVisible] = useState(false)
  const [mensagem, setMensagem] = useState('')

  const [banho, setBanho] = useState(false)
  const [tosa, setTosa] = useState(false)
  const [data, setData] = useState<Date | null>(null)

  async function registrarServico() {
    const pets = await buscarPets()
    const pet = pets.find((p: any) => p.id === id)

    if (!pet) {
      setMensagem(
        'Ops! Não conseguimos localizar os dados deste pet. Você será redirecionado para a página inicial.'
      )
      setMessageVisible(true)
      return
    }

    const clientes = await buscarClientes()
    const cliente = clientes.find((c: any) => c.id === pet.idCliente)

    if (!cliente) {
      setMensagem('Ops! Não conseguimos localizar os dados deste cliente.')
      setMessageVisible(true)
      return
    }

    if (!data || (!banho && !tosa)) {
      setMensagem('Preencha os campos obrigatórios (*)')
      setMessageVisible(true)
      return
    }

    const servicos = await buscarServicos()

    if (banho) {
      const pontos = 10

      servicos.push({
        id: gerarServicoId(),
        servico: 'Banho',
        data: data.toISOString(),
        pontos,
        idPet: pet.id,
        idCliente: cliente.id
      })

      cliente.pontos = (cliente.pontos || 0) + pontos
    }

    if (tosa) {
      const pontos = 15

      servicos.push({
        id: gerarServicoId(),
        servico: 'Tosa',
        data: data.toISOString(),
        pontos,
        idPet: pet.id,
        idCliente: cliente.id
      })

      cliente.pontos = (cliente.pontos || 0) + pontos
    }

    const novaListaClientes = clientes.map((c: any) =>
      c.id === cliente.id ? cliente : c
    )

    await salvarServicos(servicos)
    await salvarClientes(novaListaClientes)

    router.back()
  }

  return (
    <View style={styles.mainContainer}>
      <Header titulo="Novo Serviço" />

      <View style={styles.content}>
        <View style={styles.inputGroup}>
          <Text style={styles.fieldLabel}>SERVIÇOS *</Text>

          <View style={styles.optionContainer}>
            <TouchableOpacity
              style={[
                styles.optionButton,
                banho && styles.optionButtonSelected
              ]}
              onPress={() => setBanho(!banho)}
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
              onPress={() => setTosa(!tosa)}
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