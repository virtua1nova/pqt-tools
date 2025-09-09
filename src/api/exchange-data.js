// 获取兑换参数列表；
// 从配置文件中获取
export async function getExchangeData(params) {
    const { sheetId, sheetName = '', deploymentId } = params;
    const scriptUrl = `https://script.google.com/macros/s/${deploymentId}/exec`;
    let url = `${scriptUrl}?sheetId=${sheetId}&sheetName=${sheetName}`;
    const resp = await fetch(url, {
        method: 'GET',
        redirect: 'follow'
    });
    return await resp.json();
}

// 获取兑换配置(当前表格的信息)
export async function getExchangeDataConfig() {
    const scriptUrl = "https://script.google.com/macros/s/AKfycbyRrP5xSt3A_fyTieysOFgv2gljQI2iunJEc0CRijOlOTOXiNesbNX2-GZyRRFVRXFe/exec";
    let url = `${scriptUrl}`;
    const resp = await fetch(url, {
        method: 'GET',
        redirect: 'follow'
    });
    return await resp.json();
}