// =====================================================
// MEMBERSHIP FUNCTION
// =====================================================

function triangle(x, a, b, c) {
  if (x <= a || x >= c) return 0;

  if (x === b) return 1;

  if (x < b) {
    return (x - a) / (b - a);
  }

  return (c - x) / (c - b);
}

function trapezoid(x, a, b, c, d) {
  if (x <= a || x >= d) return 0;

  if (x >= b && x <= c) return 1;

  if (x > a && x < b) {
    return (x - a) / (b - a);
  }

  return (d - x) / (d - c);
}

//
// Helper untuk membatasi clipping Mamdani
//
function clip(value, alpha) {
  return Math.min(value, alpha);
}

//
// Helper agregasi Mamdani
//
function max(...values) {
  return Math.max(...values);
}

//
// =====================================================
// FUZZIFIKASI INPUT
// =====================================================
//

// pH ideal ikan air tawar = 6.5 - 8
function fuzzifyPH(ph) {
  return {
    asam: trapezoid(ph, 0, 0, 5.5, 6.8),

    netral: triangle(ph, 6.5, 7.2, 8),

    basa: trapezoid(ph, 7.8, 8.5, 14, 14),
  };
}

// suhu ideal = 24 - 30
function fuzzifySuhu(suhu) {
  return {
    dingin: trapezoid(suhu, 0, 0, 18, 24),

    normal: triangle(suhu, 24, 27, 30),

    panas: trapezoid(suhu, 29, 32, 40, 40),
  };
}

// ppm
function fuzzifyTDS(tds) {
  return {
    rendah: trapezoid(tds, 0, 0, 150, 300),

    sedang: triangle(tds, 250, 500, 750),

    tinggi: trapezoid(tds, 700, 900, 2000, 2000),
  };
}

// NTU
function fuzzifyTurbidityADC(adc) {

  return {

    keruh: trapezoid(adc, 0, 0, 2200, 2380),

    sedang: triangle(adc, 2380, 2590, 2800),

    jernih: trapezoid(adc, 2800, 3200, 3814, 3814)

  };
}

//
// =====================================================
// FUZZY OUTPUT
// Kualitas Air (0 - 100)
// =====================================================
//

function outputBuruk(x) {
  return trapezoid(x, 0, 0, 20, 40);
}

function outputSedang(x) {
  return triangle(x, 30, 50, 70);
}

function outputBaik(x) {
  return trapezoid(x, 60, 80, 100, 100);
}

//
// =====================================================
// MAMDANI ENGINE
// =====================================================
//

export function fuzzyMamdani(input) {

  const {
    ph,
    suhu,
    tds,
    turbidity_adc
  } = input;

  //
  // FUZZIFIKASI
  //
  const PH = fuzzifyPH(ph);
  const SUHU = fuzzifySuhu(suhu);
  const TDS = fuzzifyTDS(tds);
  const TURB = fuzzifyTurbidityADC(turbidity_adc);

  //
  // =====================================================
  // RULE BASE
  // =====================================================
  //

  // R1
  // Semua ideal
  const r1 = {
    name: "Air Baik",
    alpha: Math.min(
      PH.netral,
      SUHU.normal,
      TDS.sedang,
      TURB.jernih
    ),
    output: "baik"
  };

  // R2
  const r2 = {
    name: "Air Keruh",
    alpha: TURB.keruh,
    output: "buruk"
  };

  // R3
  const r3 = {
    name: "TDS Tinggi",
    alpha: TDS.tinggi,
    output: "buruk"
  };

  // R4
  const r4 = {
    name: "pH Tidak Ideal",
    alpha: Math.max(
      PH.asam,
      PH.basa
    ),
    output: "sedang"
  };

  // R5
  const r5 = {
    name: "Suhu Panas",
    alpha: SUHU.panas,
    output: "sedang"
  };

  // R6
  const r6 = {
    name: "Suhu Dingin",
    alpha: SUHU.dingin,
    output: "sedang"
  };

  //
  // =====================================================
  // AGREGASI MAMDANI
  // =====================================================
  //
  // Domain output = 0..100
  //

  const aggregated = [];

  for (let z = 0; z <= 100; z++) {

    //
    // BURUK
    //
    const buruk = max(
      clip(outputBuruk(z), r2.alpha),
      clip(outputBuruk(z), r3.alpha)
    );

    //
    // SEDANG
    //
    const sedang = max(
      clip(outputSedang(z), r4.alpha),
      clip(outputSedang(z), r5.alpha),
      clip(outputSedang(z), r6.alpha)
    );

    //
    // BAIK
    //
    const baik = clip(
      outputBaik(z),
      r1.alpha
    );

    //
    // MAX AGGREGATION
    //
    aggregated[z] = max(
      buruk,
      sedang,
      baik
    );
  }

  //
  // =====================================================
  // DEFUZZIFIKASI CENTROID
  // =====================================================
  //

  let numerator = 0;
  let denominator = 0;

  for (let z = 0; z <= 100; z++) {

    numerator += z * aggregated[z];

    denominator += aggregated[z];
  }

  const score =
    denominator === 0
      ? 0
      : numerator / denominator;

  //
  // STATUS
  //

  let status = "";

  if (score < 40) {
    status = "Buruk";
  }
  else if (score < 70) {
    status = "Sedang";
  }
  else {
    status = "Baik";
  }

  //
  // AKSI AKTUATOR
  //

  let action = "OFF";

  if (score < 40) {
    action = "DRAIN_AND_REFILL";
  }

  return {
    score: Number(score.toFixed(2)),
    status,
    action,

    rules: [
      r1,
      r2,
      r3,
      r4,
      r5,
      r6
    ],

    fuzzySet: {
      PH,
      SUHU,
      TDS,
      TURB
    }
  };
}