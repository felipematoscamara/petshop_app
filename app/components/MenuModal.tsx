import React from 'react'
import { Modal, View, Text, TouchableOpacity, StyleSheet, TouchableWithoutFeedback } from 'react-native'

interface MenuOption {
  label: string;
  onPress: () => void
  isDanger?: boolean
}

interface MenuModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  options: MenuOption[]
}

const MenuModal = ({ visible, onClose, title, options }: MenuModalProps) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={stylesModal.overlay}>
          <TouchableWithoutFeedback>
            <View style={stylesModal.menu}>
              
              <Text style={stylesModal.title}>{title}</Text>

              {options.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={item.isDanger ? stylesModal.buttonDanger : stylesModal.button}
                  onPress={() => {
                    item.onPress();
                    onClose();
                  }}
                >
                  <Text style={{ color: item.isDanger ? "red" : "#000" }}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}

              <TouchableOpacity style={stylesModal.button} onPress={onClose}>
                <Text style={{ color: "#666", textAlign: 'center' }}>Cancelar</Text>
              </TouchableOpacity>

            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const stylesModal = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "center",
        alignItems: "center"
    },
    menu: {
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
    },
    buttonDanger: {
        padding: 12
    }
});

export default MenuModal