import React, { useState } from 'react';
import './index.less'
const { ipcRenderer } = window.require('electron');
function NewModuleModal(){
    const [value, setValue] = useState('');

    const onPost = () => {
        console.log(value)
        const res = value.trim();
        if(res.length===0){
            ipcRenderer.send('messageModal', 'please ensure to enter the module name')
        } else {
           // post fetch
           // close modal
           ipcRenderer.send('closeModal', {value: res, eventName: 'newModuleExecute'})
        }
    }
    const onChangeValue = (e) => {
        setValue(e.target.value)
    }
    return (
        <div className='modal-container'>
            <div className='input-wraper'>
                <label htmlFor="module name">module name:</label>
                <input placeholder='please enter the module name' value={value} onChange={onChangeValue}></input>
            </div>
            <button className='bottom-button' onClick={onPost}>post</button>
        </div>
    )
}
export default NewModuleModal