import AsyncStorage from '@react-native-async-storage/async-storage'

const SERVICOS_KEY = '@servicos'

export async function buscarServicos() {
    try{
        const dados = await AsyncStorage.getItem(SERVICOS_KEY)

        return dados ? JSON.parse(dados) : []
    }
    catch(error){
        console.log(error)
        return []
    }
}

export async function salvarServicos(servicos: any[]) {
    try{
        await AsyncStorage.setItem(
            SERVICOS_KEY,
            JSON.stringify(servicos)
        )
    }
    catch(error){
        console.log(error)
    }
}