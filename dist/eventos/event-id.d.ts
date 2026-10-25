import { ValidationError } from '../errors/validation.js';
/**
 * Per Anexo II do SEFIN_ADN v1.01-20260122: `PRE` + chave(50) + tipoEvento(6)
 * = 59 chars. Pattern TSIdPedRegEvt (bundle RTC v1.01-20260727, CNPJ
 * alfanumérico): `PRE[0-9]{8}(1[0-9]{14}|2[0-9A-Z]{14})[0-9]{33}` — na chave,
 * posições 1–8 = cMun+ambGer, 9 = tpInsc (1=CPF, 2=CNPJ), 10–23 = inscrição
 * federal (alfanumérica quando CNPJ), 24–50 numéricas.
 *
 * **Mudança breaking vs RTC v1.01 original**: o `nPedRegEvento` (3 dígitos)
 * foi removido tanto da composição do `Id` quanto do corpo de `infPedReg`.
 * Manter o formato antigo causa rejeição E1235 ("Falha no esquema XML do
 * DF-e — The Pattern constraint failed") em produção.
 */
export interface BuildEventoPedidoIdParams {
    readonly chaveAcesso: string;
    readonly tipoEvento: string;
}
export declare class InvalidEventoPedidoIdParamError extends ValidationError {
    readonly field: keyof BuildEventoPedidoIdParams;
    readonly value: string;
    constructor(field: keyof BuildEventoPedidoIdParams, value: string, detail: string);
}
export declare function buildEventoPedidoId(params: BuildEventoPedidoIdParams): string;
//# sourceMappingURL=event-id.d.ts.map