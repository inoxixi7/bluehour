// @ts-nocheck
import React from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  ScrollView,
} from "react-native";

interface AppInfoModalProps {
  visible: boolean;
  onClose: () => void;
}

export const AppInfoModal: React.FC<AppInfoModalProps> = ({
  visible,
  onClose,
}) => {
  // 定义链接点击函数
  const handleLinkPress = (url: string) => {
    Linking.openURL(url).catch((err) =>
      console.error("Couldn't load page", err)
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View style={styles.card}>
          {/* 增加了 ScrollView 的内边距，优化视觉效果 */}
          <ScrollView
            contentContainerStyle={{ paddingHorizontal: 4 }}
            style={{ maxHeight: 420 }}
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.title}>应用信息</Text>

            <Text style={styles.sectionTitle}>为追光而生</Text>
            <Text style={styles.paragraph}>
              BlueHour
              是为每一位摄影师和追光者设计的专属工具。它能根据您选择的全球任意地点和日期，精准推算出稍纵即逝的黄金时刻与蓝调时刻，让您不再错过任何绝佳光线。
            </Text>

            <Text style={styles.sectionTitle}>核心功能</Text>
            <Text style={styles.listItem}>
              • 精准天文数据：提供日出、日落、民用及航海曙暮光等关键天文时间点。
            </Text>
            <Text style={styles.listItem}>
              • 动态时段推算：基于科学算法，动态计算不同季节和纬度下，黄金与蓝调时刻的真实时长。
            </Text>
            <Text style={styles.listItem}>
              • 全球地点搜索：快速搜索全球城市并保存历史记录，方便您规划每一次出行。
            </Text>
            <Text style={styles.listItem}>
              • 实时光线追踪：通过直观的进度条，实时高亮显示当前所处的光线阶段。
            </Text>
            <Text style={styles.listItem}>
              • 智能时区支持：自动转换并显示所选地点的当地时间，让您身处异地也无需换算。
            </Text>

            <Text style={styles.sectionTitle}>您的建议很重要</Text>
            <Text style={styles.paragraph}>
              我们致力于打造最好的光线预测工具。如果您在使用中遇到任何问题，或有新的功能想法，都非常欢迎您提出宝贵建议。
            </Text>

            {/* 新增的致谢部分 */}
            <Text style={styles.sectionTitle}>数据来源与致谢</Text>
            <Text style={styles.paragraph}>
              本应用的核心功能得以实现，离不开以下优秀服务的支持，在此向它们的开发者与贡献者表示诚挚的感谢：
            </Text>
            <TouchableOpacity
              onPress={() => handleLinkPress("https://sunrisesunset.io/api/")}
            >
              <Text style={styles.linkItem}>
                • 天文数据由 Sunrise-Sunset.org 提供
              </Text>
            </TouchableOpacity>
            {/* 将 Nominatim 做成可点击链接 */}
            <TouchableOpacity
              onPress={() =>
                handleLinkPress("https://github.com/osm-search/Nominatim")
              }
            >
              <Text style={styles.linkItem}>
                • 地理位置查询由 Nominatim (OpenStreetMap) 提供
              </Text>
            </TouchableOpacity>

            <Text style={styles.sectionTitle}>
              Version：1.0.0
            </Text>
          </ScrollView>

          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeText}>关闭</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

// 样式部分
const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "center",
    padding: 24,
  },
  card: {
    backgroundColor: "#1f2533",
    borderRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 16, // 微调内边距
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 16,
    textAlign: "center",
  }, // 标题居中
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#ffd43b",
    marginTop: 16,
    marginBottom: 8,
  },
  paragraph: { fontSize: 13, lineHeight: 21, color: "rgba(255,255,255,0.82)" },
  listItem: {
    fontSize: 13,
    lineHeight: 21,
    color: "rgba(255,255,255,0.82)",
    marginTop: 4,
  },
  linkItem: {
    // 为链接创建单独样式
    fontSize: 13,
    lineHeight: 21,
    color: "#69b3ff", // 使用蓝色以示可点击
    textDecorationLine: "underline",
    marginTop: 4,
  },
  closeBtn: {
    marginTop: 20,
    backgroundColor: "#ffd43b",
    paddingVertical: 12,
    borderRadius: 12,
  },
  closeText: {
    textAlign: "center",
    fontWeight: "600",
    color: "#1a1a1a",
    fontSize: 15,
  },
});

export default AppInfoModal;
