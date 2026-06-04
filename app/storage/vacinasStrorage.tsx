import AsyncStorage from '@react-native-async-storage/async-storage'

const VACINAS_KEY = '@vacinas'

export async function buscarVacinas() {
    try{
        const dados = await AsyncStorage.getItem(VACINAS_KEY)

        return dados ? JSON.parse(dados) : []
    }
    catch(error){
        console.log(error)
        return []
    }
}

export async function salvarVacinas(vacinas: any[]) {
    try{
        await AsyncStorage.setItem(
            VACINAS_KEY,
            JSON.stringify(vacinas)
        )
    }
    catch(error){
        console.log(error)
    }
}