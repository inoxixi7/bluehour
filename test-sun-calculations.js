// 简单测试脚本来验证太阳高度角计算

// 测试东京的位置（根据截图）
const lat = 35.6762; // 东京纬度
const lng = 139.6503; // 东京经度

// 2024年1月15日的日出时间（根据API）
const testDate = new Date('2024-01-15T22:04:00.000Z'); // UTC时间的日出（东京时间07:04）

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
  
  console.log('儒略日:', jd);
  console.log('儒略世纪:', t);
  
  const declination = getSunDeclination(t);
  console.log('太阳赤纬:', declination.toFixed(4), '°');
  
  const eqTime = getEquationOfTime(t);
  console.log('时间方程:', eqTime.toFixed(2), '分钟');
  
  const utcHours = date.getUTCHours();
  const utcMinutes = date.getUTCMinutes();
  const utcSeconds = date.getUTCSeconds();
  const utcTimeMinutes = utcHours * 60 + utcMinutes + utcSeconds / 60;
  
  console.log('UTC时间 (分钟):', utcTimeMinutes.toFixed(2));
  
  const timeOffset = eqTime + 4.0 * lng;
  console.log('时间偏移:', timeOffset.toFixed(2), '分钟');
  
  const tst = utcTimeMinutes + timeOffset;
  console.log('真太阳时 (分钟):', tst.toFixed(2));
  
  let hourAngle = tst / 4.0 - 180.0;
  if (hourAngle < -180) hourAngle += 360.0;
  if (hourAngle > 180) hourAngle -= 360.0;
  
  console.log('时角:', hourAngle.toFixed(4), '°');
  
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

// 测试日出时的太阳高度角
console.log('=== 测试日出时刻的太阳高度角 ===');
const elevation = getSolarElevation(testDate, lat, lng);
console.log('\n太阳高度角:', elevation.toFixed(4), '°');
console.log('说明: API的日出时间考虑了大气折射，实际太阳高度角约为 1.6°');
console.log('      摄影中的黄金时刻应从太阳真正在0°开始计算');

// 查找0度的时刻
console.log('\n\n=== 查找太阳真正在0°的时刻 ===');
let searchStart = new Date(testDate.getTime() - 30 * 60 * 1000);
let searchEnd = new Date(testDate.getTime() + 30 * 60 * 1000);

for (let i = 0; i < 50; i++) {
  const mid = new Date((searchStart.getTime() + searchEnd.getTime()) / 2);
  const elev = getSolarElevation(mid, lat, lng);
  
  if (Math.abs(elev) < 0.01) {
    console.log('找到0°时刻!');
    console.log('时间 (UTC):', mid.toISOString());
    console.log('时间 (东京):', new Date(mid.getTime() + 9 * 60 * 60 * 1000).toTimeString());
    console.log('太阳高度角:', elev.toFixed(6), '°');
    break;
  }
  
  if (elev < 0) {
    searchStart = mid;
  } else {
    searchEnd = mid;
  }
}

// 测试黄金时刻结束（6°）
console.log('\n\n=== 查找太阳在+6°的时刻（黄金时刻结束）===');
searchStart = testDate;
searchEnd = new Date(testDate.getTime() + 2 * 60 * 60 * 1000);

for (let i = 0; i < 50; i++) {
  const mid = new Date((searchStart.getTime() + searchEnd.getTime()) / 2);
  const elev = getSolarElevation(mid, lat, lng);
  
  if (Math.abs(elev - 6) < 0.01) {
    console.log('找到+6°时刻!');
    console.log('时间 (UTC):', mid.toISOString());
    const localTime = new Date(mid.getTime());
    console.log('时间 (本地):', localTime.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Tokyo' }));
    console.log('太阳高度角:', elev.toFixed(6), '°');
    break;
  }
  
  if (elev < 6) {
    searchStart = mid;
  } else {
    searchEnd = mid;
  }
}

// 测试蓝调时刻开始（-6°）
console.log('\n\n=== 查找太阳在-6°的时刻（蓝调时刻开始）===');
searchStart = new Date(testDate.getTime() - 2 * 60 * 60 * 1000);
searchEnd = testDate;

for (let i = 0; i < 50; i++) {
  const mid = new Date((searchStart.getTime() + searchEnd.getTime()) / 2);
  const elev = getSolarElevation(mid, lat, lng);
  
  if (Math.abs(elev + 6) < 0.01) {
    console.log('找到-6°时刻!');
    console.log('时间 (UTC):', mid.toISOString());
    const localTime = new Date(mid.getTime());
    console.log('时间 (本地):', localTime.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Tokyo' }));
    console.log('太阳高度角:', elev.toFixed(6), '°');
    break;
  }
  
  if (elev < -6) {
    searchStart = mid;
  } else {
    searchEnd = mid;
  }
}

// 测试蓝调时刻结束/黄金时刻开始（-4°）
console.log('\n\n=== 查找太阳在-4°的时刻（蓝调结束/黄金开始）===');
searchStart = new Date(testDate.getTime() - 2 * 60 * 60 * 1000);
searchEnd = testDate;

for (let i = 0; i < 50; i++) {
  const mid = new Date((searchStart.getTime() + searchEnd.getTime()) / 2);
  const elev = getSolarElevation(mid, lat, lng);
  
  if (Math.abs(elev + 4) < 0.01) {
    console.log('找到-4°时刻!');
    console.log('时间 (UTC):', mid.toISOString());
    const localTime = new Date(mid.getTime());
    console.log('时间 (本地):', localTime.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Tokyo' }));
    console.log('太阳高度角:', elev.toFixed(6), '°');
    break;
  }
  
  if (elev < -4) {
    searchStart = mid;
  } else {
    searchEnd = mid;
  }
}

console.log('\n\n=== 总结：摄影时间段（东京 2024-01-15）===');
console.log('🌌 早晨蓝调时刻: -6° 到 -4°');
console.log('🌅 早晨黄金时刻: -4° 到 +6° （从蓝调结束开始）');
console.log('☀️  API日出: 约 +1.6°');
console.log('🌇 傍晚黄金时刻: +6° 到 -4° （到蓝调开始结束）');
console.log('🌌 傍晚蓝调时刻: -4° 到 -6°');
console.log('\n注意：黄金时刻从 -4° 开始，而不是从 0° 开始！');
