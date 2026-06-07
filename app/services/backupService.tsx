import AsyncStorage from '@react-native-async-storage/async-storage'
import * as Sharing from 'expo-sharing'
import * as DocumentPicker from 'expo-document-picker'
import * as FileSystem from 'expo-file-system/legacy'

const BACKUP_VERSION = 1

export async function exportarBackup() {
    try {
        const clientes = await AsyncStorage.getItem('@clientes')
        const pets = await AsyncStorage.getItem('@pets')
        const servicos = await AsyncStorage.getItem('@servicos')
        const vacinas = await AsyncStorage.getItem('@vacinas')

        const backup = {
            version: BACKUP_VERSION,
            exportDate: new Date().toISOString(),
            clientes: clientes ? JSON.parse(clientes) : [],
            pets: pets ? JSON.parse(pets) : [],
            servicos: servicos ? JSON.parse(servicos) : [],
            vacinas: vacinas ? JSON.parse(vacinas) : [],
        }

        const fileUri =
            `${FileSystem.cacheDirectory}backup_petshop_${Date.now()}.json`

        await FileSystem.writeAsStringAsync(
            fileUri,
            JSON.stringify(backup, null, 2)
        )

        await Sharing.shareAsync(fileUri)

        return {
            sucesso: true
        }
    }
    catch (error) {
        console.log(error)

        return {
            sucesso: false,
            erro: error
        }
    }
}

export async function importarBackup() {
    try {
        const resultado = await DocumentPicker.getDocumentAsync({
            type: 'application/json',
            copyToCacheDirectory: true
        })

        if (resultado.canceled) {
            return {
                sucesso: false
            }
        }

        const arquivo = resultado.assets[0]

        const resposta = await fetch(arquivo.uri)
        const backup = await resposta.json()

        if (backup.version !== BACKUP_VERSION) {
            throw new Error('Versão de backup incompatível')
        }

        await AsyncStorage.multiSet([
            ['@clientes', JSON.stringify(backup.clientes || [])],
            ['@pets', JSON.stringify(backup.pets || [])],
            ['@servicos', JSON.stringify(backup.servicos || [])],
            ['@vacinas', JSON.stringify(backup.vacinas || [])],
        ])

        return {
            sucesso: true
        }
    }
    catch (error) {
        console.log(error)

        return {
            sucesso: false,
            erro: error
        }
    }
}