import React from 'react';
import { View, Text, ScrollView, StyleSheet, Linking, TouchableOpacity } from 'react-native';
import { Card } from '../../components/common/Card';
import { AppButton } from '../../components/common/AppButton';
import { useTheme, ThemeMode } from '../../contexts/ThemeContext';
import { Layout } from '../../constants/Layout';

const SettingsScreen: React.FC = () => {
  const { theme, themeMode, setThemeMode } = useTheme();
  
  const handleOpenGitHub = () => {
    Linking.openURL('https://github.com');
  };

  const handleContactSupport = () => {
    Linking.openURL('mailto:support@example.com');
  };

  const renderThemeOption = (mode: ThemeMode, label: string, icon: string) => {
    const isSelected = themeMode === mode;
    return (
      <TouchableOpacity
        style={[
          styles.themeOption,
          isSelected && { 
            backgroundColor: theme.colors.primary + '20',
            borderColor: theme.colors.primary,
          }
        ]}
        onPress={() => setThemeMode(mode)}
      >
        <Text style={[
          styles.themeIcon,
          isSelected && { color: theme.colors.primary }
        ]}>
          {icon}
        </Text>
        <Text style={[
          styles.themeLabel,
          { color: theme.colors.text },
          isSelected && { color: theme.colors.primary, fontWeight: '600' }
        ]}>
          {label}
        </Text>
        {isSelected && (
          <Text style={{ color: theme.colors.primary, marginLeft: 'auto' }}>✓</Text>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: theme.colors.text }]}>设置</Text>

        {/* 主题设置 */}
        <Card style={styles.card}>
          <Text style={[styles.sectionTitle, { color: theme.colors.accent }]}>外观</Text>
          <Text style={[styles.sectionDescription, { color: theme.colors.textSecondary }]}>
            选择您喜欢的主题模式
          </Text>
          <View style={styles.themeOptions}>
            {renderThemeOption('light', '浅色模式', '☀️')}
            {renderThemeOption('dark', '深色模式', '🌙')}
            {renderThemeOption('auto', '跟随系统', '🔄')}
          </View>
        </Card>

        {/* 关于 */}
        <Card style={styles.card}>
          <Text style={[styles.sectionTitle, { color: theme.colors.accent }]}>关于应用</Text>
          <Text style={[styles.appName, { color: theme.colors.blueHour }]}>BlueHour - 摄影助手</Text>
          <Text style={[styles.version, { color: theme.colors.textSecondary }]}>版本 1.0.0</Text>
          <Text style={[styles.description, { color: theme.colors.text }]}>
            专为摄影爱好者设计的工具应用，帮助您规划完美的拍摄时间，
            轻松计算曝光参数、ND 滤镜和景深。
          </Text>
        </Card>

        {/* 功能说明 */}
        <Card style={styles.card}>
          <Text style={[styles.sectionTitle, { color: theme.colors.accent }]}>功能</Text>
          
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>🌅</Text>
            <View style={styles.featureContent}>
              <Text style={[styles.featureTitle, { color: theme.colors.text }]}>蓝调时刻规划器</Text>
              <Text style={[styles.featureDescription, { color: theme.colors.textSecondary }]}>
                获取黄金时刻和蓝色时刻的精确时间
              </Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>📷</Text>
            <View style={styles.featureContent}>
              <Text style={[styles.featureTitle, { color: theme.colors.text }]}>EV 曝光计算器</Text>
              <Text style={[styles.featureDescription, { color: theme.colors.textSecondary }]}>
                计算等效曝光，自由调整光圈、快门和 ISO
              </Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>⚫</Text>
            <View style={styles.featureContent}>
              <Text style={[styles.featureTitle, { color: theme.colors.text }]}>ND 滤镜计算器</Text>
              <Text style={[styles.featureDescription, { color: theme.colors.textSecondary }]}>
                计算使用 ND 滤镜后的快门速度，内置计时器
              </Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>🎯</Text>
            <View style={styles.featureContent}>
              <Text style={[styles.featureTitle, { color: theme.colors.text }]}>景深计算器</Text>
              <Text style={[styles.featureDescription, { color: theme.colors.textSecondary }]}>
                计算清晰范围和超焦距，精确控制景深
              </Text>
            </View>
          </View>
        </Card>

        {/* 数据来源 */}
        <Card style={styles.card}>
          <Text style={[styles.sectionTitle, { color: theme.colors.accent }]}>数据来源</Text>
          <Text style={[styles.infoText, { color: theme.colors.text }]}>
            日出日落数据由 sunrise-sunset.org API 提供
          </Text>
        </Card>

        {/* 联系方式 */}
        <Card style={styles.card}>
          <Text style={[styles.sectionTitle, { color: theme.colors.accent }]}>反馈与支持</Text>
          <AppButton
            title="GitHub"
            onPress={handleOpenGitHub}
            variant="outline"
            style={styles.button}
          />
          <AppButton
            title="联系支持"
            onPress={handleContactSupport}
            variant="outline"
            style={styles.button}
          />
        </Card>

        {/* 版权信息 */}
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: theme.colors.textSecondary }]}>
            © 2025 BlueHour Photography Tools
          </Text>
          <Text style={[styles.footerText, { color: theme.colors.textSecondary }]}>
            用 ❤️ 为摄影爱好者打造
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: Layout.spacing.md,
  },
  title: {
    fontSize: Layout.fontSize.hero,
    fontWeight: 'bold',
    marginBottom: Layout.spacing.lg,
    textAlign: 'center',
  },
  card: {
    marginBottom: Layout.spacing.md,
  },
  sectionTitle: {
    fontSize: Layout.fontSize.xl,
    fontWeight: 'bold',
    marginBottom: Layout.spacing.md,
  },
  sectionDescription: {
    fontSize: Layout.fontSize.sm,
    marginBottom: Layout.spacing.md,
    lineHeight: 20,
  },
  themeOptions: {
    gap: Layout.spacing.sm,
  },
  themeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Layout.spacing.md,
    borderRadius: Layout.borderRadius.md,
    borderWidth: 2,
    borderColor: 'transparent',
    marginBottom: Layout.spacing.sm,
  },
  themeIcon: {
    fontSize: Layout.fontSize.xxl,
    marginRight: Layout.spacing.md,
  },
  themeLabel: {
    fontSize: Layout.fontSize.base,
  },
  appName: {
    fontSize: Layout.fontSize.xxl,
    fontWeight: 'bold',
    marginBottom: Layout.spacing.xs,
  },
  version: {
    fontSize: Layout.fontSize.base,
    marginBottom: Layout.spacing.md,
  },
  description: {
    fontSize: Layout.fontSize.base,
    lineHeight: 24,
  },
  featureItem: {
    flexDirection: 'row',
    marginBottom: Layout.spacing.md,
    paddingBottom: Layout.spacing.md,
  },
  featureIcon: {
    fontSize: Layout.iconSize.lg,
    marginRight: Layout.spacing.md,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: Layout.fontSize.base,
    fontWeight: '600',
    marginBottom: Layout.spacing.xs,
  },
  featureDescription: {
    fontSize: Layout.fontSize.sm,
    lineHeight: 20,
  },
  infoText: {
    fontSize: Layout.fontSize.base,
    lineHeight: 24,
  },
  button: {
    marginBottom: Layout.spacing.sm,
  },
  footer: {
    alignItems: 'center',
    marginTop: Layout.spacing.lg,
    marginBottom: Layout.spacing.xl,
  },
  footerText: {
    fontSize: Layout.fontSize.sm,
    marginBottom: Layout.spacing.xs,
  },
});

export default SettingsScreen;
