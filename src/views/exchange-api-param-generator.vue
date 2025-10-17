<template>
    <div class="container1">
        <p style="margin-bottom: 10px; font-size: 18px; font-weight: 500;">兑换参数转换器</p>
        <div style="margin-bottom: 5px; color: rgb(133, 84, 84); font-size: 14px;">基本使用方法: 解析 -> 生成 -> 复制 -> 粘贴[到终端] -> 执行</div>
        <div style="margin-bottom: 5px; color: red; font-size: 12px;">注: 生成的命令不要直接复制, 而应该点击[复制]按钮, 否则会因换行符没复制出来, 导致命令执行失败</div>
        <div style="margin-bottom: 5px">
            <div style="margin-bottom: 5px;">
                <label for="command" style="display: inline-block; margin-bottom: 5px;">
                    抓包数据:
                </label>
                <div style="display: flex; align-items: flex-start; margin-bottom: 5px;">
                    <textarea v-model="command" placeholder="请输入" id="command" style="width: 500px; margin-right: 10px;" rows="6" />
                </div>
                <div style="margin-bottom: 5px;">
                    <button @click="showParamsDialog" style="margin-right: 10px;">浏览参数</button>
                    <button @click="parse" style="margin-right: 10px;">解析</button>
                    <span v-if="parsed">
                        成功, 当前兑换数量为: {{amount}}
                    </span>
                </div>
            </div>
            <div>
                <label for="newAmount" style="display: inline-block; margin-bottom: 5px;">
                    兑换数量:
                </label>
                <div style="display: flex; align-items: flex-start;">
                    <input type="text" placeholder="请输入" id="newAmount" style="margin-right: 10px; height: 24px;" v-model.number="newAmount">
                    <button @click="generate" style="margin-right: 10px; cursor: pointer;">生成</button>
                    <button @click="copy" style="margin-right: 10px; cursor: pointer;">复制</button>
                    <button @click="clear" style="margin-right: 10px; cursor: pointer;">清除</button>
                    <button :disabled="!executable || cooldown" @click="execute" :style="{'cursor': executable && !cooldown ? 'pointer' : 'not-allowed'}">执行</button>
                </div>
            </div>
            <div style="word-break: break-all; font-size: 13px; color: #855454; margin-top: 5px;">
                <div v-html="newCommand"></div>
            </div>
        </div>

        <div>本工具需要提供原始的抓包数据，以下面的数据为例：</div>
        <div style="font-size: 13px; padding-left: 10px; color: #855454">
            <div>curl -X POST 'https://us.nkrpg.com/api/exchange/exchangeItem' \</div>
            <div>-H 'Host: us.nkrpg.com' \</div>
            <div>-H 'User-Agent: Mozilla/5.0...</div>
            <div>-H 'Accept: */*' \</div>
            <div>-H 'Content-Type: application/x-www-form-urlencoded' \</div>
            <div>-H 'X-QOOKIA-DEVICE-TYPE: web' \</div>
            <div>-H 'X-QOOKIA-DEVICE: 26bed0e5-e198-4a91-93f7-58a8597b4932' \</div>
            <div>-H 'X-QOOKIA-SERVER-PREFIX: UVG' \</div>
            <div>-H 'X-QOOKIA-USER: UVG0000009756' \</div>
            <div>
                -H 'X-QOOKIA-DIGEST: 2ec453e2f13b0200b1cbd761dfc823b05dfd260d' \
            </div>
            <div>-H 'X-QOOKIA-PACK: 6a18fc16671e92d6a20655bd74ba1fd6c04bb4d1' \</div>
            <div>...</div>
            <div>--data-raw 'amount=2&setting_id=539&cost=%5B...%5D'</div>
        </div>
        <div>将其复制到输入框内即可。</div>
        <span style="color: red; font-size: 12px;">(注意一定要包含兑换参数，如"--data-raw", 或"-Body")</span>
        <div style="font-size: 13px;">若是PowerShell, 则一般为: Invoke-WebRequest -UseBasicParsing -Uri "https://us.nkrpg.com...,</div>
        <div style="font-size: 13px;">若是fetch, 则以fetch开头, 并且可直接在当前网页上执行</div>
        <SimpleDialog
            v-model:visible="dialogVisible"
            title="兑换参数对照表"
            :data="list"
            :description="description"
            @refresh="refresh"
            :loading="loading"
            :error="dialogError"
            @copy="copyDialogContent"
        />
        <SimpleDialog
            v-model:visible="executeDialogVisible"
            title="执行fetch命令"
            :data1="info2Execute"
        />
    </div>
</template>

<script setup>
import { reactive, ref, computed } from "vue";
import { useGetExchangeData } from "../composables/exchange-data";
import { useGetExchangeDataConfig } from "../composables/exchange-data-config";
import SimpleDialog from "../components/SimpleDialog.vue";
import { getExchangeData } from "../api/exchange-data";

const command = ref("");
const parsed = ref(false);
const amount = ref("");
const commandParsed = reactive({ type: '', part1: null, part2: null, part3: null, extra: null });

