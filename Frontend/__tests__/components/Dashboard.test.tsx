import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DashboardPage from '@/app/dashboard/page';
import * as api from '@/lib/api';

jest.mock('@/lib/api');

describe('Dashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders compliance list', async () => {
    const mockListApplications = api.listApplications as jest.Mock;
    mockListApplications.mockResolvedValueOnce([
      {
        application_id: 'app_001',
        applicant_name: 'John Doe',
        status: 'flagged',
        risk_score: 0.65,
        last_event_timestamp: new Date().toISOString(),
        created_at: new Date().toISOString(),
      },
    ]);

    render(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText(/john doe/i)).toBeInTheDocument();
    });
  });

  it('opens modal when application clicked', async () => {
    const user = userEvent.setup();
    const mockListApplications = api.listApplications as jest.Mock;
    const mockGetApplication = api.getApplication as jest.Mock;

    mockListApplications.mockResolvedValueOnce([
      {
        application_id: 'app_001',
        applicant_name: 'John Doe',
        status: 'flagged',
        risk_score: 0.65,
        last_event_timestamp: new Date().toISOString(),
        created_at: new Date().toISOString(),
      },
    ]);

    mockGetApplication.mockResolvedValueOnce({
      application_id: 'app_001',
      status: 'flagged',
      documents: [],
      audit_log: [],
    });

    render(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText(/john doe/i)).toBeInTheDocument();
    });

    const item = screen.getByText(/john doe/i).closest('[role="button"]');
    if (item) {
      await user.click(item);
    }

    await waitFor(() => {
      expect(mockGetApplication).toHaveBeenCalledWith('app_001');
    });
  });
});

