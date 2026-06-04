import { TextInput, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { router, useFocusEffect } from 'expo-router'
import { useCallback, useState } from 'react'
import { verificarStatusVacina } from './utils/verificarStatusVacina'
import HeaderHome from './components/HeaderHome'
import { buscarClientes } from './storage/clientesStorage' 
import { buscarPets } from './storage/petsStorage'
import { buscarVacinas } from '../app/storage/vacinasStrorage'

type StatusPet = "atrasada" | "proxima" | "em-dia" | "sem-vacina"

type Vacina = {
  id: string
  idPet: string
  idVacina: string
  vacina: string
  dose: string
  data: string
  proxima?: string
}

export default function ClientesPage() {
  const [busca, setBusca] = useState('')
 
  const [listaClientes, setListaClientes] = useState<any[]>([]) 
  const [petsPorCliente, setPetsPorCliente] = useState<Record<string, number>>({})
  const [clientesComAlerta, setClientesComAlerta] = useState<Record<string, boolean>>({})

  function obterUltimaVacinaDoTipo(idPet: string, idVacina: string, vacinasAtuais: Vacina[]) {
    const vacinasDoPet = vacinasAtuais.filter(
      (v: Vacina) => v.idPet === idPet && v.idVacina === idVacina
    )
    if (vacinasDoPet.length === 0) return null

    return vacinasDoPet.reduce((maisRecente: Vacina, atual: Vacina) => {
      return new Date(atual.data).getTime() > new Date(maisRecente.data).getTime()
        ? atual
        : maisRecente
    })
  }

  function obterStatusPet(idPet: string, vacinasAtuais: Vacina[]): StatusPet {
    const ultimaV11 = obterUltimaVacinaDoTipo(idPet, "v11", vacinasAtuais)
    const ultimaAntirrabica = obterUltimaVacinaDoTipo(idPet, "antirrabica", vacinasAtuais)
    const ultimaVanguard = obterUltimaVacinaDoTipo(idPet, "vanguard", vacinasAtuais)
    const ultimaAnticio = obterUltimaVacinaDoTipo(idPet, "anticio", vacinasAtuais)
    
    const ultimasVacinas = [ultimaV11, ultimaAntirrabica, ultimaVanguard, ultimaAnticio].filter(Boolean) as Vacina[]

    if (ultimasVacinas.length === 0) return "sem-vacina"

    const possuiAtrasada = ultimasVacinas.some(
      v => verificarStatusVacina(v.proxima || "") === "atrasada"
    )
    if (possuiAtrasada) return "atrasada"

    const possuiProxima = ultimasVacinas.some(
      v => verificarStatusVacina(v.proxima || "") === "proxima"
    )
    if (possuiProxima) return "proxima"

    return "em-dia"
  }

  useFocusEffect(
    useCallback(() => {
      async function carregarDadosDoStorage() {
        const [clientesDoBanco, petsDoBanco, vacinasDoBanco] = await Promise.all([
          buscarClientes(),
          buscarPets(),
          buscarVacinas()
        ]) as [any[], any[], any[]]

        setListaClientes(clientesDoBanco)
        
        const totalPets = petsDoBanco.reduce<Record<string, number>>((acc, pet: any) => {
          acc[pet.idCliente] = (acc[pet.idCliente] || 0) + 1
          return acc
        }, {})
        setPetsPorCliente(totalPets)

        const alertas: Record<string, boolean> = {}
        clientesDoBanco.forEach((cliente: any) => {
          const petsDoCliente = petsDoBanco.filter((pet: any) => pet.idCliente === cliente.id)
          const temAlerta = petsDoCliente.some((pet: any) => {
            const status = obterStatusPet(pet.id, vacinasDoBanco)
            return status === "atrasada" || status === "proxima"
          })
          alertas[cliente.id] = temAlerta
        })
        setClientesComAlerta(alertas)
      }

      carregarDadosDoStorage()
    }, [])
  )

  const clientesFiltrados = listaClientes.filter(cliente =>
    cliente.nome?.toLowerCase().includes(busca.toLowerCase())
  )

  return (
    <View style={{ flex: 1 }}>
      <HeaderHome titulo='PetShop Manager' />

      <View style={styles.container}>
        <View>
          <TextInput
            placeholder='🔎 Buscar cliente...'
            value={busca}
            onChangeText={setBusca}
            style={styles.input}
          />

          {clientesFiltrados.length === 0 && (
            <Text style={{ margin: 10 }}>Nenhum cliente encontrado</Text>
          )}
        </View>

        <FlatList
          data={clientesFiltrados}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            const quantidadePets = petsPorCliente[item.id] || 0
            const temAlerta = clientesComAlerta[item.id] || false

            return (
              <TouchableOpacity
                onPress={() => router.push(`/clientes/${item.id}`)}
                style={styles.card}
              >
                <View style={styles.cardLinha}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.nome}>{item.nome}</Text>
                    <Text style={styles.subtexto}>
                      🐶🐱 {quantidadePets} {quantidadePets === 1 ? "Pet" : "Pets"}
                    </Text>
                  </View>

                  {temAlerta && (
                    <Text style={styles.alerta}>⚠️</Text>
                  )}
                </View>
              </TouchableOpacity>
            )
          }}
          contentContainerStyle={{ paddingBottom: 80 }}
        />

        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push("/clientes/novo")}
        >
          <Text style={styles.buttonText}>Novo Cliente</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFF",
    flex: 1,
    padding: 20
  },
  input: {
    width: "100%",
    borderWidth: 1,
    marginBottom: 10,
    padding: 8,
    borderRadius: 6,
    borderColor: "#CCC"
  },
  card: {
    marginBottom: 10,
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#F5F5F5"
  },
  cardLinha: {
    flexDirection: "row",
    alignItems: "center"
  },
  nome: {
    fontSize: 16,
    fontWeight: "600"
  },
  subtexto: {
    marginTop: 4,
    color: "#555"
  },
  alerta: {
    fontSize: 18,
    marginLeft: 10
  },
  button: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: "#015DAD",
    padding: 12,
    borderRadius: 6,
    alignItems: "center"
  },
  buttonText: {
    color: "#FFF",
    fontWeight: "600"
  }
})