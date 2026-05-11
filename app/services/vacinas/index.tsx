import { router, useLocalSearchParams, useFocusEffect } from 'expo-router'
import { StyleSheet, View, TouchableOpacity, Text, FlatList} from 'react-native'
import { pets } from '../../data/pets'
import { vacinas } from '@/app/data/vacinas'
import { useState, useCallback } from 'react'
import Header from '@/app/components/Header'
import MessageModal from '@/app/components/MessageModal'
import MenuModal from '@/app/components/MenuModal'

function formatarData(data?: string) {
  if (!data) return ""

  const date = new Date(data)

  if (isNaN(date.getTime())) return ""

  return date.toLocaleDateString("pt-BR")
}

export default function CartaoDeVacinas(){
  const {id} = useLocalSearchParams()
  const pet = pets.find(p => p.id === id)

  const [listaVacinas, setListaVacinas] = useState(vacinas)
  const [menuVisible, setMenuVisible] = useState(false)
  const [vacinaSelecionada, setVacinaSelecionada] = useState<Vacina | null>(null)

  type Vacina = {
    id: string
    idPet: string
    vacina: string
    dose: string
    data: string
    proxima: string
  }


  const excluirVacina = () => {
    if (!vacinaSelecionada) return

    const novaLista = listaVacinas.filter( 
      v => v.id !== vacinaSelecionada.id
    )

    vacinas.length = 0
    vacinas.push(...novaLista)

    setListaVacinas(novaLista)
    setMenuVisible(false)
    setVacinaSelecionada(null)
  }

  useFocusEffect(
    useCallback(() => {
      setListaVacinas([...vacinas])
    }, [])
  )

  const vacinasDoPet = listaVacinas.filter(
    v => v.idPet === id
  )

  if(!pet){
    return(
      <View style={styles.container}>

        <MessageModal
          visible={true}
          mensagem='Ops! Não conseguimos localizar os dados deste pet. Você será redirecionado para página home ;).'
          onClose={() => router.replace("/")}
        />

      </View>
    )
  }
  
  return(
    <View style={{flex: 1}}>    

      <View>
        <Header titulo='Cartão de Vacinas'/>
      </View>

      <View style={styles.container}>

        <FlatList
          data={vacinasDoPet}
          keyExtractor={(item) => item.id}
          renderItem={({item}) => (
            <TouchableOpacity
              style={{margin: 10}}
              onPress={() => {
                setVacinaSelecionada(item)
                setMenuVisible(true)
              }}
            >
              <Text>{item.vacina}</Text>
              <Text>{item.dose}</Text>
              <Text>{formatarData(item.data)}</Text>
              <Text>{formatarData(item.proxima)}</Text>
            </TouchableOpacity>
          )}
          contentContainerStyle={{ paddingBottom: 50 }}

          ListEmptyComponent={
            <Text>Nenhuma vacina cadastrada</Text>
          }

          />

        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push(`/services/vacinas/novo?id=${pet.id}`)}
        >
          <Text style={styles.buttonText}>Nova Vacina</Text>
        </TouchableOpacity>
        
      </View>

      <MenuModal
        visible={menuVisible}
        onClose={() => {
          setMenuVisible(false)
          setVacinaSelecionada(null)
        }}
        title={vacinaSelecionada?.vacina || "Vacina"}
        options={[
          {
            label: "Editar Vacina",
            onPress: () => {
              if (!vacinaSelecionada) return

              router.push(`/services/vacinas/editar?id=${vacinaSelecionada.id}`)
            }
          },

          {
            label: "Excluir Vacina",
            isDanger: true,
            onPress: () => {
              excluirVacina()
            }
          }
        ]}
      />

    </View>
  )
}

const styles = StyleSheet.create({
  container:{
    flex: 1,
    backgroundColor: "#FFF",
    padding: 20
  },

  button:{
    position: "absolute",
    backgroundColor: '#015DAD',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
    bottom: 20,
    left: 20,
    right: 20
  },

  buttonText:{
    color: '#FFF'
  }
})