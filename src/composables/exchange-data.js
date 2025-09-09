import { getExchangeData as _ } from "../api/exchange-data";

import { reactive, ref } from "vue";

export function useGetExchangeData() {
    const list = ref([]);
    const spreadsheetSource = reactive({});
    const fields = ref([]);
    async function queryExchangeDataList(params) {
        const { action, force, sheetId, sheetName = '', deploymentId } = params;
        let raw = null;
        const sheetName2Action = action[sheetName];
        const copyFieldStr = sheetName2Action['copy'];
        const copyFields = copyFieldStr ? copyFieldStr.split(",") : [];
        let extraData = null;
        if (force) {
            const respData = await _({ sheetId, sheetName, deploymentId });
            if (respData.success) {
                raw = respData.data;
                extraData = respData.extraData;
                Object.assign(spreadsheetSource, respData.source);
                localStorage.setItem("exchange-data", JSON.stringify(respData))
            }
        }
        else {
            const exchangeData = JSON.parse(localStorage.getItem("exchange-data") || "{}");
            raw = exchangeData.data;
            extraData = exchangeData.extraData;
            Object.assign(spreadsheetSource, exchangeData.source);
        }
        const imageFields = extraData.imageFields || [];
        fields.value = Object.keys(raw[0]);
        const map = {};
        for (const item of imageFields) {
            map[item] = 1;
        }

        for (let i=0; i<raw.length; i++) {
            const rawItem = raw[i];
            for (const field of fields.value) {
                rawItem[field] = {
                    value: rawItem[field]
                };
                // 渲染图片
                if (map[`${i}:${field}`]) {
                    rawItem[field].renderImage = true;
                }
                // 复制功能
                else if (copyFields.includes(field)) {
                    rawItem[field].copy = true;
                }
            }
        }
        list.value = raw;
    }
    return { list, fields, queryExchangeDataList, spreadsheetSource };
}