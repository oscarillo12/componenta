import { InventoryItem, Order, Desarmaduria } from './types'

export const mockDesarmaduras: Desarmaduria[] = [
  {
    id: '1', slug: 'flores', nombre: 'Desarmaduria Flores',
    tagline: 'Repuestos usados de calidad desde 1998',
    descripcion: 'Somos la desarmaduria con mayor trayectoria en Temuco. Especialistas en vehículos japoneses y coreanos. Más de 2.000 piezas en stock, atención personalizada y garantía en todos nuestros repuestos.',
    direccion: 'Av. Caupolicán 1287, Temuco', telefono: '+56452345678',
    distanciaKm: 0.8, piezasCompatibles: 4, rating: 4.8, reviewCount: 127,
    fundacion: 1998, horario: 'Lun–Vie 8:30–18:30 · Sáb 9:00–14:00',
    especialidades: ['Toyota', 'Hyundai', 'Kia', 'Suzuki'], color: '#16a34a', totalVentas: 843,
  },
  {
    id: '2', slug: 'repuestos-del-sur', nombre: 'Repuestos del Sur',
    tagline: 'Todo en motores y transmisiones',
    descripcion: 'Especialistas en motores completos, cajas de cambio y transmisiones. 15 años en el mercado de Temuco. Compramos y vendemos vehículos en desuso para piezas.',
    direccion: 'Los Carrera 456, Temuco', telefono: '+56453456789',
    distanciaKm: 2.3, piezasCompatibles: 2, rating: 4.5, reviewCount: 89,
    fundacion: 2009, horario: 'Lun–Vie 9:00–18:00 · Sáb 9:00–13:00',
    especialidades: ['Chevrolet', 'Ford', 'Volkswagen'], color: '#1d4ed8', totalVentas: 412,
  },
  {
    id: '3', slug: 'jd-repuestos', nombre: 'JD Repuestos Usados',
    tagline: 'Eléctrico y electrónico automotriz',
    descripcion: 'Expertos en sistemas eléctricos y electrónicos. ECUs, sensores, alternadores y todo lo relacionado con la parte eléctrica de tu vehículo. Diagnóstico computarizado sin costo.',
    direccion: 'Av. Balmaceda 890, Temuco', telefono: '+56454567890',
    distanciaKm: 3.7, piezasCompatibles: 3, rating: 4.2, reviewCount: 56,
    fundacion: 2015, horario: 'Lun–Vie 9:00–19:00 · Sáb 10:00–14:00',
    especialidades: ['Renault', 'Peugeot', 'Citroën'], color: '#7c3aed', totalVentas: 238,
  },
  {
    id: '4', slug: 'auto-partes-labranza', nombre: 'Auto Partes Labranza',
    tagline: 'Suspensión y carrocería especializada',
    descripcion: 'Especialistas en suspensión, carrocería y frenos. Mayor stock de amortiguadores y piezas de carrocería de la región. Servicio a domicilio disponible en Labranza y alrededores.',
    direccion: 'Ruta 5 Sur Km 12, Labranza', telefono: '+56455678901',
    distanciaKm: 8.4, piezasCompatibles: 1, rating: 4.0, reviewCount: 34,
    fundacion: 2018, horario: 'Lun–Vie 8:00–17:00 · Sáb cerrado',
    especialidades: ['Nissan', 'Mitsubishi', 'Honda'], color: '#b45309', totalVentas: 156,
  },
]

