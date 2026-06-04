import { router, useLocalSearchParams } from "expo-router";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native"
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
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color="#015DAD" />
            </View>
        )
    }

    if (!clienteExiste) {
        return (
            <View style={styles.container}>
                <MessageModal
                    visible={true}
                    mensagem="Ops! Não conseguimos localizar os dados deste cliente. Você será redirecionado."
                    onClose={() => router.replace("/")}
                />
            </View>
        )
    }

    return (
        <View style={{flex: 1}}>

            <View>
                <Header titulo="Editar Cliente"/>
            </View>

            <View style={styles.container}>

                <TextInput
                    style={styles.input}
                    value={nome}
                    onChangeText={setNome}
                    placeholder="Nome*"
                />

                <TextInput
                    style={styles.input}
                    value={telefone}
                    onChangeText={setTelefone}
                    keyboardType="phone-pad"
                    placeholder="Telefone"
                />

                <TextInput 
                    style={styles.input}
                    value={endereco}
                    onChangeText={setEndereco}
                    placeholder="Endereço"
                />

                <TouchableOpacity
                    style={styles.button}
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

const styles = StyleSheet.create({
    container:{
        flex: 1,
        backgroundColor: '#FFF',
        padding: 20
    },

    input:{
        borderWidth: 1,
        borderColor: "#CCC",
        padding: 10,
        marginBottom: 10,
        borderRadius: 6
    },

    button:{
        backgroundColor: "#015DAD",
        padding: 12,
        borderRadius: 6,
        alignItems: "center"
    },

    buttonText:{
        color: "#FFF",
        fontWeight: "600"
    }
})