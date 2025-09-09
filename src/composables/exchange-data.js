import { getExchangeData as _ } from "../api/exchange-data";

import { reactive, ref } from "vue";

export function useGetExchangeData() {
    const list = ref([]);
    const spreadsheetSource = reactive({});
    const fields = ref([]);
    async function queryExchangeDataList(params) {
        let raw = null;
        if (params.force) {
            const respData = await _(params);
            if (respData.success) {
                raw = respData.data;
                Object.assign(spreadsheetSource, respData.source);
                localStorage.setItem("exchange-data", JSON.stringify(respData))
            }
        }
        else {
            const exchangeData = JSON.parse(localStorage.getItem("exchange-data") || "{}");
            raw = exchangeData.data;
            Object.assign(spreadsheetSource, exchangeData.source);
        }
        fields.value = Object.keys(raw[0]);
        for (const rawItem of raw) {
            // 只要指定字段
            for (const field of fields.value) {
                rawItem[field] = {
                    value: rawItem[field]
                };
                if (field == '图片') {
                    // 启用复制功能
                    if (rawItem[field].value.startsWith("http")) {
                        rawItem[field].renderImage = true;
                    }
                }
                else if (field == '参数') {
                    rawItem[field].copy = true;
                }
            }

        }
        list.value = raw;
    }
    return { list, fields, queryExchangeDataList, spreadsheetSource };
}