const newCommand = ref("");
const newAmount = ref("");
const dialogVisible = ref(false);
const loading = ref(false);
const dialogError = ref("");
const executable = ref(false);
const executeDialogVisible = ref(false);
const cooldown = ref(false);
const COST = "cost";
const AMOUNT = "amount";
const TYPE1 = "curl";
const TYPE2 = "PowerShell";
const TYPE3 = "fetch";
const fieldPattern = /[\-]+\w+\s+/;

const { config, queryExchangeDataConfig } = useGetExchangeDataConfig();
const { list, queryExchangeData, spreadsheetSource } = useGetExchangeData();
const info2Execute = reactive({
    message: ""
});

const descriptions = [
    "如果没有看到想要的兑换参数的话, 可前往在线表格帮忙填写",
    "使用方法: 复制 -> 拼接参数 -> 解析"
];
const description = computed(() => {
    if (spreadsheetSource.spreadsheetUrl) {
        const copying = [...descriptions];
        copying[0] += `: ${spreadsheetSource.spreadsheetUrl}`
        return copying;
    }
    return descriptions;
});

function copyDialogContent({ content, row }) {
    if (content) {
        navigator.clipboard.writeText(content);
        window.alert("复制成功");
    }
}

function getLogger(level = "info") {
    return (...args) => {
        log(level, ...args);
    }
}

// 先存到localStorage，之后再进行上报;
// 上报完之后，删除当前日志
function log(level, message) {
    let logInfo = localStorage.getItem("log_info");
    const date = new Date();
    const logItem = `[${date.toLocaleString()}] - ${level} - ${message}`;
    if (logInfo) {
        logInfo += `; ${logItem}`
    }
    else {
        logInfo = logItem;

    }
    localStorage.setItem("log_info", logInfo);
}

function showParamsDialog() {
    dialogVisible.value = true;
    if (!list.value.length) {
        refresh(false);
    }
}

function getClientInfo() {
    const clientInfo = {
      userAgent: navigator.userAgent
    };
    const logInfo = localStorage.getItem("log_info");
    if (logInfo) {
        clientInfo['log'] = logInfo;
        localStorage.removeItem("log_info");
    }
    return clientInfo;
}

async function refresh(force) {
    if (list.value.length) {
        list.value.length = 0;
    }
    loading.value = true;
    // 一天最多记录一次
    const loggedKey = localStorage.getItem("loggedKey");
    const validTime = loggedKey ? parseInt(loggedKey) : 0;
    let client = "";
    const date = new Date();
    const now = date.getTime();
    if (validTime < now) {
        const clientInfo = getClientInfo();
        if (clientInfo.log) {
            // 设置为凌晨
            date.setHours(24, 0, 0, 0);
            client = JSON.stringify(clientInfo);
            localStorage.setItem("loggedKey", date.getTime());
        }
    }
    try {
        await queryExchangeDataConfig(force, client);
        await queryExchangeData({
            ...config
        });
        dialogError.value && (dialogError.value = "");
    }
    catch (error) {
        console.log("拉取数据失败");
        console.log(error);
        dialogError.value = "拉取数据失败, 请检查网络或联系管理员";
    }
    finally {
        loading.value = false;
    }
}

/**
 * curl格式
 * @param {String} command
 * @param {{type, part1, part2, part2Parsed, part3, extra}} commandParsed
 */
