import { TextInput, FlatList, StyleSheet, Text, TouchableOpacity, View} from 'react-native'
import { router, useFocusEffect } from 'expo-router'
import { clientes } from './data/clientes'
import { useCallback, useState } from 'react'
import { pets } from './data/pets'

export default function ClientesPage(){
  const [busca, setBusca] = useState('')
  const [listaClientes, setListaClientes] = useState(clientes)
  const clientesFiltrados = listaClientes.filter(cliente => cliente.nome?.toLowerCase().includes(busca.toLowerCase()))

  useFocusEffect(
    useCallback(() => {
      setListaClientes([...clientes])
    }, [])
  )
  return(
    <View style={styles.container}>

      <View>
        <TextInput
            placeholder='Buscar cliente...'
            value={busca}
            onChangeText={setBusca}
            
            style={{
              flex: 1,
              borderWidth: 1,
              marginBottom: 10,
              padding: 8,
              borderRadius: 6,
              borderColor: "#CCC"
            }}
            />

            {clientesFiltrados.length === 0 && (
              <Text style={{margin: 10}}>Nenhum cliente encontrado</Text>
            )}
      </View>

      <FlatList 
        data={clientesFiltrados}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) =>{

        const petsPorCliente = pets.reduce((acc, pet) => {
          acc[pet.idCliente] = (acc[pet.idCliente] || 0) + 1 
          return acc
        }, {})

        const quantidadePets = petsPorCliente[item.id] || 0

        return(
          <TouchableOpacity
            onPress={() => router.push(`/clientes/${item.id}`)}
          >
            
            <View style={{ margin: 10, }}>
              <Text>
                {item.nome} {"\n"}
                🐶🐱 {quantidadePets} {quantidadePets === 1 ? "Pet" : "Pets"}
              </Text>
            </View>

          </TouchableOpacity>
        )}}
        contentContainerStyle={{ paddingBottom: 50 }}
      />
      
      <TouchableOpacity
          style={styles.button}
          onPress={() => router.push("/clientes/novo")}
      >
        <Text style={styles.buttonText}>Novo Cliente</Text>
      </TouchableOpacity>

    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFF",
    flex: 1,
    padding: 20
  },
  
  button:{
    position: "absolute",
  bottom: 20,
  left: 20,
  right: 20,
  backgroundColor: "#015DAD",
  padding: 12,
  borderRadius: 6,
  alignItems: "center"
  },

  buttonText:{
    color: "#FFF"
  }

})