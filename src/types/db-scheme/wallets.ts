/** 用户钱包表 */
export interface Wallets {
   _id: string;
   /** 关联用户 openid */
   user_id: string;
   /** 当前余额（元） */
   balance: number;
   /** 累计充值金额（元） */
   total_recharged: number;
   /** 创建时间 */
   created_at: string;
   /** 最后更新时间 */
   updated_at: string;
}
