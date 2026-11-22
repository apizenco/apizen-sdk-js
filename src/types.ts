/** A code and its description, as the Receita publishes them. */
export interface Code {
  codigo: string;
  descricao: string | null;
}

export interface Municipio {
  codigo_ibge: string | null;
  nome: string | null;
}

/** GET /v1/cnpj/{cnpj}: an establishment (head office or branch). */
export interface Cnpj {
  cnpj: string;
  razao_social: string | null;
  nome_fantasia: string | null;
  matriz: boolean;
  ativa: boolean;
  /** 01 Nula, 02 Ativa, 03 Suspensa, 04 Inapta, 08 Baixada. */
  situacao: Code;
  data_situacao: string | null;
  data_inicio_atividade: string | null;
  simples: boolean | null;
  mei: boolean | null;
  cnae: Code | null;
  endereco: {
    logradouro: string | null;
    numero: string | null;
    complemento: string | null;
    bairro: string | null;
    cep: string | null;
    municipio: Municipio;
    uf: string | null;
  };
  telefone: string | null;
  email: string | null;
}

/** GET /v1/cnpj/{cnpj}/nome. */
export interface CompanyName {
  cnpj: string;
  razao_social: string | null;
  nome_fantasia: string | null;
}

/** GET /v1/cep/{cep}. */
export interface Cep {
  cep: string;
  logradouro: string | null;
  bairro: string | null;
  municipio: Municipio;
  uf: string | null;
  localizacao: { latitude: number; longitude: number } | null;
  enderecos: number | null;
  estabelecimentos: number | null;
  fonte: "cnefe" | "receita" | "cnefe+receita";
}
