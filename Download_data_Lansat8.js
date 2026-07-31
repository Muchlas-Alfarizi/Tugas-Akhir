// ========================
// 0. Load Asset
// ========================
var sidoarjo = ee.FeatureCollection("projects/ee-ammuchlas145/assets/SDAnonLumpur");

// ========================
// 1. Masking Awan Landsat 8 L2
// ========================
function maskL8L2(image) {
  var qa = image.select('QA_PIXEL');

  var cloud  = 1 << 5;
  var shadow = 1 << 3;

  var mask = qa.bitwiseAnd(cloud).eq(0)
              .and(qa.bitwiseAnd(shadow).eq(0));

  return image.updateMask(mask);
}

// ========================
// 2. Parameter Data
// ========================
var startDate = '2020-01-01';  
var endDate   = '2025-12-31';

// ========================
// 3. Load Landsat 8
// ========================
var l8 = ee.ImageCollection("LANDSAT/LC08/C02/T1_L2")
  .filterBounds(sidoarjo)
  .filterDate(startDate, endDate)
  .filter(ee.Filter.lt('CLOUD_COVER', 20))
  .map(maskL8L2);

// ========================
// 4. Komposit Median
// ========================
var composite = l8.median().clip(sidoarjo);

// Ambil band penting (SUDAH DISESUAIKAN)
var red     = composite.select('SR_B4');
var nir     = composite.select('SR_B5');
var swir    = composite.select('SR_B6');
var thermal = composite.select('ST_B10');

// ========================
// 5. Visualisasi
// ========================
Map.centerObject(sidoarjo, 10);

// True Color
Map.addLayer(composite, {
  bands: ['SR_B4', 'SR_B3', 'SR_B2'],
  min: 0,
  max: 30000,
  gamma: 1.3
}, 'True Color L8');

// NIR Composite
Map.addLayer(composite, {
  bands: ['SR_B5', 'SR_B4', 'SR_B3'],
  min: 0,
  max: 30000
}, 'NIR-Red-Green L8');

// SWIR
Map.addLayer(swir, {
  min: 0,
  max: 30000,
  palette: ['black', 'brown', 'yellow']
}, 'SWIR (Band 6)');

// Thermal
Map.addLayer(thermal, {
  min: 13000,
  max: 16500,
  palette: ['blue', 'green', 'yellow', 'red']
}, 'Thermal (ST_B10)');

// ========================
// 6. Export ke Drive
// ========================
Export.image.toDrive({
  image: red,
  description: 'L8_Red_2025',
  folder: 'GEE_Landsat8',
  fileNamePrefix: 'L8_Red_2025',
  region: sidoarjo,
  scale: 30,
  crs: 'EPSG:4326',
  maxPixels: 1e13
});

Export.image.toDrive({
  image: nir,
  description: 'L8_NIR_2025',
  folder: 'GEE_Landsat8',
  fileNamePrefix: 'L8_NIR_2025',
  region: sidoarjo,
  scale: 30,
  crs: 'EPSG:4326',
  maxPixels: 1e13
});

Export.image.toDrive({
  image: swir,
  description: 'L8_SWIR_2025',
  folder: 'GEE_Landsat8',
  fileNamePrefix: 'L8_SWIR_2025',
  region: sidoarjo,
  scale: 30,
  crs: 'EPSG:4326',
  maxPixels: 1e13
});

Export.image.toDrive({
  image: thermal,
  description: 'L8_Thermal_2025',
  folder: 'GEE_Landsat8',
  fileNamePrefix: 'L8_Thermal_2025',
  region: sidoarjo,
  scale: 30,
  crs: 'EPSG:4326',
  maxPixels: 1e13
});

// ========================
// 7. Info
// ========================
print('✅ Export siap: Red, NIR, SWIR, Thermal (Sidoarjo Landsat 8)');