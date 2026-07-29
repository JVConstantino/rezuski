import {
  HomeIcon,
  BuildingIcon,
  MapPinIcon,
  FolderIcon,
  ShieldIcon,
  HandshakeIcon
} from '../components/Icons';

// Mapeamento de palavras-chave para ícones
const CATEGORY_ICON_MAPPING = {
  // Casa/Residencial
  casa: HomeIcon,
  residencial: HomeIcon,
  moradia: HomeIcon,
  lar: HomeIcon,
  
  // Apartamento/Prédio
  apartamento: BuildingIcon,
  predio: BuildingIcon,
  edificio: BuildingIcon,
  condominio: BuildingIcon,
  sobrado: BuildingIcon,
  
  // Comercial/Negócios
  comercial: HandshakeIcon,
  loja: HandshakeIcon,
  escritorio: HandshakeIcon,
  sala: HandshakeIcon,
  negocio: HandshakeIcon,
  
  // Terreno/Área
  terreno: MapPinIcon,
  lote: MapPinIcon,
  area: MapPinIcon,
  sitio: MapPinIcon,
  chacara: MapPinIcon,
  fazenda: MapPinIcon,
  rural: MapPinIcon,
  
  // Outros
  galpao: FolderIcon,
  deposito: FolderIcon,
  armazem: FolderIcon,
  industrial: FolderIcon,
  
  // Segurança/Premium
  premium: ShieldIcon,
  luxo: ShieldIcon,
  vip: ShieldIcon
};

/**
 * Mapeia automaticamente um ícone baseado no nome da categoria
 * @param categoryName Nome da categoria
 * @returns Componente do ícone correspondente ou BuildingIcon como fallback
 */
export const getCategoryIcon = (categoryName: string) => {
  if (!categoryName) return BuildingIcon;
  
  const normalizedName = categoryName.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .trim();
  
  // Procura por palavras-chave no nome da categoria
  for (const [keyword, IconComponent] of Object.entries(CATEGORY_ICON_MAPPING)) {
    if (normalizedName.includes(keyword)) {
      return IconComponent;
    }
  }
  
  // Fallback padrão
  return BuildingIcon;
};

/**
 * Mapeia automaticamente um ícone baseado no tipo de propriedade
 * @param propertyType Tipo da propriedade
 * @returns Componente do ícone correspondente
 */
export const getPropertyTypeIcon = (propertyType: string) => {
  const typeMapping: { [key: string]: any } = {
    'Casa': HomeIcon,
    'Apartamento': BuildingIcon,
    'Condomínio': BuildingIcon,
    'Comercial': HandshakeIcon,
    'Terreno': MapPinIcon,
    'Sobrado': BuildingIcon
  };
  
  return typeMapping[propertyType] || BuildingIcon;
};