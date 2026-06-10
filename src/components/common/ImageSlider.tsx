import React, { useCallback, useRef, useState } from 'react';
import { View, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import Carousel from 'react-native-reanimated-carousel';
import Animated, { useAnimatedStyle, withTiming, interpolate, Extrapolation } from 'react-native-reanimated';
import { colors, spacing, radius } from '@/constants';
import { resolveImageUrl } from '@/utils';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SLIDER_HEIGHT = 260;
const PLACEHOLDER = 'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=800&q=80';

interface Props {
  images: string[];
  height?: number;
}

const DotIndicator = ({ index, activeIndex }: { index: number; activeIndex: number }) => {
  const style = useAnimatedStyle(() => {
    const isActive = index === activeIndex;
    return {
      width:   withTiming(isActive ? 20 : 6,  { duration: 250 }),
      opacity: withTiming(isActive ? 1  : 0.4, { duration: 250 }),
    };
  });

  return <Animated.View style={[styles.dot, style]} />;
};

export const ImageSlider: React.FC<Props> = ({ images, height = SLIDER_HEIGHT }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const data = (images.length > 0 ? images : [PLACEHOLDER]).map(resolveImageUrl);

  const renderItem = useCallback(
    ({ item }: { item: string }) => (
      <Image
        source={{ uri: item }}
        style={{ width: SCREEN_WIDTH, height }}
        contentFit="cover"
        transition={300}
      />
    ),
    [height],
  );

  return (
    <View style={[styles.container, { height }]}>
      <Carousel
        data={data}
        renderItem={renderItem}
        width={SCREEN_WIDTH}
        height={height}
        loop={data.length > 1}
        autoPlay={data.length > 1}
        autoPlayInterval={4000}
        scrollAnimationDuration={500}
        onSnapToItem={setActiveIndex}
        enabled={data.length > 1}
      />

      {data.length > 1 && (
        <View style={styles.dotsRow}>
          {data.map((_, i) => (
            <DotIndicator key={i} index={i} activeIndex={activeIndex} />
          ))}
        </View>
      )}

      {data.length > 1 && (
        <View style={styles.countBadge}>
          <Animated.Text style={styles.countText}>
            {activeIndex + 1}/{data.length}
          </Animated.Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  dotsRow: {
    position:       'absolute',
    bottom:         spacing[3],
    left:           0,
    right:          0,
    flexDirection:  'row',
    justifyContent: 'center',
    alignItems:     'center',
    gap:            5,
  },
  dot: {
    height:       6,
    borderRadius: 3,
    backgroundColor: '#fff',
  },
  countBadge: {
    position:        'absolute',
    top:             spacing[3],
    right:           spacing[3],
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderRadius:    radius.full,
    paddingHorizontal: spacing[3],
    paddingVertical:   spacing[1],
  },
  countText: {
    color:    '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
});
