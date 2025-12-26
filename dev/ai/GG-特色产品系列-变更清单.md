# GG-特色产品系列(标签增强) - 变更清单

## 📅 实施日期
2025-12-24

## 🔄 最近更新

**2025-12-24 - Badge 样式定制：**
- ✅ 添加 Badge 差异化样式：左上角 + 红色背景
- ✅ 使用内联样式方案（方案 A），无需额外 CSS 文件
- ✅ 使用 `#collection-{{ section.id }}` 确保样式作用域隔离
- ✅ 保持 Sold out 标签的原有颜色方案

**2025-12-24 - Bug 修复：**
- ✅ 修复了 `show_sale_badge` 参数未传递时标签不显示的问题
- ✅ 改进条件判断：从 `show_sale_badge and ...` 改为 `show_sale_badge != false and ...`
- ✅ 优化默认行为：未传递参数时默认显示标签（而非隐藏）
- ✅ 增强 `sale_badge_type` 判断：未传递时默认使用百分比模式

## 🎯 实施目标
基于 Shopify 原生 `featured-collection` 组件，创建带有增强促销标签功能的新组件，支持三种促销标签显示模式。

---

## 📦 新增文件清单

### 1. Snippet 组件
**文件路径：** `snippets/gg-card-product-base.liquid`

**说明：** 复制自 `snippets/card-product.liquid`，增强了促销标签功能

**主要修改：**
- ✅ 新增参数接收：`show_sale_badge` 和 `sale_badge_type`
- ✅ 修改两处 Badge 渲染逻辑（第 127-155 行和第 551-577 行）
- ✅ 实现三种标签显示模式：
  - 百分比折扣：`Save XX%`
  - 金额折扣：`Save $XX.XX`
  - 文本标签：`Sale`

**代码行数：** 625 行

---

### 2. Section 主组件
**文件路径：** `sections/gg-featured-collection-base.liquid`

**说明：** 复制自 `sections/featured-collection.liquid`，集成增强标签功能

**主要修改：**

#### 修改位置 1 - 组件名称
- **第 202 行：** 组件名称改为 `"GG-特色产品系列(标签增强)"`
- **第 500 行：** Preset 名称同步修改

#### 修改位置 2 - Snippet 调用
- **第 107-117 行：** 将 `card-product` 改为 `gg-card-product-base`
- **新增参数传递：**
  ```liquid
  show_sale_badge: section.settings.show_sale_badge,
  sale_badge_type: section.settings.sale_badge_type
  ```

#### 修改位置 3 - Schema 配置
- **第 447-467 行：** 新增"促销标签设置"区域
- **新增配置项：**
  1. `show_sale_badge` (checkbox) - 显示促销标签开关
  2. `sale_badge_type` (select) - 标签显示模式选择

**代码行数：** 536 行

---

## 🔧 核心功能实现

### 1. 折扣计算逻辑

#### 百分比模式（percentage）
```liquid
discount_percent = (划线价 - 售价) × 100 ÷ 划线价，向下取整
显示：Save 25%
```

#### 金额模式（amount）
```liquid
discount_amount = 划线价 - 售价
使用 money_without_trailing_zeros 过滤器
显示：Save $10.50 或 Save $10
```

#### 文本模式（text）
```liquid
显示：Sale
```

### 2. 显示条件
标签显示需同时满足：
- ✅ `show_sale_badge` = true（用户开启）
- ✅ 存在划线价且高于售价
- ✅ 产品有货（售罄优先显示 "Sold out"）

---

## 🎨 样式与依赖

### 使用的 CSS 文件（共用原生）
- ✅ `component-card.css` - 卡片基础样式
- ✅ `component-price.css` - 价格样式
- ✅ `component-slider.css` - 滑块样式
- ✅ `template-collection.css` - 集合模板样式
- ✅ `base.css` - Badge 基础样式

### 使用的 JavaScript 文件（共用原生）
- ✅ `product-form.js`
- ✅ `quick-add.js`
- ✅ `quick-add-bulk.js`
- ✅ `quantity-popover.js`
- ✅ `price-per-item.js`
- ✅ 所有其他原生脚本

