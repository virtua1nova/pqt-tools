// 获取兑换参数列表；
// 从配置文件中获取；
// 更新：因为授权问题，变得很麻烦，故改为前端来调用
export async function getExchangeData(params) {
    const { sheetId, sheetName = '' } = params;
    const { cancel, controller } = setRequestTimeout(15000);
    const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheetName)}`;
    const resp = await fetch(url, {
        method: 'GET',
        redirect: 'follow',
        signal: controller.signal
    });
    cancel();
    let text = await resp.text();
    const data = text.replace(/\"/g, "").split("\n").map(item => item.split(","));
    // 不要比头部字段多
    const headers = data[0].filter(item => item);
    const jsonData = [];
    for (let i=1; i<data.length; i++) {
        const row = {};
        const data1 = data[i];
        for (let j=0; j<headers.length; j++) {
            const value = data1[j];
            row[headers[j]] = value;
        }
        jsonData.push(row);
    }
    return {
        success: true,
        source: {
            sheetName: sheetName,
            spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${sheetId}/edit`
        },
        data: jsonData,
        extraData: {
            imageFields: []
        }
    };
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
export async function getExchangeDataConfig(params) {
    const { client = "" } = params;
    const { cancel, controller } = setRequestTimeout(15000);
    const scriptUrl = `https://script.google.com/macros/s/AKfycbwNSL2bAGjo2BW0kSy7f-PO7yDL6xf5TgemhTtUPpljMRL0ub22afYLWmLgEPDyrBQMAQ/exec?client=${client}`;
    let url = `${scriptUrl}`;
    const resp = await fetch(url, {
        method: 'GET',
        redirect: 'follow',
        signal: controller.signal
    });
    cancel();
    return await resp.json();
}