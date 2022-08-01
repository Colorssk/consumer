import { get, post } from '../utils/fetch.js'
export const fetchConfigInfo = async (param) => {
    try {
        const response = await get('/api/project/template', {})
        return response.data;
    } catch (e) {
        return false;
    }
}
export const sendEmail = async (param) => {
    try {
        console.log('before post')
        const response = await post('/api/email/sendEmail', param)
        return response.data;
    } catch (e) {
        return false;
    }
}

export const saveTemplate = async (param) => {
    try {
        const response = await post('/api/project/saveTemplte', param)
        return response.data;
    } catch (e) {
        return false;
    }
}