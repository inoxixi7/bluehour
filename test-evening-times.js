// 测试傍晚的太阳高度角计算

const lat = 35.6762; // 东京纬度
const lng = 139.6503; // 东京经度

// 2024年1月15日的日落时间（根据API）
const testDate = new Date('2024-01-15T08:06:00.000Z'); // UTC时间的日落（东京时间17:06）

console.log('测试位置: 东京');
console.log('纬度:', lat);
console.log('经度:', lng);
console.log('测试时间 (UTC):', testDate.toISOString());
console.log('测试时间 (本地):', testDate.toString());
console.log('');

// 复制核心计算函数
const degToRad = (deg) => (deg * Math.PI) / 180;
const radToDeg = (rad) => (rad * 180) / Math.PI;

const getJulianDay = (date) => {
  const time = date.getTime();
  return time / 86400000 + 2440587.5;
};

const getJulianCentury = (jd) => {
  return (jd - 2451545.0) / 36525.0;
};

const getSunGeomMeanLong = (t) => {
  let l0 = 280.46646 + t * (36000.76983 + t * 0.0003032);
  while (l0 > 360.0) l0 -= 360.0;
  while (l0 < 0.0) l0 += 360.0;
  return l0;
};

const getSunGeomMeanAnomaly = (t) => {
  return 357.52911 + t * (35999.05029 - 0.0001537 * t);
};

const getEarthOrbitEccentricity = (t) => {
  return 0.016708634 - t * (0.000042037 + 0.0000001267 * t);
};

const getSunEqOfCenter = (t) => {
  const m = getSunGeomMeanAnomaly(t);
  const mrad = degToRad(m);
  const sinm = Math.sin(mrad);
  const sin2m = Math.sin(2 * mrad);
  const sin3m = Math.sin(3 * mrad);
  return sinm * (1.914602 - t * (0.004817 + 0.000014 * t)) + sin2m * (0.019993 - 0.000101 * t) + sin3m * 0.000289;
};

const getSunTrueLong = (t) => {
  const l0 = getSunGeomMeanLong(t);
  const c = getSunEqOfCenter(t);
  return l0 + c;
};

const getSunApparentLong = (t) => {
  const o = getSunTrueLong(t);
  const omega = 125.04 - 1934.136 * t;
  return o - 0.00569 - 0.00478 * Math.sin(degToRad(omega));
};

const getMeanObliquityOfEcliptic = (t) => {
  const seconds = 21.448 - t * (46.815 + t * (0.00059 - t * 0.001813));
  return 23.0 + (26.0 + seconds / 60.0) / 60.0;
};

const getObliquityCorrection = (t) => {
  const e0 = getMeanObliquityOfEcliptic(t);
  const omega = 125.04 - 1934.136 * t;
  return e0 + 0.00256 * Math.cos(degToRad(omega));
};

const getSunDeclination = (t) => {
  const e = getObliquityCorrection(t);
  const lambda = getSunApparentLong(t);
  const sint = Math.sin(degToRad(e)) * Math.sin(degToRad(lambda));
  return radToDeg(Math.asin(sint));
};

const getEquationOfTime = (t) => {
  const epsilon = getObliquityCorrection(t);
  const l0 = getSunGeomMeanLong(t);
  const e = getEarthOrbitEccentricity(t);
  const m = getSunGeomMeanAnomaly(t);

  let y = Math.tan(degToRad(epsilon) / 2.0);
  y *= y;

  const sin2l0 = Math.sin(2.0 * degToRad(l0));
  const sinm = Math.sin(degToRad(m));
  const cos2l0 = Math.cos(2.0 * degToRad(l0));
  const sin4l0 = Math.sin(4.0 * degToRad(l0));
  const sin2m = Math.sin(2.0 * degToRad(m));

  const Etime = y * sin2l0 - 2.0 * e * sinm + 4.0 * e * y * sinm * cos2l0 - 0.5 * y * y * sin4l0 - 1.25 * e * e * sin2m;

  return radToDeg(Etime) * 4.0;
};

