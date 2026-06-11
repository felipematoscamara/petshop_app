import { router, useLocalSearchParams } from "expo-router"
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Platform } from "react-native"
import { useState, useEffect } from "react"
import Header from "@/app/components/Header"
import DateInput from "@/app/components/DateInput"
import MessageModal from "@/app/components/MessageModal"
import { buscarPets, salvarPets } from "@/app/storage/petsStorage"

export default function EditarPet() {
    const { id } = useLocalSearchParams()
    const idPet = String(id)

    const [loading, setLoading] = useState(true)
    const [petExiste, setPetExiste] = useState(true)

    const [nome, setNome] = useState("")
    const [especie, setEspecie] = useState("")
    const [outraEspecie, setOutraEspecie] = useState("")
    const [raca, setRaca] = useState("")
    const [sexo, setSexo] = useState("")
    const [nascimento, setNascimento] = useState<Date | null>(null)

    const [messageVisible, setMessageVisible] = useState(false)
    const [mensagem, setMensagem] = useState("")

    useEffect(() => {
        async function carregarPet() {
            try {
                const todosPets = (await buscarPets()) || []
                const petEncontrado = todosPets.find((p: any) => p.id === idPet)

                if (petEncontrado) {
                    setNome(petEncontrado.nome || "")
                    setRaca(petEncontrado.raca || "")
                    setSexo(petEncontrado.sexo || "")
                    setNascimento(
                        petEncontrado.nascimento
                            ? new Date(petEncontrado.nascimento)
                            : null
                    )

                    const especiePet = petEncontrado.especie || ""

                    if (["Cachorro", "Gato"].includes(especiePet)) {
                        setEspecie(especiePet)
                        setOutraEspecie("")
                    } else if (especiePet) {
                        setEspecie("Outro")
                        setOutraEspecie(especiePet)
                    } else {
                        setEspecie("")
                        setOutraEspecie("")
                    }
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
        const especieFinal =
            especie === "Outro"
                ? outraEspecie.trim()
                : especie.trim()

        if (!nome.trim() || !especieFinal || !sexo.trim()) {
            setMensagem("Preencha os campos obrigatórios (*)")
            setMessageVisible(true)
            return
        }

        try {
            const todosPets = (await buscarPets()) || []

            const listaAtualizada = todosPets.map((p: any) => {
                if (p.id === idPet) {
                    return {
                        ...p,
                        nome: nome.trim(),
                        especie: especieFinal,
                        raca: raca.trim(),
                        sexo: sexo.trim(),
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
            <View style={[styles.mainContainer, { justifyContent: "center", alignItems: "center" }]}>
                <ActivityIndicator size="large" color={Colors.primary} />
            </View>
        )
    }

    if (!petExiste) {
        return (
            <View style={styles.mainContainer}>
                <MessageModal
                    visible={true}
                    mensagem="Ops! Não conseguimos localizar os dados deste pet. Você será redirecionado."
                    onClose={() => router.replace("/")}
                />
            </View>
        )
    }

    return (
        <View style={styles.mainContainer}>
            <Header titulo="Editar Pet" />

            <View style={styles.content}>
                <View style={styles.inputGroup}>
                    <Text style={styles.fieldLabel}>NOME DO PET *</Text>
                    <TextInput
                        style={styles.input}
                        value={nome}
                        onChangeText={setNome}
                        placeholder="Ex: Rex"
                        placeholderTextColor={Colors.textSecundario}
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.fieldLabel}>ESPÉCIE *</Text>

                    <View style={styles.optionContainer}>
                        <TouchableOpacity
                            style={[
                                styles.optionButton,
                                especie === "Cachorro" && styles.optionButtonSelected
                            ]}
                            onPress={() => {
                                setEspecie("Cachorro")
                                setOutraEspecie("")
                            }}
                            activeOpacity={0.85}
                        >
                            <Text
                                style={[
                                    styles.optionText,
                                    especie === "Cachorro" && styles.optionTextSelected
                                ]}
                            >
                                Cachorro
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[
                                styles.optionButton,
                                especie === "Gato" && styles.optionButtonSelected
                            ]}
                            onPress={() => {
                                setEspecie("Gato")
                                setOutraEspecie("")
                            }}
                            activeOpacity={0.85}
                        >
                            <Text
                                style={[
                                    styles.optionText,
                                    especie === "Gato" && styles.optionTextSelected
                                ]}
                            >
                                Gato
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[
                                styles.optionButton,
                                especie === "Outro" && styles.optionButtonSelected
                            ]}
                            onPress={() => setEspecie("Outro")}
                            activeOpacity={0.85}
                        >
                            <Text
                                style={[
                                    styles.optionText,
                                    especie === "Outro" && styles.optionTextSelected
                                ]}
                            >
                                Outro
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {especie === "Outro" && (
                        <View style={{ marginTop: 12 }}>
                            <TextInput
                                style={styles.input}
                                value={outraEspecie}
                                onChangeText={setOutraEspecie}
                                placeholder="Digite a espécie"
                                placeholderTextColor={Colors.textSecundario}
                            />
                        </View>
                    )}
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.fieldLabel}>SEXO *</Text>

                    <View style={styles.optionContainer}>
                        <TouchableOpacity
                            style={[
                                styles.optionButton,
                                sexo === "Macho" && styles.optionButtonSelected
                            ]}
                            onPress={() => setSexo("Macho")}
                            activeOpacity={0.85}
                        >
                            <Text
                                style={[
                                    styles.optionText,
                                    sexo === "Macho" && styles.optionTextSelected
                                ]}
                            >
                                Macho
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[
                                styles.optionButton,
                                sexo === "Fêmea" && styles.optionButtonSelected
                            ]}
                            onPress={() => setSexo("Fêmea")}
                            activeOpacity={0.85}
                        >
                            <Text
                                style={[
                                    styles.optionText,
                                    sexo === "Fêmea" && styles.optionTextSelected
                                ]}
                            >
                                Fêmea
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.fieldLabel}>RAÇA</Text>
                    <TextInput
                        style={styles.input}
                        value={raca}
                        onChangeText={setRaca}
                        placeholder="Ex: Labrador"
                        placeholderTextColor={Colors.textSecundario}
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.fieldLabel}>DATA DE NASCIMENTO</Text>
                    <DateInput
                        style={styles.input}
                        value={nascimento}
                        onChange={setNascimento}
                        placeholder="Selecione uma data"
                    />
                </View>
            </View>

            <View style={styles.footer}>
                <TouchableOpacity
                    style={styles.button}
                    onPress={salvar}
                    activeOpacity={0.85}
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
}

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
    optionContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    optionButton: {
        flexGrow: 1,
        flexBasis: 0,
        minWidth: 100,
        backgroundColor: Colors.bg,
        borderWidth: 1,
        borderColor: Colors.border,
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
        marginBottom: 10,
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
    optionButtonSelected: {
        backgroundColor: Colors.primary,
        borderColor: Colors.primary,
    },
    optionText: {
        color: Colors.textPrincipal,
        fontWeight: "700",
        fontSize: 14,
    },
    optionTextSelected: {
        color: "#FFF",
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: Colors.bg,
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: Platform.OS === 'ios' ? 34 : 20,
        borderTopWidth: 1,
        borderTopColor: Colors.border,
    },
    button: {
        backgroundColor: Colors.primary,
        paddingVertical: 16,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
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