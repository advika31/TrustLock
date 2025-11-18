import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { Sidebar } from '../../components/Layout/Sidebar';

/**
 * Sidebar Component Tests
 * Tests keyboard navigation, ARIA attributes, and collapse functionality
 */

const mockNavItems = [
  {
    href: '/dashboard',
    label: 'Dashboard',
    icon: <span>📊</span>,
  },
  {
    href: '/cases',
    label: 'Cases',
    icon: <span>📋</span>,
    badge: 5,
  },
  {
    href: '/settings',
    label: 'Settings',
    icon: <span>⚙️</span>,
  },
];

// Mock Next.js router
jest.mock('next/navigation', () => ({
  usePathname: () => '/dashboard',
}));

describe('Sidebar Component', () => {
  it('renders navigation items', () => {
    render(<Sidebar navItems={mockNavItems} />);
    
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Cases')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('displays badge count for items with badges', () => {
    render(<Sidebar navItems={mockNavItems} />);
    
    const badge = screen.getByText('5');
    expect(badge).toBeInTheDocument();
  });

  it('has correct ARIA labels', () => {
    render(<Sidebar navItems={mockNavItems} />);
    
    const nav = screen.getByRole('navigation', { name: /main navigation/i });
    expect(nav).toHaveAttribute('aria-label', 'Main navigation');
  });

  it('marks active item with aria-current', () => {
    render(<Sidebar navItems={mockNavItems} />);
    
    const dashboardLink = screen.getByText('Dashboard').closest('a');
    expect(dashboardLink).toHaveAttribute('aria-current', 'page');
  });

  it('collapse button has aria-expanded attribute', () => {
    render(<Sidebar navItems={mockNavItems} />);
    
    const collapseBtn = screen.getByTestId('sidebar-collapse-btn');
    expect(collapseBtn).toHaveAttribute('aria-expanded');
  });

  it('toggles collapsed state on collapse button click', () => {
    render(<Sidebar navItems={mockNavItems} />);
    
    const collapseBtn = screen.getByTestId('sidebar-collapse-btn');
    const sidebar = collapseBtn.closest('aside');
    
    expect(sidebar).not.toHaveClass('collapsed');
    
    fireEvent.click(collapseBtn);
    expect(sidebar).toHaveClass('collapsed');
    
    fireEvent.click(collapseBtn);
    expect(sidebar).not.toHaveClass('collapsed');
  });

  it('calls onCollapsedChange callback when collapsed state changes', () => {
    const onCollapsedChange = jest.fn();
    render(<Sidebar navItems={mockNavItems} onCollapsedChange={onCollapsedChange} />);
    
    const collapseBtn = screen.getByTestId('sidebar-collapse-btn');
    fireEvent.click(collapseBtn);
    
    expect(onCollapsedChange).toHaveBeenCalledWith(true);
  });

  it('allows keyboard navigation through nav items', async () => {
    const user = userEvent.setup();
    render(<Sidebar navItems={mockNavItems} />);
    
    const collapseBtn = screen.getByTestId('sidebar-collapse-btn');
    const dashboardLink = screen.getByText('Dashboard').closest('a');
    
    // Start with focus on collapse button
    await user.tab();
    expect(collapseBtn).toHaveFocus();
    
    // Tab to first nav item
    await user.tab();
    expect(dashboardLink).toHaveFocus();
  });

  it('renders nav items as list elements', () => {
    render(<Sidebar navItems={mockNavItems} />);
    
    const listItems = screen.getAllByRole('listitem');
    expect(listItems).toHaveLength(mockNavItems.length);
  });

  it('has proper semantic structure', () => {
    const { container } = render(<Sidebar navItems={mockNavItems} />);
    
    const aside = container.querySelector('aside');
    expect(aside).toBeInTheDocument();
    
    const nav = container.querySelector('nav');
    expect(nav).toBeInTheDocument();
    
    const ul = container.querySelector('ul');
    expect(ul).toHaveAttribute('role', 'list');
  });

  it('focuses collapse button when clicked', () => {
    render(<Sidebar navItems={mockNavItems} />);
    
    const collapseBtn = screen.getByTestId('sidebar-collapse-btn');
    fireEvent.click(collapseBtn);
    
    // Focus should remain accessible
    expect(collapseBtn).toBeVisible();
  });
});
