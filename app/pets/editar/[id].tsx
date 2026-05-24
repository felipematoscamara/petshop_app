import { router, useLocalSearchParams} from "expo-router"
import { View, Text, TextInput, TouchableOpacity, StyleSheet} from "react-native"
import { pets } from "@/app/data/pets"
import { useState } from "react"
import Header from "@/app/components/Header"
import DateInput from "@/app/components/DateInput"
import MessageModal from "@/app/components/MessageModal"

export default function EditarPet(){

    const {id} = useLocalSearchParams()
    const pet = pets.find(p => p.id === id)

    const [nome, setNome] = useState(pet?.nome || "")
    const [especie, setEspecie] = useState(pet?.especie || "")
    const [raca, setRaca] = useState(pet?.raca || "")
    const [sexo, setSexo] = useState(pet?.sexo || "")
    const [nascimento, setNascimento] = useState<Date | null>(
        pet?.nascimento 
            ? new Date(pet.nascimento)
            : null
    )

    const [messageVisible, setMessageVisible] = useState(false)
    const [mensagem, setMensagem] = useState("")

    function salvar() {
        if (!pet) return

        if (!nome.trim() || !especie.trim()) {
            setMensagem("Preencha os campos obrigatórios (*)")
            setMessageVisible(true)
            return
        }

        pet.nome = nome
        pet.especie = especie
        pet.raca = raca
        pet.sexo = sexo
        pet.nascimento = nascimento ? nascimento.toISOString() : undefined

        router.back()
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
        color: "#FFF"
    }

})