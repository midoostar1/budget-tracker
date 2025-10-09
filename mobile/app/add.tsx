import { Link, useRouter } from 'expo-router';
import React from 'react';
import { KeyboardAvoidingView, Platform, Pressable, Text, TextInput, View } from 'react-native';
import { styles as s } from './add.styles';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';

type Category = { id: string; name: string; icon: string };

export default function Add() {
  const router = useRouter();
  const [amount, setAmount] = React.useState('');
  const [currency, setCurrency] = React.useState('USD');
  const [category, setCategory] = React.useState<Category | null>(null);
  const [note, setNote] = React.useState('');

  React.useEffect(() => {
    const sub = router.addListener('focus', () => {
      const selected = router.getState()?.routes.find(r => r.name === 'add')?.params as any;
      if (selected?.category) setCategory(selected.category);
    });
    return sub;
  }, [router]);

  const submit = async () => {
    if (!category) return;
    const occurredAt = new Date().toISOString();
    await fetch(`${API_URL}/transactions`, {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ amount, currency, categoryId: category.id, note, occurredAt })
    });
    router.back();
  };

  // One-hand optimized keypad for rapid amount entry
  const append = (ch: string) => setAmount(prev => {
    if (ch === '⌫') return prev.slice(0, -1);
    if (ch === '.' && prev.includes('.')) return prev;
    if (ch === '00') return prev + '00';
    return prev + ch;
  });

  return (
    <KeyboardAvoidingView style={s.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={s.row}>
        <Text style={s.label}>Amount</Text>
        <TextInput
          value={amount}
          onChangeText={setAmount}
          placeholder="0.00"
          inputMode="decimal"
          keyboardType="decimal-pad"
          autoFocus
          style={s.input}
        />
        <Text style={s.hint}>Tap keypad below</Text>
        <View style={s.keypad}>
          {['7','8','9','⌫','4','5','6','.','1','2','3','00','0'].map(key => (
            <Pressable key={key} onPress={() => append(key)} style={s.key}><Text style={s.keyText}>{key}</Text></Pressable>
          ))}
        </View>
      </View>
      <View style={s.row}>
        <Text style={s.label}>Currency</Text>
        <TextInput value={currency} onChangeText={(v)=>setCurrency(v.toUpperCase())} autoCapitalize="characters" maxLength={3} style={s.input} />
      </View>
      <View style={s.row}>
        <Text style={s.label}>Category</Text>
        <Link href="/categories" asChild>
          <Pressable style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 999, padding: 12, alignItems: 'center' }}><Text>{category ? category.name : 'Pick'}</Text></Pressable>
        </Link>
      </View>
      <View style={s.row}>
        <Text style={s.label}>Note</Text>
        <TextInput value={note} onChangeText={setNote} placeholder="Optional" style={s.input} />
      </View>
      <Pressable onPress={submit} style={s.primary}><Text style={s.primaryText}>Save</Text></Pressable>
    </KeyboardAvoidingView>
  );
}
