/**
 * 太阳位置计算工具
 * 使用精确的天文算法计算太阳高度角
 * 参考：NOAA Solar Calculator
 */

/**
 * 将角度转换为弧度
 */
const degToRad = (deg: number): number => (deg * Math.PI) / 180;

/**
 * 将弧度转换为角度
 */
const radToDeg = (rad: number): number => (rad * 180) / Math.PI;

/**
 * 计算儒略日
 */
const getJulianDay = (date: Date): number => {
  const time = date.getTime();
  return time / 86400000 + 2440587.5;
};

/**
 * 计算从2000年1月1日12:00 UT以来的儒略世纪数
 */
const getJulianCentury = (jd: number): number => {
  return (jd - 2451545.0) / 36525.0;
};

/**
 * 计算太阳的几何平均黄经（度）
 */
const getSunGeomMeanLong = (t: number): number => {
  let l0 = 280.46646 + t * (36000.76983 + t * 0.0003032);
  while (l0 > 360.0) l0 -= 360.0;
  while (l0 < 0.0) l0 += 360.0;
  return l0;
};

/**
 * 计算太阳的几何平均近点角（度）
 */
const getSunGeomMeanAnomaly = (t: number): number => {
  return 357.52911 + t * (35999.05029 - 0.0001537 * t);
};

/**
 * 计算地球轨道的离心率
 */
const getEarthOrbitEccentricity = (t: number): number => {
  return 0.016708634 - t * (0.000042037 + 0.0000001267 * t);
};

/**
 * 计算太阳的中心方程（度）
 */
const getSunEqOfCenter = (t: number): number => {
  const m = getSunGeomMeanAnomaly(t);
  const mrad = degToRad(m);
  const sinm = Math.sin(mrad);
  const sin2m = Math.sin(2 * mrad);
  const sin3m = Math.sin(3 * mrad);
  return sinm * (1.914602 - t * (0.004817 + 0.000014 * t)) + sin2m * (0.019993 - 0.000101 * t) + sin3m * 0.000289;
};

/**
 * 计算太阳的真黄经（度）
 */
const getSunTrueLong = (t: number): number => {
  const l0 = getSunGeomMeanLong(t);
  const c = getSunEqOfCenter(t);
  return l0 + c;
};

/**
 * 计算太阳的视黄经（度）
 */
const getSunApparentLong = (t: number): number => {
  const o = getSunTrueLong(t);
  const omega = 125.04 - 1934.136 * t;
  return o - 0.00569 - 0.00478 * Math.sin(degToRad(omega));
};

/**
 * 计算黄道倾角的平均值（度）
 */
const getMeanObliquityOfEcliptic = (t: number): number => {
  const seconds = 21.448 - t * (46.815 + t * (0.00059 - t * 0.001813));
  return 23.0 + (26.0 + seconds / 60.0) / 60.0;
};

/**
 * 计算修正后的黄道倾角（度）
 */
const getObliquityCorrection = (t: number): number => {
  const e0 = getMeanObliquityOfEcliptic(t);
  const omega = 125.04 - 1934.136 * t;
  return e0 + 0.00256 * Math.cos(degToRad(omega));
};

/**
 * 计算太阳的赤纬（度）
 */
const getSunDeclination = (t: number): number => {
  const e = getObliquityCorrection(t);
  const lambda = getSunApparentLong(t);
  const sint = Math.sin(degToRad(e)) * Math.sin(degToRad(lambda));
  return radToDeg(Math.asin(sint));
};

/**
 * 计算时间方程（分钟）
 */
