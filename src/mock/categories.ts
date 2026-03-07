/**
 * 分类数据 - 根据 Figma 设计
 */

import type { Category } from '@/types';
import { categoryIcons } from '@/data/imgPaths';

export const categories: Category[] = [
   {
      id: 'cat-1',
      name: '招牌推荐',
      icon: categoryIcons.recommend.icon,
      activeIcon: categoryIcons.recommend.activeIcon,
   },
   {
      id: 'cat-2',
      name: '精选西点',
      icon: categoryIcons.cake.icon,
      activeIcon: categoryIcons.cake.activeIcon,
   },
   {
      id: 'cat-3',
      name: '特调饮品',
      icon: categoryIcons.coffee.icon,
      activeIcon: categoryIcons.coffee.activeIcon,
   },
   {
      id: 'cat-4',
      name: '休闲零食',
      icon: categoryIcons.snack.icon,
      activeIcon: categoryIcons.snack.activeIcon,
   },
   {
      id: 'cat-5',
      name: '礼品套装',
      icon: categoryIcons.gift.icon,
      activeIcon: categoryIcons.gift.activeIcon,
   },
];
