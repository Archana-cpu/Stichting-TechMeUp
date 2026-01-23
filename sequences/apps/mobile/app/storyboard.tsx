import { View, Text, ScrollView, Pressable } from "react-native";
import { Stack, Link } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";

export default function StoryboardScreen() {
  // #region agent log
  const apiUrl = process.env.EXPO_PUBLIC_API_URL;
  fetch("http://127.0.0.1:7243/ingest/d9701ca4-b5ae-4574-8484-12596633538b", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      location: "storyboard.tsx:8",
      message: "StoryboardScreen entry",
      data: { apiUrl: apiUrl || "MISSING" },
      timestamp: Date.now(),
      sessionId: "debug-session",
      runId: "run1",
      hypothesisId: "A",
    }),
  }).catch(() => {});
  // #endregion

  const {
    data: sequences,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["sequences"],
    queryFn: async () => {
      // #region agent log
      const url = `${process.env.EXPO_PUBLIC_API_URL}/api/sequences`;
      fetch(
        "http://127.0.0.1:7243/ingest/d9701ca4-b5ae-4574-8484-12596633538b",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            location: "storyboard.tsx:15",
            message: "Before API fetch",
            data: { url, hasApiUrl: !!process.env.EXPO_PUBLIC_API_URL },
            timestamp: Date.now(),
            sessionId: "debug-session",
            runId: "run1",
            hypothesisId: "A",
          }),
        }
      ).catch(() => {});
      // #endregion

      const res = await fetch(url);

      // #region agent log
      fetch(
        "http://127.0.0.1:7243/ingest/d9701ca4-b5ae-4574-8484-12596633538b",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            location: "storyboard.tsx:20",
            message: "After API fetch",
            data: {
              status: res.status,
              statusText: res.statusText,
              ok: res.ok,
            },
            timestamp: Date.now(),
            sessionId: "debug-session",
            runId: "run1",
            hypothesisId: "B",
          }),
        }
      ).catch(() => {});
      // #endregion

      if (!res.ok) {
        // #region agent log
        const errorText = await res.text().catch(() => "");
        fetch(
          "http://127.0.0.1:7243/ingest/d9701ca4-b5ae-4574-8484-12596633538b",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              location: "storyboard.tsx:25",
              message: "API fetch failed",
              data: { status: res.status, errorText },
              timestamp: Date.now(),
              sessionId: "debug-session",
              runId: "run1",
              hypothesisId: "B",
            }),
          }
        ).catch(() => {});
        // #endregion
        throw new Error(`API error: ${res.status}`);
      }

      const json = await res.json();

      // #region agent log
      fetch(
        "http://127.0.0.1:7243/ingest/d9701ca4-b5ae-4574-8484-12596633538b",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            location: "storyboard.tsx:32",
            message: "API response received",
            data: {
              isArray: Array.isArray(json),
              length: Array.isArray(json) ? json.length : 0,
              firstItem:
                Array.isArray(json) && json.length > 0
                  ? { id: json[0].id, hasEmotion: !!json[0].emotion }
                  : null,
            },
            timestamp: Date.now(),
            sessionId: "debug-session",
            runId: "run1",
            hypothesisId: "C",
          }),
        }
      ).catch(() => {});
      // #endregion

      return json;
    },
  });

  // #region agent log
  fetch("http://127.0.0.1:7243/ingest/d9701ca4-b5ae-4574-8484-12596633538b", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      location: "storyboard.tsx:37",
      message: "Render state",
      data: {
        isLoading,
        hasError: !!error,
        hasData: !!sequences,
        sequencesLength: sequences?.length || 0,
      },
      timestamp: Date.now(),
      sessionId: "debug-session",
      runId: "run1",
      hypothesisId: "D",
    }),
  }).catch(() => {});
  // #endregion

  return (
    <>
      <Stack.Screen
        options={{
          title: "Storyboard",
          headerRight: () => (
            <Link href="/create" asChild>
              <Pressable className="mr-4">
                <Ionicons name="add" size={24} color="hsl(217, 91%, 60%)" />
              </Pressable>
            </Link>
          ),
        }}
      />
      <ScrollView className="flex-1 bg-background px-4 pt-4">
        {isLoading ? (
          <Text className="text-center text-muted-foreground">Loading...</Text>
        ) : error ? (
          // #region agent log
          (() => {
            fetch(
              "http://127.0.0.1:7243/ingest/d9701ca4-b5ae-4574-8484-12596633538b",
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  location: "storyboard.tsx:42",
                  message: "Error state rendered",
                  data: { errorMessage: error?.message || "Unknown error" },
                  timestamp: Date.now(),
                  sessionId: "debug-session",
                  runId: "run1",
                  hypothesisId: "B",
                }),
              }
            ).catch(() => {});
            return (
              <View className="items-center py-12">
                <Ionicons
                  name="alert-circle"
                  size={48}
                  color="hsl(0, 72%, 51%)"
                />
                <Text className="mt-4 text-lg text-muted-foreground">
                  Error loading sequences
                </Text>
                <Text className="mt-2 text-sm text-muted-foreground">
                  {error?.message || "Unknown error"}
                </Text>
              </View>
            );
          })()
        ) : // #endregion
        sequences?.length === 0 ? (
          <View className="items-center py-12">
            <Ionicons
              name="film-outline"
              size={48}
              color="hsl(217, 10%, 64%)"
            />
            <Text className="mt-4 text-lg text-muted-foreground">
              No sequences yet
            </Text>
          </View>
        ) : (
          <View className="gap-4 pb-8">
            {sequences?.map((sequence: any) => {
              // #region agent log
              fetch(
                "http://127.0.0.1:7243/ingest/d9701ca4-b5ae-4574-8484-12596633538b",
                {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    location: "storyboard.tsx:54",
                    message: "Rendering sequence item",
                    data: {
                      sequenceId: sequence.id,
                      hasEmotion: !!sequence.emotion,
                      hasTitle: !!sequence.title,
                      hasEventDate: !!sequence.eventDate,
                    },
                    timestamp: Date.now(),
                    sessionId: "debug-session",
                    runId: "run1",
                    hypothesisId: "C",
                  }),
                }
              ).catch(() => {});
              // #endregion

              return (
                <Link
                  key={sequence.id}
                  href={`/sequence/${sequence.id}`}
                  asChild
                >
                  <Pressable className="rounded-xl bg-card p-4 active:bg-muted">
                    <View className="flex-row items-center gap-2">
                      <Text>{sequence.emotion?.icon}</Text>
                      <Text className="text-sm text-primary">
                        {sequence.emotion?.key}
                      </Text>
                      <Text className="text-sm text-muted-foreground">
                        {new Date(sequence.eventDate).toLocaleDateString()}
                      </Text>
                    </View>
                    <Text className="mt-2 text-lg font-semibold text-foreground">
                      {sequence.title}
                    </Text>
                    <Text
                      className="mt-1 text-sm text-muted-foreground"
                      numberOfLines={2}
                    >
                      {sequence.summary}
                    </Text>
                  </Pressable>
                </Link>
              );
            })}
          </View>
        )}
      </ScrollView>
    </>
  );
}
