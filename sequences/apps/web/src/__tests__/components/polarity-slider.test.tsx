import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PolaritySlider, IntensitySlider } from '@/components/polarity/polarity-slider';

// ============================================================================
// POLARITY SLIDER TESTS
// ============================================================================

describe('PolaritySlider', () => {
  describe('Rendering', () => {
    it('slider render etmeli', () => {
      const onChange = vi.fn();
      const { container } = render(<PolaritySlider value={0} onChange={onChange} />);

      expect(container.querySelector('[role="slider"]')).toBeInTheDocument();
    });

    it('label göstermeli', () => {
      const onChange = vi.fn();
      render(<PolaritySlider value={0} onChange={onChange} label="Test Label" />);

      expect(screen.getByText('Test Label')).toBeInTheDocument();
    });

    it('showValue=true ise değer göstermeli', () => {
      const onChange = vi.fn();
      render(<PolaritySlider value={3} onChange={onChange} showValue />);

      expect(screen.getByText('+3')).toBeInTheDocument();
    });

    it('showValue=false ise değer göstermemeli', () => {
      const onChange = vi.fn();
      render(<PolaritySlider value={3} onChange={onChange} showValue={false} />);

      expect(screen.queryByText('+3')).not.toBeInTheDocument();
    });

    it('Negative/Neutral/Positive etiketleri göstermeli', () => {
      const onChange = vi.fn();
      render(<PolaritySlider value={0} onChange={onChange} />);

      expect(screen.getByText('Negative')).toBeInTheDocument();
      expect(screen.getByText('Neutral')).toBeInTheDocument();
      expect(screen.getByText('Positive')).toBeInTheDocument();
    });
  });

  describe('Value Display', () => {
    it('pozitif değer + ile göstermeli', () => {
      const onChange = vi.fn();
      render(<PolaritySlider value={4} onChange={onChange} showValue />);

      expect(screen.getByText('+4')).toBeInTheDocument();
    });

    it('negatif değer göstermeli', () => {
      const onChange = vi.fn();
      render(<PolaritySlider value={-3} onChange={onChange} showValue />);

      expect(screen.getByText('-3')).toBeInTheDocument();
    });

    it('nötr değer (0) göstermeli', () => {
      const onChange = vi.fn();
      render(<PolaritySlider value={0} onChange={onChange} showValue />);

      expect(screen.getByText('0')).toBeInTheDocument();
    });
  });

  describe('Color Classes', () => {
    it('pozitif değer için polarity-positive class kullanmalı', () => {
      const onChange = vi.fn();
      render(<PolaritySlider value={3} onChange={onChange} showValue />);

      const valueSpan = screen.getByText('+3');
      expect(valueSpan).toHaveClass('polarity-positive');
    });

    it('negatif değer için polarity-negative class kullanmalı', () => {
      const onChange = vi.fn();
      render(<PolaritySlider value={-2} onChange={onChange} showValue />);

      const valueSpan = screen.getByText('-2');
      expect(valueSpan).toHaveClass('polarity-negative');
    });

    it('nötr değer için polarity-neutral class kullanmalı', () => {
      const onChange = vi.fn();
      render(<PolaritySlider value={0} onChange={onChange} showValue />);

      const valueSpan = screen.getByText('0');
      expect(valueSpan).toHaveClass('polarity-neutral');
    });
  });

  describe('Custom Range', () => {
    it('custom min/max değerleri kullanmalı', () => {
      const onChange = vi.fn();
      const { container } = render(
        <PolaritySlider value={0} onChange={onChange} min={-10} max={10} />
      );

      const slider = container.querySelector('[role="slider"]');
      expect(slider).toHaveAttribute('aria-valuemin', '-10');
      expect(slider).toHaveAttribute('aria-valuemax', '10');
    });
  });

  describe('className', () => {
    it('custom className uygulanmalı', () => {
      const onChange = vi.fn();
      const { container } = render(
        <PolaritySlider value={0} onChange={onChange} className="custom-class" />
      );

      expect(container.firstChild).toHaveClass('custom-class');
    });
  });
});

// ============================================================================
// INTENSITY SLIDER TESTS
// ============================================================================

