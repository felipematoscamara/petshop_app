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

export default function Vacinas(){
  const {id} = useLocalSearchParams()
  const pet = pets.find(p => p.id == id)

  const [vacina, setVacina] = useState('')
  const [dose, setDose] = useState('')
  const [data, setData] = useState('')
  const [proxima, setProxima] = useState('')

  const[listaVacinas, setListaVacinas] = useState<Vacina[]>([]) 
  
  function salvarVacina(){
    if(!vacina || !dose || !data) return
    
    
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
  
  function verificarESalvar(){
    if(vacina && dose && data){
      salvarVacina()
    }
  }

  if(!pet){
    return <View style={styles.container}>Pet não encontrado</View>
  }

  return(
    <View style={styles.container}>

      <Text>Cartão de vacinas</Text>

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
          onSubmitEditing={verificarESalvar}
          style={styles.input}
        />
      </View>

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
    borderColor: '#999',
    padding: 6,
    height: 40
  }
})