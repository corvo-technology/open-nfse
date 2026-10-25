/**
 * Leiaute do XML da DPS.
 *
 * - `v1.01`: leiaute em produção até 30/11/2026 (NT 004 v2.0, XSD 20260727). Default.
 * - `nt009-r1`: NT 009 release 1 (XSD 20261020, Produção Restrita; Produção em 01/12/2026):
 *   `finNFSe` em `infDPS`, `CST`/`cClassTrib` direto em `IBSCBS/valores/trib`, `vDedRed` → `vAjusteBC`.
 */
export type DpsLayout = 'v1.01' | 'nt009-r1';
export declare const DEFAULT_DPS_LAYOUT: DpsLayout;
//# sourceMappingURL=layout.d.ts.map