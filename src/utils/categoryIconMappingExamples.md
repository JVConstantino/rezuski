# Exemplos de Mapeamento Automático de Ícones por Categoria

Este sistema mapeia automaticamente ícones baseados no nome da categoria quando a imagem não carrega.

## Como Funciona

O sistema analisa o nome da categoria e procura por palavras-chave para determinar o ícone mais apropriado:

### Categorias Residenciais
- **Casa** → HomeIcon (ícone de casa)
- **Casa de Campo** → HomeIcon (ícone de casa)
- **Residencial** → HomeIcon (ícone de casa)
- **Moradia** → HomeIcon (ícone de casa)

### Categorias de Apartamentos/Prédios
- **Apartamento** → BuildingIcon (ícone de prédio)
- **Condomínio** → BuildingIcon (ícone de prédio)
- **Sobrado** → BuildingIcon (ícone de prédio)
- **Edifício** → BuildingIcon (ícone de prédio)

### Categorias Comerciais
- **Comercial** → HandshakeIcon (ícone de negócios)
- **Loja** → HandshakeIcon (ícone de negócios)
- **Escritório** → HandshakeIcon (ícone de negócios)
- **Sala Comercial** → HandshakeIcon (ícone de negócios)

### Categorias de Terrenos/Áreas
- **Terreno** → MapPinIcon (ícone de localização)
- **Sítio** → MapPinIcon (ícone de localização)
- **Chácara** → MapPinIcon (ícone de localização)
- **Fazenda** → MapPinIcon (ícone de localização)
- **Lote** → MapPinIcon (ícone de localização)
- **Área Rural** → MapPinIcon (ícone de localização)

### Categorias Industriais
- **Galpão** → FolderIcon (ícone de pasta/armazenamento)
- **Depósito** → FolderIcon (ícone de pasta/armazenamento)
- **Armazém** → FolderIcon (ícone de pasta/armazenamento)
- **Industrial** → FolderIcon (ícone de pasta/armazenamento)

### Categorias Premium
- **Premium** → ShieldIcon (ícone de escudo/proteção)
- **Luxo** → ShieldIcon (ícone de escudo/proteção)
- **VIP** → ShieldIcon (ícone de escudo/proteção)

## Fallback Padrão

Se nenhuma palavra-chave for encontrada, o sistema usa o **BuildingIcon** como padrão.

## Implementação

O sistema:
1. Normaliza o nome da categoria (remove acentos, converte para minúsculas)
2. Procura por palavras-chave no nome
3. Retorna o ícone correspondente à primeira palavra-chave encontrada
4. Usa BuildingIcon como fallback se nenhuma palavra-chave for encontrada

## Uso nos Componentes

Agora todos os componentes que usam `ImageWithFallback` podem passar o `categoryName` para obter o ícone automático:

```tsx
<ImageWithFallback 
    src={category.iconUrl} 
    alt={category.name} 
    className="w-16 h-16 object-contain rounded" 
    categoryName={category.name} // Ativa o mapeamento automático
/>
```