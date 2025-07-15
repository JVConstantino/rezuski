
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { Category } from '../types';
import { supabase } from '../lib/supabaseClient';

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
        const fetchCategories = async () => {
            setLoading(true);
            try {
                const { data, error } = await supabase
                    .from('categories')
                    .select('*')
                    .order('name');

                if (error) {
                    console.error('Error fetching categories:', error);
                    setCategories([]);
                } else {
                    setCategories(data || []);
                }
            } catch (error) {
                console.error('Error fetching categories:', error);
                setCategories([]);
            } finally {
                setLoading(false);
            }
        };

        fetchCategories();
    }, []);

    const addCategory = async (category: Omit<Category, 'id'>) => {
        try {
            const { data, error } = await supabase
                .from('categories')
                .insert([category])
                .select()
                .single();

            if (error) {
                console.error('Error adding category:', error);
                throw error;
            }

            setCategories(prev => [...prev, data]);
        } catch (error) {
            console.error('Error adding category:', error);
            throw error;
        }
    };

    const updateCategory = async (updatedCategory: Category) => {
        try {
            const { error } = await supabase
                .from('categories')
                .update(updatedCategory)
                .eq('id', updatedCategory.id);

            if (error) {
                console.error('Error updating category:', error);
                throw error;
            }

            setCategories(prev => prev.map(c => c.id === updatedCategory.id ? updatedCategory : c));
        } catch (error) {
            console.error('Error updating category:', error);
            throw error;
        }
    };

    const deleteCategory = async (categoryId: string) => {
        try {
            const { error } = await supabase
                .from('categories')
                .delete()
                .eq('id', categoryId);

            if (error) {
                console.error('Error deleting category:', error);
                throw error;
            }

            setCategories(prev => prev.filter(c => c.id !== categoryId));
        } catch (error) {
            console.error('Error deleting category:', error);
            throw error;
        }
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