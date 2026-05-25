export function verificarStatusVacina(validade: string) {

    const hoje = new Date()

    const dataValidade = new Date(validade)

    const diferenca = dataValidade.getTime() - hoje.getTime()

    const diasRestantes = Math.ceil(
        diferenca / (1000 * 60 * 60 * 24)
    )

    if (diasRestantes < 0) {
        return "atrasada"
    }

    if (diasRestantes <= 7) {
        return "proxima"
    }

    return "em dia"
}