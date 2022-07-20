const Store = require('electron-store');
const { app, BrowserWindow, dialog } = require('electron');
const isDev = require('electron-is-dev');
const { Menu, ipcMain } = require('electron');
const path = require("path");
let mainwindow, newModuleModalWindow;
// 菜单模板
const menuTemplate = ({ isPost }) => {
    return [{
        label: '复制'
    }, isPost && {
        label: '提交'
    }].filter(el => el)
}
// 构建菜单项
var menu = Menu.buildFromTemplate(menuTemplate({ isPost: false }));
const store = new Store('local')
app.on('ready', () => {
    mainwindow = new BrowserWindow({
        width: 1024,
        height: 680,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true,
        },
        titlestring: 'Cousumer Platform',
        icon: path.join(__dirname, './assets/headPortrait.jpg')
    });
    // 菜单模板设置
    let topMenuTemplate = [
        {
            label: 'refreshList',
            accelerator: 'Shift+CmdOrCtrl+F5',
            click: function (item) {
                mainwindow.webContents.send('reFrechList', true);
            }
        },
        {
            label: 'tools',
            submenu: [
                {
                    label: 'save',
                    accelerator: 'CmdOrCtrl+S',
                    click: function (item) {
                        mainwindow.webContents.send('saveCurrenEditItem', true);
                    }
                },
                {
                    label: 'clean',
                    accelerator: 'Shift+CmdOrCtrl+Delete',
                    click: function (item) {
                        dialog.showMessageBox(mainwindow, {title: 'info', message: 'have cleaned local cache'});
                        store.clear();
                        mainwindow.webContents.send('reFrechList', true);
                    }
                }
            ]
        },
        {
            label: 'list',
            submenu: [
                {
                    label: 'new module', accelerator: 'Shift+CmdOrCtrl+N', click: function (item, focusedWindow) {
                        const urlNewModuleLocation = isDev ? 'http://localhost:3000/newModuleModal' : 'platformUrl';
                        newModuleModalWindow = new BrowserWindow({
                            width: 500,
                            height: 500,
                            webPreferences: {
                                nodeIntegration: true,
                                contextIsolation: false,
                                enableRemoteModule: true,
                            },
                            parent: focusedWindow,
                            modal: true,
                            momodalable: true,
                            hasShadow: true,
                            titlestring: 'Add New Item'
                        });
                        newModuleModalWindow.setMenu(null);
                        newModuleModalWindow.loadURL(urlNewModuleLocation);
                        newModuleModalWindow.webContents.openDevTools();
                    }
                }
            ]
        },
        {
            label: 'rule',
            submenu: [
                {
                    label: 'pc code standards',
                    accelerator: 'Shift+CmdOrCtrl+I',
                    click: function (item, focusedWindow) {
                        const urlNewModuleLocation = isDev ? 'https://www.yuque.com/docs/share/b8db93a3-006d-4560-b948-a63d4cd0b112?# 《项目技术规范》' : 'platformUrl';
                        newModuleModalWindow = new BrowserWindow({
                            useContentSize: true,
                            webPreferences: {
                                nodeIntegration: true,
                                contextIsolation: false,
                                enableRemoteModule: true,
                            },
                            parent: focusedWindow,
                            modal: true,
                            momodalable: true,
                            hasShadow: true,
                            titlestring: 'code standards'
                        });
                        newModuleModalWindow.setMenu(null);
                        newModuleModalWindow.loadURL(urlNewModuleLocation);
                        newModuleModalWindow.webContents.openDevTools();
                    }
                }
            ]
        }
    ]
    // 加载菜单
    var topMenu = Menu.buildFromTemplate(topMenuTemplate)
    mainwindow.setMenu(topMenu)
    // Menu.setApplicationMenu(topMenu)
    // 右键菜单
    ipcMain.on('menu', (ev, arg) => {
        if (Number(arg.rightMenuIndex) === Number(arg.activeIndex) && arg.isPosted) {
            menu = Menu.buildFromTemplate(menuTemplate({ isPost: true }))
        } else {
            menu = Menu.buildFromTemplate(menuTemplate({ isPost: false }))
        }
        setTimeout(() => {
            menu.popup({
                x: arg.x,
                y: arg.y
            });
        }, 150);
    });
    // 保存文件
    ipcMain.on('saveFile', (ev, {currentEditCache}) => {
        try{
            const cacheitem = JSON.parse(currentEditCache)
            if(!cacheitem?.name){
                return dialog.showErrorBox(mainwindow, 'error', 'name can not be empty')
            }
            store.set(`local.${cacheitem?.name}`, currentEditCache)
        }catch(e){
            dialog.showErrorBox('error', e)
        }
       
    });
    // renderer process 获取store的值
    ipcMain.on('requestStoreValue', (event, key) => {
        event.returnValue = store.get(key);
      });
    // 显示弹窗提示
    ipcMain.on('messageModal', (event, value) => {
        dialog.showMessageBox(mainwindow,{title: 'info', message: value})

    })
    // 关闭弹窗
    ipcMain.on('closeModal', (event, name) => {
        if(newModuleModalWindow){
            newModuleModalWindow.close();
            mainwindow.webContents.send('newModuleExecute', name)
        }
    })
    console.log(app.getPath('userData'))
    const urlLocation = isDev ? 'http://localhost:3000' : 'platformUrl';
    mainwindow.loadURL(urlLocation)
    mainwindow.webContents.openDevTools();
});