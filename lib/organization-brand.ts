export const CORE_ORGANIZATIONS = [
  "Fundação Lemann",
  "Centro Lemann",
  "Motriz",
  "MegaEdu",
  "Nova Escola",
  "Reúna",
  "Bem Comum",
  "Trajetórias",
] as const;

export type CoreOrganization = (typeof CORE_ORGANIZATIONS)[number];

export const ORGANIZATION_BRANDS: Record<CoreOrganization, { color: string; foreground: string }> = {
  "Fundação Lemann": { color: "#00B97E", foreground: "#052B47" },
  "Centro Lemann": { color: "#FA4400", foreground: "#001018" },
  Motriz: { color: "#004E41", foreground: "#FFFFFF" },
  MegaEdu: { color: "#11103A", foreground: "#FFFFFF" },
  "Nova Escola": { color: "#FA0063", foreground: "#FFFFFF" },
  Reúna: { color: "#FF6A6A", foreground: "#052B47" },
  "Bem Comum": { color: "#28659A", foreground: "#FFFFFF" },
  Trajetórias: { color: "#004CA2", foreground: "#FFFFFF" },
};

export function isCoreOrganization(value: string): value is CoreOrganization {
  return CORE_ORGANIZATIONS.includes(value as CoreOrganization);
}

export function getOrganizationBrand(value: string) {
  return isCoreOrganization(value)
    ? ORGANIZATION_BRANDS[value]
    : { color: "#00A180", foreground: "#FFFFFF" };
}
