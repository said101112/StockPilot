export interface ProductCategoryInfo {
  code: string;
  label: string;
  group: string;
  description: string;
  badgeClass: string;
}

export const PRODUCT_TAXONOMY_GROUPS = [
  "Production & Fabrication",
  "Maintenance & Exploitation (MRO)",
  "Logistique & Conditionnement",
  "Sécurité & Services Généraux",
] as const;

export const PRODUCT_TAXONOMY: ProductCategoryInfo[] = [
  // 1. Production & Fabrication
  {
    code: "RAW_MATERIAL",
    label: "Matière Première",
    group: "Production & Fabrication",
    description: "Métaux, polymères, granulés, intrants bruts de fabrication",
    badgeClass: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800",
  },
  {
    code: "SEMI_FINISHED",
    label: "Produit Semi-Fini",
    group: "Production & Fabrication",
    description: "Sous-ensembles, cartes usinées, pièces intermédiaires",
    badgeClass: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800",
  },
  {
    code: "FINISHED_GOOD",
    label: "Produit Fini",
    group: "Production & Fabrication",
    description: "Articles finis prêts pour expédition, vente ou livraison",
    badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800",
  },

  // 2. Maintenance & Exploitation (MRO)
  {
    code: "SPARE_PART",
    label: "Pièce de Rechange",
    group: "Maintenance & Exploitation (MRO)",
    description: "Roulements, joints, moteurs, composants de maintenance",
    badgeClass: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800",
  },
  {
    code: "EQUIPMENT",
    label: "Équipement & Outillage",
    group: "Maintenance & Exploitation (MRO)",
    description: "Machines-outils, outillage professionnel, appareils de mesure",
    badgeClass: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800",
  },
  {
    code: "CHEMICALS",
    label: "Chimie & Lubrifiants",
    group: "Maintenance & Exploitation (MRO)",
    description: "Huiles techniques, solvants, dégraissants, graisses industrielles",
    badgeClass: "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/40 dark:text-orange-300 dark:border-orange-800",
  },

  // 3. Logistique & Conditionnement
  {
    code: "PACKAGING",
    label: "Emballage & Palettisation",
    group: "Logistique & Conditionnement",
    description: "Cartons, palettes Europe, films étirables, feuillards, calages",
    badgeClass: "bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/40 dark:text-teal-300 dark:border-teal-800",
  },
  {
    code: "CONSUMABLE",
    label: "Consommable d'Atelier",
    group: "Logistique & Conditionnement",
    description: "Étiquettes codes-barres, rouleaux adhésifs, rubans",
    badgeClass: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
  },

  // 4. Sécurité & Support
  {
    code: "SAFETY_EQUIPMENT",
    label: "EPI & Sécurité",
    group: "Sécurité & Services Généraux",
    description: "Casques, gants de protection, chaussures, masques, lunettes",
    badgeClass: "bg-green-50 text-green-700 border-green-200 dark:bg-green-950/40 dark:text-green-300 dark:border-green-800",
  },
  {
    code: "OFFICE_SUPPLY",
    label: "Bureautique & IT",
    group: "Sécurité & Services Généraux",
    description: "PC, serveurs, câblage réseau, périphériques et fournitures",
    badgeClass: "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800",
  },
  {
    code: "SERVICE",
    label: "Prestation & Service",
    group: "Sécurité & Services Généraux",
    description: "Maintenance préventive externe, étalonnage, transport",
    badgeClass: "bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200 dark:bg-fuchsia-950/40 dark:text-fuchsia-300 dark:border-fuchsia-800",
  },
];

export function getCategoryInfo(code: string | undefined | null): ProductCategoryInfo {
  if (!code) {
    return {
      code: "GENERAL",
      label: "Général",
      group: "Autres",
      description: "Catégorie standard",
      badgeClass: "bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700",
    };
  }
  const clean = code.trim().toUpperCase().replace("-", "_").replace(" ", "_");
  const match = PRODUCT_TAXONOMY.find((c) => c.code === clean);
  if (match) return match;

  return {
    code: clean,
    label: clean.replace(/_/g, " "),
    group: "Autres",
    description: "",
    badgeClass: "bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700",
  };
}
