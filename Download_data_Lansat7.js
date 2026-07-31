// ========================
// 0. Load Asset
// ========================
var sidoarjo = ee.FeatureCollection("projects/ee-ammuchlas145/assets/SDAnonLumpur");

// ========================
// 1. Masking Awan Landsat 7 L2
// ========================
function maskL7L2(image) {
  var qa = image.select('QA_PIXEL');
  var cloud = 1 << 5;
  var shadow = 1 << 3;

  var mask = qa.bitwiseAnd(cloud).eq(0)
              .and(qa.bitwiseAnd(shadow).eq(0));

  return image.updateMask(mask);
}

// ========================
// 2. Parameter Data
// ========================
var startDate = '2006-01-01';
var endDate   = '2010-12-31';

// ========================
// 3. Load Landsat 7
// ========================
var l7 = ee.ImageCollection("LANDSAT/LE07/C02/T1_L2")
  .filterBounds(sidoarjo)
  .filterDate(startDate, endDate)
  .filter(ee.Filter.lt('CLOUD_COVER', 20))
  .map(maskL7L2);

// ========================
// 4. Komposit Median
// ========================
var composite = l7.median().clip(sidoarjo);

// Ambil band penting
var red     = composite.select('SR_B3');
var nir     = composite.select('SR_B4');
var swir    = composite.select('SR_B5'); // untuk NDBI
var thermal = composite.select('ST_B6');

// ========================
// 5. Visualisasi
// ========================
Map.centerObject(sidoarjo, 10);

// True Color
Map.addLayer(composite, {
  bands: ['SR_B3', 'SR_B2', 'SR_B1'],
  min: 0,
  max: 30000,
  gamma: 1.3
}, 'True Color');

// NIR composite (opsional)
Map.addLayer(composite, {
  bands: ['SR_B4', 'SR_B3', 'SR_B2'],
  min: 0,
  max: 30000
}, 'NIR-Red-Green');

// SWIR
Map.addLayer(swir, {
  min: 0,
  max: 30000,
  palette: ['black', 'brown', 'yellow']
}, 'SWIR (Band 5)');

// Thermal
Map.addLayer(thermal, {
  min: 13000,
  max: 16500,
  palette: ['blue', 'green', 'yellow', 'red']
}, 'Thermal (ST_B6)');

// ========================
// 6. Export ke Google Drive
// ========================
Export.image.toDrive({
  image: red,
  description: 'L7_Red_2010',
  folder: 'GEE_Landsat7',
  fileNamePrefix: 'L7_Red_2010',
  region: sidoarjo,
  scale: 30,
  crs: 'EPSG:4326',
  maxPixels: 1e13
});

Export.image.toDrive({
  image: nir,
  description: 'L7_NIR_2010',
  folder: 'GEE_Landsat7',
  fileNamePrefix: 'L7_NIR_2010',
  region: sidoarjo,
  scale: 30,
  crs: 'EPSG:4326',
  maxPixels: 1e13
});

Export.image.toDrive({
  image: swir,
  description: 'L7_SWIR_2010',
  folder: 'GEE_Landsat7',
  fileNamePrefix: 'L7_SWIR_2010',
  region: sidoarjo,
  scale: 30,
  crs: 'EPSG:4326',
  maxPixels: 1e13
});

Export.image.toDrive({
  image: thermal,
  description: 'L7_Thermal_2010',
  folder: 'GEE_Landsat7',
  fileNamePrefix: 'L7_Thermal_2010',
  region: sidoarjo,
  scale: 30,
  crs: 'EPSG:4326',
  maxPixels: 1e13
});

// ========================
// 7. Info
// ========================
print('✅ Export siap: Red, NIR, SWIR, Thermal (Sidoarjo 2005)');