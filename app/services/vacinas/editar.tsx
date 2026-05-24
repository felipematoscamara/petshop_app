import { StyleSheet, View, Text, TextInput, TouchableOpacity } from 'react-native'
import { useEffect, useState } from 'react'
import { useLocalSearchParams, router } from 'expo-router'
import { pets } from '@/app/data/pets'
import { vacinas } from '@/app/data/vacinas'
import Header from '@/app/components/Header'
import DateInput from '@/app/components/DateInput'
import MessageModal from '@/app/components/MessageModal'

type Vacina = {
  id: string
  idPet: string
  vacina: string
  dose: string
  data: string
  proxima?: string
}

export default function EditarVacina() {
  const { id } = useLocalSearchParams()

  const vacinaId = Array.isArray(id) ? id[0] : id
  const vacinaAtual = vacinas.find(v => v.id === vacinaId)
  const pet = vacinaAtual ? pets.find(p => p.id === vacinaAtual.idPet) : undefined

  const [vacina, setVacina] = useState('')
  const [dose, setDose] = useState('')
  const [data, setData] = useState<Date | null>(null)
  const [proxima, setProxima] = useState<Date | null>(null)

  const [messageVisible, setMessageVisible] = useState(false)
  const [mensagem, setMensagem] = useState('')

  useEffect(() => {
    if (!vacinaAtual) return

    setVacina(vacinaAtual.vacina)
    setDose(vacinaAtual.dose)
    setData(new Date(vacinaAtual.data))
    setProxima(vacinaAtual.proxima ? new Date(vacinaAtual.proxima) : null)
  }, [vacinaAtual])

  function salvarVacina() {
    if (!vacinaAtual) return

    if (!vacina || !dose || !data) {
      setMensagem('Preencha os campos obrigatórios (*)')
      setMessageVisible(true)
      return
    }

    const vacinaEditada: Vacina = {
      ...vacinaAtual,
      vacina,
      dose,
      data: data.toISOString(),
      proxima: proxima ? proxima.toISOString() : undefined
    }

    const indice = vacinas.findIndex(v => v.id === vacinaAtual.id)

    if (indice !== -1) {
      vacinas[indice] = vacinaEditada
    }

    router.back()
  }

  if (!vacinaAtual || !pet) {
    return (
      <View style={styles.container}>
        <MessageModal
          visible={true}
          mensagem='Ops! Não conseguimos localizar os dados desta vacina. Você será redirecionado para a página inicial ;)'
          onClose={() => router.replace('/')}
        />
      </View>
    )
  }

  return (
    <View style={{ flex: 1 }}>
      <View>
        <Header titulo='Editar Vacina' />
      </View>

      <View style={styles.container}>
        <TextInput
          placeholder='Vacina*'
          value={vacina}
          onChangeText={setVacina}
          style={styles.input}
        />

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
          <Text style={styles.buttonText}>Salvar alterações</Text>
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
    backgroundColor: '#FFF',
    padding: 20
  },

  input: {
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#CCC',
    padding: 10,
    borderRadius: 6
  },

  button: {
    backgroundColor: '#015DAD',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center'
  },

  buttonText: {
    color: '#FFF'
  }
})