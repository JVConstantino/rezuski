
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
            const { data, error } = await supabase.from('categories').select('*');
            if (error) {
                console.error('Error fetching categories:', error);
                setCategories([]);
            } else {
                setCategories(data as Category[]);
            }
            setLoading(false);
        };
        fetchCategories();
    }, []);

    const addCategory = async (category: Omit<Category, 'id'>) => {
        const { data, error } = await supabase
            .from('categories')
            .insert([category])
            .select()
            .single();

        if (error) {
            console.error('Error adding category:', error);
        } else if (data) {
            setCategories(prev => [...prev, data as Category]);
        }
    };

    const updateCategory = async (updatedCategory: Category) => {
        const { id, ...updateData } = updatedCategory;
        const { error } = await supabase
            .from('categories')
            .update(updateData)
            .eq('id', id);

        if (error) {
            console.error('Error updating category:', error);
        } else {
            setCategories(prev => prev.map(c => c.id === updatedCategory.id ? updatedCategory : c));
        }
    };

    const deleteCategory = async (categoryId: string) => {
        const { error } = await supabase
            .from('categories')
            .delete()
            .eq('id', categoryId);
        
        if (error) {
            console.error('Error deleting category:', error);
        } else {
            setCategories(prev => prev.filter(c => c.id !== categoryId));
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