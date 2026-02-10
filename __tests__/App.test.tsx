import { render, screen } from '@testing-library/react';
import App from '../App';
import { describe, it, expect, vi } from 'vitest';

// Mock AuthContext
vi.mock('../src/contexts/AuthContext', () => ({
    AuthProvider: ({ children }: { children: React.ReactNode }) => <div data-testid="auth-provider">{children}</div>,
    useAuth: () => ({
        user: { id: '123', email: 'test@example.com' },
        profile: {
            full_name: 'João Diniz',
            subscription_tier: 'premium',
            avatar_url: null
        },
        loading: false,
        signOut: vi.fn(),
        refreshProfile: vi.fn(),
    }),
}));

// Mock Supabase to prevent real network calls
vi.mock('../src/lib/supabase', () => ({
    supabase: {
        auth: {
            getSession: vi.fn(() => Promise.resolve({ data: { session: null }, error: null })),
            onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
        },
        from: vi.fn(() => ({
            select: vi.fn(() => ({
                eq: vi.fn(() => ({
                    single: vi.fn(() => Promise.resolve({ data: null, error: null })),
                })),
            })),
        })),
    },
}));

// Mock other services used in App.tsx
vi.mock('../src/services/transactionService', () => ({
    transactionService: { fetchAll: vi.fn(() => Promise.resolve([])) }
}));
vi.mock('../src/services/accountService', () => ({
    accountService: {
        fetchAccounts: vi.fn(() => Promise.resolve([])),
        fetchCards: vi.fn(() => Promise.resolve([]))
    }
}));
vi.mock('../src/services/categoryService', () => ({
    categoryService: { fetchAll: vi.fn(() => Promise.resolve([])) }
}));
vi.mock('../src/services/investmentService', () => ({
    investmentService: { fetchAll: vi.fn(() => Promise.resolve([])) }
}));
vi.mock('../src/services/seedService', () => ({
    seedService: { seedInitialData: vi.fn(() => Promise.resolve()) }
}));

describe('App', () => {
    it('renders sidebar and dashboard content', () => {
        render(<App />);
        // Check for Sidebar title
        expect(screen.getByText('Finanza Pro')).toBeInTheDocument();
        // Check for a characteristic Dashboard element
        expect(screen.getByText('Patrimônio Líquido')).toBeInTheDocument();
    });

    it('displays user profile name in sidebar', async () => {
        render(<App />);
        // The sidebar should show the mocked user name
        expect(screen.getByText('João Diniz')).toBeInTheDocument();
    });
});
