import { TextInput, FlatList, StyleSheet, Text, TouchableOpacity, View} from 'react-native'
import { router } from 'expo-router'
import { clientes } from './data/clientes'
import { useState } from 'react'
import { pets } from './data/pets'

export default function ClientesPage(){
  const [busca, setBusca] = useState('')
  const clientesFiltrados = clientes.filter(cliente => cliente.nome?.toLowerCase().includes(busca.toLowerCase()))
  

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

      <View>
        <FlatList 

          data={clientesFiltrados}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) =>{

            const quantidadePets = pets.filter(p => p.idCliente === item.id).length

            return(
              <TouchableOpacity
                onPress={() => router.push(`/clientesDetails/${item.id}`)}
              >
                <View style={{ margin: 10, }}>
                  
                    <Text>
                      {item.nome} {"\n"}
                      🐶🐱 {quantidadePets} {quantidadePets === 1 ? "Pet" : "Pets"}
                    </Text>
                  
                </View>
              </TouchableOpacity>

            )

          }}
        />
      </View>

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
    backgroundColor: "#015DAD",
    padding: 12,
    borderRadius: 6,
    alignItems: "center"
  },

  buttonText:{
    color: "#fff"
  }

})