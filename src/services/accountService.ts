
import { supabase } from '../lib/supabase';
import { BankAccount, CreditCard } from '../../types';

export const accountService = {
    // Bank Accounts
    async fetchAccounts() {
        const { data, error } = await supabase
            .from('bank_accounts')
            .select('*')
            .order('name');

        if (error) throw error;
        return data as BankAccount[];
    },

    async createAccount(account: Omit<BankAccount, 'id'>, userId: string) {
        const { data, error } = await supabase
            .from('bank_accounts')
            .insert([{
                ...account,
                user_id: userId
            }])
            .select()
            .single();

        if (error) throw error;
        return data as BankAccount;
    },

    async updateAccount(account: BankAccount) {
        const { data, error } = await supabase
            .from('bank_accounts')
            .update(account)
            .eq('id', account.id)
            .select()
            .single();

        if (error) throw error;
        return data as BankAccount;
    },

    async deleteAccount(id: string) {
        const { error } = await supabase
            .from('bank_accounts')
            .delete()
            .eq('id', id);

        if (error) throw error;
    },

    // Credit Cards
    async fetchCards() {
        const { data, error } = await supabase
            .from('credit_cards')
            .select('*')
            .order('name');

        if (error) throw error;
        // Map snake_case from DB to camelCase for UI
        return (data || []).map(card => ({
            id: card.id,
            name: card.name,
            lastFour: card.last_four,
            limit: card.limit_amount,
            used: card.used_amount,
            dueDate: card.due_date,
            color: card.color,
            bankAccountId: card.bank_account_id
        })) as CreditCard[];
    },

    async createCard(card: Omit<CreditCard, 'id'>, userId: string) {
        const { data, error } = await supabase
            .from('credit_cards')
            .insert([{
                name: card.name,
                last_four: card.lastFour,
                limit_amount: card.limit,
                used_amount: card.used,
                due_date: card.dueDate,
                color: card.color,
                bank_account_id: card.bankAccountId,
                user_id: userId
            }])
            .select()
            .single();

        if (error) throw error;

        // Map back to camelCase
        return {
            id: data.id,
            name: data.name,
            lastFour: data.last_four,
            limit: data.limit_amount,
            used: data.used_amount,
            dueDate: data.due_date,
            color: data.color,
            bankAccountId: data.bank_account_id
        } as CreditCard;
    },

    async updateCard(card: CreditCard) {
        const { data, error } = await supabase
            .from('credit_cards')
            .update({
                name: card.name,
                last_four: card.lastFour,
                limit_amount: card.limit,
                used_amount: card.used,
                due_date: card.dueDate,
                color: card.color,
                bank_account_id: card.bankAccountId
            })
            .eq('id', card.id)
            .select()
            .single();

        if (error) throw error;

        return {
            id: data.id,
            name: data.name,
            lastFour: data.last_four,
            limit: data.limit_amount,
            used: data.used_amount,
            dueDate: data.due_date,
            color: data.color,
            bankAccountId: data.bank_account_id
        } as CreditCard;
    },

    async deleteCard(id: string) {
        const { error } = await supabase
            .from('credit_cards')
            .delete()
            .eq('id', id);

        if (error) throw error;
    }
};
