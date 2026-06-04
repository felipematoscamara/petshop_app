import AsyncStorage from '@react-native-async-storage/async-storage'

const CLIENTES_KEY = '@clientes'

export async function buscarClientes() {
    try{
        const dados = await AsyncStorage.getItem(CLIENTES_KEY)

        return dados ? JSON.parse(dados) : []
    }
    catch(error){
        console.log(error)
        return []
    }
}

export async function salvarClientes(clientes: any[]) {
    try{
        await AsyncStorage.setItem(
            CLIENTES_KEY,
            JSON.stringify(clientes)
        )
    }
    catch(error){
        console.log(error)
    }
}