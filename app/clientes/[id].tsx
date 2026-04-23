import { useLocalSearchParams, useFocusEffect } from "expo-router"
import {StyleSheet, Text, View, TouchableOpacity} from 'react-native'
import { clientes } from "../data/clientes"
import { router } from "expo-router"
import { pets } from "../data/pets"
import { useCallback, useState } from "react"

export default function Cliente(){
    const {id} = useLocalSearchParams()

    const [clienteAtual, setClienteAtual] = useState(clientes.find(c => c.id === id))
    const [listaPets, setListaPets] = useState(pets.filter(p => p.idCliente == id))

    useFocusEffect(
        useCallback(() => {
            const clienteAtualizado = clientes.find(c => c.id === id)
            setClienteAtual(clienteAtualizado)

            const petsAtualizados = pets.filter(p => p.idCliente == id)
            setListaPets(petsAtualizados)
        }, [id])
    )

    if (!clienteAtual){
        return(
            <View style={styles.container}>Cliente não encontrado</View>
        )
    }

    return(

        <View style={styles.container}>

            <View>
                <Text>{clienteAtual.nome}</Text>
                <Text>{clienteAtual.telefone}</Text>
                <Text>{clienteAtual.endereco}</Text>
                
                {listaPets.map((pet) => (
                    <TouchableOpacity 
                        key={pet.id}
                        onPress={() => router.push(`/pets/${pet.id}`)}
                    >
                        <Text key={pet.id}>
                            🐾 {pet.nome}
                        </Text>
                    </TouchableOpacity>
                ))}
                <Text>ID: {clienteAtual.id}</Text>
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