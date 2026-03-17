/** 用户表 */
export interface Users {
   /** 微信 openid (主键) */
   openid: string;
   /** 用户名 */
   name: string;
   /** 唯一6位用户ID */
   id: string;
   /** 用户等级 (普通会员/黄铜会员/白银会员/黄金会员) */
   level: string;
   /** 创建时间 */
   created_at: string;
   /** RLS auth id */
   user_id: string;
}

/** 用户积分表 */
export interface Credits {
   _id: string;
   /** 关联用户 openid */
   users_id: string;
   /** 累计积分 */
   total_scores: number;
   /** 可用积分 */
   available_scores: number;
}
