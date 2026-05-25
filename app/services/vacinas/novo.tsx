import { useLocalSearchParams, router } from 'expo-router'
import { StyleSheet, TouchableOpacity, View, Text, TextInput } from 'react-native'
import { pets } from '@/app/data/pets'
import { useState } from 'react'
import { gerarVacinaId, vacinas } from '@/app/data/vacinas'
import Header from '@/app/components/Header'
import DateInput from '@/app/components/DateInput'
import MessageModal from '@/app/components/MessageModal'

export default function NovaVacina() {
  const { id } = useLocalSearchParams()
  const pet = pets.find(p => p.id === id)

  const [vacinaSelecionada, setVacinaSelecionada] = useState('')
  const [dose, setDose] = useState('')
  const [data, setData] = useState<Date | null>(null)
  const [proxima, setProxima] = useState<Date | null>(null)

  const [messageVisible, setMessageVisible] = useState(false)
  const [mensagem, setMensagem] = useState('')

  function salvarVacina() {
    if (!vacinaSelecionada || !dose || !data) {
      setMensagem('Preencha os campos obrigatórios (*)')
      setMessageVisible(true)
      return
    }

    if (vacinaSelecionada === 'v11') {
      vacinas.push({
        id: gerarVacinaId(),
        idVacina: 'v11',
        vacina: 'V11',
        dose,
        data: data.toISOString(),
        proxima: proxima?.toISOString(),
        idPet: id
      })
    }

    if (vacinaSelecionada === 'antirrabica') {
      vacinas.push({
        id: gerarVacinaId(),
        idVacina: 'antirrabica',
        vacina: 'Antirrábica',
        dose,
        data: data.toISOString(),
        proxima: proxima?.toISOString(),
        idPet: id
      })
    }

    if (vacinaSelecionada === 'vanguard') {
      vacinas.push({
        id: gerarVacinaId(),
        idVacina: 'vanguard',
        vacina: 'Vanguard',
        dose,
        data: data.toISOString(),
        proxima: proxima?.toISOString(),
        idPet: id
      })
    }

    if (vacinaSelecionada === 'anticio') {
      vacinas.push({
        id: gerarVacinaId(),
        idVacina: 'anticio',
        vacina: 'Anti-cio',
        dose,
        data: data.toISOString(),
        proxima: proxima?.toISOString(),
        idPet: id
      })
    }

    router.back()
  }

  if (!pet) {
    return (
      <View style={styles.container}>
        <MessageModal
          visible={true}
          mensagem='Ops! Não conseguimos localizar os dados deste pet. Você será redirecionado para página home ;).'
          onClose={() => router.replace("/")}
        />
      </View>
    )
  }

  return (
    <View style={{ flex: 1 }}>
      <View>
        <Header titulo='Nova Vacina' />
      </View>

      <View style={styles.container}>

        <Text style={styles.label}>Selecione uma Vacina*</Text>

        <TouchableOpacity onPress={() => setVacinaSelecionada('v11')} style={styles.opcao}>
          <Text>{vacinaSelecionada === 'v11' ? '(X)' : '( )'} V11</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setVacinaSelecionada('antirrabica')} style={styles.opcao}>
          <Text>{vacinaSelecionada === 'antirrabica' ? '(X)' : '( )'} Antirrábica</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setVacinaSelecionada('vanguard')} style={styles.opcao}>
          <Text>{vacinaSelecionada === 'vanguard' ? '(X)' : '( )'} Vanguard</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setVacinaSelecionada('anticio')} style={styles.opcao}>
          <Text>{vacinaSelecionada === 'anticio' ? '(X)' : '( )'} Anti-cio</Text>
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
          placeholder='Próxima'
          value={proxima}
          onChange={setProxima}
        />

        <TouchableOpacity
          onPress={salvarVacina}
          style={styles.button}
        >
          <Text style={styles.buttonText}>Salvar</Text>
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