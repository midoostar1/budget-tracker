import { Link, useFocusEffect } from 'expo-router';
import React from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';

type Transaction = {
  id: string;
  amount: string;
  currency: string;
  categoryId: string;
  note?: string;
  occurredAt: string;
};

type ListResponse = { items: Transaction[]; nextCursor: string | null };

export default function Index() {
  const [items, setItems] = React.useState<Transaction[]>([]);
  const [cursor, setCursor] = React.useState<string | null>(null);

  const load = React.useCallback(async (reset = false) => {
    const url = new URL(`${API_URL}/transactions`);
    url.searchParams.set('limit', '20');
    if (!reset && cursor) url.searchParams.set('cursor', cursor);
    const res = await fetch(url);
    const data = (await res.json()) as ListResponse;
    setItems(prev => (reset ? data.items : [...prev, ...data.items]));
    setCursor(data.nextCursor);
  }, [cursor]);

  useFocusEffect(React.useCallback(() => {
    setItems([]);
    setCursor(null);
    load(true);
  }, [load]));

  return (
    <View style={styles.container}>
      <FlatList
        data={items}
        keyExtractor={(it) => it.id}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Text style={styles.amount}>{item.amount} {item.currency}</Text>
            <Text numberOfLines={1} style={styles.note}>{item.note ?? ''}</Text>
            <Text style={styles.date}>{new Date(item.occurredAt).toLocaleDateString()}</Text>
          </View>
        )}
        onEndReached={() => cursor && load()}
      />
      <Link href="/add" asChild>
        <Pressable style={styles.fab}><Text style={styles.fabText}>＋</Text></Pressable>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  row: { padding: 16, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: '#ccc' },
  amount: { fontSize: 16, fontWeight: '600' },
  note: { color: '#666', marginTop: 4 },
  date: { position: 'absolute', right: 16, top: 16, color: '#333' },
  fab: {
    position: 'absolute', bottom: 24, right: 24, backgroundColor: '#111', paddingHorizontal: 18,
    paddingVertical: 10, borderRadius: 24
  },
  fabText: { color: 'white', fontSize: 24, lineHeight: 24 }
});
