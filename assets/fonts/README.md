# 字体文件夹

将自定义字体文件（.ttf 或 .otf）放在此处。

## 推荐字体

- **Roboto**: Android 默认字体
- **SF Pro**: iOS 默认字体
- **Poppins**: 现代、清晰的无衬线字体
- **Inter**: 适合 UI 的字体

## 使用方法

1. 下载字体文件
2. 放入此文件夹
3. 在 App.tsx 中使用 expo-font 加载：

```typescript
import * as Font from 'expo-font';

await Font.loadAsync({
  'Poppins-Regular': require('./assets/fonts/Poppins-Regular.ttf'),
  'Poppins-Bold': require('./assets/fonts/Poppins-Bold.ttf'),
});
```
