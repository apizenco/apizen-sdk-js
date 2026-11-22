# apizen

SDK oficial das APIs da [Apizen](https://www.apizen.com.br): CNPJ (Receita Federal, inclusive o CNPJ alfanumérico) e CEP (com código IBGE e coordenadas). Sem dependências; Node 18+, Bun, Deno e funções de borda.

```bash
npm install apizen
```

```ts
import { Apizen, isValidCnpj } from "apizen";

const apizen = new Apizen({
  cnpjKey: process.env.CNPJ_API_KEY,
  cepKey: process.env.CEPS_API_KEY,
});

isValidCnpj("12.ABC.345/01DE-35"); // true: só os dígitos verificadores, sem rede

const empresa = await apizen.cnpj("33.000.167/0001-01"); // null quando o CNPJ não existe
console.log(empresa?.razao_social, empresa?.ativa);

const nome = await apizen.cnpjNome("33000167000101"); // só os nomes, mais leve

const cep = await apizen.cep("01001-000");
console.log(cep?.municipio.codigo_ibge, cep?.localizacao);
```

As chaves são secretas: use o SDK no servidor, nunca no navegador. Crie as suas grátis em [apizen.com.br/entrar](https://www.apizen.com.br/entrar).

- `cnpj(cnpj)`, `cnpjNome(cnpj)`, `cep(cep)`: o recurso, ou `null` quando não existe (404).
- Outros erros (chave inválida, formato errado) lançam `ApizenError`, com `status`.
- `isValidCnpj`, `cleanCnpj`, `maskCnpj`: CNPJ numérico e alfanumérico, sem rede.

Documentação: [apizen.com.br/docs](https://www.apizen.com.br/docs/inicio).

## Publicar uma versão

Mude `version` no `package.json`, faça o commit e crie a tag `v<versão>` (`git tag v0.1.1 && git push origin v0.1.1`): o workflow `publish` testa e publica no npm.
