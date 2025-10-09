import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Provider as PaperProvider, MD3LightTheme } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import TransactionsList from './src/screens/TransactionsList';
import AddTransaction from './src/screens/AddTransaction';
import CategoryPicker from './src/screens/CategoryPicker';

export type RootStackParamList = {
  TransactionsList: undefined;
  AddTransaction: { editId?: string };
  CategoryPicker: { onSelect: (categoryId: string) => void };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#6200EE',
    secondary: '#03DAC6',
  },
};

export default function App() {
  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <NavigationContainer>
          <Stack.Navigator
            initialRouteName="TransactionsList"
            screenOptions={{
              headerStyle: {
                backgroundColor: theme.colors.primary,
              },
              headerTintColor: '#fff',
              headerTitleStyle: {
                fontWeight: 'bold',
              },
            }}
          >
            <Stack.Screen
              name="TransactionsList"
              component={TransactionsList}
              options={{ title: 'Transactions' }}
            />
            <Stack.Screen
              name="AddTransaction"
              component={AddTransaction}
              options={{ title: 'Add Transaction' }}
            />
            <Stack.Screen
              name="CategoryPicker"
              component={CategoryPicker}
              options={{ title: 'Select Category' }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </PaperProvider>
    </SafeAreaProvider>
  );
}