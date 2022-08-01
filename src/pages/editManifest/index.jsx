/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import JSONEditor from 'jsoneditor';
import 'jsoneditor/dist/jsoneditor.css';
import './index.less';
import { fetchConfigInfo, saveTemplate } from '../../api/configInfo'
const { ipcRenderer } = window.require('electron');
function EditManifest() {
    const [list, setList] = useState([])
    const [activeIndex, setActiveIndex] = useState(0);
    const activeIndexCache = useRef(0);
    const [data, setData] = useState([])
    const dataCache = useRef([]) // 总数据的缓存
    const [isEdit, setIsEdit] = useState(false);
    const editorRef = useRef(null)
    const currentEditCache = useRef(null); // 编辑框内的缓存
    const [classCalcuate, setClassCalcuate] = useState(true); // 绑定类计算
    const loadOnce = useRef(false);
    useEffect(() => {
        const container = document.getElementById("jsonEditor") || null;
        const options = {
            mode: 'tree',
            onChangeText: (jsonString) => {
                setIsEdit(true)
                currentEditCache.current = jsonString
            }
        };
        if (!editorRef.current) {
            editorRef.current = new JSONEditor(container, options);
        }
        if (editorRef.current) {
            setInitialData()
        } else {
            console.log('didnot get editor ref')
        }
        if(!loadOnce.current){
            ipcRenderer.on('reFrechList', () => {
                setActiveIndex(0)
                activeIndexCache.current = 0;
                setInitialData()
                setIsEdit(false)
            })
            ipcRenderer.on('saveCurrenEditItem', (event) => {
                setIsEdit(false)
                event.sender.send('saveFile', {
                    currentEditCache: currentEditCache?.current
                });
                const dataTemp =  JSON.parse(JSON.stringify(dataCache.current))
                dataTemp[activeIndexCache.current] =  JSON.parse(currentEditCache?.current)
                setData(dataTemp)
                dataCache.current = dataTemp
                setList(dataTemp.map(el => ({ title: el.name })))
            })
            // new module
            ipcRenderer.on('newModuleExecute', (event, name) => {
                if(dataCache.current.some(el=>String(el.name) === String(name))){
                    event.sender.send('messageModal', 'create failed, in original list include the same name')
                } else {
                    const currentCache = JSON.parse(JSON.stringify(dataCache.current)) || null;
                    const templateItem = {
                        name : name,
                        npmName : name,
                        version : "0.0.1",
                        installCommand : "npm install",
                        startCommand : "npm run serve",
                        type : "normal",
                        tag : ["project"],
                        description : "xxxx",
                        ignore : ["public/**"]
                    }
                    if(currentCache){
                        currentCache.push(templateItem)
                        setData(currentCache)
                        dataCache.current = currentCache
                        setList(currentCache.map(el => ({ title: el.name })))
                        event.sender.send('saveFile', {
                            currentEditCache: JSON.stringify(templateItem)
                        });
                    }
                }
            
            })

            // 保存模块
            ipcRenderer.on('saveTemplateexecute', async (event, code) => {
                console.log(dataCache.current, activeIndexCache.current)
                const res = await saveTemplate({
                    editData: dataCache.current[activeIndexCache.current],
                    verifyCode: Number(code)
                });
                if (res.result === 'success'){
                    const res = ipcRenderer.sendSync('delStoreValue', `local.${dataCache.current[activeIndexCache.current]?.name}`) || {}
                    event.sender.send('messageModal', res)
                    setClassCalcuate(false)
                    setTimeout(() => {
                        setClassCalcuate(true)
                    }, 200);
                } else {
                    event.sender.send('messageModal', res.result)
                }
            })
            
        }
        loadOnce.current = true
    }, [])

    useEffect(()=>{
        const listContainer = document.querySelector('.leftContainer');
        if (listContainer) {
            listContainer.addEventListener('contextmenu', ev => {
                ev.preventDefault();
                const localData = ipcRenderer.sendSync('requestStoreValue', 'local') || {}
                const name = ev.target.dataset?.name
                const client = {
                    x: ev.clientX,
                    y: ev.clientY,
                    rightMenuIndex: ev.target.dataset?.index,
                    activeIndex,
                    isPosted: (Object.keys(localData).length > 0 && Object.keys(localData).some(el=> el===name))// the item only local have cahce can post 
                };
                ipcRenderer.send('menu', client);
            });
        }
    }, [activeIndex])

    const setInitialData = async () => {
        const localData = ipcRenderer.sendSync('requestStoreValue', 'local') || {}
        const localObjRes = {}
        if(!!Object.keys(localData).length){
            for(const [key, value] of Object.entries(localData)){
                localObjRes[key] = JSON.parse(value)
            }
        }
        const remoteRes = await fetchConfigInfo()
        const remoteObjRes = {};
        if(!!remoteRes.length){
            remoteRes.forEach(el=>{
                remoteObjRes[el.name] = el
            })
        }
        const resObj = {...remoteObjRes, ...localObjRes};
        const res = Object.values(resObj)
        setData(res)
        dataCache.current = res
        setList(res.map(el => ({ title: el.name })))
        editorRef.current.set(res[0]);
        // 数据库重名的被替换
    }
    const selectItem = (index) => {
        setActiveIndex(index);
        activeIndexCache.current = index;
        setIsEdit(false)
        if (editorRef.current) {
            editorRef.current.set(data[index])
        }
    }
    const signListClassName = useCallback((name) => {
        const localData = ipcRenderer.sendSync('requestStoreValue', 'local') || {}
        const res = (Object.keys(localData).length > 0 && Object.keys(localData).some(el=> el===name)) ? 'requirePost' : ''
        return res
    }, [classCalcuate])
    return (
        <div className='editPage'>
            <div className='leftContainer'>
                {
                    classCalcuate && list.map((item, index) => (
                        <div title={item.title} data-index={index} data-name={item.title} key={index} className={`itemBlock ${activeIndex === index ? 'active' : ''} ${signListClassName(item.title)}`} onClick={() => { selectItem(index) }}>{item.title}</div>
                    ))
                }
            </div>
            <div className={`rightContainer ${isEdit ? 'haveChanged' : ''}`} id='jsonEditor'></div>
        </div>
    )

}
export default EditManifest;