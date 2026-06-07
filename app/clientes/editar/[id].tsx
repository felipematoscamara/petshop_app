import { router, useLocalSearchParams } from "expo-router";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Platform } from "react-native"
import { useState, useEffect } from "react"
import Header from "@/app/components/Header"
import MessageModal from "@/app/components/MessageModal";

import { buscarClientes, salvarClientes } from "@/app/storage/clientesStorage"

export default function EditarCliente(){
    
    const params = useLocalSearchParams()
    const id = String(params.id)

    const [loading, setLoading] = useState(true)
    const [clienteExiste, setClienteExiste] = useState(true)

    const [nome, setNome] = useState("")
    const [telefone, setTelefone] = useState("")
    const [endereco, setEndereco] = useState("")

    const [messageVisible, setMessageVisible] = useState(false)
    const [mensagem, setMensagem] = useState("")

    useEffect(() => {
        async function carregarCliente() {
            try {
                const todosClientes = await buscarClientes()
                const cliente = todosClientes.find((c: any) => c.id === id)

                if (cliente) {
                    setNome(cliente.nome)
                    setTelefone(cliente.telefone || "")
                    setEndereco(cliente.endereco || "")
                } else {
                    setClienteExiste(false)
                }
            } catch (error) {
                console.error("Erro ao carregar cliente:", error)
            } finally {
                setLoading(false)
            }
        }

        carregarCliente()
    }, [id])

    async function salvar(){
        if (!nome.trim()) {
            setMensagem("Preencha os campos obrigatórios (*)")
            setMessageVisible(true)
            return
        }

        try {
            const todosClientes = await buscarClientes()

            const listaAtualizada = todosClientes.map((c: any) => {
                if (c.id === id) {
                    return {
                        ...c, 
                        nome: nome.trim(),
                        telefone: telefone.trim(),
                        endereco: endereco.trim()
                    }
                }
                return c 
            })

            await salvarClientes(listaAtualizada)
            router.back()
        } catch (error) {
            console.error("Erro ao salvar cliente:", error)
            setMensagem("Ops! Não foi possível salvar as alterações.")
            setMessageVisible(true)
        }
    }

    if (loading) {
        return (
            <View style={[styles.mainContainer, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={Colors.primary} />
            </View>
        )
    }

    if (!clienteExiste) {
        return (
            <View style={styles.mainContainer}>
                <MessageModal
                    visible={true}
                    mensagem="Ops! Não conseguimos localizar os dados deste cliente. Você será redirecionado."
                    onClose={() => router.replace("/")}
                />
            </View>
        )
    }

    return (
        <View style={styles.mainContainer}>
            <Header titulo="Editar Cliente"/>

            <View style={styles.content}>
    
                <View style={styles.inputGroup}>
                    <Text style={styles.fieldLabel}>NOME DO CLIENTE *</Text>
                    <TextInput
                        style={styles.input}
                        value={nome}
                        onChangeText={setNome}
                        placeholder="Ex: João Silva"
                        placeholderTextColor={Colors.textSecundario}
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.fieldLabel}>TELEFONE</Text>
                    <TextInput
                        style={styles.input}
                        value={telefone}
                        onChangeText={setTelefone}
                        keyboardType="phone-pad"
                        placeholder="(00) 00000-0000"
                        placeholderTextColor={Colors.textSecundario}
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.fieldLabel}>ENDEREÇO</Text>
                    <TextInput 
                        style={styles.input}
                        value={endereco}
                        onChangeText={setEndereco}
                        placeholder="Rua, Número, Bairro"
                        placeholderTextColor={Colors.textSecundario}
                    />
                </View>

            </View>

            <View style={styles.footer}>
                <TouchableOpacity
                    style={styles.button}
                    activeOpacity={0.85}
                    onPress={salvar}
                >
                    <Text style={styles.buttonText}>Salvar Alterações</Text>
                </TouchableOpacity>
            </View>

            <MessageModal
                visible={messageVisible}
                mensagem={mensagem}
                onClose={() => setMessageVisible(false)}
            />
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
};

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: Colors.bgSecundario,
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 24,
    },
    inputGroup: {
        marginBottom: 20,
    },
    fieldLabel: {
        fontSize: 11,
        fontWeight: '700',
        color: Colors.textSecundario,
        letterSpacing: 0.6,
        marginBottom: 6,
    },
    input: {
        backgroundColor: Colors.bg,
        borderWidth: 1,
        borderColor: Colors.border,
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderRadius: 12,
        fontSize: 15,
        color: Colors.textPrincipal,
        ...Platform.select({
            ios: {
                shadowColor: "#0F172A",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.02,
                shadowRadius: 4,
            },
            android: {
                elevation: 1,
            }
        })
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