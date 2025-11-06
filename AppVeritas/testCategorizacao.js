// Teste rápido de categorização
// Execute: node testCategorizacao.js

const testCases = [
  { ementa: 'Altera o Código Penal para aumentar penas de crimes violentos', expected: 'Segurança' },
  { ementa: 'Dispõe sobre a política de saúde pública e o SUS', expected: 'Saúde' },
  { ementa: 'Altera a Lei de Diretrizes e Bases da Educação Nacional', expected: 'Educação' },
  { ementa: 'Institui o regime de tributação simplificado para empresas', expected: 'Economia' },
  { ementa: 'Estabelece política nacional de proteção ao meio ambiente', expected: 'Meio Ambiente' },
  { ementa: 'Altera a CLT para dispor sobre jornada de trabalho', expected: 'Trabalho' },
  { ementa: 'Institui marco civil da internet e proteção de dados', expected: 'Tecnologia' },
  { ementa: 'Dispõe sobre igualdade de gênero e combate à discriminação', expected: 'Direitos Humanos' },
  { ementa: 'Altera a Lei nº 13.188', expected: 'Economia' }, // Genérica
];

function mapCategoria(keywords = '', ementa = '') {
  const text = `${keywords || ''} ${ementa || ''}`.toLowerCase().trim();
  
  if (!text) return 'Economia';
  
  // SAÚDE
  if (
    text.includes('saúde') || text.includes('saude') || 
    text.includes('sus') || text.includes('hospital') || 
    text.includes('médico') || text.includes('medico') ||
    text.includes('medicamento') || text.includes('vacina') ||
    text.includes('enfermeiro') || text.includes('tratamento') ||
    text.includes('doença') || text.includes('doenca') ||
    text.includes('paciente') || text.includes('clínica') || text.includes('clinica') ||
    text.includes('ambulatório') || text.includes('ambulatorio') ||
    text.includes('sanitário') || text.includes('sanitaria')
  ) return 'Saúde';
  
  // EDUCAÇÃO
  if (
    text.includes('educação') || text.includes('educacao') ||
    text.includes('escola') || text.includes('ensino') || 
    text.includes('professor') || text.includes('aluno') ||
    text.includes('universidade') || text.includes('faculdade') ||
    text.includes('estudante') || text.includes('curso') ||
    text.includes('aprendizagem') || text.includes('pedagógico') || text.includes('pedagogico') ||
    text.includes('didático') || text.includes('didatico') ||
    text.includes('enem') || text.includes('vestibular') ||
    text.includes('creche') || text.includes('pré-escola') || text.includes('pre-escola') ||
    text.includes('ldb') || text.includes('diretrizes e bases')
  ) return 'Educação';
  
  // SEGURANÇA
  if (
    text.includes('segurança') || text.includes('seguranca') ||
    text.includes('polícia') || text.includes('policia') || 
    text.includes('crime') || text.includes('criminal') ||
    text.includes('violência') || text.includes('violencia') ||
    text.includes('penal') || text.includes('presídio') || text.includes('presidio') ||
    text.includes('prisão') || text.includes('prisao') ||
    text.includes('delegacia') || text.includes('investigação') || text.includes('investigacao') ||
    text.includes('armamento') || text.includes('arma de fogo') ||
    text.includes('tráfico') || text.includes('trafico') ||
    text.includes('código penal') || text.includes('codigo penal')
  ) return 'Segurança';
  
  // TRABALHO
  if (
    text.includes('trabalho') || text.includes('trabalhista') ||
    text.includes('emprego') || text.includes('trabalhador') || 
    text.includes('salário') || text.includes('salario') ||
    text.includes('remuneração') || text.includes('remuneracao') ||
    text.includes('contrato de trabalho') || text.includes('clt') ||
    text.includes('sindicato') || text.includes('desemprego') ||
    text.includes('aposentadoria') || text.includes('previdência') || text.includes('previdencia') ||
    text.includes('inss') || text.includes('férias') || text.includes('ferias') ||
    text.includes('jornada') || text.includes('horário de trabalho')
  ) return 'Trabalho';
  
  // MEIO AMBIENTE
  if (
    text.includes('meio ambiente') || text.includes('ambiental') || 
    text.includes('sustentável') || text.includes('sustentavel') ||
    text.includes('clima') || text.includes('climática') || text.includes('climatica') ||
    text.includes('ecológico') || text.includes('ecologico') ||
    text.includes('floresta') || text.includes('desmatamento') ||
    text.includes('poluição') || text.includes('poluicao') ||
    text.includes('biodiversidade') || text.includes('fauna') || text.includes('flora') ||
    text.includes('reciclagem') || text.includes('lixo') || text.includes('resíduo') ||
    text.includes('água') || text.includes('hidrico') || text.includes('saneamento') ||
    text.includes('energia renovável') || text.includes('energia renovavel')
  ) return 'Meio Ambiente';
  
  // TECNOLOGIA
  if (
    text.includes('tecnologia') || text.includes('tecnológico') || text.includes('tecnologico') ||
    text.includes('digital') || text.includes('internet') || 
    text.includes('dados') || text.includes('informação') || text.includes('informacao') ||
    text.includes('software') || text.includes('aplicativo') ||
    text.includes('computador') || text.includes('eletrônico') || text.includes('eletronico') ||
    text.includes('inteligência artificial') || text.includes('inteligencia artificial') ||
    text.includes('cibernético') || text.includes('cyber') ||
    text.includes('telecomunicação') || text.includes('telecomunicacao') ||
    text.includes('5g') || text.includes('banda larga') ||
    text.includes('privacidade de dados') || text.includes('lgpd') ||
    text.includes('marco civil')
  ) return 'Tecnologia';
  
  // DIREITOS HUMANOS
  if (
    text.includes('direitos humanos') || 
    text.includes('igualdade') || text.includes('equidade') ||
    text.includes('discriminação') || text.includes('discriminacao') ||
    text.includes('lgbtqi') || text.includes('lgbt') ||
    text.includes('racismo') || text.includes('racial') ||
    text.includes('gênero') || text.includes('genero') ||
    text.includes('feminino') || text.includes('feminismo') ||
    text.includes('acessibilidade') || text.includes('deficiente') || text.includes('deficiência') ||
    text.includes('criança') || text.includes('adolescente') || text.includes('idoso') ||
    text.includes('minoria') || text.includes('inclusão') || text.includes('inclusao') ||
    text.includes('refugiado') || text.includes('imigrante')
  ) return 'Direitos Humanos';
  
  // ECONOMIA
  if (
    text.includes('economia') || text.includes('econômico') || text.includes('economico') ||
    text.includes('fiscal') || text.includes('tributário') || text.includes('tributario') ||
    text.includes('imposto') || text.includes('taxa') || text.includes('tributo') ||
    text.includes('orçamento') || text.includes('orcamento') ||
    text.includes('financeiro') || text.includes('monetário') || text.includes('monetario') ||
    text.includes('banco') || text.includes('crédito') || text.includes('credito') ||
    text.includes('dívida') || text.includes('divida') ||
    text.includes('mercado') || text.includes('comercial') || text.includes('comércio') || text.includes('comercio') ||
    text.includes('empresa') || text.includes('empresarial') ||
    text.includes('pib') || text.includes('inflação') || text.includes('inflacao') ||
    text.includes('lei complementar') || text.includes('lei ordinária') || text.includes('codigo civil')
  ) return 'Economia';
  
  return 'Economia';
}

console.log('🧪 Testando Categorização de Projetos\n');
console.log('='.repeat(80));

let passed = 0;
let failed = 0;

testCases.forEach((test, index) => {
  const result = mapCategoria('', test.ementa);
  const isCorrect = result === test.expected;
  
  if (isCorrect) {
    passed++;
    console.log(`✅ Teste ${index + 1}: PASSOU`);
  } else {
    failed++;
    console.log(`❌ Teste ${index + 1}: FALHOU`);
    console.log(`   Ementa: "${test.ementa}"`);
    console.log(`   Esperado: "${test.expected}"`);
    console.log(`   Obtido: "${result}"`);
  }
});

console.log('\n' + '='.repeat(80));
console.log(`📊 Resultado: ${passed}/${testCases.length} testes passaram`);
console.log(`✅ Aprovados: ${passed}`);
console.log(`❌ Falharam: ${failed}`);
console.log('='.repeat(80));
