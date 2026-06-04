import { View, StyleSheet, TextInput, TouchableOpacity, Text } from 'react-native'
import { useState } from 'react'
import { router } from 'expo-router'
import Header from '../components/Header'
import MessageModal from '../components/MessageModal'
import { gerarId } from '../data/clientes'
import { buscarClientes, salvarClientes } from '../storage/clientesStorage'

export default function NovoCliente() {
  const [nome, setNome] = useState('')
  const [telefone, setTelefone] = useState('')
  const [endereco, setEndereco] = useState('')
  const [modalVisible, setModalvisible] = useState(false)

  async function salvarCliente() {
    if (!nome) {
      setModalvisible(true)
      return
    }

    const novoCliente = {
      id: gerarId(),
      nome,
      telefone,
      endereco,
      pontos: 0
    }

    const listaClientes = await buscarClientes()
    listaClientes.push(novoCliente)
    await salvarClientes(listaClientes)

    router.back()
  }

  return (
    <View style={{ flex: 1 }}>
      <View>
        <Header titulo='Novo Cliente' />
      </View>

      <View style={styles.container}>
        <TextInput
          placeholder='Nome*'
          style={styles.input}
          value={nome}
          onChangeText={setNome}
        />

        <TextInput
          placeholder='Telefone'
          style={styles.input}
          value={telefone}
          onChangeText={setTelefone}
          keyboardType="phone-pad"
        />

        <TextInput
          placeholder='Endereço'
          style={styles.input}
          value={endereco}
          onChangeText={setEndereco}
        />

        <TouchableOpacity
          style={styles.button}
          onPress={salvarCliente}
        >
          <Text style={styles.buttonText}>Salvar</Text>
        </TouchableOpacity>
      </View>

      <MessageModal
        visible={modalVisible}
        mensagem='Preencha os campos obrigatórios (*)'
        onClose={() => setModalvisible(false)}
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

  input: {
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#CCC",
    padding: 10,
    borderRadius: 6
  },

  button: {
    backgroundColor: "#015DAD",
    padding: 12,
    borderRadius: 6,
    alignItems: "center"
  },

  buttonText: {
    color: "#FFF"
  }
})