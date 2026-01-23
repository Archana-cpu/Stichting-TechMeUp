import { View } from 'react-native';
import { useWindowDimensions } from 'react-native';

type RulerProps = {
  orientation?: 'horizontal' | 'vertical';
  showLabels?: boolean;
};

export function Ruler({ orientation = 'horizontal', showLabels = true }: RulerProps) {
  const { width, height } = useWindowDimensions();
  const size = orientation === 'horizontal' ? width : height;
  const step = 50; // 50px intervals
  const marks = Math.floor(size / step);

  return (
    <View
      className={`absolute ${orientation === 'horizontal' ? 'top-0 left-0 right-0 h-6' : 'left-0 top-0 bottom-0 w-6'} bg-card/80 border-b border-r border-border z-10`}
    >
      {Array.from({ length: marks }).map((_, i) => {
        const position = i * step;
        const isMajor = i % 5 === 0; // Major mark every 250px

        return (
          <View
            key={i}
            className={`absolute ${orientation === 'horizontal' ? 'h-full' : 'w-full'} border-border`}
            style={{
              [orientation === 'horizontal' ? 'left' : 'top']: position,
              borderRightWidth: orientation === 'horizontal' ? 1 : 0,
              borderBottomWidth: orientation === 'vertical' ? 1 : 0,
              height: orientation === 'horizontal' ? (isMajor ? '100%' : '50%') : undefined,
              width: orientation === 'vertical' ? (isMajor ? '100%' : '50%') : undefined,
            }}
          >
            {showLabels && isMajor && (
              <View
                className={`absolute ${orientation === 'horizontal' ? 'top-0 left-1' : 'left-0 top-1'}`}
              >
                {/* Label would go here if needed */}
              </View>
            )}
          </View>
        );
      })}
    </View>
  );
}
