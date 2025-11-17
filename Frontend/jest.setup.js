// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

const mockPush = jest.fn();

jest.mock('next/navigation', () => {
  const actual = jest.requireActual('next/navigation');
  return {
    ...actual,
    useRouter: () => ({
      push: mockPush,
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
    }),
    useSearchParams: () => ({
      get: () => null,
    }),
  };
});

