// Base de datos de vehículos del mercado chileno
// Fuente: ANAC Chile + SII + catálogos de fabricantes para mercado CL
// Última actualización: 2026 — incluye marcas chinas, europeas y nicho

export interface ModelInfo {
  yearFrom: number
  yearTo:   number
  engines:  string[]
  bodyType: string
}

export const VEHICLE_DB: Record<string, Record<string, ModelInfo>> = {

  // ── MARCAS MÁS VENDIDAS EN CHILE ─────────────────────────────────────

  Toyota: {
    'Yaris':          { yearFrom: 2006, yearTo: 2024, engines: ['1.3L','1.5L'],              bodyType: 'Hatchback/Sedan' },
    'Corolla':        { yearFrom: 2000, yearTo: 2024, engines: ['1.6L','1.8L','2.0L'],        bodyType: 'Sedan' },
    'Hilux':          { yearFrom: 2005, yearTo: 2024, engines: ['2.5D','2.7L','2.8D'],        bodyType: 'Pickup' },
    'RAV4':           { yearFrom: 2006, yearTo: 2024, engines: ['2.0L','2.5L','2.5H'],        bodyType: 'SUV' },
    'Land Cruiser':   { yearFrom: 2008, yearTo: 2024, engines: ['4.0L','4.5D'],              bodyType: 'SUV' },
    'Fortuner':       { yearFrom: 2016, yearTo: 2024, engines: ['2.4D','2.8D'],              bodyType: 'SUV' },
    'Prado':          { yearFrom: 2010, yearTo: 2024, engines: ['2.7L','3.0D','4.0L'],        bodyType: 'SUV' },
    'C-HR':           { yearFrom: 2017, yearTo: 2024, engines: ['1.2T','1.8H'],              bodyType: 'SUV' },
    'Camry':          { yearFrom: 2012, yearTo: 2024, engines: ['2.5L','2.5H'],              bodyType: 'Sedan' },
    'Corolla Cross':  { yearFrom: 2021, yearTo: 2024, engines: ['2.0L','1.8H'],              bodyType: 'SUV' },
    'SW4':            { yearFrom: 2006, yearTo: 2024, engines: ['2.7L','2.8D'],              bodyType: 'SUV' },
    '4Runner':        { yearFrom: 2010, yearTo: 2024, engines: ['4.0L'],                     bodyType: 'SUV' },
    'Avanza':         { yearFrom: 2007, yearTo: 2020, engines: ['1.3L','1.5L'],              bodyType: 'Van' },
    'Rush':           { yearFrom: 2018, yearTo: 2024, engines: ['1.5L'],                     bodyType: 'SUV' },
  },

  Chevrolet: {
    'Spark':    { yearFrom: 2010, yearTo: 2024, engines: ['1.0L','1.2L'],              bodyType: 'Hatchback' },
    'Sail':     { yearFrom: 2011, yearTo: 2021, engines: ['1.4L','1.5L'],              bodyType: 'Sedan' },
    'Aveo':     { yearFrom: 2004, yearTo: 2015, engines: ['1.4L','1.6L'],              bodyType: 'Sedan/Hatchback' },
    'Captiva':  { yearFrom: 2007, yearTo: 2018, engines: ['2.0L','2.4L','2.0D'],      bodyType: 'SUV' },
    'Cruze':    { yearFrom: 2010, yearTo: 2020, engines: ['1.4T','1.8L','2.0D'],      bodyType: 'Sedan/Hatchback' },
    'Colorado': { yearFrom: 2012, yearTo: 2024, engines: ['2.5L','2.8D'],             bodyType: 'Pickup' },
    'Tracker':  { yearFrom: 2013, yearTo: 2024, engines: ['1.2T','1.4T','1.5T'],      bodyType: 'SUV' },
    'Onix':     { yearFrom: 2019, yearTo: 2024, engines: ['1.0T'],                    bodyType: 'Sedan/Hatchback' },
    'Groove':   { yearFrom: 2021, yearTo: 2024, engines: ['1.0T'],                    bodyType: 'SUV' },
    'Tahoe':    { yearFrom: 2007, yearTo: 2024, engines: ['5.3L','6.2L'],             bodyType: 'SUV' },
    'Blazer':   { yearFrom: 2019, yearTo: 2024, engines: ['2.0T','3.6L'],             bodyType: 'SUV' },
    'Montana':  { yearFrom: 2023, yearTo: 2024, engines: ['1.2T'],                    bodyType: 'Pickup' },
  },

  Kia: {
    'Morning':  { yearFrom: 2004, yearTo: 2024, engines: ['1.0L','1.2L'],             bodyType: 'Hatchback' },
    'Río':      { yearFrom: 2005, yearTo: 2024, engines: ['1.4L','1.6L'],             bodyType: 'Sedan/Hatchback' },
    'Cerato':   { yearFrom: 2009, yearTo: 2024, engines: ['1.6L','2.0L'],             bodyType: 'Sedan/Hatchback' },
    'Sportage': { yearFrom: 2005, yearTo: 2024, engines: ['2.0L','2.0D','1.6T'],      bodyType: 'SUV' },
    'Sorento':  { yearFrom: 2010, yearTo: 2024, engines: ['2.4L','2.2D','3.3L'],      bodyType: 'SUV' },
    'Stonic':   { yearFrom: 2017, yearTo: 2024, engines: ['1.4T','1.0T'],             bodyType: 'SUV' },
    'Seltos':   { yearFrom: 2020, yearTo: 2024, engines: ['1.4T','2.0L'],             bodyType: 'SUV' },
    'Picanto':  { yearFrom: 2004, yearTo: 2024, engines: ['1.0L','1.2L'],             bodyType: 'Hatchback' },
    'Carnival': { yearFrom: 2015, yearTo: 2024, engines: ['3.3L','2.2D'],             bodyType: 'Van' },
    'Niro':     { yearFrom: 2017, yearTo: 2024, engines: ['1.6H','EV'],               bodyType: 'SUV' },
    'EV6':      { yearFrom: 2022, yearTo: 2024, engines: ['EV'],                      bodyType: 'SUV' },
    'Soul':     { yearFrom: 2010, yearTo: 2024, engines: ['1.6L','2.0L'],             bodyType: 'Hatchback' },
  },

  Hyundai: {
    'Accent':       { yearFrom: 2000, yearTo: 2024, engines: ['1.4L','1.6L'],         bodyType: 'Sedan/Hatchback' },
    'Elantra':      { yearFrom: 2011, yearTo: 2024, engines: ['1.6L','2.0L'],         bodyType: 'Sedan' },
    'Tucson':       { yearFrom: 2004, yearTo: 2024, engines: ['2.0L','2.0D','1.6T'],  bodyType: 'SUV' },
    'Santa Fe':     { yearFrom: 2007, yearTo: 2024, engines: ['2.4L','2.2D','2.0T'],  bodyType: 'SUV' },
    'i10':          { yearFrom: 2009, yearTo: 2020, engines: ['1.0L','1.2L'],         bodyType: 'Hatchback' },
    'i20':          { yearFrom: 2009, yearTo: 2024, engines: ['1.2L','1.4L','1.0T'],  bodyType: 'Hatchback' },
    'Creta':        { yearFrom: 2015, yearTo: 2024, engines: ['1.4L','1.6L','2.0L'],  bodyType: 'SUV' },
    'Kona':         { yearFrom: 2018, yearTo: 2024, engines: ['2.0L','1.0T','EV'],    bodyType: 'SUV' },
    'Staria':       { yearFrom: 2021, yearTo: 2024, engines: ['3.5L','2.2D'],         bodyType: 'Van' },
    'Ioniq 5':      { yearFrom: 2022, yearTo: 2024, engines: ['EV'],                  bodyType: 'SUV' },
    'Ioniq 6':      { yearFrom: 2023, yearTo: 2024, engines: ['EV'],                  bodyType: 'Sedan' },
    'Grand i10':    { yearFrom: 2015, yearTo: 2022, engines: ['1.2L'],                bodyType: 'Sedan' },
    'Palisade':     { yearFrom: 2020, yearTo: 2024, engines: ['3.8L','2.2D'],         bodyType: 'SUV' },
  },

  // ── MARCAS CHINAS (muy presentes en Chile) ───────────────────────────

  Chery: {
    'Tiggo 2':     { yearFrom: 2017, yearTo: 2024, engines: ['1.5L','1.5T'],          bodyType: 'SUV' },
    'Tiggo 3':     { yearFrom: 2014, yearTo: 2020, engines: ['1.6L'],                 bodyType: 'SUV' },
    'Tiggo 4':     { yearFrom: 2019, yearTo: 2024, engines: ['1.5T'],                 bodyType: 'SUV' },
    'Tiggo 5':     { yearFrom: 2014, yearTo: 2018, engines: ['2.0L'],                 bodyType: 'SUV' },
    'Tiggo 5X':    { yearFrom: 2018, yearTo: 2024, engines: ['1.5T'],                 bodyType: 'SUV' },
    'Tiggo 7':     { yearFrom: 2019, yearTo: 2024, engines: ['1.5T','2.0T'],          bodyType: 'SUV' },
    'Tiggo 7 Pro': { yearFrom: 2021, yearTo: 2024, engines: ['1.5T'],                 bodyType: 'SUV' },
    'Tiggo 8':     { yearFrom: 2020, yearTo: 2024, engines: ['1.5T','2.0T'],          bodyType: 'SUV' },
    'Arrizo 5':    { yearFrom: 2016, yearTo: 2024, engines: ['1.5L','1.5T'],          bodyType: 'Sedan' },
    'Arrizo 6':    { yearFrom: 2019, yearTo: 2024, engines: ['1.5T'],                 bodyType: 'Sedan' },
  },

  Changan: {
    'CS35':       { yearFrom: 2013, yearTo: 2020, engines: ['1.6L'],                  bodyType: 'SUV' },
    'CS35 Plus':  { yearFrom: 2020, yearTo: 2024, engines: ['1.4T'],                  bodyType: 'SUV' },
    'CS55':       { yearFrom: 2018, yearTo: 2024, engines: ['1.5T'],                  bodyType: 'SUV' },
    'CS75':       { yearFrom: 2017, yearTo: 2024, engines: ['2.0T','1.5T'],           bodyType: 'SUV' },
    'CS75 Plus':  { yearFrom: 2020, yearTo: 2024, engines: ['1.5T','2.0T'],           bodyType: 'SUV' },
    'Hunter':     { yearFrom: 2021, yearTo: 2024, engines: ['2.0T'],                  bodyType: 'Pickup' },
    'Alsvin':     { yearFrom: 2020, yearTo: 2024, engines: ['1.4T'],                  bodyType: 'Sedan' },
    'EADO':       { yearFrom: 2017, yearTo: 2022, engines: ['1.4T','1.6L'],           bodyType: 'Sedan' },
    'CS15':       { yearFrom: 2016, yearTo: 2020, engines: ['1.5L'],                  bodyType: 'SUV' },
    'UNI-T':      { yearFrom: 2021, yearTo: 2024, engines: ['1.5T'],                  bodyType: 'SUV' },
  },

  MG: {
    'ZS':       { yearFrom: 2019, yearTo: 2024, engines: ['1.5L','1.5T','EV'],        bodyType: 'SUV' },
    'HS':       { yearFrom: 2019, yearTo: 2024, engines: ['1.5T','2.0T'],             bodyType: 'SUV' },
    'MG3':      { yearFrom: 2013, yearTo: 2019, engines: ['1.5L'],                    bodyType: 'Hatchback' },
    'MG5':      { yearFrom: 2021, yearTo: 2024, engines: ['1.5T','EV'],               bodyType: 'Sedan' },
    'RX5':      { yearFrom: 2020, yearTo: 2024, engines: ['2.0T'],                    bodyType: 'SUV' },
    'Extender':  { yearFrom: 2020, yearTo: 2024, engines: ['2.0T'],                   bodyType: 'Pickup' },
    'MG4':      { yearFrom: 2023, yearTo: 2024, engines: ['EV'],                      bodyType: 'Hatchback' },
    'Marvel R': { yearFrom: 2022, yearTo: 2024, engines: ['EV'],                      bodyType: 'SUV' },
  },

  Haval: {
    'H1':     { yearFrom: 2014, yearTo: 2020, engines: ['1.5L'],                      bodyType: 'SUV' },
    'H2':     { yearFrom: 2015, yearTo: 2020, engines: ['1.5T'],                      bodyType: 'SUV' },
    'H6':     { yearFrom: 2015, yearTo: 2024, engines: ['1.5T','2.0T'],               bodyType: 'SUV' },
    'Jolion': { yearFrom: 2020, yearTo: 2024, engines: ['1.5T'],                      bodyType: 'SUV' },
    'M6':     { yearFrom: 2020, yearTo: 2024, engines: ['1.5T'],                      bodyType: 'SUV' },
    'H9':     { yearFrom: 2021, yearTo: 2024, engines: ['2.0T'],                      bodyType: 'SUV' },
  },

  'GWM': {
    'Poer':    { yearFrom: 2020, yearTo: 2024, engines: ['2.0D'],                     bodyType: 'Pickup' },
    'Cannon':  { yearFrom: 2021, yearTo: 2024, engines: ['2.0T'],                     bodyType: 'Pickup' },
  },

  JAC: {
    'J4':   { yearFrom: 2015, yearTo: 2022, engines: ['1.5T'],                        bodyType: 'Sedan' },
    'J5':   { yearFrom: 2012, yearTo: 2018, engines: ['1.5L','1.8L'],                 bodyType: 'Sedan' },
    'S4':   { yearFrom: 2018, yearTo: 2023, engines: ['1.5T'],                        bodyType: 'SUV' },
    'T8':   { yearFrom: 2019, yearTo: 2024, engines: ['2.0T'],                        bodyType: 'Pickup' },
    'T6':   { yearFrom: 2017, yearTo: 2022, engines: ['1.9D','2.0T'],                 bodyType: 'Pickup' },
    'JS4':  { yearFrom: 2022, yearTo: 2024, engines: ['1.5T'],                        bodyType: 'SUV' },
  },

  DFSK: {
    'Fengon 5':   { yearFrom: 2019, yearTo: 2024, engines: ['1.5T'],                  bodyType: 'SUV' },
    'Fengon 580': { yearFrom: 2017, yearTo: 2022, engines: ['1.5T'],                  bodyType: 'SUV' },
    'Glory 500':  { yearFrom: 2020, yearTo: 2024, engines: ['1.5T'],                  bodyType: 'SUV' },
    'Glory 580':  { yearFrom: 2021, yearTo: 2024, engines: ['1.5T'],                  bodyType: 'SUV' },
    'C31 Van':    { yearFrom: 2015, yearTo: 2024, engines: ['1.3L'],                  bodyType: 'Van' },
    'C37 Van':    { yearFrom: 2017, yearTo: 2024, engines: ['1.3L'],                  bodyType: 'Van' },
  },

  BYD: {
    'F3':          { yearFrom: 2015, yearTo: 2019, engines: ['1.5L'],                 bodyType: 'Sedan' },
    'Song Pro':    { yearFrom: 2020, yearTo: 2023, engines: ['1.5T'],                 bodyType: 'SUV' },
    'Song Plus':   { yearFrom: 2022, yearTo: 2024, engines: ['1.5T','PHEV'],          bodyType: 'SUV' },
    'Yuan Plus':   { yearFrom: 2022, yearTo: 2024, engines: ['EV'],                   bodyType: 'SUV' },
    'Seal':        { yearFrom: 2023, yearTo: 2024, engines: ['EV'],                   bodyType: 'Sedan' },
    'Dolphin':     { yearFrom: 2022, yearTo: 2024, engines: ['EV'],                   bodyType: 'Hatchback' },
    'Destroyer 05':{ yearFrom: 2023, yearTo: 2024, engines: ['PHEV'],                 bodyType: 'Sedan' },
    'Han':         { yearFrom: 2022, yearTo: 2024, engines: ['EV','PHEV'],            bodyType: 'Sedan' },
    'Tang':        { yearFrom: 2022, yearTo: 2024, engines: ['EV','PHEV'],            bodyType: 'SUV' },
  },

  BAIC: {
    'X25': { yearFrom: 2016, yearTo: 2021, engines: ['1.5L'],                         bodyType: 'SUV' },
    'X35': { yearFrom: 2018, yearTo: 2023, engines: ['1.5T'],                         bodyType: 'SUV' },
    'X55': { yearFrom: 2018, yearTo: 2023, engines: ['1.5T'],                         bodyType: 'SUV' },
    'X7':  { yearFrom: 2020, yearTo: 2024, engines: ['1.5T'],                         bodyType: 'SUV' },
  },

  Geely: {
    'Emgrand X7': { yearFrom: 2015, yearTo: 2020, engines: ['2.0L'],                  bodyType: 'SUV' },
    'Coolray':    { yearFrom: 2019, yearTo: 2024, engines: ['1.5T'],                   bodyType: 'SUV' },
    'Monjaro':    { yearFrom: 2022, yearTo: 2024, engines: ['2.0T'],                   bodyType: 'SUV' },
    'GX3 Pro':    { yearFrom: 2021, yearTo: 2024, engines: ['1.5L'],                   bodyType: 'SUV' },
  },

  // ── JAPONESAS / COREANAS ─────────────────────────────────────────────

  Mazda: {
    '2':     { yearFrom: 2007, yearTo: 2024, engines: ['1.5L'],                       bodyType: 'Hatchback/Sedan' },
    '3':     { yearFrom: 2004, yearTo: 2024, engines: ['1.5L','2.0L','2.5L'],         bodyType: 'Sedan/Hatchback' },
    '6':     { yearFrom: 2007, yearTo: 2024, engines: ['2.0L','2.5L','2.2D'],         bodyType: 'Sedan' },
    'CX-3':  { yearFrom: 2015, yearTo: 2024, engines: ['1.5D','2.0L'],               bodyType: 'SUV' },
    'CX-5':  { yearFrom: 2012, yearTo: 2024, engines: ['2.0L','2.5L','2.2D'],         bodyType: 'SUV' },
    'CX-30': { yearFrom: 2019, yearTo: 2024, engines: ['2.0L','2.5T'],               bodyType: 'SUV' },
    'CX-9':  { yearFrom: 2009, yearTo: 2024, engines: ['2.5T','3.7L'],               bodyType: 'SUV' },
    'BT-50': { yearFrom: 2007, yearTo: 2024, engines: ['2.2D','3.2D'],               bodyType: 'Pickup' },
    'MX-5':  { yearFrom: 2005, yearTo: 2024, engines: ['1.5L','2.0L'],               bodyType: 'Convertible' },
  },

  Suzuki: {
    'Swift':        { yearFrom: 2005, yearTo: 2024, engines: ['1.2L','1.3L','1.4T'],  bodyType: 'Hatchback' },
    'Vitara':       { yearFrom: 2015, yearTo: 2024, engines: ['1.4T','1.6L','1.0T'],  bodyType: 'SUV' },
    'Grand Vitara': { yearFrom: 2005, yearTo: 2015, engines: ['2.0L','2.4L'],          bodyType: 'SUV' },
    'Jimny':        { yearFrom: 2019, yearTo: 2024, engines: ['1.5L'],                 bodyType: 'SUV' },
    'Alto':         { yearFrom: 2009, yearTo: 2020, engines: ['1.0L'],                 bodyType: 'Hatchback' },
    'S-Presso':     { yearFrom: 2020, yearTo: 2024, engines: ['1.0L'],                 bodyType: 'Hatchback' },
    'Ignis':        { yearFrom: 2017, yearTo: 2024, engines: ['1.2L'],                 bodyType: 'Hatchback' },
    'Baleno':       { yearFrom: 2016, yearTo: 2024, engines: ['1.2L','1.4L'],          bodyType: 'Hatchback' },
    'Ertiga':       { yearFrom: 2013, yearTo: 2024, engines: ['1.4L','1.5L'],          bodyType: 'Van' },
    'Fronx':        { yearFrom: 2023, yearTo: 2024, engines: ['1.2L','1.0T'],          bodyType: 'SUV' },
  },

  Nissan: {
    'March':    { yearFrom: 2010, yearTo: 2024, engines: ['1.2L','1.6L'],             bodyType: 'Hatchback' },
    'Tiida':    { yearFrom: 2007, yearTo: 2018, engines: ['1.6L','1.8L'],             bodyType: 'Sedan/Hatchback' },
    'Sentra':   { yearFrom: 2012, yearTo: 2024, engines: ['1.6L','1.8L','2.0L'],      bodyType: 'Sedan' },
    'X-Trail':  { yearFrom: 2007, yearTo: 2024, engines: ['2.0L','2.5L','2.0D'],      bodyType: 'SUV' },
    'Frontier': { yearFrom: 2008, yearTo: 2024, engines: ['2.5L','2.3D'],             bodyType: 'Pickup' },
    'Kicks':    { yearFrom: 2017, yearTo: 2024, engines: ['1.6L','1.6H'],             bodyType: 'SUV' },
    'Qashqai':  { yearFrom: 2007, yearTo: 2024, engines: ['1.2T','1.3T','1.5D'],      bodyType: 'SUV' },
    'Navara':   { yearFrom: 2008, yearTo: 2024, engines: ['2.3D','2.5D'],             bodyType: 'Pickup' },
    'Murano':   { yearFrom: 2009, yearTo: 2024, engines: ['3.5L'],                    bodyType: 'SUV' },
    'Patrol':   { yearFrom: 2010, yearTo: 2024, engines: ['5.6L'],                    bodyType: 'SUV' },
    'Versa':    { yearFrom: 2012, yearTo: 2024, engines: ['1.6L'],                    bodyType: 'Sedan' },
    'Leaf':     { yearFrom: 2015, yearTo: 2024, engines: ['EV'],                      bodyType: 'Hatchback' },
  },

  Honda: {
    'Fit':     { yearFrom: 2009, yearTo: 2022, engines: ['1.5L','1.5H'],              bodyType: 'Hatchback' },
    'City':    { yearFrom: 2009, yearTo: 2024, engines: ['1.5L'],                     bodyType: 'Sedan' },
    'Civic':   { yearFrom: 2006, yearTo: 2024, engines: ['1.5T','1.8L','2.0L'],       bodyType: 'Sedan/Hatchback' },
    'CR-V':    { yearFrom: 2007, yearTo: 2024, engines: ['1.5T','2.0L','2.4L'],       bodyType: 'SUV' },
    'HR-V':    { yearFrom: 2015, yearTo: 2024, engines: ['1.5L','1.8L'],              bodyType: 'SUV' },
    'WR-V':    { yearFrom: 2021, yearTo: 2024, engines: ['1.5L'],                     bodyType: 'SUV' },
    'Accord':  { yearFrom: 2008, yearTo: 2024, engines: ['2.0T','1.5T','2.4L'],       bodyType: 'Sedan' },
    'Pilot':   { yearFrom: 2009, yearTo: 2024, engines: ['3.5L'],                     bodyType: 'SUV' },
    'ZR-V':    { yearFrom: 2023, yearTo: 2024, engines: ['1.5T'],                     bodyType: 'SUV' },
  },

  Mitsubishi: {
    'Lancer':        { yearFrom: 2004, yearTo: 2018, engines: ['1.5L','1.6L','2.0L'], bodyType: 'Sedan' },
    'ASX':           { yearFrom: 2011, yearTo: 2024, engines: ['1.6L','2.0L'],         bodyType: 'SUV' },
    'Outlander':     { yearFrom: 2007, yearTo: 2024, engines: ['2.0L','2.4L','3.0L'],  bodyType: 'SUV' },
    'L200':          { yearFrom: 2006, yearTo: 2024, engines: ['2.4D','2.5D'],         bodyType: 'Pickup' },
    'Eclipse Cross': { yearFrom: 2018, yearTo: 2024, engines: ['1.5T','2.4H'],         bodyType: 'SUV' },
    'Montero':       { yearFrom: 2006, yearTo: 2020, engines: ['3.2D','3.5L'],         bodyType: 'SUV' },
    'Montero Sport': { yearFrom: 2016, yearTo: 2024, engines: ['2.4D','3.0L'],         bodyType: 'SUV' },
    'Galant':        { yearFrom: 2004, yearTo: 2012, engines: ['2.4L','3.8L'],         bodyType: 'Sedan' },
  },

  Subaru: {
    'Impreza':  { yearFrom: 2007, yearTo: 2024, engines: ['1.6L','2.0L'],             bodyType: 'Sedan/Hatchback' },
    'XV':       { yearFrom: 2012, yearTo: 2024, engines: ['2.0L','2.0H'],             bodyType: 'SUV' },
    'Forester': { yearFrom: 2002, yearTo: 2024, engines: ['2.0L','2.5L','2.0T'],      bodyType: 'SUV' },
    'Outback':  { yearFrom: 2005, yearTo: 2024, engines: ['2.5L','3.6L'],             bodyType: 'SUV' },
    'Legacy':   { yearFrom: 2005, yearTo: 2022, engines: ['2.5L','3.6L'],             bodyType: 'Sedan' },
    'BRZ':      { yearFrom: 2012, yearTo: 2024, engines: ['2.0L','2.4L'],             bodyType: 'Coupé' },
    'WRX':      { yearFrom: 2008, yearTo: 2024, engines: ['2.0T','2.4T'],             bodyType: 'Sedan' },
    'Crosstrek':{ yearFrom: 2018, yearTo: 2024, engines: ['2.0L'],                    bodyType: 'SUV' },
  },

  Isuzu: {
    'D-Max':   { yearFrom: 2004, yearTo: 2024, engines: ['2.5D','3.0D'],              bodyType: 'Pickup' },
    'MU-X':    { yearFrom: 2013, yearTo: 2024, engines: ['1.9D','3.0D'],              bodyType: 'SUV' },
    'NKR':     { yearFrom: 2000, yearTo: 2024, engines: ['3.0D'],                     bodyType: 'Camión' },
    'NLR':     { yearFrom: 2000, yearTo: 2024, engines: ['2.8D'],                     bodyType: 'Camión' },
  },

  SsangYong: {
    'Korando':     { yearFrom: 2013, yearTo: 2024, engines: ['2.0L','2.0D','1.5T'],   bodyType: 'SUV' },
    'Rexton':      { yearFrom: 2003, yearTo: 2024, engines: ['2.0D','2.2D','3.2L'],   bodyType: 'SUV' },
    'Tivoli':      { yearFrom: 2016, yearTo: 2024, engines: ['1.2T','1.5T'],          bodyType: 'SUV' },
    'Musso':       { yearFrom: 2018, yearTo: 2024, engines: ['2.2D'],                 bodyType: 'Pickup' },
    'Musso Grand': { yearFrom: 2019, yearTo: 2024, engines: ['2.2D'],                 bodyType: 'Pickup' },
    'Rodius':      { yearFrom: 2005, yearTo: 2018, engines: ['2.0D','2.7D'],          bodyType: 'Van' },
    'Actyon':      { yearFrom: 2007, yearTo: 2018, engines: ['2.0D','2.3L'],          bodyType: 'SUV' },
  },

  // ── EUROPEAS ─────────────────────────────────────────────────────────

  Volkswagen: {
    'Gol':    { yearFrom: 2005, yearTo: 2022, engines: ['1.0L','1.6L'],               bodyType: 'Hatchback' },
    'Polo':   { yearFrom: 2010, yearTo: 2024, engines: ['1.0T','1.2T','1.6L'],        bodyType: 'Sedan/Hatchback' },
    'Golf':   { yearFrom: 2009, yearTo: 2024, engines: ['1.2T','1.4T','2.0T','2.0D'], bodyType: 'Hatchback' },
    'Vento':  { yearFrom: 2014, yearTo: 2024, engines: ['1.2T','1.4T'],               bodyType: 'Sedan' },
    'Amarok': { yearFrom: 2010, yearTo: 2024, engines: ['2.0D','3.0D'],               bodyType: 'Pickup' },
    'Tiguan': { yearFrom: 2008, yearTo: 2024, engines: ['1.4T','2.0T','2.0D'],        bodyType: 'SUV' },
    'Virtus': { yearFrom: 2020, yearTo: 2024, engines: ['1.0T'],                      bodyType: 'Sedan' },
    'Touareg':{ yearFrom: 2007, yearTo: 2024, engines: ['3.0D','3.6L'],               bodyType: 'SUV' },
    'T-Cross':{ yearFrom: 2020, yearTo: 2024, engines: ['1.0T'],                      bodyType: 'SUV' },
    'Taos':   { yearFrom: 2022, yearTo: 2024, engines: ['1.4T'],                      bodyType: 'SUV' },
  },

  Renault: {
    'Sandero': { yearFrom: 2008, yearTo: 2024, engines: ['1.0T','1.6L'],              bodyType: 'Hatchback' },
    'Logan':   { yearFrom: 2007, yearTo: 2022, engines: ['1.6L'],                     bodyType: 'Sedan' },
    'Duster':  { yearFrom: 2012, yearTo: 2024, engines: ['1.6L','2.0L','1.5D'],       bodyType: 'SUV' },
    'Clio':    { yearFrom: 2008, yearTo: 2020, engines: ['1.2L','1.6L','0.9T'],       bodyType: 'Hatchback' },
    'Kwid':    { yearFrom: 2017, yearTo: 2024, engines: ['1.0L'],                     bodyType: 'Hatchback' },
    'Captur':  { yearFrom: 2014, yearTo: 2024, engines: ['0.9T','1.2T','1.3T'],       bodyType: 'SUV' },
    'Kangoo':  { yearFrom: 2008, yearTo: 2024, engines: ['1.6L','1.5D'],              bodyType: 'Van' },
    'Koleos':  { yearFrom: 2017, yearTo: 2024, engines: ['2.0L','2.0D'],              bodyType: 'SUV' },
    'Oroch':   { yearFrom: 2016, yearTo: 2024, engines: ['1.6L','2.0L'],              bodyType: 'Pickup' },
    'Stepway': { yearFrom: 2010, yearTo: 2024, engines: ['1.6L','1.0T'],              bodyType: 'Hatchback' },
  },

  Peugeot: {
    '208':  { yearFrom: 2012, yearTo: 2024, engines: ['1.0L','1.2T','1.6D'],          bodyType: 'Hatchback' },
    '308':  { yearFrom: 2008, yearTo: 2024, engines: ['1.2T','1.6T','1.5D'],          bodyType: 'Sedan/Hatchback' },
    '2008': { yearFrom: 2014, yearTo: 2024, engines: ['1.2T','1.5D'],                 bodyType: 'SUV' },
    '3008': { yearFrom: 2009, yearTo: 2024, engines: ['1.2T','1.6T','1.5D','1.6H'],   bodyType: 'SUV' },
    '5008': { yearFrom: 2018, yearTo: 2024, engines: ['1.2T','1.5D'],                 bodyType: 'SUV' },
    '408':  { yearFrom: 2022, yearTo: 2024, engines: ['1.2T','1.6H'],                 bodyType: 'Sedan/SUV' },
    '508':  { yearFrom: 2019, yearTo: 2024, engines: ['1.6T','1.5D'],                 bodyType: 'Sedan' },
    'Partner': { yearFrom: 2008, yearTo: 2024, engines: ['1.6L','1.5D'],              bodyType: 'Van' },
    'Expert':  { yearFrom: 2008, yearTo: 2024, engines: ['2.0D'],                     bodyType: 'Van' },
  },

  Citroën: {
    'C3':        { yearFrom: 2010, yearTo: 2024, engines: ['1.2T','1.5D','1.6L'],     bodyType: 'Hatchback' },
    'C4':        { yearFrom: 2005, yearTo: 2024, engines: ['1.2T','1.6T','1.5D'],     bodyType: 'Hatchback/Sedan' },
    'C4 Cactus': { yearFrom: 2015, yearTo: 2023, engines: ['1.2T','1.5D'],            bodyType: 'SUV' },
    'C5 Aircross':{ yearFrom: 2019, yearTo: 2024, engines: ['1.2T','1.5D','1.6H'],    bodyType: 'SUV' },
    'Berlingo':  { yearFrom: 2008, yearTo: 2024, engines: ['1.6L','1.5D'],            bodyType: 'Van' },
    'Jumpy':     { yearFrom: 2008, yearTo: 2024, engines: ['2.0D'],                   bodyType: 'Van' },
    'Jumper':    { yearFrom: 2003, yearTo: 2024, engines: ['2.0D','2.2D'],            bodyType: 'Furgón' },
    'C-Elysée':  { yearFrom: 2013, yearTo: 2020, engines: ['1.2T','1.6L'],            bodyType: 'Sedan' },
  },

  Ford: {
    'Fiesta':   { yearFrom: 2004, yearTo: 2019, engines: ['1.0T','1.4L','1.6L'],      bodyType: 'Hatchback/Sedan' },
    'Focus':    { yearFrom: 2007, yearTo: 2019, engines: ['1.5T','1.6L','2.0L'],      bodyType: 'Sedan/Hatchback' },
    'Ecosport': { yearFrom: 2013, yearTo: 2024, engines: ['1.5L','2.0L','1.0T'],      bodyType: 'SUV' },
    'Ranger':   { yearFrom: 2007, yearTo: 2024, engines: ['2.2D','3.2D','2.0D'],      bodyType: 'Pickup' },
    'Explorer': { yearFrom: 2010, yearTo: 2024, engines: ['2.0T','3.0H','3.5L'],      bodyType: 'SUV' },
    'Everest':  { yearFrom: 2015, yearTo: 2024, engines: ['2.0D','2.0T'],             bodyType: 'SUV' },
    'Maverick': { yearFrom: 2022, yearTo: 2024, engines: ['2.0D','2.5H'],             bodyType: 'Pickup' },
    'Bronco':   { yearFrom: 2022, yearTo: 2024, engines: ['2.3T','2.7T'],             bodyType: 'SUV' },
    'Territory':{ yearFrom: 2021, yearTo: 2024, engines: ['1.5T'],                    bodyType: 'SUV' },
    'F-150':    { yearFrom: 2010, yearTo: 2024, engines: ['2.7T','3.5T','5.0L'],      bodyType: 'Pickup' },
  },

  Fiat: {
    'Cronos':  { yearFrom: 2018, yearTo: 2024, engines: ['1.0T','1.3L'],              bodyType: 'Sedan' },
    'Argo':    { yearFrom: 2019, yearTo: 2024, engines: ['1.0T','1.3L'],              bodyType: 'Hatchback' },
    'Mobi':    { yearFrom: 2017, yearTo: 2022, engines: ['1.0L'],                     bodyType: 'Hatchback' },
    'Uno':     { yearFrom: 2010, yearTo: 2020, engines: ['1.4L'],                     bodyType: 'Hatchback' },
    '500X':    { yearFrom: 2015, yearTo: 2024, engines: ['1.4T','2.0D'],              bodyType: 'SUV' },
    'Toro':    { yearFrom: 2016, yearTo: 2024, engines: ['1.8L','2.0D'],              bodyType: 'Pickup' },
    'Ducato':  { yearFrom: 2000, yearTo: 2024, engines: ['2.0D','2.3D','3.0D'],       bodyType: 'Furgón' },
    'Pulse':   { yearFrom: 2022, yearTo: 2024, engines: ['1.0T'],                     bodyType: 'SUV' },
    'Fastback':{ yearFrom: 2022, yearTo: 2024, engines: ['1.3T'],                     bodyType: 'Sedan' },
  },

  Jeep: {
    'Renegade':      { yearFrom: 2015, yearTo: 2024, engines: ['1.4T','1.8L','2.0T'], bodyType: 'SUV' },
    'Compass':       { yearFrom: 2017, yearTo: 2024, engines: ['1.3T','2.4L'],         bodyType: 'SUV' },
    'Grand Cherokee':{ yearFrom: 2005, yearTo: 2024, engines: ['3.6L','5.7L','3.0D'],  bodyType: 'SUV' },
    'Wrangler':      { yearFrom: 2007, yearTo: 2024, engines: ['2.0T','3.6L'],         bodyType: 'SUV' },
    'Cherokee':      { yearFrom: 2014, yearTo: 2022, engines: ['2.4L','3.2L'],         bodyType: 'SUV' },
    'Gladiator':     { yearFrom: 2021, yearTo: 2024, engines: ['3.6L'],                bodyType: 'Pickup' },
    'Commander':     { yearFrom: 2022, yearTo: 2024, engines: ['1.3T','2.0T'],         bodyType: 'SUV' },
  },

  // ── PREMIUM / LUJO ───────────────────────────────────────────────────

  BMW: {
    '116i/118i': { yearFrom: 2005, yearTo: 2024, engines: ['1.5T','1.6T','2.0T'],     bodyType: 'Hatchback' },
    '320i/328i': { yearFrom: 2007, yearTo: 2024, engines: ['2.0T','3.0T'],            bodyType: 'Sedan' },
    '330i':      { yearFrom: 2016, yearTo: 2024, engines: ['2.0T'],                   bodyType: 'Sedan' },
    '520i/528i': { yearFrom: 2010, yearTo: 2024, engines: ['2.0T','3.0T'],            bodyType: 'Sedan' },
    '420i':      { yearFrom: 2013, yearTo: 2024, engines: ['2.0T'],                   bodyType: 'Coupé' },
    'X1':        { yearFrom: 2010, yearTo: 2024, engines: ['1.5T','2.0T'],            bodyType: 'SUV' },
    'X3':        { yearFrom: 2007, yearTo: 2024, engines: ['2.0T','3.0T'],            bodyType: 'SUV' },
    'X5':        { yearFrom: 2005, yearTo: 2024, engines: ['3.0T','3.0D','4.4T'],     bodyType: 'SUV' },
    'X6':        { yearFrom: 2008, yearTo: 2024, engines: ['3.0T','4.4T'],            bodyType: 'SUV' },
    'M3/M4':     { yearFrom: 2013, yearTo: 2024, engines: ['3.0T'],                   bodyType: 'Sedan/Coupé' },
  },

  'Mercedes-Benz': {
    'A200/A250': { yearFrom: 2013, yearTo: 2024, engines: ['1.3T','2.0T'],            bodyType: 'Hatchback' },
    'C200/C300': { yearFrom: 2007, yearTo: 2024, engines: ['1.5T','2.0T'],            bodyType: 'Sedan' },
    'E200/E300': { yearFrom: 2010, yearTo: 2024, engines: ['2.0T'],                   bodyType: 'Sedan' },
    'GLA':       { yearFrom: 2014, yearTo: 2024, engines: ['1.3T','2.0T'],            bodyType: 'SUV' },
    'GLC':       { yearFrom: 2015, yearTo: 2024, engines: ['2.0T','2.0D'],            bodyType: 'SUV' },
    'GLE':       { yearFrom: 2016, yearTo: 2024, engines: ['2.0T','3.0T'],            bodyType: 'SUV' },
    'Sprinter':  { yearFrom: 2000, yearTo: 2024, engines: ['2.1D','3.0D'],            bodyType: 'Furgón' },
    'Clase B':   { yearFrom: 2012, yearTo: 2020, engines: ['1.6T','2.0T'],            bodyType: 'Van' },
    'CLA':       { yearFrom: 2014, yearTo: 2024, engines: ['1.3T','2.0T'],            bodyType: 'Sedan' },
  },

  Audi: {
    'A1':  { yearFrom: 2010, yearTo: 2024, engines: ['1.0T','1.4T'],                  bodyType: 'Hatchback' },
    'A3':  { yearFrom: 2004, yearTo: 2024, engines: ['1.0T','1.4T','1.5T','2.0T'],    bodyType: 'Sedan/Hatchback' },
    'A4':  { yearFrom: 2005, yearTo: 2024, engines: ['1.8T','2.0T','2.0D'],           bodyType: 'Sedan' },
    'A6':  { yearFrom: 2005, yearTo: 2024, engines: ['2.0T','3.0T'],                  bodyType: 'Sedan' },
    'Q2':  { yearFrom: 2018, yearTo: 2024, engines: ['1.0T','1.4T'],                  bodyType: 'SUV' },
    'Q3':  { yearFrom: 2012, yearTo: 2024, engines: ['1.4T','2.0T'],                  bodyType: 'SUV' },
    'Q5':  { yearFrom: 2008, yearTo: 2024, engines: ['2.0T','2.0D'],                  bodyType: 'SUV' },
    'Q7':  { yearFrom: 2007, yearTo: 2024, engines: ['3.0T','3.0D'],                  bodyType: 'SUV' },
  },

  Volvo: {
    'XC40':  { yearFrom: 2018, yearTo: 2024, engines: ['1.5T','2.0T','EV'],           bodyType: 'SUV' },
    'XC60':  { yearFrom: 2008, yearTo: 2024, engines: ['2.0T','2.0D','T8H'],          bodyType: 'SUV' },
    'XC90':  { yearFrom: 2005, yearTo: 2024, engines: ['2.0T','2.0D','T8H'],          bodyType: 'SUV' },
    'S60':   { yearFrom: 2010, yearTo: 2024, engines: ['2.0T'],                        bodyType: 'Sedan' },
    'V40':   { yearFrom: 2012, yearTo: 2019, engines: ['1.5T','2.0T'],                bodyType: 'Hatchback' },
    'C40':   { yearFrom: 2022, yearTo: 2024, engines: ['EV'],                          bodyType: 'SUV' },
  },

  Skoda: {
    'Octavia': { yearFrom: 2004, yearTo: 2024, engines: ['1.0T','1.5T','2.0T','2.0D'], bodyType: 'Sedan/Wagon' },
    'Superb':  { yearFrom: 2010, yearTo: 2024, engines: ['1.5T','2.0T'],               bodyType: 'Sedan' },
    'Kodiaq':  { yearFrom: 2017, yearTo: 2024, engines: ['1.5T','2.0T','2.0D'],        bodyType: 'SUV' },
    'Karoq':   { yearFrom: 2018, yearTo: 2024, engines: ['1.0T','1.5T'],               bodyType: 'SUV' },
    'Fabia':   { yearFrom: 2005, yearTo: 2022, engines: ['1.0T','1.4L'],               bodyType: 'Hatchback' },
    'Kamiq':   { yearFrom: 2020, yearTo: 2024, engines: ['1.0T'],                      bodyType: 'SUV' },
  },

  // ── COMERCIALES / TRABAJO ─────────────────────────────────────────────

  'Mercedes-Benz Vans': {
    'Vito':   { yearFrom: 2003, yearTo: 2024, engines: ['1.6D','2.0D','2.1D'],        bodyType: 'Van' },
    'Viano':  { yearFrom: 2003, yearTo: 2014, engines: ['2.0D','3.0D'],               bodyType: 'Van' },
    'Citan':  { yearFrom: 2013, yearTo: 2024, engines: ['1.1D','1.5D'],               bodyType: 'Van' },
  },
}

