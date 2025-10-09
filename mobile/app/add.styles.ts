import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 12 },
  row: { gap: 6 },
  label: { color: '#555' },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 10, padding: 12, fontSize: 22 },
  keypad: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  key: { width: '23%', paddingVertical: 16, backgroundColor: '#111', borderRadius: 12, alignItems: 'center' },
  keyText: { color: 'white', fontSize: 20, fontWeight: '700' },
  hint: { color: '#777', textAlign: 'right' },
  primary: { marginTop: 'auto', backgroundColor: '#111', padding: 16, borderRadius: 12, alignItems: 'center' },
  primaryText: { color: 'white', fontWeight: '600', fontSize: 18 }
});
