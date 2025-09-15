import { getExchangeData as _ } from "../api/exchange-data";

import { reactive, ref } from "vue";
import exchangeData1 from "../assets/exchange-data-1.json";

export function useGetExchangeData() {
    const list = ref([]);
    const spreadsheetSource = reactive({});
    const fields = ref([]);
    async function queryExchangeData(params) {
        const { action, force, sheetId, sheetName = '', deploymentId, client } = params;
        let raw = null;
        const sheetName2Action = action[sheetName];
        const copyFieldStr = sheetName2Action['copy'];
        const copyFields = copyFieldStr ? copyFieldStr.split(",") : [];
        let extraData = null;
        if (force) {
            // 接口数据加上本地配置的数据(通常不变)
            const respData = await _({ sheetId, sheetName, deploymentId, client: JSON.stringify(client) });
            if (respData.success) {
                raw = respData.data;
                extraData = respData.extraData;
                // 筛选字段
                const exchangeData1Filtered = [];
                const changeDataKeys = Object.keys(exchangeData1[0]).filter(item => !item.startsWith("_"));
                let maxIndex = raw.length - 1;
                for (const item of exchangeData1) {
                    const filtered = {};
                    for (const key of changeDataKeys) {
                        filtered[key] = item[key];
                    }
                    const _imageFields = item._imageFields;
                    maxIndex++;
                    if (_imageFields) {
                        for (const field of _imageFields.split(",")) {
                            extraData.imageFields.push(`${maxIndex}:${field}`);
                        }
                    }
                    exchangeData1Filtered.push(filtered);
                }
                raw.push(...exchangeData1Filtered);
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
    return { list, fields, queryExchangeData, spreadsheetSource };
}