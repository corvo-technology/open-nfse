import { describe, expect, it } from 'vitest';
import { buildDpsXml } from './build-xml.js';
import type { DPS, InfDPS, RtcInfoIbsCbs } from './domain.js';
import { validateDpsXml } from './validate-xml.js';

const ibscbs = (
  overrides: Partial<RtcInfoIbsCbs['valores']['trib']['gIBSCBS']> = {},
): RtcInfoIbsCbs => ({
  finNFSe: '0' as never,
  cIndOp: '040101',
  indDest: '0' as never,
  valores: { trib: { gIBSCBS: { CST: '000', cClassTrib: '000001', ...overrides } } },
});

function dps(overrides: Partial<InfDPS> = {}): DPS {
  const infDPS: InfDPS = {
    Id: 'DPS211130010057475300010000001000000000000001',
    tpAmb: '2' as InfDPS['tpAmb'],
    dhEmi: new Date('2026-12-02T14:30:00Z'),
    verAplic: 'test-1.0.0',
    serie: '1',
    nDPS: '1',
    dCompet: new Date('2026-12-02T00:00:00Z'),
    tpEmit: '1' as InfDPS['tpEmit'],
    cLocEmi: '2111300',
    prest: {
      identificador: { CNPJ: '00574753000100' },
      regTrib: { opSimpNac: '1' as never, regEspTrib: '0' as never },
    },
    serv: {
      locPrest: { cLocPrestacao: '2111300' },
      cServ: { cTribNac: '250101', cNBS: '123456789', xDescServ: 'Serviço de teste' },
    },
    valores: {
      vServPrest: { vServ: 100 },
      trib: {
        tribMun: { tribISSQN: '1' as never, tpRetISSQN: '1' as never },
        totTrib: { indTotTrib: '0' as never },
      },
    },
    IBSCBS: ibscbs(),
    ...overrides,
  };
  return { versao: '1.01', infDPS };
}

const nt009 = { layout: 'nt009-r1' } as const;

describe('layout nt009-r1 (NT 009 release 1)', () => {
  it('moves finNFSe to infDPS right after tpEmit and out of IBSCBS', () => {
    const xml = buildDpsXml(dps(), nt009);
    expect(xml).toMatch(/<tpEmit>1<\/tpEmit><finNFSe>0<\/finNFSe><cLocEmi>/);
    expect(xml).not.toMatch(/<IBSCBS><finNFSe>/);
  });

  it('puts CST and cClassTrib directly under trib, without gIBSCBS when nothing else is set', () => {
    const xml = buildDpsXml(dps(), nt009);
    expect(xml).toContain('<trib><CST>000</CST><cClassTrib>000001</cClassTrib></trib>');
    expect(xml).not.toContain('<gIBSCBS>');
  });

  it('keeps cCredPres, gTribRegular and gDif inside gIBSCBS', () => {
    const xml = buildDpsXml(dps({ IBSCBS: ibscbs({ cCredPres: '01' }) }), nt009);
    expect(xml).toContain(
      '<trib><CST>000</CST><cClassTrib>000001</cClassTrib><gIBSCBS><cCredPres>01</cCredPres></gIBSCBS></trib>',
    );
  });

  it('renames vDedRed to vAjusteBC (percentage and value)', () => {
    const base = dps().infDPS.valores;
    const withVal = dps({ valores: { ...base, vDedRed: { vDR: 10 } } });
    expect(buildDpsXml(withVal, nt009)).toContain(
      '<vAjusteBC><vAjusteBCISSQN>10</vAjusteBCISSQN></vAjusteBC>',
    );
    const withPct = dps({ valores: { ...base, vDedRed: { pDR: 5 } } });
    expect(buildDpsXml(withPct, nt009)).toContain(
      '<vAjusteBC><pAjusteBCISSQN>5</pAjusteBCISSQN></vAjusteBC>',
    );
  });

  it('refuses what the new layout cannot express yet', () => {
    const base = dps().infDPS.valores;
    const docs = dps({ valores: { ...base, vDedRed: { documentos: { docDedRed: [] } } } });
    expect(() => buildDpsXml(docs, nt009)).toThrow(/nt009-r1/);
    const ree = dps({
      IBSCBS: {
        ...ibscbs(),
        valores: { gReeRepRes: { documentos: [] }, trib: ibscbs().valores.trib },
      },
    });
    expect(() => buildDpsXml(ree, nt009)).toThrow(/nt009-r1/);
  });

  it('keeps the legacy layout by default', () => {
    const xml = buildDpsXml(dps());
    expect(xml).toMatch(/<IBSCBS><finNFSe>0<\/finNFSe>/);
    expect(xml).toContain('<trib><gIBSCBS><CST>000</CST>');
  });

  it('validates the new layout against the 20261020 XSD and rejects it against the legacy one', async () => {
    const xml = buildDpsXml(dps(), nt009);
    await expect(validateDpsXml(xml, { layout: 'nt009-r1' })).resolves.toBeUndefined();
    const legacy = await validateDpsXml(xml, { throwOnInvalid: false });
    expect(legacy.valid).toBe(false);
  });

  it('validates the legacy layout only against the legacy XSD', async () => {
    const xml = buildDpsXml(dps());
    await expect(validateDpsXml(xml)).resolves.toBeUndefined();
    const res = await validateDpsXml(xml, { layout: 'nt009-r1', throwOnInvalid: false });
    expect(res.valid).toBe(false);
  });
});
