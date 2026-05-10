import { Modal, View, Text, TouchableOpacity, StyleSheet } from "react-native"

type Props = {
    visible: boolean
    mensagem: string
    onClose: () => void
}

export default function MessageModal({
    visible,
    mensagem,
    onClose
}: Props){

    return(
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
        >
            <View style={styles.overlay}>
                
                <View style={styles.container}>

                    <Text style={styles.title}>
                        {mensagem}
                    </Text>

                    <TouchableOpacity
                        style={styles.button}
                        onPress={onClose}
                    >
                        <Text>Ok</Text>
                    </TouchableOpacity>

                </View>

            </View>

        </Modal>
    )
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "center",
        alignItems: "center"
    },

    container: {
        width: 260,
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 16
    },

    title: {
        fontSize: 16,
        fontWeight: "bold",
        marginBottom: 10
    },

    button: {
        padding: 12
    }
})