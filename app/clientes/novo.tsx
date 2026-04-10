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

                    console.log(clientes)
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
        backgroundColor: "#fff",
        padding: 20
    },

    input:{
        borderWidth: 1,
        borderColor: "#ccc",
        padding: 10,
        borderRadius: 8
    },

    button:{
        backgroundColor: "#015DAD",
        padding: 12,
        borderRadius: 8,
        alignItems: "center"
    },

    buttonText:{
        color: "#fff"
    }    
}) 