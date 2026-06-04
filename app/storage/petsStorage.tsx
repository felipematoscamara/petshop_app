import AsyncStorage from '@react-native-async-storage/async-storage'

const PETS_KEY = "@pets"

export async function buscarPets() {
    try {
        const dados = await AsyncStorage.getItem(PETS_KEY)

        return dados ? JSON.parse(dados) : []
    }
    catch(error){
        console.log(error)
        return []
    }
}

export async function salvarPets(pets: any[]) {
    try{
        await AsyncStorage.setItem(
            PETS_KEY,
            JSON.stringify(pets)
        )
    }
    catch(error){
        console.log(error)
    }
}