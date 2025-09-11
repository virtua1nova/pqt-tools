import { getExchangeDataConfig as _ } from "../api/exchange-data";

import { reactive } from "vue";

export function useGetExchangeDataConfig() {
    const config = reactive({});
    async function queryExchangeDataConfig(force) {
        const date = new Date();
        // await new Promise((resolve) => {
        //     setTimeout(() => {
        //         resolve();
        //     }, 4000);
        // });
        // throw new Error("1111222");
        if (!force) {
            const configStr = localStorage.getItem("exchange-data-config");
            let _config = configStr ? JSON.parse(configStr) : null;
            // 如果没过期的话，可以使用
            if (_config) {
                const expiration = +_config.expiration;
                if (expiration > date.getTime()) {
                    Object.assign(config, _config);
                    return;
                }
            }
        }
        const respData = await _();
        Object.assign(config, respData);
        config.expiration = date.setHours(24, 0, 0, 0);
        config.force = true;
        localStorage.setItem("exchange-data-config", JSON.stringify(config));
    }

    return { config, queryExchangeDataConfig };
}