const getEquationOfTime = (t: number): number => {
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

/**
 * 计算给定时间和位置的太阳高度角
 * @param date 日期时间（本地时间）
 * @param lat 纬度（度）
 * @param lng 经度（度）
 * @returns 太阳高度角（度），正值表示在地平线上方
 */
export const getSolarElevation = (date: Date, lat: number, lng: number): number => {
  const jd = getJulianDay(date);
  const t = getJulianCentury(jd);
  
  // 计算太阳赤纬
  const declination = getSunDeclination(t);
  
  // 计算时间方程
  const eqTime = getEquationOfTime(t);
  
  // 使用UTC时间计算真太阳时（分钟）
  const utcHours = date.getUTCHours();
  const utcMinutes = date.getUTCMinutes();
  const utcSeconds = date.getUTCSeconds();
  const utcTimeMinutes = utcHours * 60 + utcMinutes + utcSeconds / 60;
  
  // 经度时差（分钟）：每度经度对应4分钟时差
  const timeOffset = eqTime + 4.0 * lng;
  const tst = utcTimeMinutes + timeOffset;
  
  // 计算时角（度）：从正午开始计算，每小时15度
  let hourAngle = tst / 4.0 - 180.0;
  if (hourAngle < -180) hourAngle += 360.0;
  if (hourAngle > 180) hourAngle -= 360.0;
  
  // 计算太阳高度角
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

/**
 * 使用二分查找找到太阳高度角达到目标角度的时间
 * @param targetElevation 目标高度角（度）
 * @param startTime 搜索起始时间
 * @param endTime 搜索结束时间
 * @param lat 纬度
 * @param lng 经度
 * @param ascending 太阳是否在上升（true）或下降（false）
 * @returns 找到的时间，如果未找到则返回null
 */
export const findTimeForElevation = (
  targetElevation: number,
  startTime: Date,
  endTime: Date,
  lat: number,
  lng: number,
  ascending: boolean
): Date | null => {
  const maxIterations = 50;
  const tolerance = 0.01; // 角度容差
  
  let start = startTime.getTime();
  let end = endTime.getTime();
  
  for (let i = 0; i < maxIterations; i++) {
    const mid = (start + end) / 2;
    const midDate = new Date(mid);
    const elevation = getSolarElevation(midDate, lat, lng);
    
    if (Math.abs(elevation - targetElevation) < tolerance) {
      return midDate;
    }
    
    if (ascending) {
      // 太阳上升：如果当前角度小于目标，向后搜索
      if (elevation < targetElevation) {
        start = mid;
      } else {
        end = mid;
      }
    } else {
      // 太阳下降：如果当前角度大于目标，向后搜索
      if (elevation > targetElevation) {
        start = mid;
      } else {
        end = mid;
      }
    }
    
    // 防止搜索范围过小
    if (Math.abs(end - start) < 1000) { // 1秒
      return new Date((start + end) / 2);
    }
  }
  
  return new Date((start + end) / 2);
};

/**
 * 计算精确的黄金时刻和蓝调时刻
 * @param sunrise 日出时间（API提供，已考虑大气折射，太阳中心在-0.833°）
 * @param sunset 日落时间（API提供，已考虑大气折射，太阳中心在-0.833°）
 * @param lat 纬度
 * @param lng 经度
 */
export const calculateGoldenAndBlueHours = (
  sunrise: Date,
  sunset: Date,
  lat: number,
  lng: number
) => {
  // 搜索窗口（前后2小时）
  const searchWindow = 2 * 60 * 60 * 1000;
  
  // 摄影标准定义（参考 PhotoPills, TPE 等专业应用）：
  // - Blue Hour（蓝调时刻）: 太阳高度角 -6° 到 -4°
  // - Golden Hour（黄金时刻）: 太阳高度角 -4° 到 +6°
  // 注意：黄金时刻从蓝调结束（-4°）开始，而不是从0°开始
  
  // 早晨蓝调时刻：太阳从 -6° 上升到 -4°
  const morningBlueHourStart = findTimeForElevation(
    -6,
    new Date(sunrise.getTime() - searchWindow),
    sunrise,
    lat,
    lng,
    true // 上升
  );
  
  const morningBlueHourEnd = findTimeForElevation(
    -4,
    morningBlueHourStart || new Date(sunrise.getTime() - searchWindow),
    new Date(sunrise.getTime() + searchWindow), // 扩大搜索范围，-4°可能在日出之后
    lat,
    lng,
    true
  );
  
  // 早晨黄金时刻：太阳从 -4° 上升到 +6°
  // 黄金时刻从蓝调结束（-4°）开始
  const morningGoldenHourStart = morningBlueHourEnd;
  
  const morningGoldenHourEnd = findTimeForElevation(
    6,
    morningBlueHourEnd || sunrise,
    new Date(sunrise.getTime() + searchWindow),
    lat,
    lng,
    true
  );
  
  // 傍晚黄金时刻：太阳从 +6° 下降到 -4°
  const eveningGoldenHourStart = findTimeForElevation(
    6,
    new Date(sunset.getTime() - searchWindow),
    sunset,
    lat,
    lng,
    false // 下降
  );
  
  const eveningGoldenHourEnd = findTimeForElevation(
    -4,
    sunset,
    new Date(sunset.getTime() + searchWindow), // -4°在日落之后
    lat,
    lng,
    false
  );
  
  // 傍晚蓝调时刻：太阳从 -4° 下降到 -6°
  // 蓝调开始就是黄金结束
  const eveningBlueHourStart = eveningGoldenHourEnd;
  
  const eveningBlueHourEnd = findTimeForElevation(
    -6,
    eveningBlueHourStart || sunset,
    new Date(sunset.getTime() + searchWindow),
    lat,
    lng,
    false
  );
  
  return {
    morningBlueHourStart: morningBlueHourStart || new Date(sunrise.getTime() - 40 * 60 * 1000),
    morningBlueHourEnd: morningBlueHourEnd || new Date(sunrise.getTime() - 20 * 60 * 1000),
    morningGoldenHourStart: morningGoldenHourStart || morningBlueHourEnd || new Date(sunrise.getTime() - 10 * 60 * 1000),
    morningGoldenHourEnd: morningGoldenHourEnd || new Date(sunrise.getTime() + 60 * 60 * 1000),
    eveningGoldenHourStart: eveningGoldenHourStart || new Date(sunset.getTime() - 60 * 60 * 1000),
    eveningGoldenHourEnd: eveningGoldenHourEnd || new Date(sunset.getTime() + 10 * 60 * 1000),
    eveningBlueHourStart: eveningBlueHourStart || eveningGoldenHourEnd || new Date(sunset.getTime() + 10 * 60 * 1000),
    eveningBlueHourEnd: eveningBlueHourEnd || new Date(sunset.getTime() + 40 * 60 * 1000),
  };
};
