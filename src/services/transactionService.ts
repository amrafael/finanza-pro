
import { supabase } from '../lib/supabase';
import { Transaction } from '../../types';

export const transactionService = {
    async fetchAll() {
        const { data, error } = await supabase
            .from('transactions')
            .select('*')
            .order('date', { ascending: false });

        if (error) throw error;
        return data as Transaction[];
    },

    async create(transaction: Omit<Transaction, 'id'>) {
        const { data, error } = await supabase
            .from('transactions')
            .insert([transaction])
            .select()
            .single();

        if (error) throw error;
        return data as Transaction;
    },

    async update(transaction: Transaction) {
        const { data, error } = await supabase
            .from('transactions')
            .update(transaction)
            .eq('id', transaction.id)
            .select()
            .single();

        if (error) throw error;
        return data as Transaction;
    },

    async delete(id: string) {
        const { error } = await supabase
            .from('transactions')
            .delete()
            .eq('id', id);

        if (error) throw error;
    }
};
