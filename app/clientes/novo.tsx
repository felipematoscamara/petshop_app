import {View, StyleSheet, TextInput, TouchableOpacity, Text} from 'react-native'
import { useState } from 'react'
import { clientes } from '../data/clientes'

export default function NovoCliente(){
    const [nome, setNome] = useState('')
    const [telefone, setTelefone] = useState('')

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

            <TouchableOpacity 
                style={styles.button}
                onPress={() => {
                    const novoCliente={
                        nome: nome,
                        telefone: telefone
                    }

                    clientes.push(novoCliente)

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