### 样式类名
- `.badge` - 基础标签样式
- `.badge--bottom-left` - 左下角位置
- `.card__badge` - 卡片标签容器
- `color-{{ settings.sale_badge_color_scheme }}` - 颜色方案

### Badge 定制样式（差异化设计）

**设计需求：**
- 📍 位置：左上角（区别于其他组件的左下角）
- 🎨 颜色：红色背景 + 白色文字（区别于主题配色）

**实现方案：方案 A - 内联样式**

在 `sections/gg-featured-collection-base.liquid` 中添加定制样式：

```css
/* 位置：左上角 */
#collection-{{ section.id }} .card__badge {
  align-self: flex-start !important;
  grid-row-start: 1 !important;
}

/* 颜色：红色（仅促销标签，排除 Sold out） */
#collection-{{ section.id }} .badge:not([class*="sold_out"]) {
  background-color: #ff0000 !important;
  border-color: #ff0000 !important;
  color: #ffffff !important;
}
```

**优势：**
- ✅ 无需额外 CSS 文件
- ✅ 样式作用域隔离（使用 section.id）
- ✅ 不影响其他组件的 Badge 样式
- ✅ Sold out 标签保持主题原有配色

---

## 📋 配置面板

在 Shopify 编辑器中，组件配置界面包含：

### 原有配置（保持不变）
- ✅ 标题设置
- ✅ 描述设置
- ✅ 集合选择
- ✅ 产品数量
- ✅ 列数设置
- ✅ 图片比例
- ✅ 快速购买
- ✅ 移动端设置
- ✅ 内边距设置

### 新增配置
**区域名称：** 促销标签设置

1. **显示促销标签** (checkbox)
   - 默认值：开启
   - 说明：开启后，在有折扣的产品左上角显示促销标签

2. **标签显示模式** (select)
   - 默认值：百分比折扣
   - 选项：
     - 百分比折扣 (Save XX%)
     - 金额折扣 (Save $XX.XX)
     - 文本标签 (Sale)
   - 说明：选择促销标签的显示方式

---

## ✅ 功能验证清单

实施完成后，请验证以下功能：

### 基础功能
- [ ] 组件在编辑器中显示为 "GG-特色产品系列(标签增强)"
- [ ] 能够正常添加到页面
- [ ] 配置面板包含"促销标签设置"区域

### Badge 显示逻辑
- [ ] 有折扣的产品显示促销标签（开启时）
- [ ] 无折扣的产品不显示促销标签
- [ ] 售罄产品优先显示 "Sold out"
- [ ] 百分比模式显示正确（Save XX%）
- [ ] 金额模式显示正确（Save $XX.XX）
- [ ] 文本模式显示 "Sale"
- [ ] 关闭标签开关后不显示促销标签

### Badge 样式定制 ⭐
- [ ] 促销 Badge 显示在左上角（而非左下角）
- [ ] 促销 Badge 为红色背景 + 白色文字
- [ ] Sold out Badge 保持主题原有配色（不受影响）
- [ ] Badge 样式不影响其他组件

### 整体功能
- [ ] 所有原有功能正常（滑块、快速购买、评分等）
- [ ] 移动端显示正常
- [ ] 桌面端显示正常

---

## 📊 技术统计

| 项目 | 数量 |
|------|------|
| 新增文件 | 2 个 |
| 新增 CSS 文件 | 0 个（使用内联样式）|
| 新增 JS 文件 | 0 个 |
| 共用原生 CSS | 5+ 个 |
| 共用原生 JS | 5+ 个 |
| 新增代码行数 | ~1,180 行（含定制样式）|
| 新增配置项 | 2 个 |
| 支持的标签模式 | 3 种 |
| Badge 定制样式 | 内联（~15 行 CSS）|

---

## 🐛 Bug 修复说明

### 问题：部分商品无法显示 Badge

**发现时间：** 2024-12-24
**问题描述：** 某些商品配置了显示 Sale，但依然无法显示 Badge

**原因分析：**

在 Liquid 中，条件 `show_sale_badge and ...` 存在问题：
| show_sale_badge 值 | 原逻辑结果 | 期望结果 |
|-------------------|-----------|---------|
| `true` | ✅ 显示 | ✅ 显示 |
| `false` | ❌ 不显示 | ❌ 不显示 |
| `nil` (未传递) | ❌ 不显示 | ✅ **应该显示** |

