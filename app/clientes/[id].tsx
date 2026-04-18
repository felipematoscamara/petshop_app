import { useLocalSearchParams } from "expo-router"
import {StyleSheet, Text, View, TouchableOpacity} from 'react-native'
import { clientes } from "../data/clientes"
import { router } from "expo-router"
import { pets } from "../data/pets"

export default function Details(){
    const {id} = useLocalSearchParams()
    const cliente = clientes.find(c => String(c.id) === String(id))
    const petsDoCliente = pets.filter(p => p.idCliente == id)

    if (!cliente){
        return(
            <View style={styles.container}>Cliente não encontrado</View>
        )
    }

    return(

        <View style={styles.container}>

            <View>
                <Text>{cliente.nome}{"\n"}{cliente.telefone}</Text>
                
                {petsDoCliente.map((pet) => (
                    <TouchableOpacity 
                        key={pet.id}
                        onPress={() => router.push(`/pets/${pet.id}`)}
                    >
                        <Text key={pet.id}>
                            🐾 {pet.nome}
                        </Text>
                    </TouchableOpacity>
                ))}
                <Text>ID: {cliente.id}</Text>
            </View>

            <TouchableOpacity
                style={styles.button}
                onPress={() => router.push(`/pets/novo?idCliente=${id}`)}
                >
               <Text style={styles.buttonText}>Novo Pet</Text>
            </TouchableOpacity>

        </View>
    )
}

const styles = StyleSheet.create({
    container:{
        flex: 1,
        backgroundColor: '#FFF',
        padding: 20
    },

    button:{
        marginTop: 10,
        backgroundColor: "#015DAD",
        padding: 12,
        borderRadius: 6,
        alignItems: "center"
    },

    buttonText:{
        color: "#FFF"
    }
})