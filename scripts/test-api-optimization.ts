/**
 * API 优化效果测试脚本
 * 
 * 运行方式：
 * npx ts-node scripts/test-api-optimization.ts
 */

import { getSunTimes } from '../src/api/sunTimeService';
import { clearCacheByPrefix } from '../src/utils/apiHelpers';

const testLocation = {
  lat: 35.6895,  // 东京
  lng: 139.6917,
  name: '东京'
};

async function testCachePerformance() {
  console.log('🧪 测试 API 缓存性能\n');
  
  // 清除旧缓存
  await clearCacheByPrefix('suntimes');
  console.log('🗑️ 已清除旧缓存\n');

  // 第一次请求（应该从网络获取）
  console.log('📡 第一次请求（网络）...');
  const start1 = Date.now();
  try {
    const data1 = await getSunTimes(testLocation.lat, testLocation.lng);
    const time1 = Date.now() - start1;
    console.log(`✅ 完成！耗时: ${time1}ms`);
    console.log(`   日出: ${data1.sunrise.toLocaleTimeString()}`);
    console.log(`   日落: ${data1.sunset.toLocaleTimeString()}\n`);
  } catch (error) {
    console.error('❌ 失败:', error);
  }

  // 第二次请求（应该从缓存获取）
  console.log('📦 第二次请求（缓存）...');
  const start2 = Date.now();
  try {
    const data2 = await getSunTimes(testLocation.lat, testLocation.lng);
    const time2 = Date.now() - start2;
    console.log(`✅ 完成！耗时: ${time2}ms`);
    console.log(`   日出: ${data2.sunrise.toLocaleTimeString()}`);
    console.log(`   日落: ${data2.sunset.toLocaleTimeString()}\n`);
    
    // 计算性能提升
    const speedup = ((time1 - time2) / time1 * 100).toFixed(1);
    console.log(`🚀 性能提升: ${speedup}%`);
  } catch (error) {
    console.error('❌ 失败:', error);
  }
}

async function testRetryMechanism() {
  console.log('\n🧪 测试重试机制');
  console.log('提示：这需要模拟网络错误来测试\n');
}

// 运行测试
(async () => {
  await testCachePerformance();
  await testRetryMechanism();
})();
