import { useLocalSearchParams, useFocusEffect } from "expo-router"
import {StyleSheet, Text, View, TouchableOpacity, FlatList} from 'react-native'
import { clientes } from "../data/clientes"
import { router } from "expo-router"
import { pets } from "../data/pets"
import { useCallback, useState } from "react"
import { servicos } from "../data/servicos"
import Header from "../components/Header"
import MessageModal from "../components/MessageModal"
import MenuModal from "../components/MenuModal"

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

                <MessageModal
                    visible={true}
                    mensagem="Ops! Não conseguimos localizar os dados deste cliente. Você será redirecionado para página home ;)."
                    onClose={() => router.replace("/")}
                />

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

            <MenuModal
                visible={menuVisible}
                onClose={() => setMenuVisible(false)}
                title={clienteAtual.nome}
                options={[
                    {
                        label: "Editar Cliente",
                        onPress: () => {
                            router.push(`/clientes/editar/${id}`)
                        }
                    },

                    {
                        label: "Excluir Cliente",
                        isDanger: true,
                        onPress: () => {
                            excluirCliente()
                        }
                    }
                ]}
            />

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
                            <Text>{clienteAtual.telefone
                                ? `Telefone: ${clienteAtual.telefone}`
                                : 'Telefone: Não informado'}
                            </Text>                                
                            <Text>{clienteAtual.endereco
                                ? `Endereço: ${clienteAtual.endereco}`
                                : 'Endereço: Não informado'}
                            </Text>
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