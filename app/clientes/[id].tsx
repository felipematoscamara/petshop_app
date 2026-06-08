import { useLocalSearchParams, useFocusEffect } from "expo-router"
import { StyleSheet, Text, View, TouchableOpacity, FlatList, ActivityIndicator, Platform } from 'react-native'
import { router } from "expo-router"
import { useCallback, useState } from "react"
import Header from "../components/Header"
import MessageModal from "../components/MessageModal"
import MenuModal from "../components/MenuModal"
import { verificarStatusVacina } from "../utils/verificarStatusVacina"
import { buscarClientes, salvarClientes } from "../storage/clientesStorage"
import { buscarPets } from "../storage/petsStorage"
import { buscarVacinas } from "../storage/vacinasStrorage"
import { buscarServicos, salvarServicos } from "../storage/servicosStorage"

type StatusTipo = "atrasada" | "proxima" | "em-dia" | "sem-vacina";

export default function Cliente() {
    const { id } = useLocalSearchParams()

    const [menuVisible, setMenuVisible] = useState(false)
    const [confirmModalVisible, setConfirmModalVisible] = useState(false)
    const [resgateModalVisible, setResgateModalVisible] = useState(false) 
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
            <View style={[styles.mainContainer, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={Colors.primary} />
            </View>
        )
    }

    if (!clienteAtual) {
        return (
            <View style={styles.mainContainer}>
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
        setConfirmModalVisible(false) 
        router.back()
    }

    async function limparPontosCliente() {
        try {
            const novosServicos = listaServicos.map((servico) => {
                if (idsPetsDoCliente.includes(servico.idPet)) {
                    return { ...servico, pontos: 0 } 
                }
                return servico
            })

            await salvarServicos(novosServicos)
            setListaServicos(novosServicos) 
            setResgateModalVisible(false)
        } catch (error) {
            console.error("Erro ao resgatar pontos:", error)
        }
    }

    function obtenerStatusPet(idPet: string): StatusTipo {
        const vacinasDoPet = listaVacinas.filter(v => v.idPet === idPet)

        if (vacinasDoPet.length === 0) return "sem-vacina"

        const ultimasVacinasMap: Record<string, any> = {}
        
        vacinasDoPet.forEach(vacina => {
            const vacinaExistente = ultimasVacinasMap[vacina.idVacina]
            if (!vacinaExistente || new Date(vacina.data).getTime() > new Date(vacinaExistente.data).getTime()) {
                ultimasVacinasMap[vacina.idVacina] = vacina
            }
        })

        const ultimasVacinas = Object.values(ultimasVacinasMap)

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

    function obterEstiloStatus(status: StatusTipo) {
        switch (status) {
            case "atrasada":
                return { texto: "Atrasada", cor: Colors.danger, bg: Colors.dangerLight }
            case "proxima":
                return { texto: "Próxima", cor: Colors.warning, bg: Colors.warningLight }
            case "em-dia":
                return { texto: "Em Dia", cor: Colors.success, bg: Colors.successLight }
            default:
                return { texto: "Sem Vacinas", cor: Colors.textSecundario, bg: Colors.bgSecundario }
        }
    }

    return (
        <View style={styles.mainContainer}>

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
                        label: `Resgatar Pontos (${totalPontos} pts)`,
                        onPress: () => {
                            setMenuVisible(false)
                            setResgateModalVisible(true)
                        }
                    },
                    {
                        label: "Excluir Cliente",
                        isDanger: true,
                        onPress: () => {
                            setMenuVisible(false)
                            setConfirmModalVisible(true)
                        }
                    }
                ]}
            />

            <MenuModal
                visible={resgateModalVisible}
                onClose={() => setResgateModalVisible(false)}
                title={totalPontos > 0 ? `Resgatar ${totalPontos} pontos?` : "Sem pontos disponíveis"}
                options={
                    totalPontos > 0 ? [
                        {
                            label: "Confirmar Resgate (Zerar)",
                            onPress: () => limparPontosCliente()
                        }
                    ] : []
                }
            />

            <MenuModal
                visible={confirmModalVisible}
                onClose={() => setConfirmModalVisible(false)}
                title={`Excluir ${clienteAtual.nome}?`}
                options={[
                    {
                        label: "Confirmar Exclusão",
                        isDanger: true,
                        onPress: () => excluirCliente()
                    }
                ]}
            />

            <Header 
                titulo="Cliente"
                onMenuPress={abrirMenu}
            />

            <View style={styles.content}>
                <FlatList
                    data={listaPets}
                    keyExtractor={(item) => item.id}
                    showsVerticalScrollIndicator={false}
                    ListHeaderComponent={
                        <View>
                            <View style={styles.profileCard}>
                                <View style={styles.profileHeaderRow}>
                                    <Text style={styles.clienteNome} numberOfLines={2}>
                                        {clienteAtual.nome}
                                    </Text>
                                    
                                    <View style={styles.pointsBadge}>
                                        <Text style={styles.pointsText}>⭐ {totalPontos} pts</Text>
                                    </View>
                                </View>

                                <View style={styles.divider} />

                                <View style={styles.infoRow}>
                                    <Text style={styles.infoLabel}>TELEFONE</Text>
                                    <Text style={styles.infoValue}>{clienteAtual.telefone || 'Não informado'}</Text>
                                </View>

                                <View style={styles.infoRow}>
                                    <Text style={styles.infoLabel}>ENDEREÇO</Text>
                                    <Text style={styles.infoValue} numberOfLines={2}>{clienteAtual.endereco || 'Não informado'}</Text>
                                </View>
                            </View>

                            <Text style={styles.tituloSecao}>Pets Vinculados</Text>
                        </View>
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyStateContainer}>
                            <Text style={styles.vazioTexto}>Nenhum pet cadastrado para este cliente.</Text>
                        </View>
                    }
                    renderItem={({ item }) => {
                        const status = obtenerStatusPet(item.id)
                        const configStatus = obterEstiloStatus(status)

                        return (
                            <TouchableOpacity
                                onPress={() => router.push(`/pets/${item.id}`)}
                                activeOpacity={0.7}
                                style={styles.petCard}
                            >
                                <View style={styles.petCardContent}>
                                    <View style={styles.petInfoLeft}>
                                        <Text style={styles.petEmoji}>🐾</Text>
                                        <Text style={styles.petNome}>{item.nome}</Text>
                                    </View>
                                    
                                    <View style={[styles.statusBadge, { backgroundColor: configStatus.bg }]}>
                                        <Text style={[styles.statusText, { color: configStatus.cor }]}>
                                            {configStatus.texto}
                                        </Text>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        )
                    }}
                    ListFooterComponent={
                        <Text style={styles.idTexto}>ID: {clienteAtual.id}</Text>
                    }
                    contentContainerStyle={{ paddingBottom: 130 }} 
                />
            </View>

            <View style={styles.footer}>
                <TouchableOpacity
                    style={styles.button}
                    activeOpacity={0.85}
                    onPress={() => router.push(`/pets/novo?idCliente=${id}`)}
                >
                    <Text style={styles.buttonText}>Novo Pet</Text>
                </TouchableOpacity>
            </View>
        </View>
    )
}

