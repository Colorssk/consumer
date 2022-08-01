import React, { useState } from 'react';
import './index.less'
import { sendEmail } from '../../api/configInfo'
const { ipcRenderer } = window.require('electron');
function NewModuleModal(){
    const [value, setValue] = useState('');
    const [sendFlag, setSendFlag] = useState(false)
    const onSendCode =  () => {
         sendEmail({});
         setSendFlag(true)
    }
    const onPost = async () => {
        console.log(value)
        const res = value.trim();
        if(res.length===0){
            ipcRenderer.send('messageModal', 'please ensure to enter the module name')
        } else {
            ipcRenderer.send('closeModal', {value: res, eventName: 'saveTemplateexecute'})
        }
    }
    const onChangeValue = (e) => {
        setValue(e.target.value)
    }
    return (
        <div className='save-confirm-container'>
            <div className='input-wraper'>
                <label htmlFor="module name">code:</label>
                <input placeholder='please enter the verification code' value={value} onChange={onChangeValue}></input>
                {!sendFlag && <button onClick={onSendCode}>send</button>}
                
            </div>
            <button className='bottom-button' disabled={!sendFlag && !value.length} onClick={onPost}>post</button>
        </div>
    )
}
export default NewModuleModal