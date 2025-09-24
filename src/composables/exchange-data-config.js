import { getExchangeDataConfig as _ } from "../api/exchange-data";

import { reactive } from "vue";

export function useGetExchangeDataConfig() {
    const config = reactive({});
    async function queryExchangeDataConfig(force) {
        const date = new Date();
        // await new Promise((resolve) => {
        //     setTimeout(() => {
        //         resolve();
        //     }, 11000);
        // });
        // throw new Error("1111222");
        const now = date.getTime();
        if (!force) {
            const configStr = localStorage.getItem("exchange-data-config");
            let _config = configStr ? JSON.parse(configStr) : null;
            // 如果没过期的话，可以使用
            if (_config) {
                const expiration = +_config.expiration;
                if (expiration > now) {
                    Object.assign(config, _config);
                    return;
                }
            }
        }
        for (const key of Object.keys(config)) {
            delete config[key];
        }
        const respData = await _();
        Object.assign(config, respData);
        config.expiration = now + 60 * 60 * 12 * 1000;
        localStorage.setItem("exchange-data-config", JSON.stringify(config));
        // 不记录该变量在本地存储中
        config.force = true;
    }

    return { config, queryExchangeDataConfig };
}