export const mockInventory: InventoryItem[] = [
  {
    id: '1', pieza: 'Bomba de agua completa', marca: 'Chevrolet', modelo: 'Spark / Sail / Aveo', anios: '2008-2018',
    oem: '25182341', estado: 'bueno', precio: 35000, publicado: '2026-06-15', disponible: true, vistas: 47,
    zona: 'motor', vendedorSlug: 'flores',
    fitment: [
      { make: 'Chevrolet', model: 'Spark', yearFrom: 2010, yearTo: 2018 },
      { make: 'Chevrolet', model: 'Sail',  yearFrom: 2011, yearTo: 2018 },
      { make: 'Chevrolet', model: 'Aveo',  yearFrom: 2008, yearTo: 2015 },
    ],
  },
  {
    id: '2', pieza: 'Alternador 70A remanufacturado', marca: 'Toyota', modelo: 'Yaris / Vios', anios: '2006-2013',
    oem: '27060-21050', estado: 'excelente', precio: 85000, publicado: '2026-06-18', disponible: true, vistas: 32,
    zona: 'electrico', vendedorSlug: 'flores',
    fitment: [
      { make: 'Toyota', model: 'Yaris', yearFrom: 2006, yearTo: 2013 },
    ],
  },
  {
    id: '3', pieza: 'Amortiguador delantero KYB equiv.', marca: 'Chevrolet', modelo: 'Spark', anios: '2010-2016',
    oem: null, estado: 'bueno', precio: 42000, publicado: '2026-06-20', disponible: true, vistas: 89,
    zona: 'suspension-d', vendedorSlug: 'flores',
    fitment: [
      { make: 'Chevrolet', model: 'Spark', yearFrom: 2010, yearTo: 2016 },
    ],
  },
  {
    id: '4', pieza: 'Caja de cambios mecánica 5 vel.', marca: 'Hyundai', modelo: 'Accent / i10', anios: '2011-2017',
    oem: null, estado: 'con-detalles', precio: 180000, publicado: '2026-06-10', disponible: true, vistas: 21,
    zona: 'transmision', vendedorSlug: 'repuestos-del-sur',
    fitment: [
      { make: 'Hyundai', model: 'Accent', yearFrom: 2011, yearTo: 2017 },
      { make: 'Hyundai', model: 'i10',    yearFrom: 2011, yearTo: 2017 },
    ],
  },
  {
    id: '5', pieza: 'Sensor MAP original', marca: 'Hyundai', modelo: 'Accent', anios: '2006-2011',
    oem: '39300-22600', estado: 'excelente', precio: 18000, publicado: '2026-06-22', disponible: true, vistas: 65,
    zona: 'electrico', vendedorSlug: 'flores',
    fitment: [
      { make: 'Hyundai', model: 'Accent', yearFrom: 2006, yearTo: 2011 },
    ],
  },
  {
    id: '6', pieza: 'Radiador completo aluminio', marca: 'Toyota', modelo: 'Corolla', anios: '2003-2008',
    oem: '16400-22080', estado: 'bueno', precio: 75000, publicado: '2026-06-05', disponible: true, vistas: 43,
    zona: 'motor', vendedorSlug: 'flores',
    fitment: [
      { make: 'Toyota', model: 'Corolla', yearFrom: 2003, yearTo: 2008 },
    ],
  },
  {
    id: '7', pieza: 'Palanca de cambios completa', marca: 'Suzuki', modelo: 'Swift', anios: '2005-2010',
    oem: null, estado: 'excelente', precio: 28000, publicado: '2026-06-25', disponible: true, vistas: 12,
    zona: 'interior', vendedorSlug: 'auto-partes-labranza',
    fitment: [
      { make: 'Suzuki', model: 'Swift', yearFrom: 2005, yearTo: 2010 },
    ],
  },
  {
    id: '8', pieza: 'Disco de freno delantero (par)', marca: 'Chevrolet', modelo: 'Aveo / Sail', anios: '2010-2020',
    oem: null, estado: 'bueno', precio: 38000, publicado: '2026-06-19', disponible: true, vistas: 56,
    zona: 'frenos', vendedorSlug: 'auto-partes-labranza',
    fitment: [
      { make: 'Chevrolet', model: 'Aveo', yearFrom: 2010, yearTo: 2015 },
      { make: 'Chevrolet', model: 'Sail', yearFrom: 2011, yearTo: 2020 },
    ],
  },
  {
    id: '9', pieza: 'Silenciador trasero inox.', marca: 'Kia', modelo: 'Morning / Picanto', anios: '2012-2017',
    oem: null, estado: 'con-detalles', precio: 22000, publicado: '2026-06-12', disponible: false, vistas: 38,
    zona: 'escape', vendedorSlug: 'auto-partes-labranza',
    fitment: [
      { make: 'Kia', model: 'Morning', yearFrom: 2012, yearTo: 2017 },
      { make: 'Kia', model: 'Picanto', yearFrom: 2012, yearTo: 2017 },
    ],
  },
  {
    id: '10', pieza: 'ECU / Módulo de control motor', marca: 'Renault', modelo: 'Sandero / Logan', anios: '2009-2015',
    oem: '8200706020', estado: 'bueno', precio: 55000, publicado: '2026-06-14', disponible: true, vistas: 29,
    zona: 'electrico', vendedorSlug: 'jd-repuestos',
    fitment: [
      { make: 'Renault', model: 'Sandero', yearFrom: 2009, yearTo: 2015 },
      { make: 'Renault', model: 'Logan',   yearFrom: 2009, yearTo: 2015 },
    ],
  },
  {
    id: '11', pieza: 'Amortiguador trasero (par)', marca: 'Toyota', modelo: 'Yaris', anios: '2006-2014',
    oem: null, estado: 'bueno', precio: 38000, publicado: '2026-06-21', disponible: true, vistas: 34,
    zona: 'suspension-t', vendedorSlug: 'flores',
    fitment: [
      { make: 'Toyota', model: 'Yaris', yearFrom: 2006, yearTo: 2014 },
    ],
  },
  {
    id: '12', pieza: 'Culata completa 1.6L', marca: 'Chevrolet', modelo: 'Sail', anios: '2012-2018',
    oem: null, estado: 'para-reparar', precio: 95000, publicado: '2026-06-08', disponible: true, vistas: 18,
    zona: 'motor', vendedorSlug: 'repuestos-del-sur',
    fitment: [
      { make: 'Chevrolet', model: 'Sail', yearFrom: 2012, yearTo: 2018 },
    ],
  },
  {
    id: '13', pieza: 'Motor completo 1.2L desmontado', marca: 'Chevrolet', modelo: 'Spark', anios: '2010-2016',
    oem: 'Z12XE', estado: 'bueno', precio: 320000, publicado: '2026-06-23', disponible: true, vistas: 112,
    zona: 'motor', vendedorSlug: 'repuestos-del-sur',
    fitment: [
      { make: 'Chevrolet', model: 'Spark', yearFrom: 2010, yearTo: 2016 },
    ],
  },
  {
    id: '14', pieza: 'Cárter de aceite + tapón', marca: 'Ford', modelo: 'Fiesta / Ecosport', anios: '2010-2017',
    oem: null, estado: 'excelente', precio: 28000, publicado: '2026-06-24', disponible: true, vistas: 19,
    zona: 'motor', vendedorSlug: 'repuestos-del-sur',
    fitment: [
      { make: 'Ford', model: 'Fiesta',   yearFrom: 2010, yearTo: 2017 },
      { make: 'Ford', model: 'Ecosport', yearFrom: 2013, yearTo: 2017 },
    ],
  },
  {
    id: '15', pieza: 'Faro delantero izquierdo OEM', marca: 'Peugeot', modelo: '208', anios: '2012-2019',
    oem: '9676083480', estado: 'excelente', precio: 45000, publicado: '2026-06-25', disponible: true, vistas: 67,
    zona: 'electrico', vendedorSlug: 'jd-repuestos',
    fitment: [
      { make: 'Peugeot', model: '208', yearFrom: 2012, yearTo: 2019 },
    ],
  },
  {
    id: '16', pieza: 'Sensor ABS rueda delantera', marca: 'Renault', modelo: 'Duster', anios: '2013-2020',
    oem: '479101290R', estado: 'excelente', precio: 22000, publicado: '2026-06-26', disponible: true, vistas: 41,
    zona: 'frenos', vendedorSlug: 'jd-repuestos',
    fitment: [
      { make: 'Renault', model: 'Duster', yearFrom: 2013, yearTo: 2020 },
    ],
  },
]

