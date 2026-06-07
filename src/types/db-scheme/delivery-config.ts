/** 配送费配置表（单行文档） */
export interface DeliveryConfig {
   /** 文档 ID，固定为 'config' */
   _id: string;
   /** 满多少元免配送费 */
   free_threshold: number;
   /** 未满时的配送费 */
   delivery_fee: number;
   /** 最后修改时间 */
   updated_at: string;
}
