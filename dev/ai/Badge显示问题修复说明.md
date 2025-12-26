# Badge 显示问题修复说明

## 🐛 问题描述

**报告时间：** 2024-12-24  
**问题：** 某些商品配置了显示 Sale，但依然无法显示 Badge

---

## 🔍 问题分析

### 原始代码问题

**位置：** `snippets/gg-card-product-base.liquid` 第 137 行和第 571 行

**原条件：**
```liquid
{%- elsif show_sale_badge and card_product.compare_at_price > card_product.price and card_product.available -%}
```

### 问题根源

在 Liquid 中，条件 `show_sale_badge and ...` 存在逻辑缺陷：

| show_sale_badge 值 | 条件判断结果 | 实际显示 | 期望显示 | 是否正确 |
|-------------------|------------|---------|---------|---------|
| `true` | `true and ...` → 继续判断 | ✅ 显示 | ✅ 显示 | ✅ 正确 |
| `false` | `false and ...` → 短路 | ❌ 不显示 | ❌ 不显示 | ✅ 正确 |
| `nil`/未传递 | `nil and ...` → 视为 false | ❌ 不显示 | ✅ **应该显示** | ❌ **错误** |

**核心问题：** 当参数未传递时（`nil`），Liquid 将其视为 `false`，导致标签不显示。

---

## ✅ 修复方案

### 修复后的代码

**新条件：**
```liquid
{%- elsif show_sale_badge != false and card_product.compare_at_price > card_product.price and card_product.available -%}
```

### 修复后的逻辑

| show_sale_badge 值 | 条件判断结果 | 实际显示 | 说明 |
|-------------------|------------|---------|------|
| `true` | `true != false` → true | ✅ 显示 | 明确开启 |
| `false` | `false != false` → false | ❌ 不显示 | 明确关闭 |
| `nil`/未传递 | `nil != false` → true | ✅ 显示 | **默认显示** ✨ |

**改进点：**
- ✅ 默认行为：未传递参数时默认显示标签
- ✅ 明确控制：只有明确设置为 `false` 才隐藏标签
- ✅ 向后兼容：不影响已配置的组件

---

## 🎯 附加优化

### sale_badge_type 默认值处理

**原代码：**
```liquid
{%- if sale_badge_type == 'percentage' -%}
```

**优化后：**
```liquid
{%- if sale_badge_type == 'percentage' or sale_badge_type == blank -%}
```

**优化效果：**
- ✅ 未传递 `sale_badge_type` 时默认使用百分比模式
- ✅ 避免显示空白或错误的标签内容

---

## 📋 修改清单

### 修改的文件

1. **`snippets/gg-card-product-base.liquid`**
   - 第 137 行：无图片卡片的 Badge 逻辑
   - 第 571 行：有图片卡片的 Badge 逻辑

### 修改的位置

#### 位置 1：第 137 行附近

**修改前：**
```liquid
{%- elsif show_sale_badge and card_product.compare_at_price > card_product.price and card_product.available -%}
  {%- if sale_badge_type == 'percentage' -%}
    Save {{ discount_percent }}%
```

**修改后：**
```liquid
{%- elsif show_sale_badge != false and card_product.compare_at_price > card_product.price and card_product.available -%}
  {%- if sale_badge_type == 'percentage' or sale_badge_type == blank -%}
    Save {{ discount_percent }}%
```

#### 位置 2：第 571 行附近

**修改内容：** 与位置 1 相同

---

## 🧪 测试验证

### 测试场景

| 测试场景 | show_sale_badge | sale_badge_type | 预期结果 |
|---------|----------------|-----------------|---------|
| 1. 正常配置 | `true` | `'percentage'` | ✅ 显示 "Save XX%" |
| 2. 正常配置 | `true` | `'amount'` | ✅ 显示 "Save $XX.XX" |
| 3. 正常配置 | `true` | `'text'` | ✅ 显示 "Sale" |
| 4. 明确关闭 | `false` | 任意 | ❌ 不显示任何标签 |
| 5. 未传递参数 | `nil` | `nil` | ✅ 显示 "Save XX%"（默认） |
| 6. 未传递类型 | `true` | `nil` | ✅ 显示 "Save XX%"（默认） |
| 7. 产品售罄 | 任意 | 任意 | ✅ 显示 "Sold out" |
| 8. 无折扣 | `true` | 任意 | ❌ 不显示促销标签 |

### 验证步骤

1. **场景 5 验证（重点）**
   - 在其他 Section 中使用 `gg-card-product-base.liquid`
   - 不传递 `show_sale_badge` 和 `sale_badge_type` 参数
   - 确认有折扣的商品显示 "Save XX%" 标签

2. **场景 4 验证**
   - 在 Section 配置中明确关闭"显示促销标签"
   - 确认所有商品不显示促销标签

3. **场景 1-3 验证**
   - 测试三种标签模式的正常显示

---

## 📊 影响范围

### 受影响的组件

✅ **主要影响：**
- `sections/gg-featured-collection-base.liquid`（使用新 snippet）
- 任何使用 `snippets/gg-card-product-base.liquid` 的自定义组件

❌ **不影响：**
- `sections/featured-collection.liquid`（原生组件）
- `snippets/card-product.liquid`（原生 snippet）
- 其他使用原生 snippet 的组件

### 兼容性

- ✅ 向后兼容：已配置的组件不受影响
- ✅ 默认友好：新组件默认显示标签
- ✅ 灵活控制：支持明确开启/关闭

---

## 🎉 修复效果

### 修复前

```
❌ 问题：某些商品不显示 Badge
原因：参数未传递时被视为 false
```

### 修复后

```
✅ 解决：所有有折扣的商品都能正确显示 Badge
默认：未配置时默认显示百分比折扣标签
控制：支持明确开启/关闭标签显示
```

---

## 📝 总结

此次修复解决了 Badge 显示逻辑的核心问题，通过改进条件判断和默认值处理，确保：

1. ✅ **默认友好**：未配置时默认显示标签
2. ✅ **明确控制**：支持明确开启/关闭
3. ✅ **逻辑清晰**：条件判断符合预期
4. ✅ **向后兼容**：不影响已有配置

**修复时间：** 2024-12-24  
**修复状态：** ✅ 已完成  
**测试状态：** ⏳ 待验证
