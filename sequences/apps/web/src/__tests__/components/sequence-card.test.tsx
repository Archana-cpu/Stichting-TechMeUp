import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SequenceCard } from '@/components/sequence-card';

// Mock @dnd-kit/sortable
vi.mock('@dnd-kit/sortable', () => ({
  useSortable: () => ({
    attributes: {},
    listeners: {},
    setNodeRef: vi.fn(),
    transform: null,
    transition: null,
    isDragging: false,
  }),
}));

// Mock @dnd-kit/utilities
vi.mock('@dnd-kit/utilities', () => ({
  CSS: {
    Transform: {
      toString: () => '',
    },
  },
}));

// Mock next/image
vi.mock('next/image', () => ({
  default: ({ src, alt }: { src: string; alt: string }) => (
    <img src={src} alt={alt} data-testid="sequence-image" />
  ),
}));

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

// ============================================================================
// TEST DATA
// ============================================================================

const mockSequence = {
  id: 'seq1',
  userId: 'user1',
  eventDate: new Date('2024-01-15'),
  title: 'Test Sequence',
  summary: 'This is a test summary',
  image: null,
  isPublic: false,
  isCoreMemory: false,
  storyboardOrder: 1,
  positionX: null,
  positionY: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  emotionId: 1,
  emotionPolarity: 10,
  emotionIntensity: 5,
  triggerId: 1,
  thoughtContent: 'Test thought',
  thoughtPolarity: 5,
  thoughtIntensity: 5,
  behaviorContent: 'Test behavior',
  behaviorPolarity: 5,
  behaviorImpact: 5,
  memoryId: null,
  emotion: {
    id: 1,
    key: 'happy',
    icon: '😊',
    colorHsl: '45 100% 50%',
    order: 1,
    isPositive: true,
    category: 'basic',
    createdAt: new Date(),
  },
  trigger: {
    id: 1,
    key: 'work',
    icon: '💼',
    order: 1,
    category: 'professional',
    createdAt: new Date(),
  },
  people: [],
  _count: {
    reactions: 5,
    comments: 3,
  },
};

// ============================================================================
// TESTS
// ============================================================================

describe('SequenceCard', () => {
  describe('Grid View', () => {
    it('başlığı render etmeli', () => {
      render(<SequenceCard sequence={mockSequence as any} viewMode="grid" />);
      
      expect(screen.getByText('Test Sequence')).toBeInTheDocument();
    });

    it('özeti render etmeli', () => {
      render(<SequenceCard sequence={mockSequence as any} viewMode="grid" />);
      
      expect(screen.getByText('This is a test summary')).toBeInTheDocument();
    });

    it('emotion icon ve key render etmeli', () => {
      render(<SequenceCard sequence={mockSequence as any} viewMode="grid" />);
      
      expect(screen.getByText(/😊/)).toBeInTheDocument();
      expect(screen.getByText(/happy/)).toBeInTheDocument();
    });

    it('trigger icon ve key render etmeli', () => {
      render(<SequenceCard sequence={mockSequence as any} viewMode="grid" />);
      
      expect(screen.getByText(/💼/)).toBeInTheDocument();
      expect(screen.getByText(/work/)).toBeInTheDocument();
    });

    it('reaction count render etmeli', () => {
      render(<SequenceCard sequence={mockSequence as any} viewMode="grid" />);
      
      expect(screen.getByText('5')).toBeInTheDocument();
    });

    it('comment count render etmeli', () => {
      render(<SequenceCard sequence={mockSequence as any} viewMode="grid" />);
      
      expect(screen.getByText('3')).toBeInTheDocument();
    });

    it('sequence linkini render etmeli', () => {
      render(<SequenceCard sequence={mockSequence as any} viewMode="grid" />);
      
      const link = screen.getByRole('link', { name: 'Test Sequence' });
      expect(link).toHaveAttribute('href', '/sequence/seq1');
    });

    it('tarih render etmeli', () => {
      render(<SequenceCard sequence={mockSequence as any} viewMode="grid" />);
      
      // Date format depends on locale
      expect(screen.getByText(/2024/)).toBeInTheDocument();
    });

    it('image varsa render etmeli', () => {
      const sequenceWithImage = {
        ...mockSequence,
        image: 'https://example.com/image.jpg',
      };
      
      render(<SequenceCard sequence={sequenceWithImage as any} viewMode="grid" />);
      
      const image = screen.getByTestId('sequence-image');
      expect(image).toHaveAttribute('src', 'https://example.com/image.jpg');
    });
  });

  describe('List View', () => {
    it('başlığı render etmeli', () => {
      render(<SequenceCard sequence={mockSequence as any} viewMode="list" />);
      
      expect(screen.getByText('Test Sequence')).toBeInTheDocument();
    });

    it('image list view\'da thumbnail olarak render edilmeli', () => {
      const sequenceWithImage = {
        ...mockSequence,
        image: 'https://example.com/image.jpg',
      };
      
      render(<SequenceCard sequence={sequenceWithImage as any} viewMode="list" />);
      
      const image = screen.getByTestId('sequence-image');
      expect(image).toBeInTheDocument();
    });
  });

  describe('Timeline View', () => {
    it('başlığı render etmeli', () => {
      render(<SequenceCard sequence={mockSequence as any} viewMode="timeline" />);
      
      expect(screen.getByText('Test Sequence')).toBeInTheDocument();
    });

    it('tarih render etmeli', () => {
      render(<SequenceCard sequence={mockSequence as any} viewMode="timeline" />);
      
      expect(screen.getByText(/2024/)).toBeInTheDocument();
    });
  });

  describe('People', () => {
    it('people varsa count göstermeli', () => {
      const sequenceWithPeople = {
        ...mockSequence,
        people: [
          { personId: 'p1', sequenceId: 'seq1', person: { id: 'p1', name: 'John' } },
          { personId: 'p2', sequenceId: 'seq1', person: { id: 'p2', name: 'Jane' } },
        ],
      };
      
      render(<SequenceCard sequence={sequenceWithPeople as any} viewMode="grid" />);
      
      expect(screen.getByText('2')).toBeInTheDocument();
    });

    it('people yoksa users icon göstermemeli', () => {
      render(<SequenceCard sequence={mockSequence as any} viewMode="grid" />);
      
      // Users icon should not be visible when there are no people
      const usersElements = screen.queryAllByText(/people/i);
      expect(usersElements).toHaveLength(0);
    });
  });
});
