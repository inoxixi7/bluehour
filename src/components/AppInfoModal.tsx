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
  TouchableWithoutFeedback,
} from "react-native";
import { I18nContext } from '../i18n/context';

interface AppInfoModalProps {
  visible: boolean;
  onClose: () => void;
}

export const AppInfoModal: React.FC<AppInfoModalProps> = ({
  visible,
  onClose,
}) => {
  const { t, locale, setLocale } = React.useContext(I18nContext);
  const [langOpen, setLangOpen] = React.useState(false);

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
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop}>
            <View style={styles.card} pointerEvents="box-none">
              {/* 增加了 ScrollView 的内边距，优化视觉效果 */}
              <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={true}
                keyboardShouldPersistTaps="handled"
                nestedScrollEnabled
                alwaysBounceVertical
                scrollEventThrottle={16}
              >
                <Text style={styles.title}>{t('settings')}</Text>

                {/* 语言选择（浮层下拉，不挤压布局） */}
                <View style={styles.dropdownBlock}>
                  <Text style={styles.sectionTitle}>{t('language')}</Text>
                  <View style={styles.dropdownContainer}>
                    <TouchableOpacity style={styles.dropdownHeader} onPress={()=>setLangOpen(o=>!o)} activeOpacity={0.8}>
                      <Text style={styles.dropdownHeaderText}>{t(`lang_${locale}`)}</Text>
                      <Text style={styles.dropdownArrow}>{langOpen ? '▲' : '▼'}</Text>
                    </TouchableOpacity>
                    {langOpen && (
                      <View style={styles.dropdownOverlay} pointerEvents="box-none">
                        <View style={styles.dropdownList}>
                          {(['zh','en','ja','de'] as const).map(l => (
                            <TouchableOpacity key={l} style={styles.dropdownItem} onPress={()=>{setLocale(l); setLangOpen(false);}}>
                              <Text style={[styles.dropdownItemText, locale===l && styles.dropdownItemTextActive]}>{t(`lang_${l}`)}</Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                      </View>
                    )}
                  </View>
                </View>

                <Text style={styles.sectionTitle}>{t('appInfoTitle')}</Text>
                <Text style={styles.sectionTitle}>{t('appSlogan')}</Text>
                <Text style={styles.paragraph}>{t('appIntro')}</Text>

                <Text style={styles.sectionTitle}>{t('coreFeatures')}</Text>
                <Text style={styles.listItem}>{t('feature_preciseAstronomy')}</Text>
                <Text style={styles.listItem}>{t('feature_dynamicPeriods')}</Text>
                <Text style={styles.listItem}>{t('feature_globalSearch')}</Text>
                <Text style={styles.listItem}>{t('feature_liveTracking')}</Text>
                <Text style={styles.listItem}>{t('feature_timezone')}</Text>

                <Text style={styles.sectionTitle}>{t('feedbackWelcome')}</Text>
                <Text style={styles.paragraph}>{t('feedbackDesc')}</Text>

                {/* 致谢 */}
                <Text style={styles.sectionTitle}>{t('dataCredits')}</Text>
                <Text style={styles.paragraph}>{t('dataCreditsDesc')}</Text>
                <TouchableOpacity
                  onPress={() => handleLinkPress("https://sunrisesunset.io/api/")}
                >
                  <Text style={styles.linkItem}>{t('credit_sunrise_sunset')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() =>
                    handleLinkPress("https://github.com/osm-search/Nominatim")
                  }
                >
                  <Text style={styles.linkItem}>{t('credit_nominatim')}</Text>
                </TouchableOpacity>

                <Text style={styles.sectionTitle}>
                  {t('versionLabel')}：1.0.0
                </Text>
              </ScrollView>

              <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
                <Text style={styles.closeText}>{t('close')}</Text>
              </TouchableOpacity>
            </View>
        </View>
      </TouchableWithoutFeedback>
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
    maxHeight: '85%',
  },
  scroll: {
    maxHeight: '100%',
  },
  scrollContent: {
    paddingHorizontal: 4,
    paddingBottom: 40,
  flexGrow: 1,
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
  dropdownHeader: { flexDirection:'row', alignItems:'center', justifyContent:'space-between', backgroundColor:'rgba(255,255,255,0.08)', paddingHorizontal:12, paddingVertical:10, borderRadius:10, borderWidth:1, borderColor:'rgba(255,255,255,0.15)' },
  dropdownHeaderText: { color:'#fff', fontSize:14, fontWeight:'600' },
  dropdownArrow: { color:'rgba(255,255,255,0.7)', fontSize:12, marginLeft:8 },
  dropdownBlock: { marginBottom: 4 },
  dropdownContainer: { position:'relative' },
  dropdownOverlay: { position:'absolute', left:0, right:0, top:'100%', zIndex:50 },
  dropdownList: { marginTop:6, borderRadius:10, overflow:'hidden', borderWidth:1, borderColor:'rgba(255,255,255,0.15)', backgroundColor:'#1f2533', shadowColor:'#000', shadowOpacity:0.4, shadowRadius:8, shadowOffset:{width:0,height:4}, elevation:8 },
  dropdownItem: { paddingVertical:10, paddingHorizontal:12, backgroundColor:'rgba(255,255,255,0.05)' },
  dropdownItemText: { color:'rgba(255,255,255,0.85)', fontSize:13 },
  dropdownItemTextActive: { color:'#ffd43b', fontWeight:'600' },
});

export default AppInfoModal;
