import { Stack } from 'expo-router';
//import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    /*<>
      <Stack screenOptions={{ headerShown: false }} />
      <StatusBar style="dark" />
    </>*/
    <Stack>
      <Stack.Screen name="index" options={{headerTitle: "Home"}}/>
      <Stack.Screen name="pets" options={{headerTitle: "Pets"}}/>
      <Stack.Screen name="clientes" options={{headerTitle: "Clientes"}}/>
      <Stack.Screen name="clientes/novo" options={{headerTitle: "Cadastro de cliente"}}/>
      <Stack.Screen name="components/ClienteIten" options={{headerTitle: "Cliente"}}/>
    </Stack>
  );
}