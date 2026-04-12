import { useLocalSearchParams } from "expo-router"
import {StyleSheet, Text, View} from 'react-native'
import { clientes } from "../data/clientes"

export default function Details(){
    const {id} = useLocalSearchParams()

    const cliente = clientes.find(c => String(c.id) === String(id))

    if (!cliente){
        return(
            <View>Cliente não encontrado</View>
        )
    }

    return(
        <View style={styles.container
        }>
            <Text>{cliente.nome}</Text>
            <Text>🐶🐱2 Pets</Text>
            <Text>ID: {cliente.id}</Text>
        </View>
    )
}

const styles = StyleSheet.create({
    container:{
        flex: 1,
        backgroundColor: '#FFF',
        padding: 20
    }
})