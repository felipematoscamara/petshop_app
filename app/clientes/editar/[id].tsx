import { router, useLocalSearchParams } from "expo-router";
import { View, Text, TextInput, TouchableOpacity, StyleSheet} from "react-native"
import { clientes } from "@/app/data/clientes"
import { useState } from "react"
import Header from "@/app/components/Header"
import MessageModal from "@/app/components/MessageModal";

export default function EditarCliente(){
    
    const params = useLocalSearchParams()
    const id = String(params.id)

    const cliente = clientes.find(c => c.id === id)

    const [nome, setNome] = useState(cliente?.nome || "")
    const [telefone, setTelefone] = useState(cliente?.telefone || "")
    const [endereco, setEndereco] = useState(cliente?.endereco || "")

    const [messageVisible, setMessageVisible] = useState(false)
    const [mensagem, setMensagem] = useState("")

    function salvar(){
        if(!cliente) return

        if (!nome.trim()) {
            setMensagem("Preencha os campos obrigatórios (*)")
            setMessageVisible(true)
            return
        }

        cliente.nome = nome
        cliente.telefone = telefone
        cliente.endereco = endereco

        router.back()
    }

    return(
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
        color: "#FFF"
    }
})