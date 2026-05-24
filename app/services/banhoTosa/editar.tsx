import { StyleSheet, TouchableOpacity, View, Text } from 'react-native'
import { useEffect, useState } from 'react'
import { useLocalSearchParams, router } from 'expo-router'
import { pets } from '@/app/data/pets'
import { servicos } from '@/app/data/servicos'
import { clientes } from '@/app/data/clientes'
import Header from '@/app/components/Header'
import DateInput from '@/app/components/DateInput'
import MessageModal from '@/app/components/MessageModal'

type Servico = {
  id: string
  idPet: string
  idCliente: string
  servico: string
  data: string
  pontos: number
}

export default function EditarServico() {
  const { id } = useLocalSearchParams()

  const servicoId = Array.isArray(id) ? id[0] : id
  const servicoAtual = servicos.find(s => s.id === servicoId)

  const pet = servicoAtual
    ? pets.find(p => p.id === servicoAtual.idPet)
    : undefined

  const cliente = servicoAtual
    ? clientes.find(c => c.id === servicoAtual.idCliente)
    : undefined

  const [banho, setBanho] = useState(false)
  const [tosa, setTosa] = useState(false)
  const [data, setData] = useState<Date | null>(null)

  const [messageVisible, setMessageVisible] = useState(false)
  const [mensagem, setMensagem] = useState('')

  useEffect(() => {
    if (!servicoAtual) return

    setData(new Date(servicoAtual.data))

    if (servicoAtual.servico === 'Banho') {
      setBanho(true)
    }

    if (servicoAtual.servico === 'Tosa') {
      setTosa(true)
    }
  }, [servicoAtual])

  function salvarServico() {
    if (!servicoAtual || !cliente) return

    if (!data || (!banho && !tosa)) {
      setMensagem('Preencha os campos obrigatórios (*)')
      setMessageVisible(true)
      return
    }

    let novoServico = ''
    let novosPontos = 0

    if (banho) {
      novoServico = 'Banho'
      novosPontos = 10
    }

    if (tosa) {
      novoServico = 'Tosa'
      novosPontos = 15
    }

    cliente.pontos -= servicoAtual.pontos

    cliente.pontos += novosPontos

    const indice = servicos.findIndex(
      s => s.id === servicoAtual.id
    )

    if (indice !== -1) {
      servicos[indice] = {
        ...servicoAtual,
        servico: novoServico,
        data: data.toISOString(),
        pontos: novosPontos
      }
    }

    router.back()
  }

  if (!servicoAtual || !pet || !cliente) {
    return (
      <View style={styles.container}>

        <MessageModal
          visible={true}
          mensagem='Ops! Não conseguimos localizar os dados deste serviço. Você será redirecionado para página home ;).'
          onClose={() => router.replace("/")}
        />

      </View>
    )
  }

  return (
    <View style={{ flex: 1 }}>

      <View>
        <Header titulo='Editar Serviço' />
      </View>

      <View style={styles.container}>

        <DateInput
          placeholder='Data*'
          value={data}
          onChange={setData}
        />

        <Text>Selecione um Serviço*</Text>

        <TouchableOpacity
          onPress={() => {
            setBanho(true)
            setTosa(false)
          }}
        >
          <Text>{banho ? '[X]' : '[  ]'} Banho</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            setTosa(true)
            setBanho(false)
          }}
        >
          <Text>{tosa ? '[X]' : '[  ]'} Tosa</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={salvarServico}
        >
          <Text style={styles.buttonText}>
            Salvar Alterações
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

  button: {
    backgroundColor: "#015DAD",
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 10
  },

  buttonText: {
    color: "#FFF"
  }
})