export function verificarStatusVacina(dataProximaStr: string): 'atrasada' | 'proxima' | 'em-dia' {
  if (!dataProximaStr) return 'em-dia'

  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)

  const dataProxima = new Date(dataProximaStr)
  dataProxima.setHours(0, 0, 0, 0)

  if (dataProxima < hoje) {
    return 'atrasada'
  }

  const diferencaMilissegundos = dataProxima.getTime() - hoje.getTime()
  const diferencaDias = Math.ceil(diferencaMilissegundos / (1000 * 60 * 60 * 24))

  if (diferencaDias >= 0 && diferencaDias <= 7) {
    return 'proxima'
  }

  return 'em-dia'
}