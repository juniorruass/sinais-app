export type Col = { label: string; placeholder?: string; kind?: "text" | "long" | "status" | "image" };
export const ROW_SCHEMAS: Record<string, { cols: Col[]; add: string; help?: string }> = {
  "grupos-whatsapp": { add: "Adicionar grupo", cols: [{ label: "Nome do grupo", placeholder: "GRUPO 1" }, { label: "Link de convite", placeholder: "https://chat.whatsapp.com/..." }] },
  "lancamentos-futuros": { add: "Adicionar lançamento", help: "Data no formato AAAA-MM-DD HH:MM (horário de Brasília) ou escreva: agora", cols: [{ label: "Jogo" }, { label: "Link", placeholder: "https://..." }, { label: "Imagem", kind: "image" }, { label: "Data de lançamento", placeholder: "2026-12-01 18:00" }] },
  "dominios-oficiais": { add: "Adicionar domínio extra", help: "O domínio em que o site está aberto aparece sozinho. Adicione aqui só domínios extras (espelhos).", cols: [{ label: "Extensão", placeholder: ".COM" }, { label: "Domínio", placeholder: "meusite.com" }, { label: "Status", kind: "status" }] },
  "duvidas-frequentes": { add: "Adicionar pergunta", cols: [{ label: "Pergunta" }, { label: "Resposta", kind: "long" }] },
  vpn: { add: "Adicionar passo", help: "A 1ª linha é o botão: título = texto do botão, 2º campo = link do download. As demais são os passos.", cols: [{ label: "Título", placeholder: "INSTALE O APLICATIVO" }, { label: "Descrição (ou link, na 1ª linha)", kind: "long" }] },
};
