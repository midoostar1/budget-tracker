import { useRouter } from 'expo-router';
import React from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';

type Category = { id: string; name: string; icon: string };

enum LoadState { Idle, Loading, Loaded }

export default function Categories() {
  const router = useRouter();
  const [items, setItems] = React.useState<Category[]>([]);
  const [name, setName] = React.useState('');
  const [icon, setIcon] = React.useState('tag');
  const [state, setState] = React.useState<LoadState>(LoadState.Idle);

  const load = async () => {
    setState(LoadState.Loading);
    const res = await fetch(`${API_URL}/categories`);
    const data = await res.json();
    setItems(data.items);
    setState(LoadState.Loaded);
  };

  React.useEffect(() => { load(); }, []);

  const create = async () => {
    await fetch(`${API_URL}/categories`, {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ name, icon })
    });
    setName('');
    await load();
  };

  return (
    <View style={styles.container}>
      <View style={styles.addRow}>
        <TextInput value={name} onChangeText={setName} placeholder="New category" style={styles.input} />
        <TextInput value={icon} onChangeText={setIcon} placeholder="icon" style={[styles.input, { width: 90 }]} />
        <Pressable onPress={create} style={styles.addBtn}><Text style={{ color: 'white' }}>Add</Text></Pressable>
      </View>
      <FlatList
        data={items}
        keyExtractor={(it) => it.id}
        renderItem={({ item }) => (
          <Pressable style={styles.row} onPress={() => router.setParams({ category: item })}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.icon}>{item.icon}</Text>
          </Pressable>
        )}
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  addRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  input: { flex: 1, borderWidth: 1, borderColor: '#ccc', borderRadius: 10, padding: 10 },
  addBtn: { backgroundColor: '#111', paddingHorizontal: 12, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  row: { padding: 12, borderWidth: 1, borderColor: '#ddd', borderRadius: 10, flexDirection: 'row', justifyContent: 'space-between' },
  name: { fontSize: 16 },
  icon: { color: '#666' }
});
