import { useLocalSearchParams, useFocusEffect } from "expo-router"
import {StyleSheet, Text, View, TouchableOpacity, FlatList} from 'react-native'
import { clientes } from "../data/clientes"
import { router } from "expo-router"
import { pets } from "../data/pets"
import { useCallback, useState } from "react"
import { servicos } from "../data/servicos"
import Header from "../components/Header"
import { Alert } from "react-native"

export default function Cliente(){
    const {id} = useLocalSearchParams()

    const [clienteAtual, setClienteAtual] = useState(
        clientes.find(c => c.id === id)
    )

    const [listaPets, setListaPets] = useState(
        pets.filter(p => p.idCliente === id)
    )

    useFocusEffect(
        useCallback(() => {
            setClienteAtual(
                clientes.find(c => c.id === id)
            )

            setListaPets(
                pets.filter(p => p.idCliente === id)
            )
        }, [id])
    )

    const idsPetsDoCliente = listaPets.map(pet => pet.id)

    const servicosDoCliente = servicos.filter(
        servico => idsPetsDoCliente.includes(servico.idPet)
    )

    const totalPontos = servicosDoCliente.reduce(
        (acc, item) => acc + Number(item.pontos), 
        0
    )

    if (!clienteAtual){
        return(
            <View style={styles.container}>
                <Text>Cliente não encontrado</Text>
            </View>
        )
    }

    function abrirMenu(){
        Alert.alert(
            clienteAtual.nome,
            "Selecione uma ação:",
            [
                {
                    text: "Editar",
                    onPress: () => router.push(`/clientes/editar/${id}`)
                },

                {
                    text: "Excluir",
                    style: "destructive",
                    onPress: excluirCliente
                },

                {
                    text: "Cancelar",
                    style: "cancel"
                }
            ]
        )
    }

    function excluirCliente(){
        Alert.alert(
            "Comfirmar",
            "Tem certeza que deseja excluir este cliente?",
            [
                {text: "Não", style: "cancel"},
                {
                    text: "Sim",
                    style: "destructive",
                    onPress: () => {
                        const index = clientes.findIndex(c => c.id === id)

                        if(index !== -1){
                            clientes.splice(index, 1)
                        }

                        router.back()
                    }
                }
            ]
        )
    }

    return(
        <View style={{flex: 1}}>

            <View>
                <Header 
                titulo="Cliente"
                onMenuPress={abrirMenu}
                />
            </View>

            <View style={styles.container}>

                <FlatList
                    data={listaPets}
                    keyExtractor={(item) => item.id}

                    ListHeaderComponent={
                        <View>
                            <Text>{clienteAtual.nome} ⭐{totalPontos}</Text>
                            <Text>{clienteAtual.telefone}</Text>                                
                            <Text>{clienteAtual.endereco}</Text>
                            <Text>Pets cadastrados:</Text>
                        </View>
                    }

                    ListEmptyComponent={
                        <Text>Nenhum pet cadastrado</Text>
                    }

                    renderItem={({ item }) => (

                        <TouchableOpacity
                            onPress={() => router.push(`/pets/${item.id}`)}
                        >
                            <View style={{margin: 10}}>
                                <Text>🐾 {item.nome}</Text>
                            </View>
                        </TouchableOpacity>

                    )}

                    ListFooterComponent={
                        <Text>ID: {clienteAtual.id}</Text>
                    }

                    contentContainerStyle={{ paddingBottom: 50 }}
                />

                <TouchableOpacity
                    style={styles.button}
                    onPress={() => router.push(`/pets/novo?idCliente=${id}`)}
                >
                    <Text style={styles.buttonText}>Novo Pet</Text>
                </TouchableOpacity>

            </View>

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