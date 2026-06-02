/**
 * Componente QRGenerator - Generador y visualizador de códigos QR
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Linking,
} from 'react-native';
import { Vehicle } from '../types/vehicle';

interface QRGeneratorProps {
  vehicleId: string;
  qrCode: string;
  vehicleData: Vehicle;
  onScan: () => void;
  onChangeTicket: () => void;
}

export const QRGenerator: React.FC<QRGeneratorProps> = ({
  vehicleId,
  qrCode,
  vehicleData,
  onScan,
  onChangeTicket,
}) => {
  const [isSharing, setIsSharing] = useState(false);

  const handleShareWhatsApp = async () => {
    try {
      setIsSharing(true);

      const message = `
🚗 *GoWash - Ticket de Ingreso*

*Vehículo #${vehicleId}*
📋 Placa: ${vehicleData.placa}
🚗 ${vehicleData.marca} ${vehicleData.modelo}
🎨 Color: ${vehicleData.color}

👤 Cliente: ${vehicleData.cliente.nombre}
🔧 Servicio: ${vehicleData.servicio}
💳 Pago: ${vehicleData.formaPago}

📅 Ingreso: ${vehicleData.fechaIngreso.toLocaleString()}

*Código QR: ${qrCode}*

¡Tu vehículo ha sido ingresado correctamente!
      `.trim();

      const phoneNumber = vehicleData.cliente.telefono.replace(/\D/g, '');
      const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

      const canOpen = await Linking.canOpenURL(whatsappUrl);

      if (canOpen) {
        await Linking.openURL(whatsappUrl);
      } else {
        Alert.alert('Error', 'WhatsApp no está instalado en tu dispositivo');
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo compartir por WhatsApp');
      console.error('WhatsApp share error:', error);
    } finally {
      setIsSharing(false);
    }
  };

  const getServiceLabel = (service: string): string => {
    const labels: Record<string, string> = {
      basico: 'Básico',
      premium: 'Premium',
      completo: 'Completo',
      detailing: 'Detailing',
    };
    return labels[service] || service;
  };

  const getPaymentLabel = (method: string): string => {
    const labels: Record<string, string> = {
      efectivo: 'Efectivo',
      tarjeta: 'Tarjeta',
      transferencia: 'Transferencia',
      cuenta: 'Cuenta',
    };
    return labels[method] || method;
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Confirmación */}
      <View style={styles.confirmationBox}>
        <Text style={styles.confirmationIcon}>✅</Text>
        <Text style={styles.confirmationTitle}>¡Vehículo Ingresado!</Text>
        <Text style={styles.confirmationSubtitle}>
          Código generado correctamente
        </Text>
      </View>

      {/* Datos del Vehículo */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Vehículo #{vehicleId}</Text>

        <View style={styles.vehicleCard}>
          <View style={styles.vehicleRow}>
            <Text style={styles.vehicleLabel}>🚗 Placa:</Text>
            <Text style={styles.vehicleValue}>{vehicleData.placa}</Text>
          </View>

          <View style={styles.vehicleRow}>
            <Text style={styles.vehicleLabel}>👤 Cliente:</Text>
            <Text style={styles.vehicleValue}>{vehicleData.cliente.nombre}</Text>
          </View>

          <View style={styles.vehicleRow}>
            <Text style={styles.vehicleLabel}>🔧 Servicio:</Text>
            <Text style={styles.vehicleValue}>
              {getServiceLabel(vehicleData.servicio)}
            </Text>
          </View>

          <View style={styles.vehicleRow}>
            <Text style={styles.vehicleLabel}>📅 Ingreso:</Text>
            <Text style={styles.vehicleValue}>
              {vehicleData.fechaIngreso.toLocaleString()}
            </Text>
          </View>

          {vehicleData.empleado && (
            <View style={styles.vehicleRow}>
              <Text style={styles.vehicleLabel}>👨‍💼 Empleado:</Text>
              <Text style={styles.vehicleValue}>{vehicleData.empleado}</Text>
            </View>
          )}
        </View>
      </View>

      {/* Código QR */}
      <View style={styles.section}>
        <View style={styles.qrContainer}>
          <View style={styles.qrBox}>
            <Text style={styles.qrPlaceholder}>📱 QR CODE</Text>
            <Text style={styles.qrCode}>{qrCode}</Text>
          </View>
        </View>
      </View>

      {/* Botones de Acción */}
      <View style={styles.section}>
        {/* Botón Escanear QR */}
        <TouchableOpacity style={styles.secondaryButton} onPress={onScan}>
          <Text style={styles.secondaryButtonText}>📱 ESCANEAR QR</Text>
        </TouchableOpacity>

        {/* Botón Cambiar Ticket */}
        <TouchableOpacity style={styles.tertiaryButton} onPress={onChangeTicket}>
          <Text style={styles.tertiaryButtonText}>🎫 CAMBIAR TICKET</Text>
        </TouchableOpacity>

        {/* Botón Compartir WhatsApp */}
        <TouchableOpacity
          style={[styles.whatsappButton, isSharing && styles.buttonDisabled]}
          onPress={handleShareWhatsApp}
          disabled={isSharing}
        >
          <Text style={styles.whatsappButtonText}>
            💬 COMPARTIR POR WHATSAPP
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.spacer} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  confirmationBox: {
    backgroundColor: '#D1FAE5',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
  },
  confirmationIcon: {
    fontSize: 40,
    marginBottom: 8,
  },
  confirmationTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#065F46',
    marginBottom: 4,
  },
  confirmationSubtitle: {
    fontSize: 14,
    color: '#047857',
  },
  section: {
    marginBottom: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  vehicleCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
  },
  vehicleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  vehicleLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  vehicleValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  qrContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  qrBox: {
    width: 200,
    height: 200,
    backgroundColor: '#F9FAFB',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qrPlaceholder: {
    fontSize: 24,
    marginBottom: 8,
  },
  qrCode: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E40AF',
    textAlign: 'center',
  },
  secondaryButton: {
    height: 48,
    backgroundColor: '#E5E7EB',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  tertiaryButton: {
    height: 48,
    backgroundColor: '#FEF3C7',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#FCD34D',
  },
  tertiaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#92400E',
  },
  whatsappButton: {
    height: 48,
    backgroundColor: '#25D366',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  whatsappButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  spacer: {
    height: 32,
  },
});
