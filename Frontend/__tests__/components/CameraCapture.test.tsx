import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CameraCapture from '@/components/CameraCapture';

jest.mock('@/hooks/useSpeechGuidance', () => ({
  useSpeechGuidance: jest.fn(),
}));

const mockCapture = jest.fn();
const mockState = {
  hasPermission: true,
};

jest.mock('@/hooks/useCameraCapture', () => ({
  useCameraCapture: () => ({
    videoRef: { current: null },
    canvasRef: { current: null },
    capture: mockCapture,
    guidance: 'Hold steady',
    hasPermission: mockState.hasPermission,
    lightScore: 0.5,
    blurScore: 120,
    edgesDetected: true,
  }),
}));

describe('CameraCapture', () => {
  const mockOnCapture = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockState.hasPermission = true;
    mockCapture.mockResolvedValue({
      file: new File([''], 'test.jpg', { type: 'image/jpeg' }),
      base64: 'data:image/jpeg;base64,mock',
      metadata: {
        width: 640,
        height: 480,
        lightScore: 0.5,
        blurScore: 120,
        edgesDetected: true,
      },
    });
    // Stub arrayBuffer used during uploads
    File.prototype.arrayBuffer = jest.fn().mockResolvedValue(new ArrayBuffer(8));
  });

  it('renders capture and upload controls', () => {
    render(<CameraCapture documentType="selfie" onCapture={mockOnCapture} />);
    expect(screen.getByRole('button', { name: /capture/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/upload/i)).toBeInTheDocument();
  });

  it('handles file upload fallback', async () => {
    const user = userEvent.setup();
    render(<CameraCapture documentType="id_front" onCapture={mockOnCapture} />);

    const fileInput = screen.getByLabelText(/upload/i);
    await user.upload(fileInput, new File(['hello'], 'front.jpg', { type: 'image/jpeg' }));

    await waitFor(() => {
      expect(mockOnCapture).toHaveBeenCalled();
    });
  });

  it('shows permission warning when camera is blocked', () => {
    mockState.hasPermission = false;
    render(<CameraCapture documentType="selfie" onCapture={mockOnCapture} />);
    expect(screen.getByText(/permission denied/i)).toBeInTheDocument();
  });
});

