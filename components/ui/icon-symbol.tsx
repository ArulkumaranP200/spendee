// Fallback for using MaterialIcons on Android and web.

import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { SymbolWeight, SymbolViewProps } from "expo-symbols";
import { ComponentProps } from "react";
import { OpaqueColorValue, type StyleProp, type TextStyle } from "react-native";

type IconMapping = Record<SymbolViewProps["name"], ComponentProps<typeof MaterialIcons>["name"]>;
type IconSymbolName = keyof typeof MAPPING;

/**
 * Add your SF Symbols to Material Icons mappings here.
 * - see Material Icons in the [Icons Directory](https://icons.expo.fyi).
 * - see SF Symbols in the [SF Symbols](https://developer.apple.com/sf-symbols/) app.
 */
const MAPPING = {
  // Navigation tabs
  "house.fill": "home",
  "list.bullet": "list",
  "plus.circle.fill": "add-circle",
  "person.2.fill": "people",
  "chart.bar.fill": "bar-chart",
  "gear": "settings",
  // Transaction status
  "checkmark.circle.fill": "check-circle",
  "clock.fill": "schedule",
  "xmark.circle.fill": "cancel",
  // Ledger
  "arrow.up.right": "trending-up",
  "arrow.down.left": "trending-down",
  // General
  "chevron.right": "chevron-right",
  "chevron.left": "chevron-left",
  "magnifyingglass": "search",
  "ellipsis": "more-vert",
  "calendar": "event",
  "trash": "delete",
  "pencil": "edit",
  "paperplane.fill": "send",
  "chevron.left.forwardslash.chevron.right": "code",
  // Categories
  "fork.knife": "restaurant",
  "car.fill": "directions-car",
  "bag.fill": "shopping-bag",
  "bolt.fill": "flash-on",
  "heart.fill": "favorite",
  "film.fill": "movie",
  "book.fill": "school",
  "airplane.fill": "flight",
  "person.fill": "person",
  // Exclusions
  "eye.slash.fill": "visibility-off",
  "circle": "radio-button-unchecked",
  "circle.fill": "radio-button-checked",
} as unknown as IconMapping;

/**
 * An icon component that uses native SF Symbols on iOS, and Material Icons on Android and web.
 * This ensures a consistent look across platforms, and optimal resource usage.
 * Icon `name`s are based on SF Symbols and require manual mapping to Material Icons.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  return <MaterialIcons color={color} size={size} name={MAPPING[name]} style={style} />;
}
