import { router, useLocalSearchParams } from "expo-router"
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native"
import { useState, useEffect } from "react"
import Header from "@/app/components/Header"
import DateInput from "@/app/components/DateInput"
import MessageModal from "@/app/components/MessageModal"

import { buscarPets, salvarPets } from "@/app/storage/petsStorage"

export default function EditarPet(){

    const { id } = useLocalSearchParams()
    const idPet = String(id)

    const [loading, setLoading] = useState(true)
    const [petExiste, setPetExiste] = useState(true)

    const [nome, setNome] = useState("")
    const [especie, setEspecie] = useState("")
    const [raca, setRaca] = useState("")
    const [sexo, setSexo] = useState("")
    const [nascimento, setNascimento] = useState<Date | null>(null)

    const [messageVisible, setMessageVisible] = useState(false)
    const [mensagem, setMensagem] = useState("")

    useEffect(() => {
        async function carregarPet() {
            try {
                const todosPets = await buscarPets()
                const petEncontrado = todosPets.find((p: any) => p.id === idPet)

                if (petEncontrado) {
                    setNome(petEncontrado.nome || "")
                    setEspecie(petEncontrado.especie || "")
                    setRaca(petEncontrado.raca || "")
                    setSexo(petEncontrado.sexo || "")
                    setNascimento(
                        petEncontrado.nascimento 
                            ? new Date(petEncontrado.nascimento)
                            : null
                    )
                } else {
                    setPetExiste(false)
                }
            } catch (error) {
                console.error("Erro ao carregar pet:", error)
            } finally {
                setLoading(false)
            }
        }

        carregarPet()
    }, [idPet])

    async function salvar() {
        if (!nome.trim() || !especie.trim()) {
            setMensagem("Preencha os campos obrigatórios (*)")
            setMessageVisible(true)
            return
        }

        try {

            const todosPets = await buscarPets()

            const listaAtualizada = todosPets.map((p: any) => {
                if (p.id === idPet) {
                    return {
                        ...p, 
                        nome: nome.trim(),
                        especie: especie.trim(),
                        raca: raca.trim(),
                        sexo: sexo,
                        nascimento: nascimento ? nascimento.toISOString() : undefined
                    }
                }
                return p 
            })

            await salvarPets(listaAtualizada)

            router.back()
        } catch (error) {
            console.error("Erro ao salvar pet:", error)
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

    if (!petExiste) {
        return (
            <View style={styles.container}>
                <MessageModal
                    visible={true}
                    mensagem="Ops! Não conseguimos localizar os dados deste pet. Você será redirecionado."
                    onClose={() => router.replace("/")}
                />
            </View>
        )
    }

    return(
        <View style={{flex: 1}}>

            <View>
                <Header titulo="Editar Pet"/>
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
                    value={especie}
                    onChangeText={setEspecie}
                    placeholder="Espécie*"
                />

                <TextInput 
                    style={styles.input}
                    value={raca}
                    onChangeText={setRaca}
                    placeholder="Raça"
                />

                <DateInput 
                    style={styles.input}
                    value={nascimento}
                    onChange={setNascimento}
                    placeholder="Nascimento"
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