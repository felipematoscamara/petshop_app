export const servicos: any[] = [] 

export function gerarServicoId(){
    return String(Date.now() + Math.floor(Math.random() * 10000))
}