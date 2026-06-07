import { TextInput, FlatList, StyleSheet, Text, TouchableOpacity, View, Image, Platform } from 'react-native' 
import { router, useFocusEffect } from 'expo-router'
import { useCallback, useState } from 'react'
import { verificarStatusVacina } from './utils/verificarStatusVacina'
import { buscarClientes } from './storage/clientesStorage'
import { buscarPets } from './storage/petsStorage'
import { buscarVacinas } from '../app/storage/vacinasStrorage'

const MASCOTE_IMG = require('../assets/images/mascote.jpeg');

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

function obterIniciais(nome: string) {
  if (!nome) return "?";
  const nomes = nome.trim().split(" ");
  if (nomes.length >= 2) {
    return `${nomes[0][0]}${nomes[1][0]}`.toUpperCase();
  }
  return nomes[0][0].toUpperCase();
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

        const clientesOrdenados = clientesDoBanco.sort((a: any, b: any) => 
          a.nome?.localeCompare(b.nome)
        );

        setListaClientes(clientesOrdenados)

        const totalPets = petsDoBanco.reduce<Record<string, number>>((acc, pet: any) => {
          acc[pet.idCliente] = (acc[pet.idCliente] || 0) + 1
          return acc
        }, {})
        setPetsPorCliente(totalPets)

        const alertas: Record<string, boolean> = {}
        clientesOrdenados.forEach((cliente: any) => {
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
    <View style={styles.mainContainer}>
  
      <View style={styles.headerContainer}>
        <View>
          <Text style={styles.headerHello}>Olá, Vet!</Text>
          <Text style={styles.headerTitle}>PetShop Manager</Text>
        </View>

        <Image 
          source={MASCOTE_IMG} 
          style={styles.mascote} 
          resizeMode="cover"
        />
      </View>

      <View style={styles.content}>
        <View style={styles.searchSection}>
          <Text style={styles.searchIcon}>🔍</Text> 
          <TextInput
            placeholder='Buscar por nome do cliente...'
            placeholderTextColor="#94A3B8"
            value={busca}
            onChangeText={setBusca}
            style={styles.inputNoBorder}
          />
        </View>

        {clientesFiltrados.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTextTitle}>Nenhum cliente</Text>
            <Text style={styles.emptyTextSub}>Sua busca não retornou resultados.</Text>
          </View>
        )}

        <FlatList
          data={clientesFiltrados}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={styles.divisor} />}
          renderItem={({ item }) => {
            const quantidadePets = petsPorCliente[item.id] || 0
            const temAlerta = clientesComAlerta[item.id] || false
            const iniciais = obterIniciais(item.nome)

            return (
              <TouchableOpacity
                onPress={() => router.push(`/clientes/${item.id}`)}
                style={styles.clienteRow}
                activeOpacity={0.6}
              >
                <View style={[styles.avatar, temAlerta ? styles.avatarAlert : styles.avatarNormal]}>
                  <Text style={[styles.avatarText, temAlerta ? styles.avatarTextAlert : styles.avatarTextNormal]}>
                    {iniciais}
                  </Text>
                </View>

                <View style={styles.infoContainer}>
                  <Text style={styles.nomeMain}>{item.nome}</Text>
                  <Text style={styles.subtextoCount}>
                    {quantidadePets === 0 
                      ? "Nenhum pet cadastrado" 
                      : `${quantidadePets} ${quantidadePets === 1 ? "pet" : "pets"}`
                    }
                  </Text>
                </View>

                <View style={styles.rightAction}>
                  {temAlerta && <View style={styles.dotAlert} />}
                  <Text style={styles.chevron}>›</Text>
                </View>
              </TouchableOpacity>
            )
          }}
          contentContainerStyle={{ paddingBottom: 130, paddingTop: 8 }}
        />
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.button}
          activeOpacity={0.85}
          onPress={() => router.push("/clientes/novo")}
        >
          <Text style={styles.buttonText}>Novo Cliente</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const Colors = {
  bg: '#FFFFFF',
  bgSecundario: '#F8FAFC',
  textPrincipal: '#1E293B',
  textSecundario: '#64748B',
  primary: '#007BFF',
  border: '#E2E8F0',
  danger: '#EF4444',
  dangerLight: '#FEE2E2',
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 60, 
    paddingBottom: 20,
    backgroundColor: Colors.bg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerHello: {
    fontSize: 14,
    color: Colors.textSecundario,
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.textPrincipal,
    letterSpacing: -0.5,
  },
  mascote: {
    width: 56,
    height: 56,
    borderRadius: 28, 
    backgroundColor: Colors.bgSecundario, 
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  searchSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bgSecundario,
    borderRadius: 12,
    marginTop: 16,
    marginBottom: 8,
    paddingHorizontal: 12,
    height: 50,
  },
  searchIcon: {
    fontSize: 18,
    marginRight: 8,
    opacity: 0.5
  },
  inputNoBorder: {
    flex: 1,
    fontSize: 16,
    color: Colors.textPrincipal,
  },
  clienteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  avatarNormal: {
    backgroundColor: Colors.bgSecundario,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  avatarAlert: {
    backgroundColor: Colors.dangerLight,
    borderWidth: 1,
    borderColor: Colors.danger,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '700',
  },
  avatarTextNormal: {
    color: Colors.primary,
  },
  avatarTextAlert: {
    color: Colors.danger,
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  nomeMain: {
    fontSize: 17,
    fontWeight: '600',
    color: Colors.textPrincipal,
    marginBottom: 2,
  },
  subtextoCount: {
    fontSize: 14,
    color: Colors.textSecundario,
  },
  rightAction: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  dotAlert: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.danger,
    marginRight: 12,
  },
  chevron: {
    fontSize: 24,
    color: Colors.border,
    fontWeight: '300',
  },
  divisor: {
    height: 1,
    backgroundColor: Colors.border,
    marginLeft: 66,
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 60,
    paddingHorizontal: 40,
  },
  emptyTextTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrincipal,
    marginBottom: 8,
  },
  emptyTextSub: {
    fontSize: 14,
    color: Colors.textSecundario,
    textAlign: 'center',
    lineHeight: 20,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.bg,
    paddingHorizontal: 16,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  button: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  buttonText: {
    color: "#FFF",
    fontWeight: "700",
    fontSize: 16,
    letterSpacing: 0.3
  }
})