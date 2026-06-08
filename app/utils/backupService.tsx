import AsyncStorage from '@react-native-async-storage/async-storage'
import * as Sharing from 'expo-sharing'
import * as DocumentPicker from 'expo-document-picker'
import * as FileSystem from 'expo-file-system/legacy'

const BACKUP_VERSION = 1

function validarBackup(backup: any) {
    if (!backup) return false
    if (typeof backup !== 'object') return false
    if (!backup.version) return false

    const campos = ['clientes', 'pets', 'servicos', 'vacinas', 'pontos']

    for (const campo of campos) {
        if (!Array.isArray(backup[campo])) {
            backup[campo] = []
        }
    }

    return true
}

export async function exportarBackup() {
    try {
        const clientes = await AsyncStorage.getItem('@clientes')
        const pets = await AsyncStorage.getItem('@pets')
        const servicos = await AsyncStorage.getItem('@servicos')
        const vacinas = await AsyncStorage.getItem('@vacinas')
        const pontos = await AsyncStorage.getItem('@pontos') 

        const backup = {
            version: BACKUP_VERSION,
            exportDate: new Date().toISOString(),
            clientes: clientes ? JSON.parse(clientes) : [],
            pets: pets ? JSON.parse(pets) : [],
            servicos: servicos ? JSON.parse(servicos) : [],
            vacinas: vacinas ? JSON.parse(vacinas) : [],
            pontos: pontos ? JSON.parse(pontos) : [], 
        }

        const fileUri = `${FileSystem.cacheDirectory}backup_petshop_${Date.now()}.json`

        await FileSystem.writeAsStringAsync(
            fileUri,
            JSON.stringify(backup, null, 2)
        )

        await Sharing.shareAsync(fileUri)

        return { sucesso: true }
    }
    catch (error) {
        console.log(error)
        return { sucesso: false, erro: error }
    }
}

export async function importarBackup() {
    try {
        const resultado = await DocumentPicker.getDocumentAsync({
            type: 'application/json',
            copyToCacheDirectory: true
        })

        if (resultado.canceled) {
            return { sucesso: false, erro: 'cancelado' }
        }

        const arquivo = resultado.assets?.[0]

        if (!arquivo?.uri) {
            return { sucesso: false, erro: 'arquivo_invalido' }
        }

        let conteudo

        try {
            conteudo = await FileSystem.readAsStringAsync(arquivo.uri)
        } catch (e) {
            return { sucesso: false, erro: 'erro_leitura_arquivo' }
        }

        let backup

        try {
            backup = JSON.parse(conteudo)
        } catch (e) {
            return { sucesso: false, erro: 'json_invalido' }
        }

        if (!validarBackup(backup)) {
            return { sucesso: false, erro: 'backup_corrompido' }
        }

        if (backup.version !== BACKUP_VERSION) {
            return { sucesso: false, erro: 'versao_incompativel' }
        }


        try {
            
            await AsyncStorage.multiSet([
                ['@clientes', JSON.stringify(backup.clientes || [])],
                ['@pets', JSON.stringify(backup.pets || [])],
                ['@servicos', JSON.stringify(backup.servicos || [])],
                ['@vacinas', JSON.stringify(backup.vacinas || [])],
                ['@pontos', JSON.stringify(backup.pontos || [])], 
            ])
        } catch (e) {
            return { sucesso: false, erro: 'erro_salvar_storage' }
        }

        return { sucesso: true }

    } catch (error) {
        console.log(error)
        return { sucesso: false, erro: 'erro_desconhecido' }
    }
}