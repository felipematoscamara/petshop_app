import { useLocalSearchParams } from 'expo-router'
import {StyleSheet, TouchableOpacity, View, Text, TextInput, Alert} from 'react-native'
import { pets } from '@/app/data/pets'
import { useState } from 'react'
import { gerarServicoId, servicos } from '@/app/data/servicos'
import { clientes } from '@/app/data/clientes'
import { router } from 'expo-router'

export default function NovoServico(){
  const {id} = useLocalSearchParams()
  const [banho, setBanho] = useState(false)
  const [tosa, setTosa] = useState(false)
  const [data, setData] = useState('')

  function registrarServico() {
    const pet = pets.find(p => p.id === id)
    if (!pet) return

    const cliente = clientes.find(c => c.id === pet.idCliente)
    if (!cliente) return

    if(!banho && !tosa){
      Alert.alert('Erro','Selecione pelo menos um serviço')
      return
    }

    const dataAtual = data || new Date().toISOString()

    if(banho) {
      const pontos = 10

      servicos.push({
        id: gerarServicoId(),
        servico: 'banho',
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
        servico: 'tosa',
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