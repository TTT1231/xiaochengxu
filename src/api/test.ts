import { supabaseClient } from '../utils/supabaseClient';

//获取菜单数据
export async function getLeftMenuData() {
   return supabaseClient.from('categoried').select('*');
}
