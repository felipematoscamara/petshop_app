import { useLocalSearchParams, router } from 'expo-router'
import { StyleSheet, TouchableOpacity, View, Text, TextInput, Platform } from 'react-native'
import { useState } from 'react'
import { gerarVacinaId } from '@/app/data/vacinas'
import Header from '@/app/components/Header'
import DateInput from '@/app/components/DateInput'
import MessageModal from '@/app/components/MessageModal'
import { buscarPets } from '@/app/storage/petsStorage'
import { buscarVacinas, salvarVacinas } from '@/app/storage/vacinasStrorage'

export default function NovaVacina() {
  const { id } = useLocalSearchParams()
  const idPet = Array.isArray(id) ? id[0] : String(id)

  const [vacinaSelecionada, setVacinaSelecionada] = useState('')
  const [outraVacina, setOutraVacina] = useState('')
  const [dose, setDose] = useState('')
  const [data, setData] = useState<Date | null>(null)
  const [proxima, setProxima] = useState<Date | null>(null)

  const [messageVisible, setMessageVisible] = useState(false)
  const [mensagem, setMensagem] = useState('')

  async function salvarVacina() {
    const vacinaFinal =
      vacinaSelecionada === 'Outro'
        ? outraVacina.trim()
        : vacinaSelecionada.trim()

    const pets = await buscarPets()
    const pet = pets.find((p: any) => p.id === idPet)

    if (!pet) {
      setMensagem('Ops! Não conseguimos localizar os dados deste pet.')
      setMessageVisible(true)
      return
    }

    if (!vacinaSelecionada || !dose.trim() || !data || !proxima) {
      setMensagem('Preencha os campos obrigatórios (*)')
      setMessageVisible(true)
      return
    }

    if (vacinaSelecionada === 'Outro' && !outraVacina.trim()) {
      setMensagem('Digite o nome da vacina')
      setMessageVisible(true)
      return
    }

    const vacinas = await buscarVacinas()

    vacinas.push({
      id: gerarVacinaId(),
      idVacina: vacinaSelecionada,
      vacina: vacinaFinal,
      dose: dose.trim(),
      data: data.toISOString(),
      proxima: proxima.toISOString(),
      idPet: idPet
    })

    await salvarVacinas(vacinas)

    router.back()
 }

  return (
    <View style={styles.mainContainer}>
      <Header titulo='Nova Vacina' />

      <View style={styles.content}>
        <View style={styles.inputGroup}>
          <Text style={styles.fieldLabel}>VACINA *</Text>

          <View style={styles.optionContainer}>
            <TouchableOpacity
              onPress={() => setVacinaSelecionada('v11')}
              style={[
                styles.optionButton,
                vacinaSelecionada === 'v11' && styles.optionButtonSelected
              ]}
              activeOpacity={0.85}
            >
              <Text
                style={[
                  styles.optionText,
                  vacinaSelecionada === 'v11' && styles.optionTextSelected
                ]}
              >
                V11
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setVacinaSelecionada('antirrabica')}
              style={[
                styles.optionButton,
                vacinaSelecionada === 'antirrabica' && styles.optionButtonSelected
              ]}
              activeOpacity={0.85}
            >
              <Text
                style={[
                  styles.optionText,
                  vacinaSelecionada === 'antirrabica' && styles.optionTextSelected
                ]}
              >
                Antirrábica
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setVacinaSelecionada('vanguard')}
              style={[
                styles.optionButton,
                vacinaSelecionada === 'vanguard' && styles.optionButtonSelected
              ]}
              activeOpacity={0.85}
            >
              <Text
                style={[
                  styles.optionText,
                  vacinaSelecionada === 'vanguard' && styles.optionTextSelected
                ]}
              >
                Vanguard
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setVacinaSelecionada('anticio')}
              style={[
                styles.optionButton,
                vacinaSelecionada === 'anticio' && styles.optionButtonSelected
              ]}
              activeOpacity={0.85}
            >
              <Text
                style={[
                  styles.optionText,
                  vacinaSelecionada === 'anticio' && styles.optionTextSelected
                ]}
              >
                Anti-cio
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.optionButton,
                vacinaSelecionada === 'Outro' && styles.optionButtonSelected
              ]}
              onPress={() => setVacinaSelecionada('Outro')}
              activeOpacity={0.85}
            >
              <Text
                style={[
                  styles.optionText,
                  vacinaSelecionada === 'Outro' && styles.optionTextSelected
                ]}
              >
                Outro
              </Text>
            </TouchableOpacity>
          </View>

          {vacinaSelecionada === 'Outro' && (
            <View style={{ marginTop: 12 }}>
              <TextInput
                placeholder="Digite a vacina"
                placeholderTextColor={Colors.textSecundario}
                style={styles.input}
                value={outraVacina}
                onChangeText={setOutraVacina}
              />
            </View>
          )}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.fieldLabel}>DOSE *</Text>
          <TextInput
            placeholder='Ex: 1ª dose'
            placeholderTextColor={Colors.textSecundario}
            value={dose}
            onChangeText={setDose}
            style={styles.input}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.fieldLabel}>DATA DA APLICAÇÃO *</Text>
          <DateInput
            placeholder='Selecione uma data'
            value={data}
            onChange={setData}
            style={styles.input}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.fieldLabel}>PRÓXIMA DOSE *</Text>
          <DateInput
            placeholder='Selecione uma data'
            value={proxima}
            onChange={setProxima}
            style={styles.input}
          />
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          onPress={salvarVacina}
          style={styles.button}
          activeOpacity={0.85}
        >
          <Text style={styles.buttonText}>
            Salvar Vacina
          </Text>
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
    fontSize: 15,
    color: Colors.textPrincipal,
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

  optionContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },

  optionButton: {
    flexGrow: 1,
    flexBasis: '48%',
    backgroundColor: Colors.bg,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
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