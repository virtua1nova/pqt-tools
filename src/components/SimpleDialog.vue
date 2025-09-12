<!-- src/components/DataModal.vue -->
<template>
  <!-- 模态框遮罩层 -->
  <div class="modal-overlay" @click.self="handleOverlayClick" v-show="visible">
    <!-- 模态框内容区域 -->
    <div class="modal-content" style="padding: 0 10px;">
      <!-- 标题和关闭按钮 -->
      <div class="modal-header">
        <h2>{{ title }}</h2>
        <button class="close-btn" @click="closeModal">×</button>
      </div>
      <div class="desc" v-if="description.length">
        <p v-for="(item, index) in description" :key="index">
          {{index + 1}}、{{ item }}
        </p>
      </div>
      <!-- 仅展示信息 -->
      <div v-if="key2Data1.length" class="modal-body data-state">
        <!-- <p>{{ data1.message }}</p> -->
        <p v-for="(value, key) in data1" :key="key">
          {{key}}: {{value}}
        </p>
      </div>
      <!-- 加载状态 -->
      <div v-else-if="loading" class="modal-body loading-state">
        <div class="loading"></div>
        <p>加载数据中...</p>
      </div>

      <!-- 错误状态 -->
      <div v-else-if="error" class="modal-body error-state">
        <p class="error-text">❌ {{ error }}</p>
        <button @click="refresh">重试</button>
      </div>
      <!-- 成功状态：显示数据 -->
      <div v-else-if="data && data.length > 0" class="modal-body data-state">
        <table>
          <thead>
            <tr>
              <th v-for="(header, index) in tabHeaders" :key="index">
                {{ header || `列 ${index + 1}` }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, rowIndex) in data" :key="rowIndex">
              <td v-for="(cell, cellIndex) in row" :key="cellIndex">
                <img v-if="cell.renderImage" :src="cell.value" referrerpolicy="no-referrer">
                <div class="multi-line" v-else>
                  <span>{{ cell.value }}</span>
                </div>
                <button class="btn-copy" v-if="cell.copy" @click="copy(cell.value)">
                  复制
                </button>
              </td>
            </tr>
          </tbody>
        </table>
        <div style="margin-top: 10px;">
          <button @click="refresh">刷新数据</button>
        </div>
      </div>
      <!-- 无数据状态 -->
      <div v-else class="modal-body empty-state">
        <p>暂无数据</p>
      </div>
    </div>
  </div>
</template>

<script>


export default {
  name: "DataModal",
  props: {
    // 是否显示模态框
    visible: {
      type: Boolean,
      required: true,
    },
    // 模态框标题
    title: {
      type: String,
      default: "数据详情",
    },
    // 要显示的数据 (二维数组)
    data: {
      type: Array,
      default: () => [],
    },
    // 加载状态
    loading: {
      type: Boolean,
      default: false,
    },
    // 错误信息
    error: {
      type: String,
      default: "",
    },
    description: {
      type: Array,
      default: () => [],
    },
    data1: {
      type: Object,
      default: () => ({})
    }
  },
  emits: [
    "update:visible", // 支持 v-model
    "close",
    "refresh",
  ],
  methods: {
    // 点击遮罩层关闭
    handleOverlayClick() {
      this.closeModal();
    },
    // 关闭模态框
    closeModal() {
      // 优先发出 close 事件 (更语义化)
      this.$emit("close");
      // 同时支持 v-model
      this.$emit("update:visible", false);
    },
    // 重试按钮点击
    refresh() {
      this.$emit("refresh", true);
    },
    copy(content) {
      if (content) {
        navigator.clipboard.writeText(content);
        window.alert("复制成功");
      }
    }
  },
  computed: {
    tabHeaders() {
      if (this.data.length) {
        return Object.keys(this.data[0]);
      }
      return [];
    },
    key2Data1() {
      return Object.keys(this.data1);
    }
  }
};
</script>

<style scoped>
.btn-copy {
  cursor: pointer;
  margin-top: 5px;
}
/* 模态框遮罩层 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

/* 模态框内容 */
.modal-content {
  background: white;
  border-radius: 8px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  width: 90%;
  max-width: 800px;
  max-height: 80vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* 头部 */
.modal-header {
  padding: 10px 0;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h2 {
  margin: 0;
  /* font-size: 1.5rem; */
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  font-size: 28px;
  cursor: pointer;
  color: #999;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background-color 0.2s;
}

.close-btn:hover {
  background-color: #f0f0f0;
  color: #333;
}

/* 主体 */
.modal-body {
  padding: 10px;
  overflow-y: auto;
  flex: 1;
}

/* 加载状态 */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
}

.loading {
  width: 40px;
  height: 40px;
  border: 5px solid #f3f3f3;
  border-top: 5px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* 错误状态 */
.error-state {
  text-align: center;
  color: #e74c3c;
}

.error-text {
  margin-bottom: 15px;
  font-weight: bold;
}

.error-state button {
  background-color: #e74c3c;
  color: white;
  border: none;
  padding: 8px 20px;
  border-radius: 4px;
  cursor: pointer;
}

.error-state button:hover {
  background-color: #c0392b;
}

/* 数据表格 */
.data-state table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
}

.data-state th,
.data-state td {
  border: 1px solid #ddd;
  padding: 10px;
  text-align: left;
  word-wrap: break-word;
  word-break: break-word;
  /* 或者更现代的写法 */
  overflow-wrap: break-word;
  /* 设置最大宽度 */
  max-width: 200px;
}

.data-state th {
  background-color: #f8f9fa;
  font-weight: bold;
  position: sticky;
  top: 0;
  z-index: 1;
}

.data-state tr:nth-child(even) {
  background-color: #f9f9f9;
}

.data-state tr:hover {
  background-color: #f1f1f1;
}
.data-state img {
  width: 100px;
  /* height: 80px; */
}

/* 无数据状态 */
.empty-state {
  text-align: center;
  color: #666;
  font-style: italic;
  padding: 40px 0;
}

/* 响应式设计 */
@media (max-width: 600px) {
  .modal-content {
    margin: 10px;
    width: calc(100% - 20px);
  }

  .modal-header,
  .modal-body {
    padding: 16px;
  }
}

.truncated {
  /* max-width: 200px; */
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  /* 可选：显示为块级，避免内联元素间隙问题 */
  /* display: inline-block; */
}
.multi-line {
  /* 必须的三件套 */
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  /* 其他样式 */
  overflow: hidden;
  /* text-overflow: ellipsis; */
  /* max-width: 300px; */
  /* line-height: 1.4; */
  /* font-size: 14px; */
  /* border: 1px solid #ddd; */
  /* padding: 8px; */
}
</style>