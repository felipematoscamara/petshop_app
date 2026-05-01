import { useLocalSearchParams, useFocusEffect } from "expo-router"
import {StyleSheet, Text, View, TouchableOpacity, FlatList, Modal} from 'react-native'
import { clientes } from "../data/clientes"
import { router } from "expo-router"
import { pets } from "../data/pets"
import { useCallback, useState } from "react"
import { servicos } from "../data/servicos"
import Header from "../components/Header"

export default function Cliente(){
    const {id} = useLocalSearchParams()

    const [menuVisible, setMenuVisible] = useState(false)
    
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


    function abrirMenu() {
        setMenuVisible(true)
    }


    function excluirCliente() {
        const index = clientes.findIndex(c => c.id === id);

        if (index !== -1) {
            clientes.splice(index, 1);
        }

        router.back();
    }

    return(
        <View style={{flex: 1}}>

            <Modal
                visible={menuVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setMenuVisible(false)}
            >
                <View style={stylesModal.overlay}>

                    <View style={stylesModal.menu}>

                        <Text style={stylesModal.title}>
                            {clienteAtual.nome}
                        </Text>

                        <TouchableOpacity
                            style={stylesModal.button}
                            onPress={() => {
                                setMenuVisible(false);
                                router.push(`/clientes/editar/${id}`);
                            }}
                        >
                            <Text>Editar Cliente</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={stylesModal.buttonDanger}
                            onPress={() => {
                                setMenuVisible(false);
                                excluirCliente();
                            }}
                        >
                            <Text style={{ color: "red" }}>Excluir Cliente</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={stylesModal.button}
                            onPress={() => setMenuVisible(false)}
                        >
                            <Text>Cancelar</Text>
                        </TouchableOpacity>

                    </View>

                </View>

            </Modal>

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