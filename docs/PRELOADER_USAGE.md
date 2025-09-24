# Como Usar o Preloader Global

O preloader global foi implementado para mostrar indicadores de carregamento em toda a aplicação quando operações demoram para ser concluídas.

## Configuração

O preloader global já está configurado no `App.tsx` através do `LoadingProvider` e do componente `GlobalPreloader`.

## Como Usar

### 1. Importar o Hook

```typescript
import { useLoading } from '../contexts/LoadingContext';
```

### 2. Usar o Hook no Componente

```typescript
const { showLoading, hideLoading, withLoading } = useLoading();
```

### 3. Métodos Disponíveis

#### `showLoading(message?: string)`
Mostra o preloader com uma mensagem opcional.

```typescript
showLoading('Carregando dados...');
```

#### `hideLoading()`
Esconde o preloader.

```typescript
hideLoading();
```

#### `withLoading(promise, message?)`
Envolve uma Promise com o preloader automaticamente.

```typescript
const result = await withLoading(
  fetch('/api/data').then(res => res.json()),
  'Buscando informações...'
);
```

### 4. Exemplo Prático

```typescript
const handleSubmit = async () => {
  showLoading('Salvando dados...');
  
  try {
    await saveData();
    // Sucesso
  } catch (error) {
    // Erro
  } finally {
    hideLoading();
  }
};

// Ou usando withLoading
const handleSubmit = async () => {
  try {
    await withLoading(saveData(), 'Salvando dados...');
    // Sucesso
  } catch (error) {
    // Erro
  }
};
```

## Exemplo Implementado

Veja o arquivo `pages/public/SearchResultsPage.tsx` para um exemplo de como o preloader foi implementado na aplicação de filtros de busca.

## Características

- **Global**: Aparece sobre toda a aplicação
- **Automático**: Gerencia o estado de carregamento automaticamente
- **Personalizável**: Permite mensagens customizadas
- **Responsivo**: Funciona em dispositivos móveis e desktop
- **Acessível**: Inclui indicadores visuais apropriados