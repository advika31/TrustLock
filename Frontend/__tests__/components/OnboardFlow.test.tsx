import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import OnboardPage from '@/app/onboard/page';
import * as api from '@/lib/api';

// Mock heavy child components
jest.mock('@/components/CameraCapture', () => () => <div data-testid="camera-capture" />);

// Mock the API
jest.mock('@/lib/api');

describe('Onboard Flow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders method selection step', () => {
    render(<OnboardPage />);
    expect(screen.getByText(/choose verification method/i)).toBeInTheDocument();
    expect(screen.getByText(/upload document/i)).toBeInTheDocument();
  });

  it('starts KYC application when method selected', async () => {
    const user = userEvent.setup();
    const mockStartKyc = api.startKyc as jest.Mock;
    mockStartKyc.mockResolvedValueOnce({
      application_id: 'app_123',
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    render(<OnboardPage />);

    const uploadButton = screen.getByText(/upload document/i).closest('button');
    if (uploadButton) {
      await act(async () => {
        await user.click(uploadButton);
      });
    }

    await waitFor(() => {
      expect(mockStartKyc).toHaveBeenCalledWith({ method: 'upload' });
    });
  });

  it('displays OCR results after document capture', async () => {
    const mockInferDocument = api.inferDocument as jest.Mock;
    mockInferDocument.mockResolvedValueOnce({
      application_id: 'app_123',
      ocr_json: {
        name: 'John Doe',
        date_of_birth: '1990-05-15',
      },
      doc_confidence: 0.92,
      doc_hash: 'abc123',
    });

    // This test would need more setup to simulate the full flow
    // For now, it's a skeleton showing the test structure
  });
});