function curlParser(command, commandParsed) {
    let key = "--data-raw";
    let index = command.lastIndexOf(key);

    if (index === -1) {
        key = "--data-binary";
        index = command.lastIndexOf(key);
    }
    if (index === -1) {
        return;
    }
    index += key.length
    commandParsed.type = TYPE1;
    commandParsed.part1 = command.slice(0, index);
    let part2 = command.slice(index);
    const result = part2.match(fieldPattern);
    if (result) {
        commandParsed.part3 = part2.slice(result.index);
        part2 = part2.slice(0, result.index);
    }
    part2 = part2.trim().slice(1, -1);
    commandParsed.part2 = part2;
    const groups = commandParsed.part1.match(/curl.*?["'](.*?)["']/);
    const extra = {
        url: groups ? groups[1] : ""
    };
    commandParsed.extra = extra;
}

// powerShell格式
function powerShellParser(command, commandParsed) {
    const key = "-Body";
    let index = command.lastIndexOf(key);
    if (index === -1) {
        return;
    }
    index += key.length
    commandParsed.type = TYPE2;
    commandParsed.part1 = command.slice(0, index);
    let part2 = command.slice(index);
    const result = part2.match(fieldPattern);
    if (result) {
        commandParsed.part3 = part2.slice(result.index);
        part2 = part2.slice(0, result.index);
    }
    part2 = part2.trim().slice(1, -1);
    commandParsed.part2 = part2;
    const groups = commandParsed.part1.match(/Invoke-WebRequest.*?["'](.*?)["']/);
    const extra = {
        url: groups ? groups[1] : ""
    };
    commandParsed.extra = extra;
}

function fetchParser(command, commandParsed) {
    commandParsed.type = TYPE3;
    // 提取fetch()里的参数, 并进一步解析
    const groups = command.match(/^fetch\((.*?)\);$/s);
    if (groups) {
        const key = ",";
        const matched = groups[1];
        const index = matched.indexOf(key);
        if (index != -1) {
            const extra = {
                url: matched.slice(1, index - 1),
                options: (new Function(`return ${matched.slice(index + 1)}`))()
            };
            commandParsed.part1 = extra.url;
            commandParsed.part2 = extra.options.body;
            commandParsed.extra = extra;
        }
    }
}

// 要修改的地方有两个：amount和cost;
// 解析出amount，并根据新设置的amount来生成cost，其他不变
function parse() {
    let _command = command.value;
    if (!_command) {
        window.alert("请输入抓包参数");
        return;
    }
    if (_command.startsWith(TYPE1)) {
        curlParser(_command, commandParsed);
    }
    else if (_command.startsWith("Invoke-WebRequest") || _command.startsWith("$session")) {
        powerShellParser(_command, commandParsed);
    }
    else if (_command.startsWith(TYPE3)) {
        fetchParser(_command, commandParsed);
    }
    if (!commandParsed.part1 || !commandParsed.part2) {
        return window.alert('解析失败, 参数格式是否正确?');
    }
    const params = commandParsed.part2.split("&");
    params.sort();
    const map = {};
    for (const item of params) {
        let [a, b] = item.split("=");
        if (a === COST) {
            b = decodeURIComponent(b);
            // json字符串；像是需要多种材料的
            if (b.startsWith("[")) {
                b = JSON.parse(b.replace(/\+/g, ""));
                for (const item of b) {
                    item.unit = item.value / map[AMOUNT];
                }
            }
            else {
                map.costUnit = b / map[AMOUNT];
            }
        }
        map[a] = b;
    }
    if (!map[AMOUNT] && !map[COST]) {
        window.alert("请输入正确的抓包参数");
        return;
    }
    commandParsed.part2Parsed = map;
    parsed.value = true;
    amount.value = map[AMOUNT];
}

function generate() {
    let _amount = newAmount.value;
    if (!_amount) {
        window.alert("请输入兑换数量");
        return;
    }
    // 不要小数
    _amount = _amount >> 0;
    if (_amount < 1) {
        window.alert("请输入正确的兑换数量");
        return;
    }
    let _params = "";
    const _copy = { ...commandParsed.part2Parsed };
    _copy[AMOUNT] = _amount;
    let costUnit;
    const cost = _copy[COST];
    if (!Array.isArray(cost)) {
        costUnit = _copy.costUnit;
        delete _copy.costUnit;
    }
    for (const key in _copy) {
        if (key === COST) {
            if (costUnit) {
                _params += `${key}=${costUnit * _amount}&`;
            }
            else {
                const _cost = [];
                for (const item of cost) {
                    const obj = {
                        ...item
                    };
                    obj.value = '' + (item.unit * _amount);
                    delete obj.unit;
                    _cost.push(obj);
                }
                _params += `${key}=${encodeURIComponent(JSON.stringify(_cost))}&`;
            }
        }
        else {
            _params += `${key}=${_copy[key]}&`;
        }
    }
    _params = _params.slice(0, -1);
    commandParsed.extra._params = _params;
    if (commandParsed.type === TYPE3) {
        newCommand.value = `fetch('${commandParsed.part1}', ${JSON.stringify({
            ...commandParsed.extra.options,
            body: _params
        })});`;
        executable.value = true;
    }
    else {
        newCommand.value = `${commandParsed.part1} '${_params}'`;
        if (commandParsed.part3) {
            newCommand.value += ` ${commandParsed.part3}`;
        }
    }
}

function copy() {
    if (newCommand.value) {
        navigator.clipboard.writeText(newCommand.value);
        const message = `copy:command:${commandParsed.type};${commandParsed.extra.url || "-"};${decodeURIComponent(commandParsed.extra._params)}`;
        getLogger()(message);
        window.alert("复制成功");
    }
}

// 执行fetch命令
async function execute() {
    if (!executable.value || cooldown.value) {
        return;
    }
    cooldown.value = true;
    setTimeout(() => {
        cooldown.value = false;
    }, 5000);
    const resp = await fetch(commandParsed.extra.url, {
        ...commandParsed.extra.options,
        body: commandParsed.extra._params
    });
    info2Execute.status_code = resp.status;
    let message = `execute:command:${commandParsed.type};${commandParsed.extra.url || "-"};${decodeURIComponent(commandParsed.extra._params)}`;
    try {
        message += ";ok"
        const respData = await resp.json();
        Object.assign(info2Execute, respData);
    }
    catch (error) {
        console.log(error);
        message += ";error"
        try {
            const respData = await resp.text();
            info2Execute.respText = respData;
        }
        catch (error) {
            console.log(error);
        }
        info2Execute.message = "请求失败, 网络或参数错误";
    }
    finally {
        executeDialogVisible.value = true;
        getLogger()(message);
    }
}

function clear() {
    if (newCommand.value) {
        newCommand.value = '';
    }
    if (parsed.value) {
        parsed.value = false;
    }
    if (command.value) {
        command.value = "";
    }
    newAmount.value && (newAmount.value = "");
    executable.value && (executable.value = false);
}
</script>