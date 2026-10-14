import fs from 'fs';
import path from 'path';

import i18n, { initI18n } from '../../locales/i18n';
import { buildSharedFiles } from '../buildSharedData';

/**
 * shared/ 下的 JSON 由 buildSharedData.ts 生成。
 * 修改计算逻辑或胶片数据后，运行 `npm run shared:update` 重新生成，
 * 否则这个测试会失败，提醒原生版本的数据已经过期。
 */

const SHARED_DIR = path.resolve(__dirname, '../../../shared');
const shouldUpdate = process.env.UPDATE_SHARED_DATA === '1';

describe('shared data', () => {
  let files: Record<string, unknown> = {};

  beforeAll(async () => {
    // 格式化向量使用英文单位
    await initI18n();
    await i18n.changeLanguage('en');
    files = buildSharedFiles();
  });

  it.each(Object.keys(buildSharedFiles()))('%s 与代码一致', relativePath => {
    const filePath = path.join(SHARED_DIR, relativePath);
    const expected = JSON.parse(JSON.stringify(files[relativePath]));

    if (shouldUpdate) {
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
      fs.writeFileSync(filePath, `${JSON.stringify(expected, null, 2)}\n`);
    }

    expect(fs.existsSync(filePath)).toBe(true);
    expect(JSON.parse(fs.readFileSync(filePath, 'utf8'))).toEqual(expected);
  });
});