**修复方案：**

将条件从：
```liquid
{%- elsif show_sale_badge and card_product.compare_at_price > card_product.price -%}
```

改为：
```liquid
{%- elsif show_sale_badge != false and card_product.compare_at_price > card_product.price -%}
```

**额外优化：**

同时优化了 `sale_badge_type` 的判断：
```liquid
{%- if sale_badge_type == 'percentage' or sale_badge_type == blank -%}
```

这样当 `sale_badge_type` 未传递时，默认使用百分比模式。

---

## 🔍 代码变更细节

### gg-card-product-base.liquid

#### 变更点 1：Badge 逻辑（无图片卡片）
**位置：** 第 129-155 行

**原代码逻辑：**
```liquid
IF 售罄 THEN 显示 "Sold out"
ELSE IF 有折扣 THEN 显示 "On Sale"
```

**新代码逻辑（已修复）：**
```liquid
IF 售罄 THEN 显示 "Sold out"
ELSE IF show_sale_badge != false AND 有折扣 THEN
  计算 discount_percent 和 discount_amount
  CASE sale_badge_type
    WHEN 'percentage' OR blank: 显示 "Save XX%"
    WHEN 'amount': 显示 "Save $XX.XX"
    ELSE: 显示 "Sale"
  END
END
```

#### 变更点 2：Badge 逻辑（有图片卡片）
**位置：** 第 551-577 行

**变更内容：** 与变更点 1 相同

---

### gg-featured-collection-base.liquid

#### 变更点 1：组件名称
**位置：** 第 202 行、第 500 行

**原值：** `"t:sections.featured-collection.name"`
**新值：** `"GG-特色产品系列(标签增强)"`

#### 变更点 2：Snippet 调用
**位置：** 第 107 行、第 139 行

**原值：** `{% render 'card-product', ... %}`
**新值：** `{% render 'gg-card-product-base', ... %}`

**新增参数：**
```liquid
show_sale_badge: section.settings.show_sale_badge,
sale_badge_type: section.settings.sale_badge_type
```

#### 变更点 3：Schema 配置
**位置：** 第 447-467 行（在 quick_add 之后插入）

**新增内容：**
```json
{
  "type": "header",
  "content": "促销标签设置"
},
{
  "type": "checkbox",
  "id": "show_sale_badge",
  "label": "显示促销标签",
  "default": true,
  "info": "开启后，在有折扣的产品左上角显示促销标签"
},
{
  "type": "select",
  "id": "sale_badge_type",
  "label": "标签显示模式",
  "options": [
    {
      "value": "percentage",
      "label": "百分比折扣 (Save XX%)"
    },
    {
      "value": "amount",
      "label": "金额折扣 (Save $XX.XX)"
    },
    {
      "value": "text",
      "label": "文本标签 (Sale)"
    }
  ],
  "default": "percentage",
  "info": "选择促销标签的显示方式"
}
```

#### 变更点 4：Badge 定制样式（新增）
**位置：** 第 27-50 行（在现有 style 标签内）

**新增内容：**
```liquid
{%- style -%}
  /* 原有 padding 样式... */
  
  /* ====== GG 特色产品系列 Badge 定制样式 ====== */
  /* 位置：左上角 */
  #collection-{{ section.id }} .card__badge {
    align-self: flex-start !important;
    grid-row-start: 1 !important;
  }
  
  /* 颜色：红色（仅促销标签，排除 Sold out） */
  #collection-{{ section.id }} .badge:not([class*="sold_out"]) {
    background-color: #ff0000 !important;
    border-color: #ff0000 !important;
    color: #ffffff !important;
  }
  /* ============================================= */
{%- endstyle -%}
```

**说明：**
- ✅ 使用内联样式方案（方案 A）
- ✅ 使用 `#collection-{{ section.id }}` 确保样式作用域隔离
- ✅ 使用 `:not([class*="sold_out"])` 排除 Sold out 标签
- ✅ 使用 `!important` 覆盖全局样式
- ✅ 无需额外 CSS 文件

---

