// Dados da empresa usados no rodapé, na Política de privacidade e nos Termos de uso.
// Tudo entre [colchetes] é PLACEHOLDER: troque pelos dados reais antes de publicar.
// Não invente nenhum dado. Sem CNPJ, razão social e endereço reais o site não deve ir ao ar.
// Identificação do fornecedor: dever de informação do CDC (art. 6º, III, e art. 31) e
// o padrão do Decreto 7.962/2013, art. 2º (nome, CNPJ, endereço físico e eletrônico).

export const EMPRESA = {
  nomeFantasia: 'Barbearia Raiz',
  razaoSocial: '[RAZÃO SOCIAL]',
  cnpj: '[CNPJ 00.000.000/0000-00]',
  endereco: '[Rua, número, complemento]',
  bairroCidadeUf: '[Bairro], [Cidade]/[UF]',
  cep: '[CEP 00000-000]',
  email: '[e-mail de contato]',
  // canal para pedidos sobre dados pessoais (LGPD art. 18 e art. 41).
  // Microempresa e EPP podem dispensar o encarregado (Resolução CD/ANPD nº 2/2022, art. 11),
  // mas precisam manter um canal de comunicação com o titular.
  canalPrivacidade: '[e-mail ou WhatsApp para assuntos de privacidade]',
  encarregado: '[Nome do encarregado, ou: "Dispensado (Resolução CD/ANPD nº 2/2022); contato pelo canal acima"]',
  hospedagem: '[Nome do provedor de hospedagem e país dos servidores]',
  // Quem mantém o site tecnicamente (operador, LGPD art. 5º, VII), se houver contrato para isso.
  operadorTecnico: '[Empresa que mantém o site, se houver]',
  // Prazo de guarda das reservas depois da data do atendimento. O servidor usa o mesmo número
  // (BOOKING_RETENTION_DAYS no .env sobrescreve). Se mudar aqui, mude no .env também.
  retencaoDias: 90,
  // data da última revisão dos textos legais (AAAA-MM-DD)
  revisaoPoliticas: '[AAAA-MM-DD]',
}

// true enquanto houver qualquer placeholder: usado para mostrar o aviso "Dados a preencher".
export const EMPRESA_INCOMPLETA = Object.values(EMPRESA).some((v) => typeof v === 'string' && v.includes('['))
