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
                    <textarea v-model="command" placeholder="请输入" id="command" style="width: 360px; margin-right: 10px;" rows="4" />
                </div>
                <div style="margin-bottom: 5px;">
                    <button @click="dialogVisible = true" style="margin-right: 10px;">浏览参数</button>
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
                    <button @click="generate" style="margin-right: 10px;">生成</button>
                    <button @click="copy" style="margin-right: 10px;">复制</button>
                    <button @click="clear">清除</button>
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
        <div style="font-size: 13px;">若是PowerShell, 则一般为: Invoke-WebRequest -UseBasicParsing -Uri "https://us.nkrpg.com...</div>
        <SimpleDialog
            v-model:visible="dialogVisible"
            title="兑换参数对照表"
            :data="list"
            :description="description"
            @refresh="refresh"
            :loading="loading"
            :error="dialogError"
        />
    </div>
</template>

<script setup>
import { reactive, ref, onMounted, computed } from "vue";
import { useGetExchangeData } from "../composables/exchange-data";
import { useGetExchangeDataConfig } from "../composables/exchange-data-config";
import SimpleDialog from "../components/SimpleDialog.vue";
// import { testCloudLog } from "../api/exchange-data";

const command = ref("");
const parsed = ref(false);
const amount = ref("");
const commandParsed = reactive({ type: '', part1: null, part2: null, part3: null});

const newCommand = ref("");
const newAmount = ref("");
const dialogVisible = ref(false);
const loading = ref(false);
const dialogError = ref("");

const COST = "cost";
const AMOUNT = "amount";
const TYPE1 = "curl";
const TYPE2 = "PowerShell";
const fieldPattern = /[\-]+\w+\s+/;

const { config, queryExchangeDataConfig } = useGetExchangeDataConfig();
const { list, queryExchangeData, spreadsheetSource } = useGetExchangeData();

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

onMounted(() => {
    refresh(false);
});

function getClientInfo() {
    const clientInfo = {
      userAgent: navigator.userAgent
    };
    return clientInfo;
}

const clientInfo = getClientInfo();

async function refresh(force) {
    if (list.value.length) {
        list.value.length = 0;
    }
    loading.value = true;
    try {
        await queryExchangeDataConfig(force);
        await queryExchangeData({
            ...config,
            client: clientInfo
        });
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
 * @param {{type, part1, part2, part2Parsed, part3}} commandParsed
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
}

// 假定参数在命令的最后一行
function parse() {
    let _command = command.value;
    if (!_command) {
        window.alert("请输入抓包参数");
        return;
    }
    if (_command.startsWith(TYPE1)) {
        curlParser(_command, commandParsed);
    }
    else if (_command.startsWith("Invoke-WebRequest")) {
        powerShellParser(_command, commandParsed);
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
            b = JSON.parse(b.replace(/\+/g, ""));
            for (const item of b) {
                item.unit = item.value / map[AMOUNT];
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
    for (const key in _copy) {
        if (key === COST) {
            const _cost = [];
            for (const item of _copy[key]) {
                const obj = {
                    ...item
                };
                obj.value = '' + (item.unit * _amount);
                delete obj.unit;
                _cost.push(obj);
            }
            _params += `${key}=${encodeURIComponent(JSON.stringify(_cost))}&`;
        }
        else {
            _params += `${key}=${_copy[key]}&`;
        }
    }
    newCommand.value = `${commandParsed.part1} '${_params.slice(0, -1)}'`;
    if (commandParsed.part3) {
        newCommand.value += ` ${commandParsed.part3}`;
    }
}

function copy() {
    if (newCommand.value) {
        navigator.clipboard.writeText(newCommand.value);
        window.alert("复制成功");
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
}
</script>