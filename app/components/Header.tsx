import { View, Text, TouchableOpacity, StyleSheet} from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

type Props = {
    titulo: string
}

export default function Header({titulo}: Props){
    return(

        <SafeAreaView style={styles.safe}>

            <View style={styles.header}>

                <TouchableOpacity
                    onPress={() => router.back()}
                >
                    <Text style={styles.arrow}>🠔</Text>
                </TouchableOpacity>

                <Text style={styles.titulo}>
                    {titulo}
                </Text>

                <TouchableOpacity>
                    <Text style={styles.icon}>☰</Text>
                </TouchableOpacity>

            </View>

        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    header:{
        height: 50,
        backgroundColor: "#015DAD",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 15
    },

    safe:{
        backgroundColor: "#015DAD"
    },

    titulo:{
        color: "#FFF",
        fontSize: 18,
        fontWeight: "bold"
    },

    icon:{
        color: "#FFF",
        fontSize: 22
    },

    arrow:{
        color: "#FFF",
        fontSize: 30
    }
})