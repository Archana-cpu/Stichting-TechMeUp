import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { LoginForm } from '@/components/login-form';

// Mock next-auth/react
const mockSignIn = vi.fn();
vi.mock('next-auth/react', () => ({
  signIn: (provider: string, options: { callbackUrl: string }) => mockSignIn(provider, options),
}));

// Mock next-intl
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string, params?: { provider?: string }) => {
    if (key === 'auth.continueWith' && params?.provider) {
      return `Continue with ${params.provider}`;
    }
    return key;
  },
  useLocale: () => 'en',
}));

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => <div {...props}>{children}</div>,
    p: ({ children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => <p {...props}>{children}</p>,
  },
}));

describe('LoginForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('Sequences başlığını render etmeli', () => {
    render(<LoginForm />);
    
    expect(screen.getByText('Sequences')).toBeInTheDocument();
  });

  it('Google button render etmeli', () => {
    render(<LoginForm />);
    
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('Continue with Google');
  });

  it('Google button tıklandığında signIn çağrılmalı', () => {
    render(<LoginForm />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    expect(mockSignIn).toHaveBeenCalledWith('google', {
      callbackUrl: '/en/storyboard',
    });
  });

  it('button doğru className ile render etmeli', () => {
    render(<LoginForm />);
    
    const button = screen.getByRole('button');
    expect(button).toHaveClass('w-full', 'h-12', 'rounded-xl');
  });

  it('motion.div animasyon propsları ile render etmeli', () => {
    render(<LoginForm />);
    
    // Component renders successfully with animation props
    expect(screen.getByText('Sequences')).toBeInTheDocument();
  });

  it('Logo icon render etmeli', () => {
    render(<LoginForm />);
    
    expect(screen.getByText('✦')).toBeInTheDocument();
  });
});