// ── Helpers ──────────────────────────────────────────────────────────────

// Acepta tanto {make,model,yearFrom,yearTo} (mock/nuevo) como {marca,modelo,anios} (legacy Supabase)
export type FitmentEntry = {
  make?: string;    marca?: string
  model?: string;   modelo?: string
  yearFrom?: number; yearTo?: number
  anios?: string
}

function normalizeModel(make: string, model: string): string {
  const prefix = make.toLowerCase().trim() + ' '
  const m = model.toLowerCase().trim()
  return m.startsWith(prefix) ? model.slice(make.length + 1).trim() : model.trim()
}

function parseFitmentEntry(f: FitmentEntry): { make: string; model: string; yearFrom: number; yearTo: number } | null {
  const make  = (f.make  || f.marca  || '').trim()
  const model = (f.model || f.modelo || '').trim()
  if (!make || !model) return null

  let yearFrom = f.yearFrom ?? 0
  let yearTo   = f.yearTo   ?? 0

  if ((!yearFrom || !yearTo) && f.anios) {
    const anios = f.anios.replace('–', '-').replace(/\s/g, '')
    const range = anios.match(/^(\d{4})-(\d{4})$/)
    const single = anios.match(/^(\d{4})$/)
    yearFrom = range ? parseInt(range[1]) : single ? parseInt(single[1]) : 0
    yearTo   = range ? parseInt(range[2]) : yearFrom
  }

  if (!yearFrom || !yearTo) return null
  return { make, model, yearFrom, yearTo }
}

