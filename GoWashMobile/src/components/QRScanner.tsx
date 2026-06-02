/**
 * Componente QRScanner - Escáner de códigos QR
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { BarCodeScanner, BarCodeScannerResult } from 'expo-barcode-scanner';
import { QRData } from '../types/qr';
import qrService from '../services/qrService';

interface QRScannerProps {
  onScanned: (data: QRData) => void;
  onError: (error: Error) => void;
  onCancel?: () => void;
}

export const QRScanner: React.FC<QRScannerProps> = ({
  onScanned,
  onError,
  onCancel,
}) => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const getBarCodeScannerPermissions = async () => {
      try {
        const { status } = await BarCodeScanner.requestPermissionsAsync();
        setHasPermission(status === 'granted');

        if (status !== 'granted') {
          Alert.alert(
            'Permiso denegado',
            'Se requiere acceso a la cámara para escanear códigos QR'
          );
        }
      } catch (error) {
        console.error('Error requesting camera permission:', error);
        setHasPermission(false);
        onError(
          error instanceof Error
            ? error
            : new Error('Error requesting camera permission')
        );
      }
    };

    getBarCodeScannerPermissions();
  }, [onError]);

  const handleBarCodeScanned = async (result: BarCodeScannerResult) => {
    if (scanned || isProcessing) {
      return;
    }

    try {
      setScanned(true);
      setIsProcessing(true);

      const qrCode = result.data;

      // Validar código QR
      if (!qrService.validateQRCode(qrCode)) {
        Alert.alert('Código inválido', 'El código QR no es válido');
        setScanned(false);
        setIsProcessing(false);
        return;
      }

      // Decodificar código QR
      const qrData = qrService.decodeQRCode(qrCode);

      // Llamar callback
      onScanned(qrData);
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Error scanning QR');
      Alert.alert('Error', 'Ocurrió un error al escanear el código QR');
      onError(err);
      setScanned(false);
      setIsProcessing(false);
    }
  };

  const handleRetry = () => {
    setScanned(false);
    setIsProcessing(false);
  };

  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#1E40AF" />
        <Text style={styles.loadingText}>Solicitando permisos de cámara...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <View style={styles.errorBox}>
          <Text style={styles.errorIcon}>❌</Text>
          <Text style={styles.errorTitle}>Permiso denegado</Text>
          <Text style={styles.errorMessage}>
            Se requiere acceso a la cámara para escanear códigos QR
          </Text>
          <TouchableOpacity style={styles.retryButton} onPress={onCancel}>
            <Text style={styles.retryButtonText}>Volver</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <BarCodeScanner
        onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Overlay */}
      <View style={styles.overlay}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>🔍 Escanea el código QR</Text>
        </View>

        {/* Scanner Frame */}
        <View style={styles.scannerFrame}>
          <View style={styles.corner} />
          <View style={[styles.corner, styles.cornerTopRight]} />
          <View style={[styles.corner, styles.cornerBottomLeft]} />
          <View style={[styles.corner, styles.cornerBottomRight]} />
        </View>

        {/* Instructions */}
        <View style={styles.instructions}>
          <Text style={styles.instructionsText}>
            Posiciona el código QR dentro del marco
          </Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          {scanned && (
            <View style={styles.processingBox}>
              <ActivityIndicator size="large" color="#FFFFFF" />
              <Text style={styles.processingText}>Procesando...</Text>
            </View>
          )}

          {!scanned && (
            <>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={onCancel}
              >
                <Text style={styles.cancelButtonText}>❌ CANCELAR</Text>
              </TouchableOpacity>
            </>
          )}

          {scanned && !isProcessing && (
            <TouchableOpacity
              style={styles.retryButton}
              onPress={handleRetry}
            >
              <Text style={styles.retryButtonText}>🔄 REINTENTAR</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginTop: 16,
  },
  errorBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    marginHorizontal: 16,
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  header: {
    paddingTop: 40,
    paddingBottom: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    width: '100%',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  scannerFrame: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: '#10B981',
    borderRadius: 12,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderColor: '#10B981',
    top: -2,
    left: -2,
  },
  cornerTopRight: {
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderLeftWidth: 0,
    top: -2,
    right: -2,
    left: 'auto',
  },
  cornerBottomLeft: {
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderTopWidth: 0,
    bottom: -2,
    left: -2,
    top: 'auto',
  },
  cornerBottomRight: {
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderTopWidth: 0,
    borderLeftWidth: 0,
    bottom: -2,
    right: -2,
    top: 'auto',
    left: 'auto',
  },
  instructions: {
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  instructionsText: {
    fontSize: 14,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  footer: {
    paddingBottom: 40,
    paddingHorizontal: 16,
    width: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    alignItems: 'center',
  },
  processingBox: {
    alignItems: 'center',
  },
  processingText: {
    color: '#FFFFFF',
    fontSize: 14,
    marginTop: 12,
  },
  cancelButton: {
    height: 48,
    backgroundColor: '#EF4444',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  retryButton: {
    height: 48,
    backgroundColor: '#1E40AF',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
