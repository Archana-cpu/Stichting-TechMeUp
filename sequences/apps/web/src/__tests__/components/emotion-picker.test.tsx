import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { EmotionPicker } from '@/components/emotions/emotion-picker';

// Mock translations
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

// ============================================================================
// TEST DATA
// ============================================================================

const mockEmotions = [
  { id: 1, key: 'happy', icon: '😊', colorHsl: '48 96% 53%' },
  { id: 2, key: 'sad', icon: '😢', colorHsl: '217 91% 60%' },
  { id: 3, key: 'anxious', icon: '😰', colorHsl: '280 87% 58%' },
  { id: 4, key: 'angry', icon: '😠', colorHsl: '0 84% 60%' },
];

// ============================================================================
// TESTS
// ============================================================================

describe('EmotionPicker', () => {
  describe('Rendering', () => {
    it('tüm duyguları render etmeli', () => {
      const onSelect = vi.fn();
      render(<EmotionPicker emotions={mockEmotions} onSelect={onSelect} />);

      mockEmotions.forEach((emotion) => {
        expect(screen.getByText(emotion.icon)).toBeInTheDocument();
        expect(screen.getByText(emotion.key)).toBeInTheDocument();
      });
    });

    it('seçili duyguyu vurgulamalı', () => {
      const onSelect = vi.fn();
      render(
        <EmotionPicker
          emotions={mockEmotions}
          selectedId={1}
          onSelect={onSelect}
        />
      );

      const selectedButton = screen.getByText('😊').closest('button');
      expect(selectedButton).toHaveClass('scale-105');
    });

    it('boş emotions dizisi ile render edebilmeli', () => {
      const onSelect = vi.fn();
      const { container } = render(
        <EmotionPicker emotions={[]} onSelect={onSelect} />
      );

      expect(container.querySelector('.grid')).toBeInTheDocument();
    });
  });

  describe('Selection', () => {
    it('emotion tıklandığında onSelect çağırmalı', () => {
      const onSelect = vi.fn();
      render(<EmotionPicker emotions={mockEmotions} onSelect={onSelect} />);

      fireEvent.click(screen.getByText('😊'));
      expect(onSelect).toHaveBeenCalledWith(1);
    });

    it('farklı emotion tıklandığında doğru id ile onSelect çağırmalı', () => {
      const onSelect = vi.fn();
      render(<EmotionPicker emotions={mockEmotions} onSelect={onSelect} />);

      fireEvent.click(screen.getByText('😢'));
      expect(onSelect).toHaveBeenCalledWith(2);
    });

    it('aynı emotion tekrar tıklandığında onSelect çağırmalı', () => {
      const onSelect = vi.fn();
      render(
        <EmotionPicker
          emotions={mockEmotions}
          selectedId={1}
          onSelect={onSelect}
        />
      );

      fireEvent.click(screen.getByText('😊'));
      expect(onSelect).toHaveBeenCalledWith(1);
    });
  });

  describe('Intensity Slider', () => {
    it('showIntensitySlider=true ve seçili emotion varsa slider göstermeli', () => {
      const onSelect = vi.fn();
      const onIntensityChange = vi.fn();
      render(
        <EmotionPicker
          emotions={mockEmotions}
          selectedId={1}
          onSelect={onSelect}
          showIntensitySlider
          onIntensityChange={onIntensityChange}
        />
      );

      expect(screen.getByText('intensity')).toBeInTheDocument();
    });

    it('showIntensitySlider=false ise slider göstermemeli', () => {
      const onSelect = vi.fn();
      render(
        <EmotionPicker
          emotions={mockEmotions}
          selectedId={1}
          onSelect={onSelect}
          showIntensitySlider={false}
        />
      );

      expect(screen.queryByText('intensity')).not.toBeInTheDocument();
    });

    it('seçili emotion yoksa slider göstermemeli', () => {
      const onSelect = vi.fn();
      render(
        <EmotionPicker
          emotions={mockEmotions}
          onSelect={onSelect}
          showIntensitySlider
        />
      );

      expect(screen.queryByText('intensity')).not.toBeInTheDocument();
    });

    it('varsayılan intensity değeri 5 olmalı', () => {
      const onSelect = vi.fn();
      render(
        <EmotionPicker
          emotions={mockEmotions}
          selectedId={1}
          onSelect={onSelect}
          showIntensitySlider
        />
      );

      expect(screen.getByText('5/10')).toBeInTheDocument();
    });

    it('custom intensity değeri göstermeli', () => {
      const onSelect = vi.fn();
      render(
        <EmotionPicker
          emotions={mockEmotions}
          selectedId={1}
          onSelect={onSelect}
          showIntensitySlider
          intensity={8}
        />
      );

      expect(screen.getByText('8/10')).toBeInTheDocument();
    });
  });

  describe('Polarity Slider', () => {
    it('onPolarityChange varsa polarity slider göstermeli', () => {
      const onSelect = vi.fn();
      const onPolarityChange = vi.fn();
      render(
        <EmotionPicker
          emotions={mockEmotions}
          selectedId={1}
          onSelect={onSelect}
          showIntensitySlider
          onPolarityChange={onPolarityChange}
        />
      );

      expect(screen.getByText('polarity')).toBeInTheDocument();
    });

    it('pozitif polarity değeri + ile göstermeli', () => {
      const onSelect = vi.fn();
      const onPolarityChange = vi.fn();
      render(
        <EmotionPicker
          emotions={mockEmotions}
          selectedId={1}
          onSelect={onSelect}
          showIntensitySlider
          polarity={3}
          onPolarityChange={onPolarityChange}
        />
      );

      expect(screen.getByText('+3')).toBeInTheDocument();
    });

    it('negatif polarity değeri göstermeli', () => {
      const onSelect = vi.fn();
      const onPolarityChange = vi.fn();
      render(
        <EmotionPicker
          emotions={mockEmotions}
          selectedId={1}
          onSelect={onSelect}
          showIntensitySlider
          polarity={-2}
          onPolarityChange={onPolarityChange}
        />
      );

      expect(screen.getByText('-2')).toBeInTheDocument();
    });

    it('nötr polarity değeri 0 göstermeli', () => {
      const onSelect = vi.fn();
      const onPolarityChange = vi.fn();
      render(
        <EmotionPicker
          emotions={mockEmotions}
          selectedId={1}
          onSelect={onSelect}
          showIntensitySlider
          polarity={0}
          onPolarityChange={onPolarityChange}
        />
      );

      expect(screen.getByText('0')).toBeInTheDocument();
    });
  });

  describe('className', () => {
    it('custom className uygulanmalı', () => {
      const onSelect = vi.fn();
      const { container } = render(
        <EmotionPicker
          emotions={mockEmotions}
          onSelect={onSelect}
          className="custom-class"
        />
      );

      expect(container.firstChild).toHaveClass('custom-class');
    });
  });
});
