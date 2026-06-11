import { StyleSheet, Text, View, TextInput, TouchableOpacity, Platform } from 'react-native'
import { useState } from 'react'
import { useLocalSearchParams, router } from 'expo-router'
import { gerarPetId } from '../data/pets'
import Header from '../components/Header'
import DateInput from '../components/DateInput'
import MessageModal from '../components/MessageModal'
import { buscarPets, salvarPets } from '../storage/petsStorage'

export default function NovoPet() {
  const { idCliente } = useLocalSearchParams()

  const [nome, setNome] = useState('')
  const [especieSelecionada, setEspecieSelecionada] = useState('')
  const [outraEspecie, setOutraEspecie] = useState('')
  const [raca, setRaca] = useState('')
  const [sexo, setSexo] = useState('')
  const [nascimento, setNascimento] = useState<Date | null>(null)

  const [modalVisible, setModalVisible] = useState(false)
  const [mensagemModal, setMensagemModal] = useState('')

  async function salvarPet() {
    const especieFinal =
      especieSelecionada === 'Outro'
        ? outraEspecie.trim()
        : especieSelecionada.trim()

    if (!idCliente || !nome.trim() || !especieFinal || !sexo.trim()) {
      setMensagemModal('Preencha os campos obrigatórios (*)')
      setModalVisible(true)
      return
    }

    const novoPet = {
      id: gerarPetId(),
      nome: nome.trim(),
      especie: especieFinal,
      raca: raca.trim(),
      sexo: sexo.trim(),
      nascimento: nascimento ? nascimento.toISOString() : null,
      idCliente: String(idCliente)
    }

    const listaPets = (await buscarPets()) || []
    listaPets.push(novoPet)
    await salvarPets(listaPets)

    router.back()
  }

  return (
    <View style={styles.mainContainer}>
      <Header titulo="Novo Pet" />

      <View style={styles.content}>
        <View style={styles.inputGroup}>
          <Text style={styles.fieldLabel}>NOME DO PET *</Text>
          <TextInput
            placeholder="Ex: Rex"
            placeholderTextColor={Colors.textSecundario}
            style={styles.input}
            value={nome}
            onChangeText={setNome}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.fieldLabel}>ESPÉCIE *</Text>

          <View style={styles.optionContainer}>
            <TouchableOpacity
              style={[
                styles.optionButton,
                especieSelecionada === 'Cachorro' && styles.optionButtonSelected
              ]}
              onPress={() => {
                setEspecieSelecionada('Cachorro')
                setOutraEspecie('')
              }}
              activeOpacity={0.85}
            >
              <Text
                style={[
                  styles.optionText,
                  especieSelecionada === 'Cachorro' && styles.optionTextSelected
                ]}
              >
                Cachorro
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.optionButton,
                especieSelecionada === 'Gato' && styles.optionButtonSelected
              ]}
              onPress={() => {
                setEspecieSelecionada('Gato')
                setOutraEspecie('')
              }}
              activeOpacity={0.85}
            >
              <Text
                style={[
                  styles.optionText,
                  especieSelecionada === 'Gato' && styles.optionTextSelected
                ]}
              >
                Gato
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.optionButton,
                especieSelecionada === 'Outro' && styles.optionButtonSelected
              ]}
              onPress={() => setEspecieSelecionada('Outro')}
              activeOpacity={0.85}
            >
              <Text
                style={[
                  styles.optionText,
                  especieSelecionada === 'Outro' && styles.optionTextSelected
                ]}
              >
                Outro
              </Text>
            </TouchableOpacity>
          </View>

          {especieSelecionada === 'Outro' && (
            <View style={{ marginTop: 12 }}>
              <TextInput
                placeholder="Digite a espécie"
                placeholderTextColor={Colors.textSecundario}
                style={styles.input}
                value={outraEspecie}
                onChangeText={setOutraEspecie}
              />
            </View>
          )}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.fieldLabel}>SEXO *</Text>

          <View style={styles.optionContainer}>
            <TouchableOpacity
              style={[
                styles.optionButton,
                sexo === 'Macho' && styles.optionButtonSelected
              ]}
              onPress={() => setSexo('Macho')}
              activeOpacity={0.85}
            >
              <Text
                style={[
                  styles.optionText,
                  sexo === 'Macho' && styles.optionTextSelected
                ]}
              >
                Macho
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.optionButton,
                sexo === 'Fêmea' && styles.optionButtonSelected
              ]}
              onPress={() => setSexo('Fêmea')}
              activeOpacity={0.85}
            >
              <Text
                style={[
                  styles.optionText,
                  sexo === 'Fêmea' && styles.optionTextSelected
                ]}
              >
                Fêmea
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.fieldLabel}>RAÇA</Text>
          <TextInput
            placeholder="Ex: Labrador"
            placeholderTextColor={Colors.textSecundario}
            style={styles.input}
            value={raca}
            onChangeText={setRaca}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.fieldLabel}>DATA DE NASCIMENTO</Text>
          <DateInput
            placeholder="Selecione uma data"
            value={nascimento}
            onChange={setNascimento}
            style={styles.input}
          />
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.button}
          onPress={salvarPet}
          activeOpacity={0.85}
        >
          <Text style={styles.buttonText}>Salvar Pet</Text>
        </TouchableOpacity>
      </View>

      <MessageModal
        visible={modalVisible}
        mensagem={mensagemModal}
        onClose={() => setModalVisible(false)}
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
    gap: 10,
    flexWrap: 'wrap',
  },

  optionButton: {
    flexGrow: 1,
    flexBasis: 0,
    minWidth: 100,
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