// 获取兑换参数配置；
// 返回sheetId和sheetName
function doGet() {
    const config = readJsonFromDrive();
    return output(config);
}

// 返回json数据
function output(respData) {
    const output = ContentService.createTextOutput(JSON.stringify(respData));
    output.setMimeType(ContentService.MimeType.JSON);
    return output;
}

function readJsonFromDrive() {
    const files = DriveApp.getFilesByName("exchange-data-config.json");
    if (files.hasNext()) {
        const file = files.next();
        const blob = file.getBlob();
        const content = blob.getDataAsString();
        const jsonData = JSON.parse(content);
        return jsonData;
    }
    return {};
}