import { get } from '../utils/fetch.js'
export const fetchConfigInfo = async (param) => {
    try {
        const response = await get('/api/project/template', {})
        return response.data;
    } catch (e) {
        return false;
    }
}