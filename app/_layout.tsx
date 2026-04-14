import { HeaderTitle } from '@react-navigation/elements';
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
      <Stack.Screen name="clientesDetails/[id]" options={{headerTitle: "Cliente"}}/>
      <Stack.Screen name="pets/novo" options={{headerTitle: "Cadastro de pet"}}/>
      <Stack.Screen name="petsDetails/[id]" options={{headerTitle: "Pet"}}/>
      <Stack.Screen name="petServices/vacinas/[id]" options={{headerTitle: "Cartão de vacinas"}}/>
      <Stack.Screen name="petServices/banhoTosa/[id]" options={{headerTitle: "Banho e Tosa"}}/>
    </Stack>
  );
}