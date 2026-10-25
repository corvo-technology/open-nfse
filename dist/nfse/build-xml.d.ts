import type { DPS } from './domain.js';
import { type DpsLayout } from './layout.js';
export interface BuildDpsXmlOptions {
    /** Emit the `<?xml ... ?>` declaration. Default `true`. */
    readonly includeXmlDeclaration?: boolean;
    /** Leiaute do XML. Default `'v1.01'` (produção até 30/11/2026). Ver {@link DpsLayout}. */
    readonly layout?: DpsLayout;
}
/**
 * Serializes a typed `DPS` DTO to canonical XML. Inverse of `parseNfseXml`'s
 * DPS branch. Element order and namespace declarations follow RTC v1.01.
 */
export declare function buildDpsXml(dps: DPS, options?: BuildDpsXmlOptions): string;
//# sourceMappingURL=build-xml.d.ts.map