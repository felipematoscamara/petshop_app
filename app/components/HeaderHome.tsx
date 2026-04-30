import { View, Text, StyleSheet} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

type Props = {
    titulo: string
}

export default function HeaderHome({titulo}: Props){
    return(

        <SafeAreaView style={styles.safe}>

            <View style={styles.header}>

                    <Text style={styles.titulo}>{titulo}</Text>
                
            </View>

        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    header:{
        height: 50,
        backgroundColor: "#015DAD",
        alignItems: "center",
        justifyContent: "center"
    },

    safe:{
        backgroundColor: "#015DAD"
    },

    titulo:{
        color: "#FFF",
        fontSize: 18,
        fontWeight: "bold"
    }
})