const getSolarElevation = (date, lat, lng) => {
  const jd = getJulianDay(date);
  const t = getJulianCentury(jd);
  
  const declination = getSunDeclination(t);
  const eqTime = getEquationOfTime(t);
  
  const utcHours = date.getUTCHours();
  const utcMinutes = date.getUTCMinutes();
  const utcSeconds = date.getUTCSeconds();
  const utcTimeMinutes = utcHours * 60 + utcMinutes + utcSeconds / 60;
  
  const timeOffset = eqTime + 4.0 * lng;
  const tst = utcTimeMinutes + timeOffset;
  
  let hourAngle = tst / 4.0 - 180.0;
  if (hourAngle < -180) hourAngle += 360.0;
  if (hourAngle > 180) hourAngle -= 360.0;
  
  const latRad = degToRad(lat);
  const decRad = degToRad(declination);
  const haRad = degToRad(hourAngle);
  
  const elevation = radToDeg(
    Math.asin(
      Math.sin(latRad) * Math.sin(decRad) +
      Math.cos(latRad) * Math.cos(decRad) * Math.cos(haRad)
    )
  );
  
  return elevation;
};

// 测试日落时的太阳高度角
console.log('=== 测试日落时刻的太阳高度角 ===');
const elevation = getSolarElevation(testDate, lat, lng);
console.log('太阳高度角:', elevation.toFixed(4), '°');
console.log('');

// 查找傍晚黄金时刻开始（+6°）
console.log('=== 查找太阳在+6°的时刻（傍晚黄金开始）===');
let searchStart = new Date(testDate.getTime() - 2 * 60 * 60 * 1000);
let searchEnd = testDate;

for (let i = 0; i < 50; i++) {
  const mid = new Date((searchStart.getTime() + searchEnd.getTime()) / 2);
  const elev = getSolarElevation(mid, lat, lng);
  
  if (Math.abs(elev - 6) < 0.01) {
    console.log('找到+6°时刻!');
    console.log('时间 (UTC):', mid.toISOString());
    const localTime = new Date(mid.getTime());
    console.log('时间 (东京):', localTime.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Tokyo' }));
    console.log('太阳高度角:', elev.toFixed(6), '°');
    break;
  }
  
  if (elev > 6) {
    searchStart = mid;
  } else {
    searchEnd = mid;
  }
}

// 查找傍晚黄金时刻结束（-4°）
console.log('\n=== 查找太阳在-4°的时刻（傍晚黄金结束/蓝调开始）===');
searchStart = testDate;
searchEnd = new Date(testDate.getTime() + 2 * 60 * 60 * 1000);

for (let i = 0; i < 50; i++) {
  const mid = new Date((searchStart.getTime() + searchEnd.getTime()) / 2);
  const elev = getSolarElevation(mid, lat, lng);
  
  if (Math.abs(elev + 4) < 0.01) {
    console.log('找到-4°时刻!');
    console.log('时间 (UTC):', mid.toISOString());
    const localTime = new Date(mid.getTime());
    console.log('时间 (东京):', localTime.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Tokyo' }));
    console.log('太阳高度角:', elev.toFixed(6), '°');
    break;
  }
  
  if (elev > -4) {
    searchStart = mid;
  } else {
    searchEnd = mid;
  }
}

// 查找傍晚蓝调时刻结束（-6°）
console.log('\n=== 查找太阳在-6°的时刻（傍晚蓝调结束）===');
searchStart = testDate;
searchEnd = new Date(testDate.getTime() + 2 * 60 * 60 * 1000);

for (let i = 0; i < 50; i++) {
  const mid = new Date((searchStart.getTime() + searchEnd.getTime()) / 2);
  const elev = getSolarElevation(mid, lat, lng);
  
  if (Math.abs(elev + 6) < 0.01) {
    console.log('找到-6°时刻!');
    console.log('时间 (UTC):', mid.toISOString());
    const localTime = new Date(mid.getTime());
    console.log('时间 (东京):', localTime.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Tokyo' }));
    console.log('太阳高度角:', elev.toFixed(6), '°');
    break;
  }
  
  if (elev > -6) {
    searchStart = mid;
  } else {
    searchEnd = mid;
  }
}

console.log('\n=== 总结：傍晚时间段（东京 2024-01-15）===');
console.log('🌇 傍晚黄金时刻: +6° 到 -4°');
console.log('☀️  API日落: 约 +1.6° (17:06)');
console.log('🌌 傍晚蓝调时刻: -4° 到 -6°');
