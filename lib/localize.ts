import { Property } from '../types';
import { translations } from '../translations';

export const localizeProperty = (property: Property, locale: keyof typeof translations): Property => {
    if (!property) return property;

    const translatedProperty = { ...property };

    if (property.translations && locale !== 'pt-BR') {
        const translationData = property.translations[locale];
        if (translationData) {
            translatedProperty.title = translationData.title || property.title;
            translatedProperty.description = translationData.description || property.description;
        }
    }
    
    return translatedProperty;
};
