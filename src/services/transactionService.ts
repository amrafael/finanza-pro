
import { supabase } from '../lib/supabase';
import { Transaction } from '../../types';

export const transactionService = {
    async fetchAll() {
        const { data, error } = await supabase
            .from('transactions')
            .select('*')
            .order('date', { ascending: false });

        if (error) throw error;

        // Map snake_case from DB to camelCase for UI
        return (data || []).map(tx => ({
            id: tx.id,
            description: tx.description,
            amount: tx.amount,
            date: tx.date,
            category: tx.category_id, // Map category_id to category for current UI
            type: tx.type,
            bankAccount: tx.bank_account_id,
            paymentMethod: tx.payment_method
        })) as Transaction[];
    },

    async create(transaction: Omit<Transaction, 'id'>, userId: string) {
        const { data, error } = await supabase
            .from('transactions')
            .insert([{
                description: transaction.description,
                amount: transaction.amount,
                date: transaction.date,
                category_id: transaction.category, // Assuming 'category' in UI is ID
                type: transaction.type,
                bank_account_id: transaction.bankAccount,
                payment_method: transaction.paymentMethod,
                user_id: userId
            }])
            .select()
            .single();

        if (error) throw error;

        return {
            id: data.id,
            description: data.description,
            amount: data.amount,
            date: data.date,
            category: data.category_id,
            type: data.type,
            bankAccount: data.bank_account_id,
            paymentMethod: data.payment_method
        } as Transaction;
    },

    async update(transaction: Transaction) {
        const { data, error } = await supabase
            .from('transactions')
            .update({
                description: transaction.description,
                amount: transaction.amount,
                date: transaction.date,
                category_id: transaction.category,
                type: transaction.type,
                bank_account_id: transaction.bankAccount,
                payment_method: transaction.paymentMethod
            })
            .eq('id', transaction.id)
            .select()
            .single();

        if (error) throw error;

        return {
            id: data.id,
            description: data.description,
            amount: data.amount,
            date: data.date,
            category: data.category_id,
            type: data.type,
            bankAccount: data.bank_account_id,
            paymentMethod: data.payment_method
        } as Transaction;
    },

    async delete(id: string) {
        const { error } = await supabase
            .from('transactions')
            .delete()
            .eq('id', id);

        if (error) throw error;
    }
};
