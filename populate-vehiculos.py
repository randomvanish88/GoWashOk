#!/usr/bin/env python3
"""
Script para poblar la hoja PWA_Vehiculos en Google Sheets
con datos de vehículos e imágenes desde la carpeta local
"""

import os
import sys
from pathlib import Path

# Agregar la ruta del proyecto al path
PROJECT_ROOT = Path(__file__).parent
sys.path.insert(0, str(PROJECT_ROOT))

# Base de datos de categorías de precios y vehículos
CATEGORIAS = {
    '$25000 3Y5 PUERTAS': {
        'precio': 25000,
        'tamano': 'Pequeño',
        'categoria': '3-5 Puertas'
    },
    '$28.000   5 PUERTAS UTILITARIOS Y DEPORTIVOS': {
        'precio': 28000,
        'tamano': 'Mediano',
        'categoria': '5 Puertas'
    },
    '$30.000 SUV CHI Y MED': {
        'precio': 30000,
        'tamano': 'Mediano',
        'categoria': 'SUV Pequeño-Medio'
    },
    '$35.000 SUV GRANDES Y CAMIONETAS': {
        'precio': 35000,
        'tamano': 'Grande',
        'categoria': 'SUV Grande'
    },
    '$40.000 CAMIONETAS RAM Y MINIBAN': {
        'precio': 40000,
        'tamano': 'Grande',
        'categoria': 'Camioneta Premium'
    }
}

EXTENSIONES_VALIDAS = {'.jpg', '.jpeg', '.png', '.webp', '.avif', '.jfif'}
CARPETA_VEHICULOS = PROJECT_ROOT / 'vehiculos lavadero'

def obtener_vehiculos():
    """Extrae la lista de vehículos de las carpetas locales"""
    vehiculos = []
    
    for categoria_dir, categoria_info in CATEGORIAS.items():
        categoria_path = CARPETA_VEHICULOS / categoria_dir
        
        if not categoria_path.exists():
            print(f"⚠️  Carpeta no encontrada: {categoria_path}")
            continue
        
        # Leer todas las imágenes de la carpeta
        imagenes = []
        for archivo in categoria_path.iterdir():
            if archivo.is_file() and archivo.suffix.lower() in EXTENSIONES_VALIDAS:
                # Obtener el nombre del vehículo sin extensión
                nombre_vehiculo = archivo.stem.upper()
                # Ignorar archivos de categoría (que contienen el precio)
                if not nombre_vehiculo.startswith('$'):
                    imagenes.append({
                        'nombre': nombre_vehiculo,
                        'archivo': archivo.name,
                        'ruta': str(archivo.relative_to(PROJECT_ROOT))
                    })
        
        # Crear entrada para cada imagen
        for img in sorted(imagenes, key=lambda x: x['nombre']):
            vehiculos.append({
                'Marca': img['nombre'],
                'Modelo': categoria_info['categoria'],
                'Tamaño': categoria_info['tamano'],
                'Precio': categoria_info['precio'],
                'URL_Imagen': f"/vehiculos lavadero/{categoria_dir}/{img['archivo']}",
                'Ruta_Local': img['ruta']
            })
    
    return vehiculos

def mostrar_datos(vehiculos):
    """Muestra los datos en formato tabla"""
    print("\n" + "="*120)
    print(f"{'MARCA':<30} {'MODELO':<40} {'TAMAÑO':<15} {'PRECIO':>10} {'URL':<30}")
    print("="*120)
    
    for v in vehiculos[:10]:  # Mostrar primeros 10
        url = v['URL_Imagen'].replace('/vehiculos lavadero/', '')[:25]
        print(f"{v['Marca']:<30} {v['Modelo']:<40} {v['Tamaño']:<15} ${v['Precio']:>9,} {url:<30}")
    
    print(f"\n... y {len(vehiculos) - 10} vehículos más")
    print(f"\nTotal: {len(vehiculos)} vehículos")
    print("="*120 + "\n")

def generar_estructura_sheets(vehiculos):
    """Genera la estructura para insertar en Google Sheets"""
    # Encabezados
    headers = ['Marca', 'Modelo', 'Tamaño', 'Precio', 'URL_Imagen']
    
    # Datos
    rows = []
    for v in vehiculos:
        rows.append([
            v['Marca'],
            v['Modelo'],
            v['Tamaño'],
            str(v['Precio']),
            v['URL_Imagen']
        ])
    
    return headers, rows

def main():
    print("\n🔍 Leyendo vehículos desde carpetas locales...\n")
    
    vehiculos = obtener_vehiculos()
    
    if not vehiculos:
        print("❌ No se encontraron vehículos")
        sys.exit(1)
    
    print(f"✅ Se encontraron {len(vehiculos)} vehículos\n")
    
    mostrar_datos(vehiculos)
    
    # Generar estructura para Google Sheets
    headers, rows = generar_estructura_sheets(vehiculos)
    
    print("📊 Estructura para Google Sheets:")
    print(f"Encabezados: {headers}")
    print(f"Filas: {len(rows)}")
    print(f"\nPrimera fila ejemplo:")
    print(f"  {rows[0]}")
    
    # Guardar como JSON para usar en otro script
    import json
    output_file = PROJECT_ROOT / 'vehiculos-data.json'
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump({
            'headers': headers,
            'rows': rows,
            'total': len(rows)
        }, f, ensure_ascii=False, indent=2)
    
    print(f"\n✅ Datos guardados en: {output_file}")
    print("\n💡 Ahora necesitas:")
    print("   1. Copiar estos datos a tu Google Sheet (pestaña PWA_Vehiculos)")
    print("   2. O usar la API de Google Sheets para insertarlos automáticamente")

if __name__ == '__main__':
    main()
