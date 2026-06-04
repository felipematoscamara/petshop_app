import { useLocalSearchParams, router } from 'expo-router'
import { StyleSheet, TouchableOpacity, View, Text, TextInput } from 'react-native'
import { useState } from 'react'
import { gerarVacinaId } from '@/app/data/vacinas'
import Header from '@/app/components/Header'
import DateInput from '@/app/components/DateInput'
import MessageModal from '@/app/components/MessageModal'
import { buscarPets } from '@/app/storage/petsStorage'
import { buscarVacinas, salvarVacinas } from '@/app/storage/vacinasStrorage'

export default function NovaVacina() {

  const { id } = useLocalSearchParams()

  const [vacinaSelecionada, setVacinaSelecionada] = useState('')
  const [dose, setDose] = useState('')
  const [data, setData] = useState<Date | null>(null)
  const [proxima, setProxima] = useState<Date | null>(null)

  const [messageVisible, setMessageVisible] = useState(false)
  const [mensagem, setMensagem] = useState('')

  async function salvarVacina() {

    const pets = await buscarPets()

    const pet = pets.find((p: any) => p.id === id)

    if (!pet) {
      setMensagem('Ops! Não conseguimos localizar os dados deste pet.')
      setMessageVisible(true)
      return
    }

    if (!vacinaSelecionada || !dose || !data || !proxima) {
      setMensagem('Preencha os campos obrigatórios (*)')
      setMessageVisible(true)
      return
    }

    const vacinas = await buscarVacinas()

    let nomeVacina = ''

    if (vacinaSelecionada === 'v11') {
      nomeVacina = 'V11'
    }

    if (vacinaSelecionada === 'antirrabica') {
      nomeVacina = 'Antirrábica'
    }

    if (vacinaSelecionada === 'vanguard') {
      nomeVacina = 'Vanguard'
    }

    if (vacinaSelecionada === 'anticio') {
      nomeVacina = 'Anti-cio'
    }

    vacinas.push({
      id: gerarVacinaId(),
      idVacina: vacinaSelecionada,
      vacina: nomeVacina,
      dose,
      data: data.toISOString(),
      proxima: proxima ? proxima.toISOString() : null,
      idPet: String(id)
    })

    await salvarVacinas(vacinas)

    router.back()
  }

  return (
    <View style={{ flex: 1 }}>

      <View>
        <Header titulo='Nova Vacina' />
      </View>

      <View style={styles.container}>

        <Text style={styles.label}>
          Selecione uma Vacina*
        </Text>

        <TouchableOpacity
          onPress={() => setVacinaSelecionada('v11')}
          style={styles.opcao}
        >
          <Text>
            {vacinaSelecionada === 'v11' ? '(X)' : '( )'} V11
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setVacinaSelecionada('antirrabica')}
          style={styles.opcao}
        >
          <Text>
            {vacinaSelecionada === 'antirrabica' ? '(X)' : '( )'} Antirrábica
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setVacinaSelecionada('vanguard')}
          style={styles.opcao}
        >
          <Text>
            {vacinaSelecionada === 'vanguard' ? '(X)' : '( )'} Vanguard
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setVacinaSelecionada('anticio')}
          style={styles.opcao}
        >
          <Text>
            {vacinaSelecionada === 'anticio' ? '(X)' : '( )'} Anti-cio
          </Text>
        </TouchableOpacity>

        <TextInput
          placeholder='Dose*'
          value={dose}
          onChangeText={setDose}
          style={styles.input}
        />

        <DateInput
          placeholder='Data*'
          value={data}
          onChange={setData}
        />

        <DateInput
          placeholder='Próxima*'
          value={proxima}
          onChange={setProxima}
        />

        <TouchableOpacity
          onPress={salvarVacina}
          style={styles.button}
        >
          <Text style={styles.buttonText}>
            Salvar
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF",
    padding: 20
  },

  label: {
    fontWeight: "600",
    marginBottom: 10
  },

  opcao: {
    paddingVertical: 8,
  },

  input: {
    borderWidth: 1,
    borderColor: "#CCC",
    borderRadius: 6,
    padding: 10,
    marginTop: 10,
    marginBottom: 12
  },

  button: {
    backgroundColor: "#015DAD",
    padding: 12,
    borderRadius: 6,
    alignItems: 'center'
  },

  buttonText: {
    color: "#FFF"
  }
})