
import { supabase } from '../lib/supabase';
import { Investment } from '../../types';

export const investmentService = {
    async fetchAll() {
        const { data, error } = await supabase
            .from('investments')
            .select('*')
            .order('value', { ascending: false });

        if (error) throw error;
        return data as Investment[];
    },

    async create(investment: Omit<Investment, 'id'>) {
        const { data, error } = await supabase
            .from('investments')
            .insert([investment])
            .select()
            .single();

        if (error) throw error;
        return data as Investment;
    },

    async update(investment: Investment) {
        const { data, error } = await supabase
            .from('investments')
            .update(investment)
            .eq('id', investment.id)
            .select()
            .single();

        if (error) throw error;
        return data as Investment;
    },

    async delete(id: string) {
        const { error } = await supabase
            .from('investments')
            .delete()
            .eq('id', id);

        if (error) throw error;
    }
};
