// 获取兑换参数列表；
// 从配置文件中获取
export async function getExchangeData(params) {
    const { sheetId, sheetName = '', deploymentId, client } = params;
    const { cancel, controller } = setRequestTimeout(10000);
    const scriptUrl = `https://script.google.com/macros/s/${deploymentId}/exec`;
    let url = `${scriptUrl}?sheetId=${sheetId}&sheetName=${sheetName}&client=${client}`;
    const resp = await fetch(url, {
        method: 'GET',
        redirect: 'follow',
        signal: controller.signal
    });
    cancel();
    return await resp.json();
}

function setRequestTimeout(timeout) {
    const controller = new AbortController();
    const id = setTimeout(() => {
        controller.abort();
    }, timeout);
    return {
        controller,
        cancel: () => {
            clearTimeout(id);
        }
    };
}

// 获取兑换配置(当前表格的信息)
export async function getExchangeDataConfig() {
    const { cancel, controller } = setRequestTimeout(10000);
    const scriptUrl = "https://script.google.com/macros/s/AKfycbyRrP5xSt3A_fyTieysOFgv2gljQI2iunJEc0CRijOlOTOXiNesbNX2-GZyRRFVRXFe/exec";
    let url = `${scriptUrl}`;
    const resp = await fetch(url, {
        method: 'GET',
        redirect: 'follow',
        signal: controller.signal
    });
    cancel();
    return await resp.json();
}

// export async function testCloudLog() {
//     const scriptUrl = "https://script.google.com/macros/s/AKfycbzvjsQR1ZvmQse7dZris_8zBSDkY8Mf98sGixtAXUph762cvZbkFyMEHgpTiK2Txcyd/exec";
//     let url = `${scriptUrl}`;
//     const resp = await fetch(url, {
//         method: 'GET',
//         redirect: 'follow'
//     });
//     return await resp.text();
// }