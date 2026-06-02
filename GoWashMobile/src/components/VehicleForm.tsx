/**
 * Componente VehicleForm - Formulario para ingreso de vehículos
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Vehicle, VehicleFormData, ServiceType, PaymentMethod } from '../types/vehicle';
import vehicleService from '../services/vehicleService';

interface VehicleFormProps {
  onSubmit: (data: VehicleFormData) => void;
  initialData?: Partial<Vehicle>;
  isLoading?: boolean;
}

const BRANDS = ['Toyota', 'Honda', 'Ford', 'Chevrolet', 'Nissan', 'BMW', 'Mercedes', 'Audi'];
const COLORS = ['Blanco', 'Negro', 'Gris', 'Rojo', 'Azul', 'Verde', 'Amarillo', 'Plateado'];
const SERVICES: ServiceType[] = ['basico', 'premium', 'completo', 'detailing'];
const PAYMENT_METHODS: PaymentMethod[] = ['efectivo', 'tarjeta', 'transferencia', 'cuenta'];

export const VehicleForm: React.FC<VehicleFormProps> = ({
  onSubmit,
  initialData,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState<Partial<VehicleFormData>>({
    placa: initialData?.placa || '',
    marca: initialData?.marca || '',
    modelo: initialData?.modelo || '',
    color: initialData?.color || '',
    cliente: initialData?.cliente || { nombre: '', telefono: '' },
    servicio: initialData?.servicio || 'basico',
    observaciones: initialData?.observaciones || '',
    formaPago: initialData?.formaPago || 'efectivo',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showBrandDropdown, setShowBrandDropdown] = useState(false);
  const [showColorDropdown, setShowColorDropdown] = useState(false);
  const [showServiceDropdown, setShowServiceDropdown] = useState(false);
  const [showPaymentDropdown, setShowPaymentDropdown] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Limpiar error del campo
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleClientChange = (field: 'nombre' | 'telefono', value: string) => {
    setFormData((prev) => ({
      ...prev,
      cliente: {
        ...prev.cliente,
        [field]: value,
      },
    }));
  };

  const handleSubmit = () => {
    try {
      // Validar datos
      const validation = vehicleService.validateVehicleData(formData);

      if (!validation.isValid) {
        setErrors(validation.errors);
        Alert.alert('Validación', 'Por favor completa todos los campos requeridos');
        return;
      }

      // Llamar callback
      onSubmit(formData as VehicleFormData);
    } catch (error) {
      Alert.alert('Error', 'Ocurrió un error al procesar el formulario');
      console.error('Form submission error:', error);
    }
  };

  const getServiceLabel = (service: ServiceType): string => {
    const labels: Record<ServiceType, string> = {
      basico: 'Básico',
      premium: 'Premium',
      completo: 'Completo',
      detailing: 'Detailing',
    };
    return labels[service];
  };

  const getPaymentLabel = (method: PaymentMethod): string => {
    const labels: Record<PaymentMethod, string> = {
      efectivo: 'Efectivo',
      tarjeta: 'Tarjeta',
      transferencia: 'Transferencia',
      cuenta: 'Cuenta',
    };
    return labels[method];
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Sección 1: Datos del Vehículo */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>1. Datos del Vehículo</Text>

        {/* Placa */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Placa *</Text>
          <TextInput
            style={[styles.input, errors.placa && styles.inputError]}
            placeholder="Ej: AB123CD"
            value={formData.placa}
            onChangeText={(value) => handleInputChange('placa', value.toUpperCase())}
            editable={!isLoading}
            maxLength={8}
          />
          {errors.placa && <Text style={styles.errorText}>{errors.placa}</Text>}
        </View>

        {/* Marca */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Marca *</Text>
          <TouchableOpacity
            style={[styles.dropdown, errors.marca && styles.inputError]}
            onPress={() => setShowBrandDropdown(!showBrandDropdown)}
            disabled={isLoading}
          >
            <Text style={styles.dropdownText}>
              {formData.marca || 'Selecciona marca'}
            </Text>
            <Text style={styles.dropdownArrow}>▼</Text>
          </TouchableOpacity>
          {showBrandDropdown && (
            <View style={styles.dropdownMenu}>
              {BRANDS.map((brand) => (
                <TouchableOpacity
                  key={brand}
                  style={styles.dropdownItem}
                  onPress={() => {
                    handleInputChange('marca', brand);
                    setShowBrandDropdown(false);
                  }}
                >
                  <Text style={styles.dropdownItemText}>{brand}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
          {errors.marca && <Text style={styles.errorText}>{errors.marca}</Text>}
        </View>

        {/* Modelo */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Modelo *</Text>
          <TextInput
            style={[styles.input, errors.modelo && styles.inputError]}
            placeholder="Ej: Corolla"
            value={formData.modelo}
            onChangeText={(value) => handleInputChange('modelo', value)}
            editable={!isLoading}
          />
          {errors.modelo && <Text style={styles.errorText}>{errors.modelo}</Text>}
        </View>

        {/* Color */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Color *</Text>
          <TouchableOpacity
            style={[styles.dropdown, errors.color && styles.inputError]}
            onPress={() => setShowColorDropdown(!showColorDropdown)}
            disabled={isLoading}
          >
            <Text style={styles.dropdownText}>
              {formData.color || 'Selecciona color'}
            </Text>
            <Text style={styles.dropdownArrow}>▼</Text>
          </TouchableOpacity>
          {showColorDropdown && (
            <View style={styles.dropdownMenu}>
              {COLORS.map((color) => (
                <TouchableOpacity
                  key={color}
                  style={styles.dropdownItem}
                  onPress={() => {
                    handleInputChange('color', color);
                    setShowColorDropdown(false);
                  }}
                >
                  <Text style={styles.dropdownItemText}>{color}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
          {errors.color && <Text style={styles.errorText}>{errors.color}</Text>}
        </View>
      </View>

      {/* Sección 2: Cliente */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>2. Cliente</Text>

        {/* Nombre */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Nombre *</Text>
          <TextInput
            style={[styles.input, errors.cliente && styles.inputError]}
            placeholder="Ej: Juan Pérez"
            value={formData.cliente?.nombre}
            onChangeText={(value) => handleClientChange('nombre', value)}
            editable={!isLoading}
          />
          {errors.cliente && <Text style={styles.errorText}>{errors.cliente}</Text>}
        </View>

        {/* Teléfono */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Teléfono</Text>
          <TextInput
            style={styles.input}
            placeholder="Ej: +1 2258-6789"
            value={formData.cliente?.telefono}
            onChangeText={(value) => handleClientChange('telefono', value)}
            editable={!isLoading}
            keyboardType="phone-pad"
          />
        </View>
      </View>

      {/* Sección 3: Servicio */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>3. Servicio</Text>

        <TouchableOpacity
          style={[styles.dropdown, errors.servicio && styles.inputError]}
          onPress={() => setShowServiceDropdown(!showServiceDropdown)}
          disabled={isLoading}
        >
          <Text style={styles.dropdownText}>
            {getServiceLabel(formData.servicio as ServiceType)}
          </Text>
          <Text style={styles.dropdownArrow}>▼</Text>
        </TouchableOpacity>
        {showServiceDropdown && (
          <View style={styles.dropdownMenu}>
            {SERVICES.map((service) => (
              <TouchableOpacity
                key={service}
                style={styles.dropdownItem}
                onPress={() => {
                  handleInputChange('servicio', service);
                  setShowServiceDropdown(false);
                }}
              >
                <Text style={styles.dropdownItemText}>{getServiceLabel(service)}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
        {errors.servicio && <Text style={styles.errorText}>{errors.servicio}</Text>}
      </View>

      {/* Sección 4: Observaciones */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>4. Observaciones</Text>

        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Ej: No reparar interior..."
          value={formData.observaciones}
          onChangeText={(value) => handleInputChange('observaciones', value)}
          editable={!isLoading}
          multiline
          numberOfLines={4}
        />
      </View>

      {/* Sección 5: Forma de Pago */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>5. Forma de Pago</Text>

        <TouchableOpacity
          style={[styles.dropdown, errors.formaPago && styles.inputError]}
          onPress={() => setShowPaymentDropdown(!showPaymentDropdown)}
          disabled={isLoading}
        >
          <Text style={styles.dropdownText}>
            {getPaymentLabel(formData.formaPago as PaymentMethod)}
          </Text>
          <Text style={styles.dropdownArrow}>▼</Text>
        </TouchableOpacity>
        {showPaymentDropdown && (
          <View style={styles.dropdownMenu}>
            {PAYMENT_METHODS.map((method) => (
              <TouchableOpacity
                key={method}
                style={styles.dropdownItem}
                onPress={() => {
                  handleInputChange('formaPago', method);
                  setShowPaymentDropdown(false);
                }}
              >
                <Text style={styles.dropdownItemText}>{getPaymentLabel(method)}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
        {errors.formaPago && <Text style={styles.errorText}>{errors.formaPago}</Text>}
      </View>

      {/* Botón Submit */}
      <TouchableOpacity
        style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
        onPress={handleSubmit}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <>
            <Text style={styles.submitButtonText}>🔵 GENERAR QR E INGRESAR</Text>
          </>
        )}
      </TouchableOpacity>

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
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
    marginBottom: 8,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    color: '#1F2937',
    backgroundColor: '#FFFFFF',
  },
  inputError: {
    borderColor: '#EF4444',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  dropdown: {
    height: 48,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  dropdownText: {
    fontSize: 16,
    color: '#1F2937',
    flex: 1,
  },
  dropdownArrow: {
    fontSize: 12,
    color: '#6B7280',
  },
  dropdownMenu: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    marginTop: 4,
    backgroundColor: '#FFFFFF',
    maxHeight: 200,
  },
  dropdownItem: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  dropdownItemText: {
    fontSize: 14,
    color: '#1F2937',
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 4,
  },
  submitButton: {
    height: 48,
    backgroundColor: '#1E40AF',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  spacer: {
    height: 32,
  },
});
