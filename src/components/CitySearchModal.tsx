import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Modal,
  TouchableWithoutFeedback,
} from "react-native";
import { GeocodeResult } from "../types";
import { loadSelectionHistory, saveSelectionHistory } from "../utils/storage";

/**
 * 城市搜索模态
 * 调整：搜索历史改为“选择历史”（用户点选过的地点）最多 5 条，可再次快速选择。
 */
interface CitySearchModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (result: GeocodeResult) => void;
  minQueryLength?: number;
  debounceMs?: number;
  limit?: number;
}

export const CitySearchModal: React.FC<CitySearchModalProps> = ({
  visible,
  onClose,
  onSelect,
  minQueryLength = 2,
  debounceMs = 400,
  limit = 8,
}) => {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<GeocodeResult[]>([]);
  const [selectionHistory, setSelectionHistory] = useState<GeocodeResult[]>([]); // 最近“选择”历史
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  // 标准化 Nominatim => GeocodeResult
  const normalizeNominatim = (raw: any): GeocodeResult => ({
    displayName: raw.display_name,
    description: raw.display_name,
    latitude: parseFloat(raw.lat),
    longitude: parseFloat(raw.lon),
    type: raw.type,
    providerId: raw.osm_id,
    source: "nominatim",
  });

  // 执行搜索
  const performSearch = useCallback(
    async (text: string) => {
      if (text.length < minQueryLength) {
        setResults([]);
        setError(null);
        return;
      }
      try {
        setLoading(true);
        setError(null);
        const url = `https://nominatim.openstreetmap.org/search?format=json&limit=${limit}&q=${encodeURIComponent(
          text
        )}`;
        const resp = await fetch(url, {
          headers: { "Accept-Language": "zh-CN" },
        });
        if (!resp.ok) throw new Error(`网络错误: ${resp.status}`);
        const data = await resp.json();
        const mapped: GeocodeResult[] = (Array.isArray(data) ? data : []).map(
          normalizeNominatim
        );
        const uniqMap = new Map<string, GeocodeResult>();
        mapped.forEach((item) => {
          if (!uniqMap.has(item.displayName))
            uniqMap.set(item.displayName, item);
        });
        setResults(Array.from(uniqMap.values()));
      } catch (e) {
        setError(e instanceof Error ? e.message : "搜索失败");
      } finally {
        setLoading(false);
      }
    },
    [limit, minQueryLength]
  );

  // 输入防抖
  const handleChange = (text: string) => {
    setQuery(text);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      performSearch(text.trim());
    }, debounceMs);
  };

  // 选择结果：触发外部回调 + 维护选择历史（去重头插），不再立即关闭，便于用户看到已加入的“最近选择”
  const handleSelect = async (item: GeocodeResult) => {
    onSelect(item);
    setSelectionHistory((prev) => {
      const next = [
        item,
        ...prev.filter((h) => h.displayName !== item.displayName),
      ].slice(0, 5);
      // 立即持久化
      saveSelectionHistory(next);
      return next;
    });
    // 立即关闭
    onClose();
  };

  // 点击历史：直接当次选择（无需重新搜索）
  const handleHistorySelect = (item: GeocodeResult) => handleSelect(item);

  // 渲染列表项
  const renderItem = ({ item }: { item: GeocodeResult }) => (
    <TouchableOpacity
      style={styles.resultItem}
      onPress={() => handleSelect(item)}
    >
      <Text style={styles.resultName} numberOfLines={1}>
        {item.displayName}
      </Text>
      {!!item.type && <Text style={styles.resultType}>{item.type}</Text>}
    </TouchableOpacity>
  );

  // 初始化加载历史
  useEffect(() => {
    if (visible) {
      loadSelectionHistory().then(setSelectionHistory);
    }
  }, [visible]);

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback
            onPress={() => {
              /* 阻止冒泡，点击内容不关闭 */
            }}
          >
            <View style={styles.modalBox}>
              <Text style={styles.title}>搜索城市 / 地点</Text>
              <TextInput
                value={query}
                onChangeText={handleChange}
                placeholder="输入城市名称 (如 Beijing, Tokyo, Paris)"
                placeholderTextColor="rgba(255,255,255,0.4)"
                style={styles.input}
                autoFocus
                returnKeyType="search"
                onSubmitEditing={() => performSearch(query.trim())}
              />

              {/* 最近选择历史 */}
              {selectionHistory.length > 0 && (
                <View style={styles.historyWrap}>
                  <View style={styles.historyHeaderRow}>
                    <Text style={styles.historyTitle}>最近选择</Text>
                    <TouchableOpacity
                      onPress={() => {
                        setSelectionHistory([]);
                        saveSelectionHistory([]);
                      }}
                    >
                      <Text style={styles.clearHistory}>清空</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={styles.historyChips}>
                    {selectionHistory.map((h) => (
                      <TouchableOpacity
                        key={h.displayName}
                        style={styles.historyChip}
                        onPress={() => handleHistorySelect(h)}
                      >
                        <Text style={styles.historyChipText} numberOfLines={1}>
                          {h.displayName}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}

              {error && <Text style={styles.errorText}>{error}</Text>}
              <View style={styles.resultsContainer}>
                {loading && (
                  <View style={styles.loadingWrap}>
                    <ActivityIndicator color="#fff" />
                  </View>
                )}
                {!loading &&
                  results.length === 0 &&
                  query.length >= minQueryLength &&
                  !error && <Text style={styles.noResult}>暂无结果</Text>}
                <FlatList
                  data={results}
                  keyExtractor={(item, idx) =>
                    `${item.providerId || item.displayName}-${idx}`
                  }
                  renderItem={renderItem}
                  keyboardShouldPersistTaps="handled"
                  contentContainerStyle={
                    results.length === 0 ? styles.emptyList : undefined
                  }
                  style={{ maxHeight: 300 }}
                />
              </View>

              <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
                <Text style={styles.closeBtnText}>关闭</Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "center",
    padding: 24,
  },
  modalBox: {
    backgroundColor: "#1f2430",
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  title: { fontSize: 16, fontWeight: "600", color: "#fff", marginBottom: 12 },
  input: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: "#fff",
    fontSize: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
    marginBottom: 10,
  },
  errorText: { color: "#ff6b6b", fontSize: 12, marginBottom: 6 },
  resultsContainer: { marginBottom: 12 },
  loadingWrap: { paddingVertical: 20 },
  noResult: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 13,
    paddingVertical: 12,
    textAlign: "center",
  },
  resultItem: {
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.08)",
  },
  resultName: { color: "#fff", fontSize: 14, marginBottom: 2 },
  resultType: { color: "rgba(255,255,255,0.5)", fontSize: 11 },
  emptyList: { flexGrow: 1, justifyContent: "center" },
  closeBtn: {
    backgroundColor: "#3d7bfd",
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  closeBtnText: { color: "#fff", fontSize: 14, fontWeight: "600" },
  historyWrap: { marginBottom: 10 },
  historyHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  historyTitle: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  clearHistory: { color: "rgba(255,255,255,0.5)", fontSize: 12 },
  historyChips: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  historyChip: {
    backgroundColor: "rgba(255,255,255,0.1)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    marginRight: 6,
    marginBottom: 6,
  },
  historyChipText: { color: "#fff", fontSize: 12, maxWidth: 140 },
});