export const mockOrders: Order[] = [
  { id: 'ORD-001', pieza: 'Bomba de agua completa',  comprador: 'Carlos Mendoza',   region: 'Biobío',         precio: 35000,  envio: 8500, estado: 'pendiente',  fecha: '2026-06-27', telefono: '+56912345678' },
  { id: 'ORD-002', pieza: 'Sensor MAP',               comprador: 'Javiera Soto',     region: 'Metropolitana',  precio: 18000,  envio: 6000, estado: 'enviado',    fecha: '2026-06-25', telefono: '+56987654321' },
  { id: 'ORD-003', pieza: 'Amortiguador delantero',  comprador: 'Pablo Morales',    region: 'Los Lagos',      precio: 42000,  envio: 9500, estado: 'confirmado', fecha: '2026-06-26', telefono: '+56911223344' },
  { id: 'ORD-004', pieza: 'Alternador 70A',           comprador: 'Daniela Reyes',    region: 'Ñuble',          precio: 85000,  envio: 8500, estado: 'completado', fecha: '2026-06-20', telefono: '+56955443322' },
  { id: 'ORD-005', pieza: 'Disco de freno (par)',     comprador: 'Rodrigo Espinoza', region: 'La Araucanía',   precio: 38000,  envio: 5000, estado: 'pendiente',  fecha: '2026-06-28', telefono: '+56977889900' },
]

export const mockMetrics = {
  piezasPublicadas: 23, piezasDisponibles: 19, pedidosEsteMes: 8,
  ingresosMes: 347500, vistasEsteSemana: 312, tasaConversion: 3.2,
  rotacionPromedioDias: 4.2, pedidosPendientes: 2,
}
