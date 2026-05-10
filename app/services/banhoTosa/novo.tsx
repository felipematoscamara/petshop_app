import { useLocalSearchParams } from 'expo-router'
import {StyleSheet, TouchableOpacity, View, Text} from 'react-native'
import { pets } from '@/app/data/pets'
import { useState } from 'react'
import { gerarServicoId, servicos } from '@/app/data/servicos'
import { clientes } from '@/app/data/clientes'
import { router } from 'expo-router'
import Header from '@/app/components/Header'
import DateInput from '@/app/components/DateInput'
import MessageModal from '@/app/components/MessageModal'

export default function NovoServico(){
  const {id} = useLocalSearchParams()

  const [messageVisible, setMessageVisible] = useState(false)
  const [mensagem, setMensagem] = useState('')

  const [banho, setBanho] = useState(false)
  const [tosa, setTosa] = useState(false)
  const [data, setData] = useState<Date | null>(null)

  function registrarServico() {
    const pet = pets.find(p => p.id === id)
    if (!pet) return

    const cliente = clientes.find(c => c.id === pet.idCliente)
    
    if (!cliente) return
    
    if (!data || (!banho && !tosa)) {
      setMensagem('Preencha os campos obrigátorios (*)')
      setMessageVisible(true)
      return
    }

    if(banho) {
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
    
    if(tosa) {
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

    if(!pet){
      return(
        <View style={styles.container}>
    
          <MessageModal
            visible={true}
            mensagem='Ops! Não conseguimos localizar os dados deste pet. Você será redirecionado para página home ;).'
            onClose={() => router.replace("/")}
          />
    
        </View>
      )
    }

    router.back()
  }

  return(
    <View style={{flex: 1}}>

      <View>
        <Header titulo='Novo Serviço'/>
      </View>

      <View style={styles.container}>

        <DateInput
          placeholder='Data*'
          value={data}
          onChange={setData}
        />

        <Text>Selecione um Serviço*</Text>
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