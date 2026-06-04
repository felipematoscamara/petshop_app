import { useLocalSearchParams, useFocusEffect } from "expo-router"
import { StyleSheet, Text, View, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native'
import { router } from "expo-router"
import { useCallback, useState } from "react"
import Header from "../components/Header"
import MessageModal from "../components/MessageModal"
import MenuModal from "../components/MenuModal"
import { verificarStatusVacina } from "../utils/verificarStatusVacina"
import { buscarClientes, salvarClientes } from "../storage/clientesStorage"
import { buscarPets } from "../storage/petsStorage"
import { buscarVacinas } from "../storage/vacinasStrorage"
import { buscarServicos } from "../storage/servicosStorage"

export default function Cliente() {
    const { id } = useLocalSearchParams()

    const [menuVisible, setMenuVisible] = useState(false)
    const [loading, setLoading] = useState(true) 
    
    const [clienteAtual, setClienteAtual] = useState<any>(null)
    const [listaPets, setListaPets] = useState<any[]>([])
    const [listaVacinas, setListaVacinas] = useState<any[]>([]) 
    const [listaServicos, setListaServicos] = useState<any[]>([])

    useFocusEffect(
        useCallback(() => {
            async function carregarDadosDoCliente() {
                setLoading(true)
                try {
                   
                    const [allClientes, allPets, allVacinas, allServicos] = await Promise.all([
                        buscarClientes(),
                        buscarPets(),
                        buscarVacinas(),
                        buscarServicos()
                    ]) as [any[], any[], any[], any[]]

                    const cliente = allClientes.find((c: any) => c.id === id)
                    if (cliente) {
                        setClienteAtual(cliente)
                    } else {
                        setClienteAtual(null)
                    }

                    const petsDoCliente = allPets.filter((p: any) => p.idCliente === id)
                    setListaPets(petsDoCliente)
                    setListaVacinas(allVacinas)
                    setListaServicos(allServicos) 

                } catch (error) {
                    console.error("Erro ao carregar dados do cliente:", error)
                } finally {
                    setLoading(false)
                }
            }

            carregarDadosDoCliente()
        }, [id])
    )

    const idsPetsDoCliente = listaPets.map(pet => pet.id)
    
    const servicosDoCliente = listaServicos.filter(
        servico => idsPetsDoCliente.includes(servico.idPet)
    )
    const totalPontos = servicosDoCliente.reduce(
        (acc, item) => acc + Number(item.pontos || 0), 
        0
    )

    if (loading) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color="#015DAD" />
            </View>
        )
    }

    if (!clienteAtual) {
        return (
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

    async function excluirCliente() {
        const allClientes = await buscarClientes()
        const novaLista = allClientes.filter((c: any) => c.id !== id)
        
        await salvarClientes(novaLista)
        setMenuVisible(false)
        router.back()
    }

    function obterUltimaVacinaDoTipo(idPet: string, idVacina: string) {
        const vacinasDoPet = listaVacinas.filter(
            v => v.idPet === idPet && v.idVacina === idVacina
        )

        if (vacinasDoPet.length === 0) return null

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

        if (ultimasVacinas.length === 0) return "sem-vacina"

        const possuiAtrasada = ultimasVacinas.some(
            v => verificarStatusVacina(v!.proxima) === "atrasada"
        )
        if (possuiAtrasada) return "atrasada"

        const possuiProxima = ultimasVacinas.some(
            v => verificarStatusVacina(v!.proxima) === "proxima"
        )
        if (possuiProxima) return "proxima"

        return "em-dia"
    }

    return (
        <View style={{ flex: 1 }}>
            <MenuModal
                visible={menuVisible}
                onClose={() => setMenuVisible(false)}
                title={clienteAtual.nome}
                options={[
                    {
                        label: "Editar Cliente",
                        onPress: () => {
                            setMenuVisible(false)
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
                        <View style={{ marginBottom: 10 }}>
                            <Text style={styles.clienteNome}>{clienteAtual.nome} ⭐{totalPontos}</Text>
                            <Text style={styles.clienteInfo}>
                                {clienteAtual.telefone ? `📞 Telefone: ${clienteAtual.telefone}` : '📞 Telefone: Não informado'}
                            </Text>                                 
                            <Text style={styles.clienteInfo}>
                                {clienteAtual.endereco ? `📍 Endereço: ${clienteAtual.endereco}` : '📍 Endereço: Não informado'}
                            </Text>
                            <Text style={styles.tituloSecao}>Pets cadastrados:</Text>
                        </View>
                    }
                    ListEmptyComponent={
                        <Text style={styles.vazioTexto}>Nenhum pet cadastrado para este cliente.</Text>
                    }
                    renderItem={({ item }) => {
                        const status = obterStatusPet(item.id)

                        return (
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
                                    <Text style={styles.petNome}>🐾 {item.nome}</Text>
                                    {status === "atrasada" && <Text style={styles.statusAtrasado}>❌ Vacina atrasada</Text>}
                                    {status === "proxima" && <Text style={styles.statusProximo}>⚠️ Vacina próxima do vencimento</Text>}
                                    {status === "em-dia" && <Text style={styles.statusEmDia}>✅ Vacina em dia</Text>}
                                    {status === "sem-vacina" && <Text style={styles.statusSemVacina}>⚪ Nenhuma vacina cadastrada</Text>}
                                </View>
                            </TouchableOpacity>
                        )
                    }}
                    ListFooterComponent={
                        <Text style={styles.idTexto}>ID Cliente: {clienteAtual.id}</Text>
                    }
                    contentContainerStyle={{ paddingBottom: 80 }}
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
    container: {
        flex: 1,
        backgroundColor: '#FFF',
        padding: 20
    },
    clienteNome: {
        fontSize: 22,
        fontWeight: "bold",
        color: "#333",
        marginBottom: 8
    },
    clienteInfo: {
        fontSize: 14,
        color: "#555",
        marginBottom: 4
    },
    tituloSecao: {
        fontSize: 16,
        fontWeight: "600",
        marginTop: 20,
        marginBottom: 5,
        color: "#015DAD"
    },
    vazioTexto: {
        color: "#7F8C8D",
        fontStyle: "italic",
        marginVertical: 10
    },
    button: {
        position: "absolute",
        bottom: 20,
        left: 20,
        right: 20,
        backgroundColor: "#015DAD",
        padding: 12,
        borderRadius: 6,
        alignItems: "center"
    },
    buttonText: {
        color: "#FFF",
        fontWeight: "600"
    },
    petCard: {
        marginVertical: 6,
        padding: 14,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#DDD",
        backgroundColor: "#F9F9F9"
    },
    petCardAtrasado: {
        borderColor: "#C0392B",
        backgroundColor: "#FDEDEC"
    },
    petCardProximo: {
        borderColor: "#D68910",
        backgroundColor: "#FEF5E7"
    },
    petNome: {
        fontSize: 16,
        fontWeight: "600",
        color: "#333"
    },
    statusAtrasado: { marginTop: 6, color: "#C0392B", fontWeight: "600" },
    statusProximo: { marginTop: 6, color: "#D68910", fontWeight: "600" },
    statusEmDia: { marginTop: 6, color: "#1E8449", fontWeight: "600" },
    statusSemVacina: { marginTop: 6, color: "#7F8C8D", fontWeight: "600" },
    idTexto: { marginTop: 20, color: '#999', fontSize: 11 }
})