describe('IntensitySlider', () => {
  describe('Rendering', () => {
    it('slider render etmeli', () => {
      const onChange = vi.fn();
      const { container } = render(<IntensitySlider value={5} onChange={onChange} />);

      expect(container.querySelector('[role="slider"]')).toBeInTheDocument();
    });

    it('varsayılan label "Intensity" olmalı', () => {
      const onChange = vi.fn();
      render(<IntensitySlider value={5} onChange={onChange} />);

      expect(screen.getByText('Intensity')).toBeInTheDocument();
    });

    it('custom label kullanabilmeli', () => {
      const onChange = vi.fn();
      render(<IntensitySlider value={5} onChange={onChange} label="Custom Label" />);

      expect(screen.getByText('Custom Label')).toBeInTheDocument();
    });

    it('Low/Medium/High etiketleri göstermeli', () => {
      const onChange = vi.fn();
      render(<IntensitySlider value={5} onChange={onChange} />);

      expect(screen.getByText('Low')).toBeInTheDocument();
      expect(screen.getByText('Medium')).toBeInTheDocument();
      expect(screen.getByText('High')).toBeInTheDocument();
    });
  });

  describe('Value Display', () => {
    it('değer ve max göstermeli', () => {
      const onChange = vi.fn();
      render(<IntensitySlider value={7} onChange={onChange} showValue />);

      expect(screen.getByText(/7\/10/)).toBeInTheDocument();
    });

    it('showValue=false ise değer göstermemeli', () => {
      const onChange = vi.fn();
      render(<IntensitySlider value={7} onChange={onChange} showValue={false} />);

      expect(screen.queryByText(/7\/10/)).not.toBeInTheDocument();
    });
  });

  describe('Intensity Labels', () => {
    it('düşük değer (1-3) için "Low" göstermeli', () => {
      const onChange = vi.fn();
      render(<IntensitySlider value={2} onChange={onChange} showValue />);

      expect(screen.getByText(/Low\)/)).toBeInTheDocument();
    });

    it('orta değer (4-6) için "Medium" göstermeli', () => {
      const onChange = vi.fn();
      render(<IntensitySlider value={5} onChange={onChange} showValue />);

      expect(screen.getByText(/Medium\)/)).toBeInTheDocument();
    });

    it('yüksek değer (7-10) için "High" göstermeli', () => {
      const onChange = vi.fn();
      render(<IntensitySlider value={8} onChange={onChange} showValue />);

      expect(screen.getByText(/High\)/)).toBeInTheDocument();
    });
  });

  describe('Intensity Colors', () => {
    it('düşük değer için yeşil renk kullanmalı', () => {
      const onChange = vi.fn();
      render(<IntensitySlider value={2} onChange={onChange} showValue />);

      const valueSpan = screen.getByText(/2\/10/);
      expect(valueSpan).toHaveClass('text-green-500');
    });

    it('orta değer için amber renk kullanmalı', () => {
      const onChange = vi.fn();
      render(<IntensitySlider value={5} onChange={onChange} showValue />);

      const valueSpan = screen.getByText(/5\/10/);
      expect(valueSpan).toHaveClass('text-amber-500');
    });

    it('yüksek değer için kırmızı renk kullanmalı', () => {
      const onChange = vi.fn();
      render(<IntensitySlider value={9} onChange={onChange} showValue />);

      const valueSpan = screen.getByText(/9\/10/);
      expect(valueSpan).toHaveClass('text-red-500');
    });
  });

  describe('Custom Range', () => {
    it('custom min/max değerleri kullanmalı', () => {
      const onChange = vi.fn();
      const { container } = render(
        <IntensitySlider value={5} onChange={onChange} min={0} max={20} />
      );

      const slider = container.querySelector('[role="slider"]');
      expect(slider).toHaveAttribute('aria-valuemin', '0');
      expect(slider).toHaveAttribute('aria-valuemax', '20');
    });

    it('custom max değerini göstermeli', () => {
      const onChange = vi.fn();
      render(<IntensitySlider value={15} onChange={onChange} max={20} showValue />);

      expect(screen.getByText(/15\/20/)).toBeInTheDocument();
    });
  });

  describe('className', () => {
    it('custom className uygulanmalı', () => {
      const onChange = vi.fn();
      const { container } = render(
        <IntensitySlider value={5} onChange={onChange} className="custom-class" />
      );

      expect(container.firstChild).toHaveClass('custom-class');
    });
  });
});
