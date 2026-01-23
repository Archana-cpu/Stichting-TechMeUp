import { useState } from 'react';
import { View, Text, TextInput, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import { Stack, router } from 'expo-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Screen, Viewport, Container } from '@seq/ui';
import Animated, { FadeInDown } from 'react-native-reanimated';

export default function CreateScreen() {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [thoughtContent, setThoughtContent] = useState('');
  const [behaviorContent, setBehaviorContent] = useState('');

  const { data: emotions } = useQuery({
    queryKey: ['emotions'],
    queryFn: async () => {
      const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/emotions`);
      return res.json();
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/sequences`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sequences'] });
      router.back();
    },
  });

  const handleSubmit = () => {
    mutation.mutate({
      title,
      summary,
      eventDate: new Date().toISOString(),
      emotionId: emotions?.[0]?.id || 1,
      emotionPolarity: 0,
      emotionIntensity: 5,
      triggerId: 1,
      thoughtContent,
      thoughtPolarity: 0,
      thoughtIntensity: 5,
      behaviorContent,
      behaviorPolarity: 0,
      behaviorImpact: 5,
    });
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'New Sequence',
          headerStyle: { backgroundColor: 'hsl(224, 71%, 4%)' },
          headerTintColor: 'hsl(213, 31%, 91%)',
        }}
      />
      <Screen>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1"
        >
          <Viewport>
            <Container className="flex-1 py-4">
              <Animated.View entering={FadeInDown} className="gap-4 flex-1">
                <View>
                  <Text className="mb-2 text-sm font-medium text-foreground">Title</Text>
                  <TextInput
                    value={title}
                    onChangeText={setTitle}
                    placeholder="What happened?"
                    placeholderTextColor="hsl(217, 10%, 64%)"
                    className="rounded-lg border border-border bg-card px-4 py-3 text-foreground"
                  />
                </View>

                <View>
                  <Text className="mb-2 text-sm font-medium text-foreground">Summary</Text>
                  <TextInput
                    value={summary}
                    onChangeText={setSummary}
                    placeholder="Describe the event..."
                    placeholderTextColor="hsl(217, 10%, 64%)"
                    multiline
                    numberOfLines={4}
                    className="rounded-lg border border-border bg-card px-4 py-3 text-foreground"
                    style={{ textAlignVertical: 'top', minHeight: 100 }}
                  />
                </View>

                <View>
                  <Text className="mb-2 text-sm font-medium text-foreground">Thought</Text>
                  <TextInput
                    value={thoughtContent}
                    onChangeText={setThoughtContent}
                    placeholder="What were you thinking?"
                    placeholderTextColor="hsl(217, 10%, 64%)"
                    multiline
                    numberOfLines={3}
                    className="rounded-lg border border-border bg-card px-4 py-3 text-foreground"
                    style={{ textAlignVertical: 'top', minHeight: 80 }}
                  />
                </View>

                <View>
                  <Text className="mb-2 text-sm font-medium text-foreground">Behavior</Text>
                  <TextInput
                    value={behaviorContent}
                    onChangeText={setBehaviorContent}
                    placeholder="How did you react?"
                    placeholderTextColor="hsl(217, 10%, 64%)"
                    multiline
                    numberOfLines={3}
                    className="rounded-lg border border-border bg-card px-4 py-3 text-foreground"
                    style={{ textAlignVertical: 'top', minHeight: 80 }}
                  />
                </View>

                <Pressable
                  onPress={handleSubmit}
                  disabled={mutation.isPending || !title || !summary}
                  className="mt-auto mb-4 rounded-lg bg-primary py-4 active:opacity-80 disabled:opacity-50"
                >
                  <Text className="text-center font-semibold text-primary-foreground">
                    {mutation.isPending ? 'Creating...' : 'Create Sequence'}
                  </Text>
                </Pressable>
              </Animated.View>
            </Container>
          </Viewport>
        </KeyboardAvoidingView>
      </Screen>
    </>
  );
}
