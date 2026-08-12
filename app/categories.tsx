import React, { useState } from 'react';
import { ScrollView, View, Text, TextInput, Alert, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeIn, FadeOut, LinearTransition } from 'react-native-reanimated';
import { ScreenContainer } from '@/components/screen-container';
import { useCategories } from '@/lib/finance-context';
import { useColors } from '@/hooks/use-colors';
import { withAlpha } from '@/lib/color-utils';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { SmoothPressable } from '@/components/ui/smooth-pressable';
import type { CategoryType } from '@/lib/types';

const EMOJI_OPTIONS = [
  '🍔', '🚗', '🛍️', '📄', '💊', '🎬', '📚', '✈️', '💇', '📦',
  '💰', '💼', '📈', '🎁', '💵', '🏠', '🐾', '⚽', '🎮', '☕',
];

export default function CategoriesScreen() {
  const router = useRouter();
  const { categories, addCategory, deleteCategory } = useCategories();
  const colors = useColors();

  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [icon, setIcon] = useState(EMOJI_OPTIONS[0]);
  const [type, setType] = useState<CategoryType>('expense');

  const closeForm = () => {
    setShowForm(false);
    setName('');
    setIcon(EMOJI_OPTIONS[0]);
    setType('expense');
  };

  const handleAdd = () => {
    if (!name.trim()) {
      Alert.alert('Missing Name', 'Please enter a category name');
      return;
    }
    if (categories.some((c) => c.name.toLowerCase() === name.trim().toLowerCase() && c.type === type)) {
      Alert.alert('Duplicate', 'A category with this name already exists');
      return;
    }
    addCategory({ name: name.trim(), icon, type });
    closeForm();
  };

  const handleDelete = (id: string, categoryName: string) => {
    Alert.alert('Delete Category', `Delete "${categoryName}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => deleteCategory(id),
      },
    ]);
  };

  return (
    <ScreenContainer className="bg-background">
      <View className="flex-1">
        <Animated.View entering={FadeIn.duration(250)}>
        <View className="px-4 py-4 flex-row items-center gap-3">
          <SmoothPressable onPress={() => router.back()} hitSlop={8} className="p-1">
            <IconSymbol size={24} name="chevron.left" color={colors.foreground} />
          </SmoothPressable>
          <Text className="text-2xl font-bold text-foreground">Categories</Text>
        </View>
        </Animated.View>

        <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20 }}>
          {categories.map((category) => (
            <Animated.View
              key={category.id}
              entering={FadeIn.duration(200)}
              exiting={FadeOut.duration(150)}
              layout={LinearTransition.duration(200)}
              className="bg-surface rounded-2xl p-4 mb-3 shadow-sm flex-row items-center justify-between"
            >
              <View className="flex-row items-center gap-3 flex-1">
                <Text className="text-2xl">{category.icon}</Text>
                <View className="flex-1">
                  <Text className="font-semibold text-foreground">{category.name}</Text>
                  <Text className="text-xs text-muted capitalize">{category.type}</Text>
                </View>
              </View>
              {category.isDefault ? (
                <View className="px-2 py-1 rounded-full bg-primary/10">
                  <Text className="text-xs font-semibold text-primary">DEFAULT</Text>
                </View>
              ) : (
                <SmoothPressable
                  onPress={() => handleDelete(category.id, category.name)}
                  hitSlop={8}
                  dynamicStyle={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}
                  className="p-1"
                >
                  <IconSymbol size={20} name="trash" color={colors.error} />
                </SmoothPressable>
              )}
            </Animated.View>
          ))}

          <SmoothPressable
            onPress={() => setShowForm(true)}
            className="mt-2"
            dynamicStyle={({ pressed, hovered }) => [
              {
                paddingVertical: 16,
                borderRadius: 999,
                borderWidth: 1,
                borderColor: withAlpha(colors.primary, 0.3),
                backgroundColor: withAlpha(colors.primary, hovered ? 0.4 : 0.3),
                alignItems: 'center',
                opacity: pressed ? 0.85 : 1,
              },
            ]}
          >
            <Text className="font-bold" style={{ color: colors.foreground }}>+ Add Category</Text>
          </SmoothPressable>
        </ScrollView>
      </View>

      {showForm && (
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={[StyleSheet.absoluteFillObject, { zIndex: 50 }]}
          className="justify-end bg-black/40"
        >
          <Animated.View entering={FadeIn.duration(200)} exiting={FadeOut.duration(150)}>
          <View className="bg-background rounded-t-2xl p-4 gap-4 border-t border-border">
            <Text className="text-lg font-bold text-foreground">New Category</Text>

            <View className="gap-2">
              <Text className="text-sm font-semibold text-foreground">Name</Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Category name"
                placeholderTextColor={colors.muted}
                className="bg-surface rounded-lg px-3 py-3 border border-border text-foreground"
              />
            </View>

            <View className="gap-2">
              <Text className="text-sm font-semibold text-foreground">Icon</Text>
              <View className="flex-row flex-wrap gap-2">
                {EMOJI_OPTIONS.map((emoji) => {
                  const selected = icon === emoji;
                  return (
                    <SmoothPressable
                      key={emoji}
                      onPress={() => setIcon(emoji)}
                      dynamicStyle={({ pressed, hovered }) => [
                        {
                          width: 44,
                          height: 44,
                          borderRadius: 12,
                          borderWidth: 1,
                          backgroundColor: selected
                            ? withAlpha(colors.primary, 0.3)
                            : hovered
                              ? withAlpha(colors.primary, 0.12)
                              : colors.surface,
                          borderColor: selected ? withAlpha(colors.primary, 0.3) : colors.border,
                          opacity: pressed ? 0.85 : 1,
                        },
                      ]}
                    >
                      <Text className="text-xl">{emoji}</Text>
                    </SmoothPressable>
                  );
                })}
              </View>
            </View>

            <View className="gap-2">
              <Text className="text-sm font-semibold text-foreground">Type</Text>
              <View className="flex-row gap-2">
                {(['expense', 'income', 'both'] as CategoryType[]).map((t) => {
                  const selected = type === t;
                  return (
                    <SmoothPressable
                      key={t}
                      onPress={() => setType(t)}
                      className="flex-1"
                      dynamicStyle={({ pressed, hovered }) => [
                        {
                          paddingVertical: 8,
                          borderRadius: 12,
                          borderWidth: 1,
                          backgroundColor: selected
                            ? withAlpha(colors.primary, 0.3)
                            : hovered
                              ? withAlpha(colors.primary, 0.12)
                              : colors.surface,
                          borderColor: selected ? withAlpha(colors.primary, 0.3) : colors.border,
                          opacity: pressed ? 0.85 : 1,
                        },
                      ]}
                    >
                      <Text className="font-semibold capitalize text-sm" style={{ color: colors.foreground }}>
                        {t}
                      </Text>
                    </SmoothPressable>
                  );
                })}
              </View>
            </View>

            <View className="flex-row gap-2 pt-2">
              <SmoothPressable
                onPress={closeForm}
                dynamicStyle={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
                className="flex-1 py-3 rounded-full items-center border border-border"
              >
                <Text className="text-foreground font-semibold">Cancel</Text>
              </SmoothPressable>
              <SmoothPressable
                onPress={handleAdd}
                className="flex-1"
                dynamicStyle={({ pressed, hovered }) => [
                  {
                    paddingVertical: 12,
                    borderRadius: 999,
                    borderWidth: 1,
                    borderColor: withAlpha(colors.primary, 0.3),
                    backgroundColor: withAlpha(colors.primary, hovered ? 0.4 : 0.3),
                    alignItems: 'center',
                    opacity: pressed ? 0.85 : 1,
                  },
                ]}
              >
                <Text className="font-bold" style={{ color: colors.foreground }}>Add</Text>
              </SmoothPressable>
            </View>
          </View>
          </Animated.View>
        </KeyboardAvoidingView>
      )}
    </ScreenContainer>
  );
}
