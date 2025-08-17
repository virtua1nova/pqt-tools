<template>
    <div>
        <p style="margin-bottom: 10px; font-size: 18px; font-weight: 500;">请求拦截器</p>
        <div style="margin-bottom: 10px;">该工具是一个浏览器插件，有以下获取方式：</div>
        <div style="padding-left: 10px;">
            <div>
                1、请前往火狐市场下载安装：<a href="https://addons.mozilla.org/zh-CN/firefox/addon/_request-interceptor/" target="_blank">狐火插件市场</a>
                <span>；这种方式可直接安装到火狐浏览器。</span>
            </div>
            <div>
                2、前往github下载源码安装：<a href="https://github.com/errr0l/request-interceptor" target="_blank">github</a>
                <span>；由于某些政策原因，chrome等浏览器的插件市场已经不支持发布该插件，但仍支持自己安装使用，参照文档即可。</span>
            </div>
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