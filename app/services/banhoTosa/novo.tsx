import { useLocalSearchParams, router } from 'expo-router'
import { StyleSheet, TouchableOpacity, View, Text } from 'react-native'
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
      setMensagem('Ops! Não conseguimos localizar os dados deste pet. Você será redirecionado para a página inicial.')
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
    <View style={{ flex: 1 }}>
      <View>
        <Header titulo='Novo Serviço' />
      </View>

      <View style={styles.container}>
        <Text style={styles.label}>
          Selecione um Serviço*
        </Text>

        <TouchableOpacity
          onPress={() => setBanho(!banho)}
          style={styles.opcao}
        >
          <Text>
            {banho ? '(X)' : '( )'} Banho
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setTosa(!tosa)}
          style={[styles.opcao, { marginBottom: 10 }]}
        >
          <Text>
            {tosa ? '(X)' : '( )'} Tosa
          </Text>
        </TouchableOpacity>

        <DateInput
          placeholder='Data*'
          value={data}
          onChange={setData}
        />

        <TouchableOpacity
          style={styles.button}
          onPress={registrarServico}
        >
          <Text style={styles.buttonText}>Registrar</Text>
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
    alignItems: 'center'
  },

  buttonText: {
    color: "#FFF"
  },

  label: {
    marginBottom: 10,
    fontWeight: "600"
  },

  opcao: {
    paddingVertical: 8
  }
})