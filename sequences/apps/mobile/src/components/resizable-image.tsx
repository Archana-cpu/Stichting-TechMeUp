import { View, Image, ImageSourcePropType } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { PanGestureHandler, State } from 'react-native-gesture-handler';

type ResizableImageProps = {
  source: ImageSourcePropType | { uri: string } | null;
  width: number;
  height: number;
  x: number;
  y: number;
  onResize: (width: number, height: number) => void;
  onMove: (x: number, y: number) => void;
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
};

export function ResizableImage({
  source,
  width,
  height,
  x,
  y,
  onResize,
  onMove,
  minWidth = 100,
  minHeight = 100,
  maxWidth = 500,
  maxHeight = 500,
}: ResizableImageProps) {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const startX = useSharedValue(x);
  const startY = useSharedValue(y);
  const startWidth = useSharedValue(width);
  const startHeight = useSharedValue(height);

  // Resize handles
  const resizeTranslateX = useSharedValue(0);
  const resizeTranslateY = useSharedValue(0);
  const resizeStartX = useSharedValue(0);
  const resizeStartY = useSharedValue(0);

  const containerStyle = useAnimatedStyle(() => ({
    position: 'absolute',
    left: startX.value + translateX.value,
    top: startY.value + translateY.value,
    width: startWidth.value + resizeTranslateX.value,
    height: startHeight.value + resizeTranslateY.value,
  }));

  const handleMove = (event: any) => {
    'worklet';
    translateX.value = event.translationX;
    translateY.value = event.translationY;
  };

  const handleMoveEnd = () => {
    'worklet';
    const newX = startX.value + translateX.value;
    const newY = startY.value + translateY.value;
    startX.value = newX;
    startY.value = newY;
    translateX.value = 0;
    translateY.value = 0;
    onMove(newX, newY);
  };

  const handleResize = (event: any) => {
    'worklet';
    const newWidth = Math.max(minWidth, Math.min(maxWidth, startWidth.value + event.translationX));
    const newHeight = Math.max(minHeight, Math.min(maxHeight, startHeight.value + event.translationY));
    resizeTranslateX.value = newWidth - startWidth.value;
    resizeTranslateY.value = newHeight - startHeight.value;
  };

  const handleResizeEnd = () => {
    'worklet';
    const newWidth = startWidth.value + resizeTranslateX.value;
    const newHeight = startHeight.value + resizeTranslateY.value;
    startWidth.value = newWidth;
    startHeight.value = newHeight;
    resizeTranslateX.value = 0;
    resizeTranslateY.value = 0;
    onResize(newWidth, newHeight);
  };

  return (
    <PanGestureHandler
      onGestureEvent={handleMove}
      onHandlerStateChange={(event) => {
        if (event.nativeEvent.state === State.END) {
          handleMoveEnd();
        }
      }}
    >
      <Animated.View style={containerStyle}>
        <View className="w-full h-full overflow-hidden rounded-lg">
          {source ? (
            <Image
              source={source}
              className="w-full h-full"
              resizeMode="cover"
              style={{ width: '100%', height: '100%' }}
            />
          ) : (
            <View className="w-full h-full bg-gray-200" />
          )}
        </View>

        {/* Resize handle - bottom right corner */}
        <PanGestureHandler
          onGestureEvent={handleResize}
          onHandlerStateChange={(event) => {
            if (event.nativeEvent.state === State.END) {
              handleResizeEnd();
            }
          }}
        >
          <Animated.View
            className="absolute bottom-0 right-0 w-6 h-6 bg-primary rounded-full border-2 border-background"
            style={{
              transform: [{ translateX: -3 }, { translateY: -3 }],
            }}
          />
        </PanGestureHandler>
      </Animated.View>
    </PanGestureHandler>
  );
}
