import { View, StyleSheet, TextInput, TouchableOpacity, Text} from 'react-native'
import { useState } from 'react'
import { clientes } from '../data/clientes'
import { gerarId } from '../data/clientes'
import { router } from 'expo-router'

export default function NovoCliente(){
    const [nome, setNome] = useState('')
    const [telefone, setTelefone] = useState('')
    const [endereco, setEndereco] = useState('')
    const [pontos] = useState('')

    return(
        
        <View style={styles.container}>
        
            <TextInput
                placeholder='Nome'
                style={styles.input}
                value={nome}
                onChangeText={setNome}
                />

            <TextInput
                placeholder='Telefone'
                style={styles.input}
                value={telefone}
                onChangeText={setTelefone}
                />

            <TextInput
                placeholder='Endereço'
                style={styles.input}
                value={endereco}
                onChangeText={setEndereco}
                />

            <TouchableOpacity 
                style={styles.button}
                onPress={() => {
                    const novoCliente={
                        id: gerarId(),
                        nome: nome,
                        telefone: telefone,
                        endereco: endereco,
                        pontos: 0
                    }

                    clientes.push(novoCliente)
                    router.back()
                }}
                >
                <Text style={styles.buttonText}>Salvar</Text>
            </TouchableOpacity>


        </View>
    )
}

const styles = StyleSheet.create({
    container:{
        flex: 1,
        backgroundColor: "#FFF",
        padding: 20
    },

    input:{
        marginBottom: 10,
        borderWidth: 1,
        borderColor: "#CCC",
        padding: 10,
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