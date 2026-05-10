import {StyleSheet, Text, View, TextInput, TouchableOpacity} from 'react-native'
import { useState } from 'react'
import { useLocalSearchParams, router } from 'expo-router'
import { pets, gerarPetId } from '../data/pets'
import Header from '../components/Header'
import DateInput from '../components/DateInput'
import MessageModal from '../components/MessageModal'

export default function NovoPet(){
  const {idCliente} = useLocalSearchParams()
  const [nome, setNome] = useState('')
  const [especie, setEspecie] = useState('')
  const [raca, setRaca] = useState('')
  const [sexo, setSexo] = useState('')
  const [nascimento, setNascimento] = useState<Date | null>(null)

  const [modalVisible, setModalVisible] = useState(false)
  const [mensagemModal, setMensagemModal] = useState('')

  function salvarPet(){

    if(!idCliente || !nome || !especie){
      setMensagemModal('Preencha os campos obrigátorios (*)')
      setModalVisible(true)
      return
    }

    const novoPet = {
      id: gerarPetId(),
      nome,
      especie,
      raca,
      sexo,
      nascimento: nascimento?.toISOString(),
      idCliente: idCliente
    }
    pets.push(novoPet)

    router.back()
  }


  return(
    <View style={{flex: 1}}>

      <View>
        <Header titulo='Novo Pet'/>
      </View>

      <View style={styles.container}>

        <TextInput
          placeholder='Nome*'
          style={styles.input}
          value={nome}
          onChangeText={setNome}
        />

        <TextInput
          placeholder='Especie*'
          style={styles.input}
          value={especie}
          onChangeText={setEspecie}
        />

        <TextInput
          placeholder='Raça'
          style={styles.input}
          value={raca}
          onChangeText={setRaca}
        />

        <DateInput
          placeholder="Nascimento"
          value={nascimento}
          onChange={setNascimento}
        />

        <TouchableOpacity 
        style={styles.button}
        onPress={salvarPet}
        >
          <Text style={styles.buttonText}>Salvar</Text>
        </TouchableOpacity>
        
      </View>

      <MessageModal
        visible={modalVisible}
        mensagem={mensagemModal}
        onClose={() => setModalVisible(false)}
      />
        
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#FFF",
    flex: 1,
  },

  input:{
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#CCC",
    padding: 10,
    borderRadius: 6
  },
   
    button:{
      backgroundColor: "#015DAD",
      borderRadius: 6,
      padding: 12,
      alignItems: "center",
    },

    buttonText:{
      color: "#FFF"
    }
})