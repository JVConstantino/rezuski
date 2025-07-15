
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { Category } from '../types';
import { CATEGORIES } from '../constants';

interface CategoryContextType {
    categories: Category[];
    addCategory: (category: Omit<Category, 'id'>) => Promise<void>;
    updateCategory: (updatedCategory: Category) => Promise<void>;
    deleteCategory: (categoryId: string) => Promise<void>;
    loading: boolean;
}

const CategoryContext = createContext<CategoryContextType | undefined>(undefined);

export const CategoryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        setTimeout(() => {
            setCategories(CATEGORIES);
            setLoading(false);
        }, 100);
    }, []);

    const addCategory = async (category: Omit<Category, 'id'>) => {
        const newCategory = { ...category, id: `cat-${Date.now()}` };
        setCategories(prev => [...prev, newCategory]);
    };

    const updateCategory = async (updatedCategory: Category) => {
        setCategories(prev => prev.map(c => c.id === updatedCategory.id ? updatedCategory : c));
    };

    const deleteCategory = async (categoryId: string) => {
        setCategories(prev => prev.filter(c => c.id !== categoryId));
    };

    return (
        <CategoryContext.Provider value={{ categories, addCategory, updateCategory, deleteCategory, loading }}>
            {!loading && children}
        </CategoryContext.Provider>
    );
};

export const useCategories = () => {
    const context = useContext(CategoryContext);
    if (context === undefined) {
        throw new Error('useCategories must be used within a CategoryProvider');
    }
    return context;
};