import type { ComponentProps } from 'react';
import type { Ionicons } from '@expo/vector-icons';

/** Ionicons 图标名（编译期检查拼写） */
export type IoniconName = ComponentProps<typeof Ionicons>['name'];
