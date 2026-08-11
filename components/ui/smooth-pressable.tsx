import React, { useState } from 'react';
import { Pressable, type PressableProps, type PressableStateCallbackType, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { cssInterop } from 'nativewind';

export interface SmoothPressableProps extends Omit<PressableProps, 'style'> {
  /** Scale applied while pressed. Defaults to a subtle 0.96. */
  scaleTo?: number;
  /**
   * Not meant to be passed directly — cssInterop (bottom of file) writes
   * the style computed from `className` here, and it flows through to
   * the underlying Pressable via prop-spreading.
   */
  style?: StyleProp<ViewStyle>;
  /**
   * Pressed/selected-state-dependent style, same convention as
   * Pressable's own `style` function form. Named separately from `style`
   * because `className` is mapped onto this component's own `style` prop
   * via cssInterop (see bottom of file) — reusing the name here would let
   * that mapping silently overwrite the caller's dynamic style before
   * this component ever sees it.
   */
  dynamicStyle?: StyleProp<ViewStyle> | ((state: PressableStateCallbackType) => StyleProp<ViewStyle>);
}

/**
 * Drop-in replacement for Pressable that adds a smooth scale press
 * animation and supports the same `style`-as-function convention via
 * `dynamicStyle` (see prop doc for why it isn't just called `style`).
 *
 * The outer element stays a genuine `Pressable` (not an
 * `Animated.createAnimatedComponent`-wrapped one) so nativewind's
 * `className` interop keeps working — `cssInterop` is registered below
 * so `className` reaching this component through prop-spreading (rather
 * than as a literal JSX attribute) still gets converted. The scale +
 * dynamic style are applied to an inner Animated.View instead, so they
 * never have to interact with that className/style mapping at all.
 */
export function SmoothPressable({
  scaleTo = 0.96,
  dynamicStyle,
  onPressIn,
  onPressOut,
  children,
  ...props
}: SmoothPressableProps) {
  const scale = useSharedValue(1);
  const [pressed, setPressed] = useState(false);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const pressableState: PressableStateCallbackType = { pressed, hovered: false };
  const resolvedDynamicStyle =
    typeof dynamicStyle === 'function' ? dynamicStyle(pressableState) : dynamicStyle;

  return (
    <Pressable
      {...props}
      onPressIn={(e) => {
        scale.value = withTiming(scaleTo, { duration: 100, easing: Easing.out(Easing.quad) });
        setPressed(true);
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        scale.value = withTiming(1, { duration: 180, easing: Easing.out(Easing.quad) });
        setPressed(false);
        onPressOut?.(e);
      }}
    >
      <Animated.View
        style={[
          { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
          resolvedDynamicStyle,
          animatedStyle,
        ]}
      >
        {typeof children === 'function' ? children(pressableState) : children}
      </Animated.View>
    </Pressable>
  );
}

// SmoothPressable forwards `className` through prop-spreading rather than
// as a literal JSX attribute, so nativewind's compile-time className
// transform can't see it. This registers the runtime conversion instead.
cssInterop(SmoothPressable, { className: 'style' });
