import { StyleSheet, View, Text, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native'
import { useEffect, useState } from 'react'
import { useLocalSearchParams, router } from 'expo-router'
import Header from '@/app/components/Header'
import DateInput from '@/app/components/DateInput'
import MessageModal from '@/app/components/MessageModal'
import { buscarVacinas, salvarVacinas } from '@/app/storage/vacinasStrorage'
import { buscarPets } from '@/app/storage/petsStorage'

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

  const [loading, setLoading] = useState(true)
  const [vacinaAtual, setVacinaAtual] = useState<Vacina | null>(null)
  const [pet, setPet] = useState<any>(null)

  const [vacina, setVacina] = useState('')
  const [dose, setDose] = useState('')
  const [data, setData] = useState<Date | null>(null)
  const [proxima, setProxima] = useState<Date | null>(null)

  const [messageVisible, setMessageVisible] = useState(false)
  const [mensagem, setMensagem] = useState('')

  useEffect(() => {
    async function carregarDadosVacina() {
      try {
        setLoading(true)
        const [allVacinas, allPets] = await Promise.all([
          buscarVacinas(),
          buscarPets()
        ])

        const vAtual = allVacinas.find((v: Vacina) => v.id === vacinaId)
        
        if (vAtual) {
          setVacinaAtual(vAtual)
          setPet(allPets.find((p: any) => p.id === vAtual.idPet) || null)

          setVacina(vAtual.vacina)
          setDose(vAtual.dose)
          setData(new Date(vAtual.data))
          setProxima(vAtual.proxima ? new Date(vAtual.proxima) : null)
        }
      } catch (error) {
        console.error("Erro ao buscar dados da vacina:", error)
      } finally {
        setLoading(false)
      }
    }

    carregarDadosVacina()
  }, [vacinaId])

  async function salvarVacina() {
    if (!vacinaAtual) return

    if (!vacina || !dose || !data || !proxima) {
      setMensagem('Preencha os campos obrigatórios (*)')
      setMessageVisible(true)
      return
    }

    try {

      const todasVacinas = await buscarVacinas()

      const vacinasAtualizadas = todasVacinas.map((v: Vacina) => {
        if (v.id === vacinaAtual.id) {
          return {
            ...v, 
            vacina: vacina.trim(),
            dose: dose.trim(),
            data: data.toISOString(),
            proxima: proxima ? proxima.toISOString() : undefined
          }
        }
        return v
      })

      await salvarVacinas(vacinasAtualizadas)
      
      router.back()
    } catch (error) {
      console.error("Erro ao salvar vacina:", error)
      setMensagem("Ops! Não foi possível salvar as alterações.")
      setMessageVisible(true)
    }
  }

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#015DAD" />
      </View>
    )
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
        <Header titulo={`Editar Vacina: ${pet.nome}`} />
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
          placeholder='Próxima*'
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
    borderRadius: 6,
    backgroundColor: '#F9F9F9'
  },
  button: {
    backgroundColor: '#015DAD',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 15
  },
  buttonText: {
    color: '#FFF',
    fontWeight: '600'
  }
})