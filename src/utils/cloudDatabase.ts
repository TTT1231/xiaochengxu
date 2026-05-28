/** WeChat Cloud Database client-side wrapper (read-only) */

/** Get a read-only database instance for client-side queries.
 *  Only `products` and `categoried` collections are readable from client. */
export function getDatabase() {
   return wx.cloud.database();
}
