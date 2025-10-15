// 获取兑换参数配置；
// 返回sheetId和sheetName
function doGet(request = {}) {
  let client = request.parameter?.client;
  const config = readJsonFromDrive();
  try {
    if (client) {
      client = JSON.parse(client);
      const logConfig = config.log;
      const ss = SpreadsheetApp.openById(logConfig.sheetId);
      const sheet = ss.getActiveSheet();
      if (sheet.getLastRow() === 0) {
        sheet.getRange('A1:D1').setValues([[
          '时间', 'userAgent', '消息', ""
        ]]);
      }
      sheet.appendRow([
        new Date().toISOString(),
        client.userAgent || "-",
        client.log || "-",
        ""
      ]);
    }
  }
  catch (error) {
    console.error("记录日志时出现错误");
    Logger.log(error);
  }
  delete config.log;
  return output(config);
}

function test1() {
  doGet({
    parameter: {
      client: '{"userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36","log":"copy:测试。。。"}'
    }
  });
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