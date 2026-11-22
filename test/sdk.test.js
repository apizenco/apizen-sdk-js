import assert from "node:assert/strict";
import { test } from "node:test";

import { Apizen, ApizenError, cleanCnpj, isValidCnpj, maskCnpj } from "../dist/index.js";

test("check digits, numeric and alphanumeric", () => {
  assert.equal(isValidCnpj("33.000.167/0001-01"), true);
  assert.equal(isValidCnpj("33.000.167/0001-02"), false);
  assert.equal(isValidCnpj("12.ABC.345/01DE-35"), true);
  assert.equal(isValidCnpj("11.111.111/1111-11"), false);
  assert.equal(cleanCnpj("12.abc.345/01de-35"), "12ABC34501DE35");
  assert.equal(maskCnpj("33000167000101"), "33.000.167/0001-01");
});

const fake = (status, body) => async (url, init) => {
  fake.last = { url, init };
  return new Response(JSON.stringify(body), { status });
};

test("cnpj: the record, the key in the header", async () => {
  const apizen = new Apizen({ cnpjKey: "sk_cnpj_x", fetch: fake(200, { cnpj: "33000167000101" }) });
  const r = await apizen.cnpj("33.000.167/0001-01");
  assert.equal(r.cnpj, "33000167000101");
  assert.equal(fake.last.url, "https://cnpj.apizen.com.br/v1/cnpj/33000167000101");
  assert.equal(fake.last.init.headers.Authorization, "Bearer sk_cnpj_x");
});

test("404 is null; 401 throws", async () => {
  assert.equal(await new Apizen({ cepKey: "k", fetch: fake(404, { error: "cep not found" }) }).cep("01001-000"), null);
  await assert.rejects(
    new Apizen({ cnpjKey: "k", fetch: fake(401, { error: "invalid or revoked key" }) }).cnpjNome("33000167000101"),
    (e) => e instanceof ApizenError && e.status === 401,
  );
  await assert.rejects(new Apizen().cep("01001000"), ApizenError);
});
