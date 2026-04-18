import { StyleSheet, View, Text, TextInput, TouchableOpacity } from 'react-native'
import { useState } from 'react'
import { useLocalSearchParams } from 'expo-router'
import { pets } from '@/app/data/pets'

type Vacina = {
  vacina: string
  dose: string
  data: string
  proxima: string
}

export default function NovaVacina(){
  const {id} = useLocalSearchParams()
  const pet = pets.find(p => p.id == id)

  const [vacina, setVacina] = useState('')
  const [dose, setDose] = useState('')
  const [data, setData] = useState('')
  const [proxima, setProxima] = useState('')

  const[listaVacinas, setListaVacinas] = useState<Vacina[]>([]) 
  
  function salvarVacina(){
    if(!vacina || !dose || !data) {
      return
    }
    
    const novaVacina = {
      vacina,
      dose,
      data,
      proxima
    }
    
    setListaVacinas(prev => [...prev, novaVacina])
    
    setVacina('')
    setDose('')
    setData('')
    setProxima('')
  }

  if(!pet){
    return <View style={styles.container}>Pet não encontrado</View>
  }

  return(
    <View style={styles.container}>

      <View style={{flexDirection: "row", gap: 5, marginTop: 10}}>

      <View style={{flex:1}}>
        <Text>Vacina</Text>
        <TextInput
          value={vacina}
          onChangeText={setVacina}
          style={styles.input}
        />
      </View>

      <View style={{flex:1}}>
        <Text>Dose</Text>
        <TextInput
          value={dose}
          onChangeText={setDose}
          style={styles.input}
        />
      </View>

      <View style={{flex:1}}>
        <Text>Data</Text>
        <TextInput
          value={data}
          onChangeText={setData}
          style={styles.input}
        />
      </View>

      <View style={{flex:1}}>
        <Text>Próxima</Text>
        <TextInput
          value={proxima}
          onChangeText={setProxima}
          style={styles.input}
        />
      </View>


    </View>

    <View style={{marginTop: 10}}>

      <TouchableOpacity
        onPress={salvarVacina}
        style={styles.button}
      >
        <Text style={styles.buttonText}>Salvar</Text>
      </TouchableOpacity>

    </View>

      {listaVacinas.map((v, index)=>(
        <View key={index} style={{marginTop: 10}}>
          <Text>
            {v.vacina} | {v.dose} | {v.data} | {v.proxima}
          </Text>
        </View>
      ))}

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
  borderWidth: 1,
  borderColor: '#ccc',
  padding: 10,
  height: 50,
  borderRadius: 6,
  backgroundColor: '#f9f9f9'
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