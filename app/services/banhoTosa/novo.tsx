import { useLocalSearchParams } from 'expo-router'
import {StyleSheet, TouchableOpacity, View, Text, TextInput, Modal} from 'react-native'
import { pets } from '@/app/data/pets'
import { useState } from 'react'
import { gerarServicoId, servicos } from '@/app/data/servicos'
import { clientes } from '@/app/data/clientes'
import { router } from 'expo-router'
import Header from '@/app/components/Header'

export default function NovoServico(){
  const {id} = useLocalSearchParams()

  const [menuVisible, setMenuVisible] = useState(false)
  const [mensagem, setMensagem] = useState('')

  const [banho, setBanho] = useState(false)
  const [tosa, setTosa] = useState(false)
  const [data, setData] = useState('')

  function registrarServico() {
    const pet = pets.find(p => p.id === id)
    if (!pet) return

    const cliente = clientes.find(c => c.id === pet.idCliente)
    if (!cliente) return

    if(!banho && !tosa){
      setMensagem('Selecione pelo menos um serviço')
      setMenuVisible(true)
      return
    }

    const dataAtual = data || new Date().toISOString()

    if(banho) {
      const pontos = 10

      servicos.push({
        id: gerarServicoId(),
        servico: 'Banho',
        data: dataAtual, 
        pontos,
        idPet: pet.id,
        idCliente: cliente.id
      })
      
      cliente.pontos = (cliente.pontos || 0) + pontos
    }
    
    if(tosa) {
      const pontos = 15

      servicos.push({
        id: gerarServicoId(),
        servico: 'Tosa',
        data: dataAtual,
        pontos,
        idPet: pet.id,
        idCliente: cliente.id
      })
      
      cliente.pontos = (cliente.pontos || 0) + pontos
    }

    router.back()
  }

  return(
    <View style={{flex: 1}}>

      <View>
        <Header titulo='Novo Serviço'/>
      </View>

      <View style={styles.container}>

        <TextInput
          placeholder='Data'
          value={data}
          onChangeText={setData}
          style={{
            borderWidth: 1,
            padding: 8,
            borderColor: '#CCC',
            marginBottom: 10
          }}
        />
        
        <TouchableOpacity onPress={() => setBanho(!banho)}>
          <Text>{banho ? '[X]' : '[  ]'} Banho</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setTosa(!tosa)}>
          <Text>{tosa ? '[X]' : '[  ]'} Tosa</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button} 
          onPress={registrarServico}
        >
          <Text style={styles.buttonText}>Registrar</Text>
        </TouchableOpacity>
        
      </View>

      <Modal
        visible={menuVisible}
        transparent
        animationType='fade'
        onRequestClose={() => setMenuVisible(false)}
      >
        <View style={stylesModal.overlay}>

          <View style={stylesModal.menu}>

            <Text style={stylesModal.title}>
              {mensagem}
            </Text>

            <TouchableOpacity
              style={stylesModal.button}
              onPress={() => setMenuVisible(false)}
            >
              <Text>Ok</Text>
            </TouchableOpacity>

          </View>

        </View>

      </Modal>

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

const stylesModal = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "center",
        alignItems: "center"
    },
    menu: {
        width: 260,
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 16
    },
    title: {
        fontSize: 16,
        fontWeight: "bold",
        marginBottom: 10
    },
    button: {
        padding: 12
    },
    buttonDanger: {
        padding: 12
    }
})