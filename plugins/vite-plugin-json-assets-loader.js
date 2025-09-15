// import fs from 'fs';
// import path from 'path';

// // 用于加载json文件中指定的资源；
// // 大致的效果是将json文件转为虚拟js文件，以供引用；
// // 使用方法：
// // 1）启用插件：jsonAssetsLoader([{ alias: 'appConfig', configPath: './src/application.json' }])
// // 2）在js中引用：import appConfig from 'virtual:json-assets/appConfig';
// export default function jsonAssetsLoader(configs = []) {
//     const _modules = {};
//     configs.forEach(({ alias, configPath }) => {
//         const id = `virtual:json-assets/${alias}`;
//         _modules[id] = path.resolve(process.cwd(), configPath);
//     });
//     return {
//         name: 'json-assets-loader',
//         resolveId(id) {
//             if (id in _modules) {
//                 return '\0' + id;
//             }
//         },
//         load(id) {
//             for (const key in _modules) {
//                 if (id === '\0' + key) {
//                     const fullPath = _modules[key];
//                     const content = fs.readFileSync(fullPath, 'utf-8');
//                     const config = JSON.parse(content);
//                     let result = 'export default {\n';
//                     let _imports = "";
//                     if (Array.isArray(config)) {
//                         for (const item of config) {

//                         }
//                     }
//                     else {
//                         for (const key in config) {
//                             const value = config[key];
//                             // 图片以及非图片
//                             if (typeof value === 'string' && /\.(png|jpe?g|gif|webp|svg)$/i.test(value)) {
//                                 const _import = `import ${key} from '${value}?url';\n`;
//                                 _imports += _import;
//                                 result += `${key}: ${key},\n`;
//                             }
//                             else {
//                                 result += `${key}: \`${value}\`,\n`;
//                             }
//                         }
//                     }
                    
//                     result += '};';
//                     result = _imports + result;
//                     return result;
//                 }
//             }
//         }
//     };
// }