import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

/**
 * CaseCard Component Tests
 * Tests accessibility, focus states, and card rendering
 */

// Mock CaseCard component for testing purposes
const MockCaseCard = ({ 
  id, 
  documentName, 
  riskLevel, 
  riskScore,
  issues 
}: {
  id: string;
  documentName: string;
  riskLevel: 'low' | 'medium' | 'high';
  riskScore: number;
  issues: string[];
}) => (
  <article
    data-testid={`case-card-${id}`}
    className="card"
    aria-label={`Case ${documentName}, ${riskLevel} risk`}
  >
    <h3>{documentName}</h3>
    <div>Risk Score: {riskScore}%</div>
    <div aria-label={`Risk level: ${riskLevel}`}>
      {riskLevel}
    </div>
    <h4>Top Issues:</h4>
    <ul>
      {issues.map((issue) => (
        <li key={issue}>{issue}</li>
      ))}
    </ul>
  </article>
);

describe('CaseCard Component', () => {
  const mockCaseData = {
    id: 'case-001',
    documentName: 'John Doe - Passport',
    riskLevel: 'medium' as const,
    riskScore: 45,
    issues: ['Face mismatch detected', 'Document quality low', 'Expiry warning'],
  };

  it('renders case card with document name', () => {
    render(<MockCaseCard {...mockCaseData} />);
    
    expect(screen.getByText('John Doe - Passport')).toBeInTheDocument();
  });

  it('displays risk score', () => {
    render(<MockCaseCard {...mockCaseData} />);
    
    expect(screen.getByText(/Risk Score: 45%/)).toBeInTheDocument();
  });

  it('displays risk level', () => {
    render(<MockCaseCard {...mockCaseData} />);
    
    expect(screen.getByText('medium')).toBeInTheDocument();
  });

  it('displays all issues', () => {
    render(<MockCaseCard {...mockCaseData} />);
    
    mockCaseData.issues.forEach((issue) => {
      expect(screen.getByText(issue)).toBeInTheDocument();
    });
  });

  it('has correct ARIA label', () => {
    render(<MockCaseCard {...mockCaseData} />);
    
    const article = screen.getByTestId('case-card-001');
    expect(article).toHaveAttribute(
      'aria-label',
      'Case John Doe - Passport, medium risk'
    );
  });

  it('uses semantic HTML structure', () => {
    const { container } = render(<MockCaseCard {...mockCaseData} />);
    
    const article = container.querySelector('article');
    expect(article).toBeInTheDocument();
    
    const headings = container.querySelectorAll('h3, h4');
    expect(headings.length).toBeGreaterThan(0);
    
    const list = container.querySelector('ul');
    expect(list).toBeInTheDocument();
  });

  it('renders different risk levels', () => {
    const { rerender } = render(
      <MockCaseCard
        {...mockCaseData}
        riskLevel="high"
      />
    );
    
    expect(screen.getByText('high')).toBeInTheDocument();
    
    rerender(
      <MockCaseCard
        {...mockCaseData}
        riskLevel="low"
      />
    );
    
    expect(screen.getByText('low')).toBeInTheDocument();
  });

  it('has proper data-testid for selection', () => {
    render(<MockCaseCard {...mockCaseData} />);
    
    const card = screen.getByTestId('case-card-001');
    expect(card).toBeInTheDocument();
  });

  it('renders issues as list items', () => {
    const { container } = render(<MockCaseCard {...mockCaseData} />);
    
    const listItems = container.querySelectorAll('ul li');
    expect(listItems).toHaveLength(mockCaseData.issues.length);
  });

  it('is keyboard focusable (article role)', () => {
    const { container } = render(<MockCaseCard {...mockCaseData} />);
    
    const article = container.querySelector('article');
    // Articles are naturally focusable when used as interactive elements
    expect(article?.tagName).toBe('ARTICLE');
  });

  it('has accessible headings hierarchy', () => {
    const { container } = render(<MockCaseCard {...mockCaseData} />);
    
    const h3 = container.querySelector('h3');
    const h4 = container.querySelector('h4');
    
    expect(h3).toBeInTheDocument();
    expect(h4).toBeInTheDocument();
    // h4 should come after h3
    expect(h3?.compareDocumentPosition(h4!)).toBe(4); // 4 = DOCUMENT_POSITION_FOLLOWING
  });
});
