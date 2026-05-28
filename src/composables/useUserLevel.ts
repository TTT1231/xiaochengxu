interface LevelConfig {
   tier: 'normal' | 'vip';
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
   badgeTextColor: string;
}

const LEVEL_CONFIG: Record<string, LevelConfig> = {
   普通用户: {
      tier: 'normal',
      isVip: false,
      color: '#E8873A',
      lightBg: 'rgba(232, 135, 58, 0.06)',
      gradientBg: 'linear-gradient(135deg, #FFF8F2, #FEF0E2)',
      shadow: '0 2rpx 12rpx rgba(232, 135, 58, 0.08)',
      bannerGradient: 'linear-gradient(180deg, #FBBF7E 0%, #FDD9A8 30%, #FEF0E2 60%, #FFF8F2 100%)',
      pageBg: '#FFFAF6',
      serviceGradient: 'linear-gradient(to right, #ee862b, #f59e0b)',
      badgeGradient: 'rgba(232, 135, 58, 0.1)',
      displayLabel: '普通用户',
      badgeTextColor: '#C06A20',
   },
   会员用户: {
      tier: 'vip',
      isVip: true,
      color: '#A16207',
      lightBg: 'rgba(161, 98, 7, 0.10)',
      gradientBg: 'linear-gradient(135deg, #FFFBEB, #FEF3C7)',
      shadow: '0 4rpx 28rpx rgba(161, 98, 7, 0.18)',
      bannerGradient:
         'linear-gradient(180deg, #92400E 0%, #B45309 15%, #D97706 35%, #F59E0B 55%, #FCD34D 75%, #FFFBEB 100%)',
      pageBg: '#FFFEF5',
      serviceGradient: 'linear-gradient(to right, #A16207, #D97706)',
      badgeGradient: 'linear-gradient(135deg, #92400E, #B45309 40%, #D97706 70%, #F59E0B)',
      displayLabel: '会员用户',
      badgeTextColor: '#ffffff',
   },
};

export function useUserLevel(level: string): LevelConfig {
   return LEVEL_CONFIG[level] ?? LEVEL_CONFIG['普通用户'];
}
