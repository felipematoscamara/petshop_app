import { StyleSheet, View, Text, TextInput, TouchableOpacity, Modal } from 'react-native'
import { useState } from 'react'
import { useLocalSearchParams, router } from 'expo-router'
import { pets } from '@/app/data/pets'
import { gerarVacinaId, vacinas } from '@/app/data/vacinas'
import Header from '@/app/components/Header'

export default function NovaVacina(){
  const {id} = useLocalSearchParams()
  const pet = pets.find(p => p.id === id)

  const [menuVisible, setMenuVisible] = useState(false)
  const [mensagem, setMensagem] = useState('')

  const [vacina, setVacina] = useState('')
  const [dose, setDose] = useState('')
  const [data, setData] = useState('')
  const [proxima, setProxima] = useState('')
  
  function salvarVacina(){
    if(!vacina || !dose || !data) {
      setMensagem('Preencha os campos obrigátorios')
      setMenuVisible(true)
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
    <View style={{flex: 1}}>

      <View>
        <Header titulo='Nova Vacina'/>
      </View>

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