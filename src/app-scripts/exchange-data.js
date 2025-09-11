function doGet(request) {
    return getExchangeData(request);
}

// function test1() {
//     doGet({
//         parameter: {
//             sheetId: "1X93126pZVHEopktgE83JwmT1nEViaff1z6KSlYoTPWk"
//         }
//     });
// }

// 获取pqt兑换数据；
// 从Google Sheet获取指定id的表格，并转为json数据返回；
// id通过url动态传递；
// 表格可由任何人编辑，但一定要保证参数正确，否则会出现兑换错误的问题；
function getExchangeData(request) {
    try {
        const sheetId = request.parameter.sheetId;
        const sheetName = request.parameter.sheetName || 'Sheet1';
        Logger.log(`获取兑换数据: id=${sheetId}; name=${sheetName}`);
        Logger.log(`客户端信息：${request.parameter.client || '无'}`)
        if (!sheetId) {
            throw new Error("缺少必需参数: sheetId");
        }

        // 根据 ID 打开指定的 Spreadsheet
        const ss = SpreadsheetApp.openById(sheetId);
        const spreadsheetUrl = ss.getUrl();
        const sheet = ss.getSheetByName(sheetName);

        if (!sheet) {
            throw new Error(`找不到名为 "${sheetName}" 的工作表`);
        }

        const data = sheet.getDataRange().getValues();
        if (data.length === 0) {
            return output({ success: true, data: [] });
        }
        const headers = data[0];
        const jsonData = [];
        const imageFields = [];
        for (let i = 1; i < data.length; i++) {
            const row = {};
            for (let j = 0; j < headers.length; j++) {
                const value = data[i][j];
                if (value.valueType == SpreadsheetApp.ValueType.IMAGE) {
                    row[headers[j]] = getImageUrl(value);
                    imageFields.push(`${i - 1}:${headers[j]}`);
                }
                else {
                    row[headers[j]] = value;
                }
            }
            jsonData.push(row);
        }

        return output({
            success: true,
            source: {
                spreadsheetId: sheet.getParent().getId(),
                spreadsheetName: sheet.getParent().getName(),
                sheetName: sheet.getName(),
                spreadsheetUrl: spreadsheetUrl
            },
            data: jsonData,
            extraData: {
                imageFields
            }
        });
    }
    catch (error) {
        Logger.log(`失败: ${error.message}`);
        return output({
            success: false,
            data: null,
            error: error.message
        });
    }
}

// 返回json数据
function output(respData) {
    const output = ContentService.createTextOutput(JSON.stringify(respData));
    output.setMimeType(ContentService.MimeType.JSON);
    return output;
}

function getImageUrl(value) {
    const contentUrl = value.getContentUrl();
    Logger.log(`获取图片链接：${contentUrl}`);
    return contentUrl;
}