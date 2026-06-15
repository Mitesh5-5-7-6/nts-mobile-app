import { Easing } from 'react-native-reanimated';

export const durations = {
  fast: 150,
  normal: 300,
  slow: 500,
} as const;

export const easing = {
  // Standard material/iOS design easings
  standard: Easing.bezier(0.4, 0.0, 0.2, 1),
  decelerate: Easing.bezier(0.0, 0.0, 0.2, 1),
  accelerate: Easing.bezier(0.4, 0.0, 1, 1),
  bounce: Easing.bezier(0.175, 0.885, 0.32, 1.275),
} as const;

export const presets = {
  // Reanimated Transition Configs
  fade: {
    duration: durations.fast,
    easing: easing.decelerate,
  },
  slide: {
    duration: durations.normal,
    easing: easing.standard,
  },
  bottomSheet: {
    duration: durations.normal,
    easing: easing.decelerate,
  },
  cardTap: {
    duration: durations.fast,
    easing: easing.standard,
  },
} as const;

export const animations = {
  durations,
  easing,
  presets,
} as const;

export type AnimationsType = typeof animations;
export default animations;
