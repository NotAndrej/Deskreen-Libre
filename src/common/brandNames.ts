/** Display-name spoofer: the product name shown across the host UI, the
 * window title, and the viewer. Purely cosmetic. */
export const BRAND_DEFAULT = 'Deskreen Libre';

export const BRAND_OPTIONS = [
	'Deskreen Libre',
	'Deskreen',
	'Deskreen Pro',
	'Deskreen Teams',
] as const;

export type BrandName = (typeof BRAND_OPTIONS)[number];

export function normalizeBrandName(value: unknown): BrandName {
	return (BRAND_OPTIONS as readonly string[]).includes(String(value))
		? (String(value) as BrandName)
		: BRAND_DEFAULT;
}
