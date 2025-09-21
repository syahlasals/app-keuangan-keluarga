import { render, screen } from '@testing-library/react';
import StatisticsPage from '../src/app/statistics/page';

// Mock the necessary modules
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
  }),
}));

jest.mock('@/stores/authStore', () => ({
  useAuthStore: () => ({
    user: { id: 'test-user-id', email: 'test@example.com' },
    initialized: true,
    signOut: jest.fn(),
  }),
}));

jest.mock('@/stores/transactionStore', () => ({
  useTransactionStore: () => ({
    transactions: [
      {
        id: '1',
        user_id: 'test-user-id',
        kategori_id: 'cat-1',
        nominal: 100000,
        tipe: 'pemasukan',
        tanggal: '2025-09-15',
        catatan: 'Test income',
        status: 'success',
        created_at: '2025-09-15T10:00:00Z',
        updated_at: '2025-09-15T10:00:00Z',
      },
      {
        id: '2',
        user_id: 'test-user-id',
        kategori_id: 'cat-2',
        nominal: 50000,
        tipe: 'pengeluaran',
        tanggal: '2025-09-15',
        catatan: 'Test expense',
        status: 'success',
        created_at: '2025-09-15T11:00:00Z',
        updated_at: '2025-09-15T11:00:00Z',
      },
    ],
    fetchTransactions: jest.fn(),
    getMonthlyStats: () => ({
      income: 100000,
      expense: 50000,
      balance: 50000,
    }),
    getCurrentBalance: () => 50000,
    getDailyData: () => [
      {
        date: '2025-09-15',
        pemasukan: 100000,
        pengeluaran: 50000,
      },
    ],
  }),
}));

jest.mock('@/stores/categoryStore', () => ({
  useCategoryStore: () => ({
    categories: [
      { id: 'cat-1', user_id: 'test-user-id', nama: 'Pemasukan', created_at: '', updated_at: '' },
      { id: 'cat-2', user_id: 'test-user-id', nama: 'Makanan', created_at: '', updated_at: '' },
    ],
    fetchCategories: jest.fn(),
  }),
}));

jest.mock('@/components/MonthlyChart', () => {
  return function MockMonthlyChart() {
    return <div data-testid="monthly-chart">Monthly Chart</div>;
  };
});

jest.mock('@/utils/helpers', () => ({
  formatCurrency: (amount: number) => `Rp ${amount.toLocaleString('id-ID')}`,
  formatDate: (date: string) => new Date(date).toLocaleDateString('id-ID'),
}));

describe('StatisticsPage', () => {
  it('renders without crashing', () => {
    render(<StatisticsPage />);

    // Check if the main title is rendered
    expect(screen.getByText('Statistik Keuangan')).toBeInTheDocument();

    // Check if growth comparison cards are rendered
    expect(screen.getByText('Pertumbuhan Pemasukan')).toBeInTheDocument();
    expect(screen.getByText('Pertumbuhan Pengeluaran')).toBeInTheDocument();
    expect(screen.getByText('Pertumbuhan Saldo')).toBeInTheDocument();

    // Check if chart is rendered
    expect(screen.getByTestId('monthly-chart')).toBeInTheDocument();

    // Check if category analysis section is rendered
    expect(screen.getByText('Analisis Kategori')).toBeInTheDocument();

    // Check if summary stats are rendered
    expect(screen.getByText('Ringkasan Bulan')).toBeInTheDocument();
  });

  it('displays correct financial data', () => {
    render(<StatisticsPage />);

    // Check if income is displayed correctly
    expect(screen.getByText('Rp 100.000')).toBeInTheDocument();

    // Check if expense is displayed correctly
    expect(screen.getByText('Rp 50.000')).toBeInTheDocument();

    // Check if balance is displayed correctly
    expect(screen.getByText('Rp 50.000')).toBeInTheDocument();
  });
});