import type { Cep, Cnpj, CompanyName } from "./types.js";

export * from "./cnpj.js";
export type * from "./types.js";

export interface ApizenOptions {
  /** The CNPJ API's key (sk_cnpj_…). */
  cnpjKey?: string;
  /** The CEP API's key (sk_ceps_…). */
  cepKey?: string;
  /** Another fetch (tests, a proxy). */
  fetch?: typeof fetch;
  /** Milliseconds before a call gives up (default 15 000). */
  timeout?: number;
  /** Other addresses (tests). */
  baseUrls?: { cnpj?: string; cep?: string };
}

/** An answer other than 200 or 404: 400 (bad input), 401 (the key), 5xx. */
export class ApizenError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApizenError";
  }
}

/**
 * The Apizen APIs. Secret keys: use this on a server, never in a browser.
 *
 *   const apizen = new Apizen({ cnpjKey: process.env.CNPJ_API_KEY });
 *   const empresa = await apizen.cnpj("33.000.167/0001-01"); // null when there is none
 */
export class Apizen {
  private readonly opts: ApizenOptions;

  constructor(opts: ApizenOptions = {}) {
    this.opts = opts;
  }

  /** An establishment's record, or null when the CNPJ is not in the Receita's data. */
  cnpj(cnpj: string): Promise<Cnpj | null> {
    return this.get("cnpj", `/v1/cnpj/${this.path(cnpj)}`);
  }

  /** Only the company's names: lighter, to check whose a CNPJ is. */
  cnpjNome(cnpj: string): Promise<CompanyName | null> {
    return this.get("cnpj", `/v1/cnpj/${this.path(cnpj)}/nome`);
  }

  /** A CEP's address, with the town's IBGE code and a point; null when there is none. */
  cep(cep: string): Promise<Cep | null> {
    return this.get("cep", `/v1/cep/${encodeURIComponent(cep.replace(/\D/g, ""))}`);
  }

  private path(cnpj: string) {
    return encodeURIComponent(cnpj.replace(/[./\s-]/g, "").toUpperCase());
  }

  private async get<T>(api: "cnpj" | "cep", path: string): Promise<T | null> {
    const key = api === "cnpj" ? this.opts.cnpjKey : this.opts.cepKey;
    if (!key) {
      throw new ApizenError(401, `Apizen: set ${api === "cnpj" ? "cnpjKey" : "cepKey"}`);
    }
    const base =
      (api === "cnpj" ? this.opts.baseUrls?.cnpj : this.opts.baseUrls?.cep) ??
      (api === "cnpj" ? "https://cnpj.apizen.com.br" : "https://ceps.apizen.com.br");
    const res = await (this.opts.fetch ?? fetch)(`${base}${path}`, {
      headers: { Authorization: `Bearer ${key}`, Accept: "application/json" },
      signal: AbortSignal.timeout(this.opts.timeout ?? 15_000),
    });
    if (res.status === 404) return null;
    const body = (await res.json().catch(() => null)) as { error?: string } | null;
    if (!res.ok) throw new ApizenError(res.status, body?.error ?? `HTTP ${res.status}`);
    return body as T;
  }
}
