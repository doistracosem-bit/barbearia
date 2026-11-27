// Fotos da landing. Enquanto um valor for null, a página mostra um espaço marcado "Foto: ...".
// Para usar uma foto real: coloque o arquivo em public/fotos/ e troque null pelo caminho,
// por exemplo hero: '/fotos/hero.jpg'. Use fotos da própria barbearia ou com licença de uso.
//
// DIREITO DE IMAGEM (Constituição art. 5º, X; Código Civil art. 20; LGPD): antes de publicar
// qualquer foto em que apareça uma pessoa (barbeiro, cliente, criança), tenha a autorização
// de uso de imagem por escrito, assinada por ela ou, no caso de menor, pelo responsável.
// Guarde as autorizações. Não use fotos de banco de imagens sem licença nem fotos tiradas do
// Instagram ou do Google de outras barbearias. Quem pedir para sair, sai: troque por null.
// O texto do segundo argumento de <Photo> vira o texto alternativo (alt): descreva o que a foto mostra.
export const FOTOS = {
  hero: null,
  sobre: null,
  servicos: {
    'Corte clássico': null,
    'Corte + barba': null,
    Barba: null,
    'Hot towel': null,
  },
  galeria: [null, null, null, null, null],
  equipe: [null, null, null],
}
