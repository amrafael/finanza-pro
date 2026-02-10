
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

    async createAccount(account: Omit<BankAccount, 'id'>) {
        const { data, error } = await supabase
            .from('bank_accounts')
            .insert([account])
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
        return data as CreditCard[];
    },

    async createCard(card: Omit<CreditCard, 'id'>) {
        const { data, error } = await supabase
            .from('credit_cards')
            .insert([card])
            .select()
            .single();

        if (error) throw error;
        return data as CreditCard;
    },

    async updateCard(card: CreditCard) {
        const { data, error } = await supabase
            .from('credit_cards')
            .update(card)
            .eq('id', card.id)
            .select()
            .single();

        if (error) throw error;
        return data as CreditCard;
    },

    async deleteCard(id: string) {
        const { error } = await supabase
            .from('credit_cards')
            .delete()
            .eq('id', id);

        if (error) throw error;
    }
};
