/** 用户表 */
export interface Users {
   /** 文档 _id = openid (微信唯一用户标识) */
   _id: string;
   /** 用户名 */
   name: string;
   /** 唯一7位用户ID */
   id: string;
   /** 创建时间 */
   created_at: string;
   /** 手机号 */
   phone?: string;
}

/** @deprecated 旧积分表，已废弃，使用 Wallets 替代 */
export interface Credits {
   _id: string;
   /** 关联用户 openid */
   users_id: string;
   /** 累计积分 */
   total_scores: number;
   /** 可用积分 */
   available_scores: number;
}
