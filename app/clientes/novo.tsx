import { View, StyleSheet, TextInput, TouchableOpacity, Text, Platform } from 'react-native'
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
    if (!nome.trim()) {
      setModalvisible(true)
      return
    }

    const novoCliente = {
      id: gerarId(),
      nome: nome.trim(),
      telefone: telefone.trim(),
      endereco: endereco.trim(),
      pontos: 0
    }

    const listaClientes = await buscarClientes()
    listaClientes.push(novoCliente)
    await salvarClientes(listaClientes)

    router.back()
  }

  return (
    <View style={styles.mainContainer}>
      <Header titulo='Novo Cliente' />

      <View style={styles.content}>
        <View style={styles.inputGroup}>
          <Text style={styles.fieldLabel}>NOME DO CLIENTE *</Text>
          <TextInput
            placeholder='Ex: João Silva'
            placeholderTextColor={Colors.textSecundario}
            style={styles.input}
            value={nome}
            onChangeText={setNome}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.fieldLabel}>TELEFONE</Text>
          <TextInput
            placeholder='(00) 00000-0000'
            placeholderTextColor={Colors.textSecundario}
            style={styles.input}
            value={telefone}
            onChangeText={setTelefone}
            keyboardType="phone-pad"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.fieldLabel}>ENDEREÇO</Text>
          <TextInput
            placeholder='Rua, Número, Bairro'
            placeholderTextColor={Colors.textSecundario}
            style={styles.input}
            value={endereco}
            onChangeText={setEndereco}
          />
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.button}
          onPress={salvarCliente}
          activeOpacity={0.85}
        >
          <Text style={styles.buttonText}>Salvar Cliente</Text>
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
        shadowColor: "#0F172A",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.02,
        shadowRadius: 4,
      },
      android: {
        elevation: 1,
      }
    })
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.bg,
    paddingHorizontal: 16,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  button: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  buttonText: {
    color: "#FFF",
    fontWeight: "700",
    fontSize: 16,
    letterSpacing: 0.3
  }
})