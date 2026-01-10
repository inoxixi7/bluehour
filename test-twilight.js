// 测试不同曙暮光角度的时间

const lat = 35.6762; // 东京纬度
const lng = 139.6503; // 东京经度

// 2024年1月15日的日落时间
const testDate = new Date('2024-01-15T08:06:00.000Z'); // UTC时间的日落（东京时间17:06）

console.log('测试位置: 东京 (2024-01-15)');
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

const findAngleTime = (targetAngle, descending) => {
  let searchStart = descending ? testDate : new Date(testDate.getTime() - 2 * 60 * 60 * 1000);
  let searchEnd = descending ? new Date(testDate.getTime() + 2 * 60 * 60 * 1000) : testDate;
  
  for (let i = 0; i < 50; i++) {
    const mid = new Date((searchStart.getTime() + searchEnd.getTime()) / 2);
    const elev = getSolarElevation(mid, lat, lng);
    
    if (Math.abs(elev - targetAngle) < 0.01) {
      return mid;
    }
    
    if (descending) {
      if (elev > targetAngle) {
        searchStart = mid;
      } else {
        searchEnd = mid;
      }
    } else {
      if (elev > targetAngle) {
        searchEnd = mid;
      } else {
        searchStart = mid;
      }
    }
  }
  return null;
};

console.log('=== 曙暮光定义 ===');
console.log('民用曙暮光 (Civil Twilight): 0° 到 -6°');
console.log('航海曙暮光 (Nautical Twilight): -6° 到 -12°');
console.log('天文曙暮光 (Astronomical Twilight): -12° 到 -18°');
console.log('');

console.log('=== 不同蓝调时刻定义的比较 ===\n');

// 定义1：PhotoPills标准 (-6° 到 -4°)
const time_minus6 = findAngleTime(-6, true);
const time_minus4 = findAngleTime(-4, true);
if (time_minus6 && time_minus4) {
  const duration1 = (time_minus6.getTime() - time_minus4.getTime()) / 60000;
  console.log('📘 定义1: PhotoPills标准 (-6° 到 -4°)');
  console.log('   开始:', time_minus4.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Tokyo' }));
  console.log('   结束:', time_minus6.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Tokyo' }));
  console.log('   时长:', Math.round(duration1), '分钟\n');
}

// 定义2：扩展版本 (-8° 到 -4°)
const time_minus8 = findAngleTime(-8, true);
if (time_minus8 && time_minus4) {
  const duration2 = (time_minus8.getTime() - time_minus4.getTime()) / 60000;
  console.log('📘 定义2: 扩展版本 (-8° 到 -4°)');
  console.log('   开始:', time_minus4.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Tokyo' }));
  console.log('   结束:', time_minus8.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Tokyo' }));
  console.log('   时长:', Math.round(duration2), '分钟\n');
}

// 定义3：民用曙暮光范围 (0° 到 -6°)
const time_0 = findAngleTime(0, true);
if (time_0 && time_minus6) {
  const duration3 = (time_minus6.getTime() - time_0.getTime()) / 60000;
  console.log('📘 定义3: 民用曙暮光 (0° 到 -6°)');
  console.log('   开始:', time_0.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Tokyo' }));
  console.log('   结束:', time_minus6.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Tokyo' }));
  console.log('   时长:', Math.round(duration3), '分钟\n');
}

// 定义4：部分民用曙暮光 (-3° 到 -6°)
const time_minus3 = findAngleTime(-3, true);
if (time_minus3 && time_minus6) {
  const duration4 = (time_minus6.getTime() - time_minus3.getTime()) / 60000;
  console.log('📘 定义4: 部分民用曙暮光 (-3° 到 -6°)');
  console.log('   开始:', time_minus3.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Tokyo' }));
  console.log('   结束:', time_minus6.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Tokyo' }));
  console.log('   时长:', Math.round(duration4), '分钟\n');
}

console.log('📌 当前应用使用: 定义1 (PhotoPills标准)');
console.log('💡 如果其他应用显示更长时间，可能使用定义2、3或4');
