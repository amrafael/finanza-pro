
import { categoryService } from './categoryService';
import { accountService } from './accountService';
import { INITIAL_CATEGORIES, INITIAL_BANK_ACCOUNTS } from '../../constants';

export const seedService = {
    async seedInitialData(userId: string) {
        try {
            // Seed Categories
            const categoriesPromises = INITIAL_CATEGORIES.map(cat => {
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const { id, ...rest } = cat;
                return categoryService.create({ ...rest, is_default: true } as any, userId);
            });

            // Seed Bank Accounts
            const accountsPromises = INITIAL_BANK_ACCOUNTS.map(acc => {
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const { id, ...rest } = acc;
                return accountService.createAccount(rest, userId);
            });

            await Promise.all([...categoriesPromises, ...accountsPromises]);
            return true;
        } catch (error) {
            console.error('Error seeding data:', error);
            return false;
        }
    }
};
