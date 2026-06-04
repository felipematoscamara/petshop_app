import { StyleSheet, TouchableOpacity, View, Text, ActivityIndicator } from 'react-native'
import { useEffect, useState } from 'react'
import { useLocalSearchParams, router } from 'expo-router'
import Header from '@/app/components/Header'
import DateInput from '@/app/components/DateInput'
import MessageModal from '@/app/components/MessageModal'

import { buscarPets } from '@/app/storage/petsStorage'
import { buscarServicos, salvarServicos } from '@/app/storage/servicosStorage'
import { buscarClientes, salvarClientes } from '@/app/storage/clientesStorage'

export default function EditarServico() {
  const { id } = useLocalSearchParams()

  const servicoId = Array.isArray(id) ? id[0] : id

  const [loading, setLoading] = useState(true)
  const [servicoAtual, setServicoAtual] = useState<any>(null)
  const [pet, setPet] = useState<any>(null)
  const [cliente, setCliente] = useState<any>(null)

  const [banho, setBanho] = useState(false)
  const [tosa, setTosa] = useState(false)
  const [data, setData] = useState<Date | null>(null)

  const [messageVisible, setMessageVisible] = useState(false)
  const [mensagem, setMensagem] = useState('')

  useEffect(() => {
    async function carregarDadosServico() {
      try {
        setLoading(true)
  
        const [allServicos, allPets, allClientes] = await Promise.all([
          buscarServicos(),
          buscarPets(),
          buscarClientes()
        ])

        const sAtual = allServicos.find((s: any) => s.id === servicoId)
        
        if (sAtual) {
          setServicoAtual(sAtual)
          setPet(allPets.find((p: any) => p.id === sAtual.idPet) || null)
          setCliente(allClientes.find((c: any) => c.id === sAtual.idCliente) || null)

          setData(new Date(sAtual.data))
          if (sAtual.servico === 'Banho') setBanho(true)
          if (sAtual.servico === 'Tosa') setTosa(true)
        }
      } catch (error) {
        console.error("Erro ao carregar dados do serviço:", error)
      } finally {
        setLoading(false)
      }
    }

    carregarDadosServico()
  }, [servicoId])

  async function salvarServico() {
    if (!servicoAtual || !cliente) return

    if (!data || (!banho && !tosa)) {
      setMensagem('Preencha os campos obrigatórios (*)')
      setMessageVisible(true)
      return
    }

    try {
      let novoServico = ''
      let novosPontos = 0

      if (banho) {
        novoServico = 'Banho'
        novosPontos = 10
      }

      if (tosa) {
        novoServico = 'Tosa'
        novosPontos = 15
      }

      const [todosServicos, todosClientes] = await Promise.all([
        buscarServicos(),
        buscarClientes()
      ])

      const clientesAtualizados = todosClientes.map((c: any) => {
        if (c.id === servicoAtual.idCliente) {
          const pontosAtuais = c.pontos || 0
          const pontosAntigosDoServico = servicoAtual.pontos || 0
          return {
            ...c,
            pontos: pontosAtuais - pontosAntigosDoServico + novosPontos
          }
        }
        return c
      })

      const servicosAtualizados = todosServicos.map((s: any) => {
        if (s.id === servicoAtual.id) {
          return {
            ...s,
            servico: novoServico,
            data: data.toISOString(),
            pontos: novosPontos
          }
        }
        return s
      })

      await Promise.all([
        salvarServicos(servicosAtualizados),
        salvarClientes(clientesAtualizados)
      ])

      router.back()
    } catch (error) {
      console.error("Erro ao atualizar o serviço:", error)
      setMensagem("Ops! Não foi possível salvar as alterações.")
      setMessageVisible(true)
    }
  }

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#015DAD" />
      </View>
    )
  }

  if (!servicoAtual || !pet || !cliente) {
    return (
      <View style={styles.container}>
        <MessageModal
          visible={true}
          mensagem='Ops! Não conseguimos localizar os dados deste serviço. Você será redirecionado para página home ;).'
          onClose={() => router.replace("/")}
        />
      </View>
    )
  }

  return (
    <View style={{flex: 1}}>
      <View>
        <Header titulo='Editar Serviço' />
      </View>

      <View style={styles.container}>
        <Text style={styles.labelSelect}>Selecione um Serviço*</Text>

        <TouchableOpacity
          style={styles.checkboxContainer}
          onPress={() => {
            setBanho(true)
            setTosa(false)
          }}
        >
          <Text style={styles.checkboxText}>{banho ? '(X)' : '( )'} Banho</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.checkboxContainer}
          onPress={() => {
            setTosa(true)
            setBanho(false)
          }}
        >
          <Text style={styles.checkboxText}>{tosa ? '(X)' : '( )'} Tosa</Text>
        </TouchableOpacity>

        <DateInput
          placeholder='Data*'
          value={data}
          onChange={setData}
        />

        <TouchableOpacity
          style={styles.button}
          onPress={salvarServico}
        >
          <Text style={styles.buttonText}>
            Salvar Alterações
          </Text>
        </TouchableOpacity>
      </View>

      <MessageModal
        visible={messageVisible}
        mensagem={mensagem}
        onClose={() => setMessageVisible(false)}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF",
    padding: 20
  },
  labelSelect: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10
  },
  checkboxContainer: {
    paddingVertical: 8,
    paddingHorizontal: 2,
    marginBottom: 5
  },
  checkboxText: {
    fontSize: 16,
    color: '#444'
  },
  button: {
    backgroundColor: "#015DAD",
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 10
  },
  buttonText: {
    color: "#FFF",
    fontWeight: '600'
  }
})