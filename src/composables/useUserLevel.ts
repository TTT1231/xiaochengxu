/** 用户等级配置 */
interface LevelConfig {
   /** 等级标识 (用于 CSS class) */
   tier: 'regular' | 'bronze' | 'silver' | 'gold';
   /** 是否为付费等级 (青铜及以上) */
   isVip: boolean;
   /** 主色 */
   color: string;
   /** 浅色背景 */
   lightBg: string;
   /** UserCard 渐变背景 */
   gradientBg: string;
   /** UserCard 卡片阴影 */
   shadow: string;
   /** 顶部氛围带渐变 (从深到浅，纵向) */
   bannerGradient: string;
   /** 整页背景色 (极淡等级色调) */
   pageBg: string;
   /** 客服按钮渐变 */
   serviceGradient: string;
   /** 徽章渐变填充 */
   badgeGradient: string;
   /** 显示文本 (用户→会员) */
   displayLabel: string;
}

const LEVEL_CONFIG: Record<string, LevelConfig> = {
   普通用户: {
      tier: 'regular',
      isVip: false,
      color: '',
      lightBg: '',
      gradientBg: '',
      shadow: 'none',
      bannerGradient: 'transparent',
      pageBg: '#f8f7f6',
      serviceGradient: 'linear-gradient(to right, #ee862b, #f59e0b)',
      badgeGradient: '',
      displayLabel: '普通用户',
   },
   青铜用户: {
      tier: 'bronze',
      isVip: true,
      color: '#B87333',
      lightBg: 'rgba(184, 115, 51, 0.08)',
      gradientBg: 'linear-gradient(135deg, #FAF5F0, #F5EDE4)',
      shadow: '0 4rpx 20rpx rgba(184, 115, 51, 0.12)',
      bannerGradient: 'linear-gradient(180deg, #D2B48C 0%, #EDE0D4 40%, #F5EDE4 75%, #FAF5F0 100%)',
      pageBg: '#FBF8F5',
      serviceGradient: 'linear-gradient(to right, #ee862b, #B87333)',
      badgeGradient: 'linear-gradient(135deg, #B87333, #CD9B6A)',
      displayLabel: '青铜会员',
   },
   白银用户: {
      tier: 'silver',
      isVip: true,
      color: '#9CA3AF',
      lightBg: 'rgba(156, 163, 175, 0.08)',
      gradientBg: 'linear-gradient(135deg, #F8F9FA, #EEF0F2)',
      shadow: '0 4rpx 20rpx rgba(156, 163, 175, 0.15)',
      bannerGradient: 'linear-gradient(180deg, #D1D5DB 0%, #E5E7EB 40%, #EEF0F2 75%, #F8F9FA 100%)',
      pageBg: '#F9FAFB',
      serviceGradient: 'linear-gradient(to right, #ee862b, #9CA3AF)',
      badgeGradient: 'linear-gradient(135deg, #9CA3AF, #B8BEC6)',
      displayLabel: '白银会员',
   },
   黄金用户: {
      tier: 'gold',
      isVip: true,
      color: '#D97706',
      lightBg: 'rgba(217, 119, 6, 0.08)',
      gradientBg: 'linear-gradient(135deg, #FFFBEB, #FEF3C7)',
      shadow: '0 4rpx 24rpx rgba(217, 119, 6, 0.18)',
      bannerGradient: 'linear-gradient(180deg, #F59E0B 0%, #FBBF24 30%, #FDE68A 65%, #FFFBEB 100%)',
      pageBg: '#FFFEF5',
      serviceGradient: 'linear-gradient(to right, #ee862b, #D97706)',
      badgeGradient: 'linear-gradient(135deg, #D97706, #F59E0B)',
      displayLabel: '黄金会员',
   },
};

/** 获取用户等级配置 */
export function useUserLevel(level: string): LevelConfig {
   return LEVEL_CONFIG[level] ?? LEVEL_CONFIG['普通用户'];
}