const Colors = {
    bg: '#FFFFFF',
    bgSecundario: '#F8FAFC', 
    textPrincipal: '#1E293B', 
    textSecundario: '#64748B', 
    primary: '#007BFF', 
    border: '#E2E8F0', 
    danger: '#EF4444',
    dangerLight: '#FEE2E2',
    warning: '#F59E0B',
    warningLight: '#FEF3C7',
    success: '#10B981',
    successLight: '#D1FAE5',
};

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: Colors.bgSecundario,
    },
    content: {
        flex: 1,
        paddingHorizontal: 16,
    },
    profileCard: {
        backgroundColor: Colors.bg,
        borderRadius: 16,
        padding: 18,
        marginTop: 16,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: Colors.border,
        shadowColor: "#0F172A",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.03,
        shadowRadius: 10,
        elevation: 1,
    },
    profileHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center', 
    },
    clienteNome: {
        fontSize: 20,
        fontWeight: "700",
        color: Colors.textPrincipal,
        flex: 1,
        marginRight: 10,
    },
    pointsBadge: {
        backgroundColor: '#EFF6FF', 
        paddingHorizontal: 12,
        paddingVertical: 8, 
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#DBEAFE',
    },
    pointsText: {
        fontSize: 13,
        fontWeight: '700',
        color: Colors.primary,
    },
    divider: {
        height: 1,
        backgroundColor: Colors.border,
        marginVertical: 14,
    },
    infoRow: {
        marginBottom: 12,
    },
    infoLabel: {
        fontSize: 10,
        fontWeight: '700',
        color: Colors.textSecundario,
        letterSpacing: 0.5,
        marginBottom: 2,
    },
    infoValue: {
        fontSize: 15,
        color: Colors.textPrincipal,
        fontWeight: '500',
    },
    tituloSecao: {
        fontSize: 13,
        fontWeight: "700",
        textTransform: "uppercase",
        letterSpacing: 0.8,
        marginTop: 20,
        marginBottom: 10,
        color: Colors.textSecundario,
        paddingLeft: 4,
    },
    petCard: {
        backgroundColor: Colors.bg,
        marginVertical: 5,
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    petCardContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    petInfoLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    petEmoji: {
        fontSize: 18,
        marginRight: 10,
    },
    petNome: {
        fontSize: 16,
        fontWeight: "600",
        color: Colors.textPrincipal,
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    statusText: {
        fontSize: 12,
        fontWeight: "700",
    },
    emptyStateContainer: {
        backgroundColor: Colors.bg,
        borderRadius: 12,
        padding: 24,
        alignItems: 'center',
        marginTop: 8,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    vazioTexto: {
        color: Colors.textSecundario,
        fontSize: 14,
        textAlign: 'center',
    },
    idTexto: { 
        textAlign: 'center',
        marginTop: 24, 
        color: Colors.textSecundario, 
        fontSize: 11,
        letterSpacing: 0.5
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: Colors.bg,
        paddingHorizontal: 16,
        paddingBottom: Platform.OS === 'ios' ? 34 : 20,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: Colors.border,
    },
    button: {
        backgroundColor: Colors.primary,
        paddingVertical: 16,
        borderRadius: 14,
        alignItems: "center",
        justifyContent: "center",
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 3,
    },
    buttonText: {
        color: "#FFF",
        fontWeight: "700",
        fontSize: 16,
        letterSpacing: 0.3
    }
})