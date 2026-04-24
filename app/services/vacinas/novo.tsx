import { StyleSheet, View, Text, TextInput, TouchableOpacity, Alert } from 'react-native'
import { useState } from 'react'
import { useLocalSearchParams, router } from 'expo-router'
import { pets } from '@/app/data/pets'
import { gerarVacinaId, vacinas } from '@/app/data/vacinas'

export default function NovaVacina(){
  const {id} = useLocalSearchParams()
  const pet = pets.find(p => p.id === id)

  const [vacina, setVacina] = useState('')
  const [dose, setDose] = useState('')
  const [data, setData] = useState('')
  const [proxima, setProxima] = useState('')
  
  function salvarVacina(){
    if(!vacina || !dose || !data) {
      Alert.alert('Erro','Preencha os campos obrigatórios')
      return
  }
    
    const novaVacina = {
      id: gerarVacinaId(),
      vacina,
      dose,
      data,
      proxima,
      idPet: id
    }
    vacinas.push(novaVacina)
    router.back()
  }

  if(!pet){
    return <View style={styles.container}>Pet não encontrado</View>
  }

  return(
    <View style={styles.container}>

        <TextInput
          placeholder='Vacina'
          value={vacina}
          onChangeText={setVacina}
          style={styles.input}
        />
     
        <TextInput
          placeholder='Dose'
          value={dose}
          onChangeText={setDose}
          style={styles.input}
        />

        <TextInput
          placeholder='Data'
          value={data}
          onChangeText={setData}
          style={styles.input}
        />
      
        <TextInput
          placeholder='Próxima'
          value={proxima}
          onChangeText={setProxima}
          style={styles.input}
        />
    
        <TouchableOpacity
          onPress={salvarVacina}
         style={styles.button}
         >
          <Text style={styles.buttonText}>Salvar</Text>
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

  input:{
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#CCC",
    padding: 10,
    borderRadius: 6
  },

  button:{
    backgroundColor: '#015DAD',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center'
  },

  buttonText:{
    color: '#FFF'
  }
})