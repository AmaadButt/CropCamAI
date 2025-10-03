import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native';
import parseOverlayText from '../../custom/parseOverlayText';
import type { OverlayDef, ParseResult } from '../../custom/OverlayDef';
import { useTheme } from '../../theme/ThemeProvider';

export type NLBarProps = {
  onParsed: (def: OverlayDef, summary: string) => void;
  onSavePreset?: (def: OverlayDef, summary: string) => void;
};

const NLBar: React.FC<NLBarProps> = ({ onParsed, onSavePreset }) => {
  const { theme } = useTheme();
  const [text, setText] = useState('');
  const [result, setResult] = useState<ParseResult | null>(null);

  const handleApply = () => {
    const parsed = parseOverlayText(text);
    setResult(parsed);
    if (parsed.ok) {
      onParsed(parsed.def, parsed.summary);
      setText('');
    }
  };

  const handleSave = () => {
    if (result && result.ok && onSavePreset) {
      onSavePreset(result.def, result.summary);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={[styles.container, { backgroundColor: theme.surface }]}>
        <TextInput
          style={[styles.input, { color: theme.textPrimary }]}
          placeholder="Describe an overlay..."
          placeholderTextColor="#999"
          value={text}
          onChangeText={setText}
          accessibilityLabel="Natural language overlay input"
          autoCapitalize="none"
          returnKeyType="send"
          onSubmitEditing={handleApply}
        />
        <Pressable
          style={[styles.button, { backgroundColor: theme.accent }]}
          onPress={handleApply}
          accessibilityRole="button"
          accessibilityLabel="Apply natural language overlay"
        >
          <Text style={styles.buttonText}>Apply</Text>
        </Pressable>
      </View>
      {result && (
        <View style={styles.feedback}>
          <Text style={[styles.feedbackText, { color: result.ok ? theme.accent : theme.danger }]}>
            {result.ok ? result.summary : result.message}
          </Text>
          {result.ok && onSavePreset && (
            <Pressable
              style={styles.saveButton}
              onPress={handleSave}
              accessibilityRole="button"
              accessibilityLabel="Save overlay preset"
            >
              <Text style={styles.saveText}>Save preset</Text>
            </Pressable>
          )}
          {!result.ok && (
            <Text style={styles.suggestions}>Try: {result.suggestions.join(' · ')}</Text>
          )}
        </View>
      )}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 12,
    alignItems: 'center',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16
  },
  input: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#ffffff11',
    borderRadius: 12
  },
  button: {
    marginLeft: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600'
  },
  feedback: {
    paddingHorizontal: 12,
    paddingBottom: 8
  },
  feedbackText: {
    fontWeight: '600'
  },
  suggestions: {
    fontSize: 12,
    opacity: 0.7,
    marginTop: 4
  },
  saveButton: {
    alignSelf: 'flex-start',
    marginTop: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#ffffff11',
    borderRadius: 8
  },
  saveText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600'
  }
});

export default NLBar;
