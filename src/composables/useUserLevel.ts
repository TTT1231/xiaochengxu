interface LevelConfig {
   tier: 'regular' | 'bronze' | 'silver' | 'gold';
   isVip: boolean;
   color: string;
   lightBg: string;
   gradientBg: string;
   shadow: string;
   bannerGradient: string;
   pageBg: string;
   serviceGradient: string;
   badgeGradient: string;
   displayLabel: string;
}

const LEVEL_CONFIG: Record<string, LevelConfig> = {
   普通会员: {
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
      displayLabel: '普通会员',
   },
   黄铜会员: {
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
      displayLabel: '黄铜会员',
   },
   白银会员: {
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
   黄金会员: {
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

export function useUserLevel(level: string): LevelConfig {
   return LEVEL_CONFIG[level] ?? LEVEL_CONFIG['普通会员'];
}
