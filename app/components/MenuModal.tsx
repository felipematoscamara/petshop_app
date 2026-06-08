import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TouchableWithoutFeedback
} from 'react-native'

interface MenuOption {
  label: string;
  onPress: () => void;
  isDanger?: boolean;
}

interface MenuModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  options: MenuOption[];
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
        <View style={styles.overlay}>
          
          <TouchableWithoutFeedback>
            <View style={styles.card}>

              <Text style={styles.title}>
                {title}
              </Text>

              <View style={styles.divider} />

              {options.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.option,
                    item.isDanger && styles.optionDanger
                  ]}
                  onPress={() => {
                    item.onPress()
                    onClose()
                  }}
                >
                  <Text
                    style={[
                      styles.optionText,
                      item.isDanger && styles.optionTextDanger
                    ]}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}

              <TouchableOpacity
                style={styles.cancelButton}
                onPress={onClose}
              >
                <Text style={styles.cancelText}>
                  Cancelar
                </Text>
              </TouchableOpacity>

            </View>
          </TouchableWithoutFeedback>

        </View>
      </TouchableWithoutFeedback>
    </Modal>
  )
}

const Colors = {
  bg: '#FFFFFF',
  bgSecundario: '#F8FAFC',
  textPrincipal: '#1E293B',
  textSecundario: '#64748B',
  border: '#E2E8F0',
  danger: '#EF4444',
}

const styles = StyleSheet.create({

  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  card: {
    width: '85%',
    backgroundColor: Colors.bg,
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 16,

    borderWidth: 1,
    borderColor: Colors.border,

    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 5,
  },

  title: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrincipal,
    textAlign: 'center',
    marginBottom: 12,
  },

  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginBottom: 10,
  },

  option: {
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: Colors.bgSecundario,
    marginBottom: 10,
    alignItems: 'center',
  },

  optionText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textPrincipal,
  },

  optionDanger: {
    backgroundColor: '#FEE2E2',
  },

  optionTextDanger: {
    color: Colors.danger,
  },

  cancelButton: {
    marginTop: 6,
    paddingVertical: 12,
    alignItems: 'center',
  },

  cancelText: {
    color: Colors.textSecundario,
    fontWeight: '600',
  },
})

export default MenuModal