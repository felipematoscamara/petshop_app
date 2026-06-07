import { useState } from "react"
import { Text, TouchableOpacity, StyleSheet, View } from "react-native"
import DateTimePicker from "@react-native-community/datetimepicker"

type Props = {
    placeholder?: string
    value: Date | null
    onChange: (date: Date) => void
    style?: any
}

export default function DateInput({
    value,
    onChange,
    placeholder,
    style
}: Props){

    const [mostrarPicker, setMostrarPicker] = useState(false)

    return(
        <View>
            <TouchableOpacity
                style={[styles.input, style]}
                onPress={() => setMostrarPicker(true)}
            >
                <Text
                    style={{
                        color: value ? "#1E293B" : "#64748B",
                        fontSize: 15
                    }}
                >
                    {value
                        ? value.toLocaleDateString('pt-BR')
                        : placeholder
                    }
                </Text>
            </TouchableOpacity>

            {mostrarPicker && (
                <DateTimePicker
                    value={value || new Date()}
                    mode="date"
                    display="default"
                    onChange={(event, selectDate) => {

                        if(event.type === "dismissed"){
                            setMostrarPicker(false)
                            return
                        }

                        if(selectDate){
                            onChange(selectDate)
                        }

                        setMostrarPicker(false)
                    }}
                />
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    input:{
        borderWidth: 1,
        borderColor: "#CCC",
        padding: 10,
        borderRadius: 6
    }
})