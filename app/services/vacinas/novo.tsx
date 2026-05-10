import { StyleSheet, View, Text, TextInput, TouchableOpacity} from 'react-native'
import { useState } from 'react'
import { useLocalSearchParams, router } from 'expo-router'
import { pets } from '@/app/data/pets'
import { gerarVacinaId, vacinas } from '@/app/data/vacinas'
import Header from '@/app/components/Header'
import DateInput from '@/app/components/DateInput'
import MessageModal from '@/app/components/MessageModal'

export default function NovaVacina(){
  const {id} = useLocalSearchParams()
  const pet = pets.find(p => p.id === id)

  const [vacina, setVacina] = useState('')
  const [dose, setDose] = useState('')
  const [data, setData] = useState<Date | null>(null)
  const [proxima, setProxima] = useState<Date | null>(null)
  
  const [messageVisible, setMessageVisible] = useState(false)
  const [mensagem, setMensagem] = useState('')

  function salvarVacina(){

    if(!vacina || !dose || !data) {
      setMensagem('Preencha os campos obrigátorios (*)')
      setMessageVisible(true)
      return
  }
    
    const novaVacina = {
      id: gerarVacinaId(),
      vacina,
      dose,
      data: data.toISOString(),
      proxima: proxima?.toISOString(),
      idPet: id
    }

    vacinas.push(novaVacina)
    router.back()
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

  return(
    <View style={{flex: 1}}>

      <View>
        <Header titulo='Nova Vacina'/>
      </View>

      <View style={styles.container}>

        <TextInput
          placeholder='Vacina*'
          value={vacina}
          onChangeText={setVacina}
          style={styles.input}
        />
     
        <TextInput
          placeholder='Dose*'
          value={dose}
          onChangeText={setDose}
          style={styles.input}
        />

        <DateInput
          placeholder='Data*'
          value={data}
          onChange={setData}
        />
      
        <DateInput
          placeholder='Próxima'
          value={proxima}
          onChange={setProxima}
        />
    
        <TouchableOpacity
          onPress={salvarVacina}
         style={styles.button}
         >
          <Text style={styles.buttonText}>Salvar</Text>
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