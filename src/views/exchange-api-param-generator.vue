<template>
    <div>
        <p style="margin-bottom: 10px; font-size: 18px; font-weight: 500;">请求参数转换器</p>
        <div style="margin-bottom: 10px">
            <div style="margin-bottom: 5px">
                <label for="params">
                    抓包参数：
                    <input
                        v-model="params"
                        type="text"
                        placeholder="请输入"
                        style="width: 240px; margin-right: 10px;"
                        id="params"
                    />
                    <button @click="parse">解析</button>
                    <span v-if="parsed">
                        成功, 当前兑换数量为: {{paramsParsed[AMOUNT]}}
                    </span>
                </label>
            </div>
            <div>
                <label for="amount">
                    兑换数量：
                    <input type="text" placeholder="请输入" id="amount" style="margin-right: 10px;" v-model="amount">
                    <button @click="generate" style="margin-right: 10px;">生成</button><button @click="copy">复制</button>
                </label>
                <div style="word-break: break-all; font-size: 13px; padding-left: 10px; color: #855454; margin-top: 5px;">
                    <div v-text="newParams"></div>
                </div>
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
            <div style="word-break: break-all">
                <div>
                --data-raw
                'amount=2&setting_id=539&cost=%5B...%5D'
                </div>
            </div>
            </div>
        <div>
        其中，"--data-raw"一行就是本工具的目标数据，将其复制到输入框内即可(从amount开始，不要引号)。
        </div>
    </div>
</template>

<script setup>
import { reactive, ref } from "vue";

const params = ref("");
const parsed = ref(false);
const amount = ref("");
const paramsParsed = reactive({});
const newParams = ref("");

const COST = "cost";
const AMOUNT = "amount";

function parse() {
    let _params = params.value;
    if (!_params) {
        window.alert("请输入抓包参数");
        return;
    }
    if (_params.startsWith("'") || _params.startsWith("\""))  {
        _params = _params.slice(1);
    }
    if (_params.endsWith("'") || _params.endsWith("\"")) {
        _params = _params.slice(0, -1);
    }
    const parts = _params.split("&");
    parts.sort();
    const map = {};
    for (const part of parts) {
        const [a, b] = part.split("=");
        let _b = decodeURIComponent(b);
        if (a === COST) {
            _b = JSON.parse(_b.replace(/\+/g, ""));

            for (const item of _b) {
                item.unit = item.value / map[AMOUNT];
            }
        }
        map[a] = _b;
    }
    if (!map[AMOUNT] && !map[COST]) {
        window.alert("请输入正确的抓包参数");
        return;
    }
    Object.assign(paramsParsed, map);
    parsed.value = true;
}

function generate() {
    let _amount = amount.value;
    if (!_amount) {
        window.alert("请输入兑换数量");
        return;
    }
    if (!/\d+/.test(_amount) || +amount.value < 1) {
        window.alert("请输入正确的兑换数量");
        return;
    }
    let _params = "";
    const _copy = { ...paramsParsed };
    _copy[AMOUNT] = _amount;
    for (const key in paramsParsed) {
        if (key === COST) {
            const _cost = [];
            for (const item of paramsParsed[key]) {
                const obj = {
                    ...item
                };
                obj.value = item.unit * +amount.value;
                delete obj.unit;
                _cost.push(obj);
            }
            _params += `${key}=${encodeURIComponent(JSON.stringify(_cost))}&`;
        }
        else {
            _params += `${key}=${paramsParsed[key]}&`;
        }
    }
    newParams.value = _params.slice(0, -1);
}

function copy() {
    if (newParams.value) {
        navigator.clipboard.writeText(newParams.value);
        window.alert("复制成功");
    }
}
</script>