## 🎯 实施方案

### 方案特点
- ✅ **最小侵入原则** - 仅复制 2 个文件
- ✅ **样式高度复用** - 仅 Badge 使用内联定制样式，无需额外 CSS 文件
- ✅ **功能完全保留** - 保持所有原生功能
- ✅ **逻辑清晰集中** - 修改集中在 Badge 渲染部分
- ✅ **向后兼容** - 不影响原组件使用
- ✅ **易于扩展** - 可后续添加更多功能
- ✅ **差异化设计** - Badge 左上角红色，区别于其他组件

### 优势
1. 维护成本低（无额外 CSS/JS 文件）
2. 性能影响小（轻量级计算，内联样式）
3. 视觉差异化（Badge 左上角红色，突出特色产品）
4. 功能完整性高（保留所有原功能）
5. 代码可读性强（清晰的逻辑结构）
6. 样式作用域隔离（不影响其他组件的 Badge）

---

## 📝 使用说明

### 在编辑器中使用

1. **添加组件**
   - 进入 Shopify 主题编辑器
   - 点击"添加区块"
   - 搜索"GG-特色产品系列(标签增强)"
   - 点击添加

2. **配置组件**
   - 选择要展示的产品集合
   - 设置产品数量、列数等基本参数
   - 在"促销标签设置"区域：
     - 勾选"显示促销标签"（默认开启）
     - 选择标签显示模式
   - 根据需要调整其他设置

3. **预览效果**
   - 保存后预览页面
   - 检查有折扣的产品是否显示标签
   - 切换不同模式查看效果

---

## ⚠️ 注意事项

1. **不要修改原文件**
   - `featured-collection.liquid` - 保持原样
   - `card-product.liquid` - 保持原样

2. **货币格式**
   - 使用 `money_without_trailing_zeros` 过滤器
   - 自动处理不同市场的货币符号
   - 自动去除无意义的 .00

3. **标签位置**
   - 由主题的 `badge_position` 设置控制
   - 默认为左下角（`badge--bottom-left`）
   - 可在主题设置中调整

4. **售罄优先**
   - 售罄产品始终显示 "Sold out"
   - 不显示促销标签
   - 即使有折扣也优先显示售罄

5. **无折扣产品**
   - 无划线价的产品不显示促销标签
   - 划线价等于或低于售价的不显示
   - 确保数据正确性

---

## 🚀 后续优化建议

### 短期优化
1. 添加多语言支持
   - 在 `locales/` 文件中添加 "Save" 的翻译
   - 使用 `{{ 'sections.badge.save' | t }}` 替代硬编码

2. 样式微调（可选）
   - 如需特殊样式，在组件顶部添加 `<style>` 标签
   - 定义自定义 badge 类名

### 长期优化
1. 支持变体价格
   - 当选择不同变体时动态更新 badge
   - 需要额外的 JavaScript 支持

2. 自定义标签文本
   - 允许用户自定义"Save"文本
   - 添加 text 配置项

3. 标签样式自定义
   - 添加颜色选择器
   - 添加字体大小调整

---

## 📞 技术支持

如遇到问题，请检查：
1. 文件是否正确创建在指定路径
2. Liquid 语法是否有错误
3. 产品是否正确设置了划线价
4. 主题是否支持 Badge 功能
5. 浏览器控制台是否有错误

---

## ✨ 总结

此次实施基于 Shopify 原生组件，采用**最小化复制、最大化复用**的策略，成功创建了一个功能增强的特色产品系列组件。新组件完全继承了原组件的所有功能，同时增加了灵活的促销标签显示能力和差异化的视觉设计，为商家提供了更丰富的营销展示选项。

**核心优势：**
- 0 个新 CSS 文件（使用内联样式）
- 0 个新 JS 文件
- 100% 功能兼容
- 差异化视觉设计（左上角红色 Badge）
- 3 种标签模式
- 样式作用域隔离
- 易于维护和扩展

**Badge 定制特色：**
- 📍 位置：左上角（区别于其他组件）
- 🎨 颜色：红色背景 + 白色文字
- 🎯 作用域：仅影响本组件，不影响其他组件
- 🔧 实现：内联样式，无需额外文件
