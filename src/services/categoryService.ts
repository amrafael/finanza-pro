
import { supabase } from '../lib/supabase';
import { Category } from '../../types';

export const categoryService = {
    async fetchAll() {
        const { data, error } = await supabase
            .from('categories')
            .select('*')
            .order('name');

        if (error) throw error;
        return data as Category[];
    },

    async create(category: Omit<Category, 'id'>, userId: string) {
        const { data, error } = await supabase
            .from('categories')
            .insert([{ ...category, user_id: userId }])
            .select()
            .single();

        if (error) throw error;
        return data as Category;
    },

    async update(category: Category) {
        const { data, error } = await supabase
            .from('categories')
            .update(category)
            .eq('id', category.id)
            .select()
            .single();

        if (error) throw error;
        return data as Category;
    },

    async delete(id: string) {
        const { error } = await supabase
            .from('categories')
            .delete()
            .eq('id', id);

        if (error) throw error;
    }
};
