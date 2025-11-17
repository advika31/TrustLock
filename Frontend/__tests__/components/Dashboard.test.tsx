import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DashboardPage from '@/app/dashboard/page';
import * as api from '@/services/api';

jest.mock('@/services/api');
jest.mock('@/components/Toast/ToastProvider', () => ({
  useToast: () => ({ pushToast: jest.fn() }),
}));

describe('Dashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders flagged queue after login', async () => {
    const user = userEvent.setup();
    const mockGetReviewQueue = api.getReviewQueue as jest.Mock;
    mockGetReviewQueue.mockResolvedValueOnce({
      applications: [
        {
          application_id: 'app_001',
          name: 'John Doe',
          status: 'flagged',
          risk_score: 0.65,
          drpa_level: 'high',
          created_at: new Date().toISOString(),
        },
      ],
    });

    render(<DashboardPage />);

    await user.click(screen.getByRole('button', { name: /enter demo mode/i }));

    await waitFor(() => {
      expect(screen.getByText(/john doe/i)).toBeInTheDocument();
    });
  });

  it('performs bulk action on selected cases', async () => {
    const user = userEvent.setup();
    const mockGetReviewQueue = api.getReviewQueue as jest.Mock;
    const mockActionCase = api.actionCase as jest.Mock;

    mockGetReviewQueue.mockResolvedValue({
      applications: [
        {
          application_id: 'app_001',
          name: 'John Doe',
          status: 'flagged',
          risk_score: 0.65,
          drpa_level: 'high',
          created_at: new Date().toISOString(),
        },
      ],
    });
    mockActionCase.mockResolvedValue({});

    render(<DashboardPage />);

    await user.click(screen.getByRole('button', { name: /enter demo mode/i }));

    await waitFor(() => {
      expect(screen.getByText(/john doe/i)).toBeInTheDocument();
    });

    const checkbox = screen.getAllByRole('checkbox')[1];
    await user.click(checkbox);
    await user.click(screen.getByRole('button', { name: /approve/i }));

    await waitFor(() => {
      expect(mockActionCase).toHaveBeenCalledWith('app_001', 'approve');
    });
  });
});

