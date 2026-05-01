import { router, useLocalSearchParams} from "expo-router"
import { View, Text, TextInput, TouchableOpacity, StyleSheet} from "react-native"
import { pets } from "@/app/data/pets"
import { useState } from "react"
import Header from "@/app/components/Header"

export default function EditarPet(){

    const {id} = useLocalSearchParams()
    const pet = pets.find(p => p.id === id)

    const [nome, setNome] = useState(pet?.nome || "")
    const [especie, setEspecie] = useState(pet?.especie || "")
    const [raca, setRaca] = useState(pet?.raca || "")
    const [sexo, setSexo] = useState(pet?.sexo || "")
    const [nascimento, setNascimento] = useState(pet?.nascimento || "")

    function salvar(){
        if(!pet) return

        pet.nome = nome
        pet.especie = especie
        pet.raca = raca
        pet.sexo = sexo
        pet.nascimento = nascimento

        router.back()
    }

    return(
        <View style={{flex: 1}}>

            <View>
                <Header titulo="Editar Pet"/>
            </View>

            <View style={styles.container}>

                <Text>Nome</Text>
                <TextInput 
                    style={styles.input}
                    value={nome}
                    onChangeText={setNome}
                />

                <Text>Espécie</Text>
                <TextInput 
                    style={styles.input}
                    value={especie}
                    onChangeText={setEspecie}
                />

                <Text>Raça</Text>
                <TextInput 
                    style={styles.input}
                    value={raca}
                    onChangeText={setRaca}
                />

                <Text>Nascimento</Text>
                <TextInput 
                    style={styles.input}
                    value={nascimento}
                    onChangeText={setNascimento}
                />

                <TouchableOpacity
                    style={styles.button}
                    onPress={salvar}
                >
                    <Text style={styles.buttonText}>Salvar</Text>
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