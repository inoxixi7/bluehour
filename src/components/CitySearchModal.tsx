import React, { useState, useCallback, useRef } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator, Modal } from 'react-native';
import { GeocodeResult } from '../types';

/**
 * 城市搜索模态组件
 * 设计目标：
 * 1. 抽象：不直接依赖特定屏幕，只通过 props 回调向外传递结果
 * 2. 可扩展：封装 query -> fetch -> 标准化 -> 展示流程，未来可替换数据源
 * 3. 健壮：加入防抖、最小查询长度、错误处理、加载态、结果去重
 * 4. 纯 UI：不修改全局位置状态，交由上层决定如何应用
 */
interface CitySearchModalProps {
  visible: boolean;                 // 是否显示模态
  onClose: () => void;              // 关闭回调
  onSelect: (result: GeocodeResult) => void; // 选择某条结果
  minQueryLength?: number;          // 触发搜索的最小输入长度，默认 2
  debounceMs?: number;              // 输入防抖延时，默认 400ms
  limit?: number;                   // 返回结果数量上限，默认 8
}

export const CitySearchModal: React.FC<CitySearchModalProps> = ({
  visible,
  onClose,
  onSelect,
  minQueryLength = 2,
  debounceMs = 400,
  limit = 8,
}) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<GeocodeResult[]>([]);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  /**
   * 标准化 Nominatim 返回格式为 GeocodeResult
   */
  const normalizeNominatim = (raw: any): GeocodeResult => {
    return {
      displayName: raw.display_name,
      description: raw.display_name,
      latitude: parseFloat(raw.lat),
      longitude: parseFloat(raw.lon),
      type: raw.type,
      providerId: raw.osm_id,
      source: 'nominatim',
    };
  };

  /**
   * 执行搜索（已通过外层防抖控制）
   */
  const performSearch = useCallback(async (text: string) => {
    if (text.length < minQueryLength) {
      setResults([]);
      setError(null);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      // 使用官方公共实例；若未来需要自建 / 代理，可抽取成配置
      const url = `https://nominatim.openstreetmap.org/search?format=json&limit=${limit}&q=${encodeURIComponent(text)}`;
      const resp = await fetch(url, {
        headers: {
          'Accept-Language': 'zh-CN', // 尝试返回中文（视服务支持情况）
        },
      });
      if (!resp.ok) throw new Error(`网络错误: ${resp.status}`);
      const data = await resp.json();
      const mapped: GeocodeResult[] = (Array.isArray(data) ? data : []).map(normalizeNominatim);

      // 去重：采用 displayName 去重
      const uniqMap = new Map<string, GeocodeResult>();
      mapped.forEach(item => {
        if (!uniqMap.has(item.displayName)) uniqMap.set(item.displayName, item);
      });
      setResults(Array.from(uniqMap.values()));
    } catch (e) {
      setError(e instanceof Error ? e.message : '搜索失败');
    } finally {
      setLoading(false);
    }
  }, [limit, minQueryLength]);

  /**
   * 输入变化：应用防抖策略
   */
  const handleChange = (text: string) => {
    setQuery(text);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      performSearch(text.trim());
    }, debounceMs);
  };

  /**
   * 选择结果：回调并关闭
   */
  const handleSelect = (item: GeocodeResult) => {
    onSelect(item);
    onClose();
  };

  /**
   * 渲染结果项
   */
  const renderItem = ({ item }: { item: GeocodeResult }) => (
    <TouchableOpacity style={styles.resultItem} onPress={() => handleSelect(item)}>
      <Text style={styles.resultName} numberOfLines={1}>{item.displayName}</Text>
      {!!item.type && <Text style={styles.resultType}>{item.type}</Text>}
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
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
          {error && <Text style={styles.errorText}>{error}</Text>}

            {/* 结果区 */}
          <View style={styles.resultsContainer}>
            {loading && (
              <View style={styles.loadingWrap}>
                <ActivityIndicator color="#fff" />
              </View>
            )}
            {!loading && results.length === 0 && query.length >= minQueryLength && !error && (
              <Text style={styles.noResult}>暂无结果</Text>
            )}
            <FlatList
              data={results}
              keyExtractor={(item, idx) => `${item.providerId || item.displayName}-${idx}`}
              renderItem={renderItem}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={results.length === 0 ? styles.emptyList : undefined}
              style={{ maxHeight: 300 }}
            />
          </View>

          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeBtnText}>关闭</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    padding: 24,
  },
  modalBox: {
    backgroundColor: '#1f2430',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 12,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#fff',
    fontSize: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    marginBottom: 10,
  },
  errorText: {
    color: '#ff6b6b',
    fontSize: 12,
    marginBottom: 6,
  },
  resultsContainer: {
    marginBottom: 12,
  },
  loadingWrap: {
    paddingVertical: 20,
  },
  noResult: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 13,
    paddingVertical: 12,
    textAlign: 'center',
  },
  resultItem: {
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  resultName: {
    color: '#fff',
    fontSize: 14,
    marginBottom: 2,
  },
  resultType: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 11,
  },
  emptyList: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  closeBtn: {
    backgroundColor: '#3d7bfd',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  closeBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
