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
import { verificarStatusVacina } from "../utils/verificarStatusVacina"
import { vacinas } from "../data/vacinas"

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

    function obterUltimaVacinaDoTipo(idPet: string, idVacina: string) {
        const vacinasDoPet = vacinas.filter(
            v => v.idPet === idPet && v.idVacina === idVacina
        )

        if (vacinasDoPet.length === 0) {
            return null
        }

        return vacinasDoPet.reduce((maisRecente, atual) => {
            return new Date(atual.data).getTime() > new Date(maisRecente.data).getTime()
                ? atual
                : maisRecente
        })
    }

    function obterStatusPet(idPet: string):
        "atrasada" | "proxima" | "em-dia" | "sem-vacina" {

        const ultimaV11 = obterUltimaVacinaDoTipo(idPet, "v11")
        const ultimaAntirrabica = obterUltimaVacinaDoTipo(idPet, "antirrabica")
        const ultimaVanguard = obterUltimaVacinaDoTipo(idPet, "vanguard")
        const ultimaAnticio = obterUltimaVacinaDoTipo(idPet, "anticio")

        const ultimasVacinas = [ultimaV11, ultimaAntirrabica, ultimaVanguard, ultimaAnticio].filter(Boolean)

        if (ultimasVacinas.length === 0) {
            return "sem-vacina"
        }

        const possuiAtrasada = ultimasVacinas.some(
            v => verificarStatusVacina(v!.proxima) === "atrasada"
        )

        if (possuiAtrasada) {
            return "atrasada"
        }

        const possuiProxima = ultimasVacinas.some(
            v => verificarStatusVacina(v!.proxima) === "proxima"
        )

        if (possuiProxima) {
            return "proxima"
        }

        return "em-dia"
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

                    renderItem={({ item }) => {

                        const status = obterStatusPet(item.id)

                        return(

                            <TouchableOpacity
                                onPress={() => router.push(`/pets/${item.id}`)}
                            >

                                <View
                                    style={[
                                        styles.petCard,
                                        status === "atrasada" && styles.petCardAtrasado,
                                        status === "proxima" && styles.petCardProximo
                                    ]}
                                >

                                    <Text style={styles.petNome}>
                                        🐾 {item.nome}
                                    </Text>

                                    {
                                        status === "atrasada" && (
                                            <Text style={styles.statusAtrasado}>
                                                ❌ Vacina atrasada
                                            </Text>
                                        )
                                    }

                                    {
                                        status === "proxima" && (
                                            <Text style={styles.statusProximo}>
                                                ⚠️ Vacina próxima do vencimento
                                            </Text>
                                        )
                                    }

                                    {
                                        status === "em-dia" && (
                                            <Text style={styles.statusEmDia}>
                                                ✅ Vacina em dia
                                            </Text>
                                        )
                                    }

                                    {
                                        status === "sem-vacina" && (
                                            <Text style={styles.statusSemVacina}>
                                                ⚪ Nenhuma vacina cadastrada
                                            </Text>
                                        )
                                    }

                                </View>

                            </TouchableOpacity>

                        )
                    }}

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
    },

    petCard:{
        marginVertical: 8,
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#DDD",
        backgroundColor: "#F7F7F7"
    },

    petCardAtrasado:{
        borderColor: "#C0392B",
        backgroundColor: "#FDEDEC"
    },

    petCardProximo:{
        borderColor: "#D68910",
        backgroundColor: "#FEF5E7"
    },

    petNome:{
        fontSize: 16,
        fontWeight: "600"
    },

    statusAtrasado:{
        marginTop: 6,
        color: "#C0392B",
        fontWeight: "600"
    },

    statusProximo:{
        marginTop: 6,
        color: "#D68910",
        fontWeight: "600"
    },

    statusEmDia:{
        marginTop: 6,
        color: "#1E8449",
        fontWeight: "600"
    },

    statusSemVacina:{
        marginTop: 6,
        color: "#7F8C8D",
        fontWeight: "600"
    }
})