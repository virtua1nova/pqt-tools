<template>
    <div style="display: flex; flex-direction: column; justify-content: center; padding: 2em 0;">
        <p style="margin-bottom: 10px; font-size: 18px; font-weight: 500;">兑换参数转换器</p>

        <div style="margin-bottom: 5px; color: rgb(133, 84, 84); font-size: 14px;">基本使用方法: 解析 -> 生成 -> 复制 -> 粘贴[到终端] -> 执行</div>
        <div style="margin-bottom: 5px">
            <div style="margin-bottom: 5px">
                <label for="command" style="display: inline-block; margin-bottom: 5px;">
                    抓包参数:
                </label>
                <div style="display: flex; align-items: flex-start;">
                    <textarea v-model="command" placeholder="请输入" id="command" style="width: 300px; margin-right: 10px;" rows="4" />
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
        <span>将其复制到输入框内即可。</span>
    </div>
</template>

<script setup>
import { reactive, ref } from "vue";

const command = ref("");
const parsed = ref(false);
const amount = ref("");
const commandParsed = reactive({ type: '', part1: null, part2: null, part3: null});

const newCommand = ref("");
const newAmount = ref("");

const COST = "cost";
const AMOUNT = "amount";
const TYPE1 = "curl";
const TYPE2 = "powerShell";

/**
 * curl格式
 * @param {String} _params
 * @param {{type, part1, part2, part3}} commandParsed
 */
function curlParser(command, commandParsed) {
    const key = "--data-raw";
    const index = command.lastIndexOf(key) + key.length;
    commandParsed.type = TYPE1;
    commandParsed.part1 = command.slice(0, index);
    commandParsed.part2 = command.slice(index).trim().slice(1, -1);
}

// powerShell格式
function powerShellParser(command, commandParsed) {
}

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
    commandParsed.part3 = map;
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
    const _copy = { ...commandParsed.part3 };
    _copy[AMOUNT] = _amount;
    for (const key in _copy) {
        if (key === COST) {
            const _cost = [];
            for (const item of _copy[key]) {
                const obj = {
                    ...item
                };
                obj.value = item.unit * _amount;
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
}

function copy() {
    if (newCommand.value) {
        navigator.clipboard.writeText(newCommand.value);
        window.alert("复制成功");
    }
}

function clear() {
    newCommand.value && (newCommand.value = '');
}
</script>