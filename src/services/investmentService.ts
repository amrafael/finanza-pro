
import { supabase } from '../lib/supabase';
import { Investment } from '../../types';

export const investmentService = {
    async fetchAll() {
        const { data, error } = await supabase
            .from('investments')
            .select('*')
            .order('value', { ascending: false });

        if (error) throw error;

        // Map snake_case from DB to camelCase for UI
        return (data || []).map(inv => ({
            id: inv.id,
            name: inv.name,
            type: inv.type,
            value: inv.value,
            initialValue: inv.initial_value,
            startDate: inv.start_date,
            profitabilityType: inv.profitability_type,
            profitabilityRate: inv.profitability_rate,
            daysType: inv.days_type,
            yieldOnWeekends: inv.yield_on_weekends,
            change: inv.change_percent
        })) as Investment[];
    },

    async create(investment: Omit<Investment, 'id'>, userId: string) {
        const { data, error } = await supabase
            .from('investments')
            .insert([{
                name: investment.name,
                type: investment.type,
                value: investment.value,
                initial_value: investment.initialValue,
                start_date: investment.startDate,
                profitability_type: investment.profitabilityType,
                profitability_rate: investment.profitabilityRate,
                days_type: investment.daysType,
                yield_on_weekends: investment.yieldOnWeekends,
                change_percent: investment.change,
                user_id: userId
            }])
            .select()
            .single();

        if (error) throw error;

        return {
            id: data.id,
            name: data.name,
            type: data.type,
            value: data.value,
            initialValue: data.initial_value,
            startDate: data.start_date,
            profitabilityType: data.profitability_type,
            profitabilityRate: data.profitability_rate,
            daysType: data.days_type,
            yieldOnWeekends: data.yield_on_weekends,
            change: data.change_percent
        } as Investment;
    },

    async update(investment: Investment) {
        const { data, error } = await supabase
            .from('investments')
            .update({
                name: investment.name,
                type: investment.type,
                value: investment.value,
                initial_value: investment.initialValue,
                start_date: investment.startDate,
                profitability_type: investment.profitabilityType,
                profitability_rate: investment.profitabilityRate,
                days_type: investment.daysType,
                yield_on_weekends: investment.yieldOnWeekends,
                change_percent: investment.change
            })
            .eq('id', investment.id)
            .select()
            .single();

        if (error) throw error;

        return {
            id: data.id,
            name: data.name,
            type: data.type,
            value: data.value,
            initialValue: data.initial_value,
            startDate: data.start_date,
            profitabilityType: data.profitability_type,
            profitabilityRate: data.profitability_rate,
            daysType: data.days_type,
            yieldOnWeekends: data.yield_on_weekends,
            change: data.change_percent
        } as Investment;
    },

    async delete(id: string) {
        const { error } = await supabase
            .from('investments')
            .delete()
            .eq('id', id);

        if (error) throw error;
    }
};
