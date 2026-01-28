// ══════════════════════════════════════════════════════════════════════════════
// CREATE POLL SCREEN
// ══════════════════════════════════════════════════════════════════════════════

import { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native'
import { useRouter } from 'expo-router'
import { useCreatePoll } from '@/hooks/usePolls'

export default function CreateScreen() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [options, setOptions] = useState(['', ''])

  const router = useRouter()
  const createPoll = useCreatePoll()

  function addOption() {
    if (options.length < 10) {
      setOptions([...options, ''])
    }
  }

  function removeOption(index: number) {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index))
    }
  }

  function updateOption(index: number, value: string) {
    const newOptions = [...options]
    newOptions[index] = value
    setOptions(newOptions)
  }

  async function handleCreate() {
    // Validation
    if (!title.trim()) {
      Alert.alert('Hata', 'Başlık gerekli')
      return
    }

    const validOptions = options.filter((o) => o.trim())
    if (validOptions.length < 2) {
      Alert.alert('Hata', 'En az 2 seçenek gerekli')
      return
    }

    createPoll.mutate(
      {
        title: title.trim(),
        description: description.trim() || undefined,
        type: 'SINGLE_CHOICE',
        visibility: 'PUBLIC',
        options: validOptions.map((text, index) => ({ text, order: index })),
      },
      {
        onSuccess: (poll) => {
          Alert.alert('Başarılı', 'Poll oluşturuldu!', [
            { text: 'Tamam', onPress: () => router.push(`/poll/${poll.id}`) },
          ])
        },
        onError: (error) => {
          Alert.alert('Hata', error.message)
        },
      }
    )
  }

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.content}>
        {/* Title */}
        <View style={styles.field}>
          <Text style={styles.label}>Başlık *</Text>
          <TextInput
            style={styles.input}
            placeholder="Sorunuzu yazın..."
            placeholderTextColor="#9ca3af"
            value={title}
            onChangeText={setTitle}
            maxLength={200}
          />
        </View>

        {/* Description */}
        <View style={styles.field}>
          <Text style={styles.label}>Açıklama</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Ek bilgi ekleyin (opsiyonel)"
            placeholderTextColor="#9ca3af"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
            maxLength={500}
          />
        </View>

        {/* Options */}
        <View style={styles.field}>
          <Text style={styles.label}>Seçenekler *</Text>
          {options.map((option, index) => (
            <View key={index} style={styles.optionRow}>
              <TextInput
                style={[styles.input, styles.optionInput]}
                placeholder={`Seçenek ${index + 1}`}
                placeholderTextColor="#9ca3af"
                value={option}
                onChangeText={(value) => updateOption(index, value)}
                maxLength={100}
              />
              {options.length > 2 && (
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => removeOption(index)}
                >
                  <Text style={styles.removeButtonText}>✕</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}

          {options.length < 10 && (
            <TouchableOpacity style={styles.addButton} onPress={addOption}>
              <Text style={styles.addButtonText}>+ Seçenek Ekle</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Create Button */}
        <TouchableOpacity
          style={[styles.createButton, createPoll.isPending && styles.createButtonDisabled]}
          onPress={handleCreate}
          disabled={createPoll.isPending}
        >
          {createPoll.isPending ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.createButtonText}>Poll Oluştur</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  content: {
    padding: 16,
  },
  field: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#111827',
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  optionInput: {
    flex: 1,
  },
  removeButton: {
    marginLeft: 8,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fee2e2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeButtonText: {
    color: '#ef4444',
    fontSize: 16,
    fontWeight: 'bold',
  },
  addButton: {
    borderWidth: 2,
    borderColor: '#6366f1',
    borderStyle: 'dashed',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#6366f1',
    fontSize: 16,
    fontWeight: '600',
  },
  createButton: {
    backgroundColor: '#6366f1',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  createButtonDisabled: {
    opacity: 0.7,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
})
