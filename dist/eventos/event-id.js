import { ValidationError } from '../errors/validation.js';
export class InvalidEventoPedidoIdParamError extends ValidationError {
    field;
    value;
    constructor(field, value, detail) {
        super(`Parâmetro inválido para ID do pedido de evento (${field}="${value}"): ${detail}`);
        this.field = field;
        this.value = value;
    }
}
// Derivado do TSIdPedRegEvt: a chave embutida no Id precisa casar com este
// recorte (o Id composto é validado pelo XSD do pedRegEvento no envio).
const REGEX_CHAVE = /^[0-9]{8}(?:1[0-9]{14}|2[0-9A-Z]{14})[0-9]{27}$/;
const REGEX_TIPO_EVENTO = /^\d{6}$/;
export function buildEventoPedidoId(params) {
    const { chaveAcesso, tipoEvento } = params;
    if (!REGEX_CHAVE.test(chaveAcesso)) {
        throw new InvalidEventoPedidoIdParamError('chaveAcesso', chaveAcesso, 'deve conter 50 caracteres no formato da chave de acesso (posição 9 = tpInsc 1|2; inscrição federal alfanumérica apenas quando tpInsc=2).');
    }
    if (!REGEX_TIPO_EVENTO.test(tipoEvento)) {
        throw new InvalidEventoPedidoIdParamError('tipoEvento', tipoEvento, 'deve conter exatamente 6 dígitos.');
    }
    return `PRE${chaveAcesso}${tipoEvento}`;
}
//# sourceMappingURL=event-id.js.map