export function checkCompatibility(
  fitment: FitmentEntry[],
  selectedMake: string,
  selectedModel: string,
  selectedYear: number,
): 'compatible' | 'incompatible' | 'unknown' {
  if (!fitment || fitment.length === 0) return 'unknown'
  const selMake  = selectedMake.toLowerCase()
  const selModel = normalizeModel(selectedMake, selectedModel).toLowerCase()

  const parsed = fitment.map(parseFitmentEntry).filter(Boolean) as { make: string; model: string; yearFrom: number; yearTo: number }[]
  if (parsed.length === 0) return 'unknown'

  const match = parsed.some(f => {
    const fMake  = f.make.toLowerCase()
    const fModel = normalizeModel(f.make, f.model).toLowerCase()
    return (
      fMake === selMake &&
      (fModel === selModel || fModel.includes(selModel) || selModel.includes(fModel)) &&
      selectedYear >= f.yearFrom &&
      selectedYear <= f.yearTo
    )
  })
  return match ? 'compatible' : 'incompatible'
}

export function getAllMakes(): string[] {
  return Object.keys(VEHICLE_DB).sort()
}

export function getModels(make: string): string[] {
  return Object.keys(VEHICLE_DB[make] ?? {})
}

export function getYears(make: string, model: string): number[] {
  const info = VEHICLE_DB[make]?.[model]
  if (!info) return []
  const years: number[] = []
  for (let y = info.yearTo; y >= info.yearFrom; y--) years.push(y)
  return years
}

export function getEngines(make: string, model: string): string[] {
  return VEHICLE_DB[make]?.[model]?.engines ?? []
}
