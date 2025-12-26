# Badge 显示逻辑详细分析

## 📋 当前完整逻辑

### 显示条件（三个条件必须同时满足）

```liquid
{%- elsif show_sale_badge != false 
    and card_product.compare_at_price > card_product.price 
    and card_product.available -%}
```

**条件分解：**

1. ✅ `show_sale_badge != false` - 标签开关未明确关闭
2. ✅ `card_product.compare_at_price > card_product.price` - **存在折扣**（划线价 > 售价）
3. ✅ `card_product.available` - 产品有货

---

## 🔍 各种场景分析

### 场景 1：有划线价且有折扣
**商品数据：**
- 划线价（compare_at_price）: $100
- 售价（price）: $80
- 有货（available）: true

**条件判断：**
- `show_sale_badge != false` → ✅ true
- `$100 > $80` → ✅ true
- `available = true` → ✅ true

**结果：** ✅ **显示 Badge**
- percentage 模式：Save 20%
- amount 模式：Save $20.00
- text 模式：Sale

---

### 场景 2：没有划线价
**商品数据：**
- 划线价（compare_at_price）: **nil** 或 **0**
- 售价（price）: $80
- 有货（available）: true

**条件判断：**
- `show_sale_badge != false` → ✅ true
- `nil > $80` 或 `0 > $80` → ❌ **false**
- 整个条件短路 → ❌ false

**结果：** ❌ **不显示 Badge**

**这是正确的行为！** 因为没有划线价意味着没有折扣，不应该显示促销标签。

---

### 场景 3：划线价等于售价
**商品数据：**
- 划线价（compare_at_price）: $80
- 售价（price）: $80
- 有货（available）: true

**条件判断：**
- `show_sale_badge != false` → ✅ true
- `$80 > $80` → ❌ **false**
- 整个条件短路 → ❌ false

**结果：** ❌ **不显示 Badge**

**这是正确的行为！** 因为没有折扣。

---

### 场景 4：划线价低于售价（价格上涨）
**商品数据：**
- 划线价（compare_at_price）: $70
- 售价（price）: $80
- 有货（available）: true

**条件判断：**
- `show_sale_badge != false` → ✅ true
- `$70 > $80` → ❌ **false**
- 整个条件短路 → ❌ false

**结果：** ❌ **不显示 Badge**

**这是正确的行为！** 因为没有折扣（反而涨价了）。

---

### 场景 5：有折扣但售罄
**商品数据：**
- 划线价（compare_at_price）: $100
- 售价（price）: $80
- 有货（available）: **false**

**条件判断：**
- 优先判断：`card_product.available == false` → ✅ true
- 显示："Sold out"

**结果：** ✅ **显示 "Sold out" Badge**（不显示促销标签）

**这是正确的行为！** 售罄优先级高于促销标签。

---

### 场景 6：明确关闭标签开关
**商品数据：**
- 划线价（compare_at_price）: $100
- 售价（price）: $80
- 有货（available）: true
- **配置：show_sale_badge = false**

**条件判断：**
- `show_sale_badge != false` → `false != false` → ❌ **false**
- 整个条件短路 → ❌ false

**结果：** ❌ **不显示 Badge**

**这是正确的行为！** 用户明确关闭了标签显示。

---

## 📊 完整逻辑流程图

```
开始
  ↓
商品是否售罄？
  ├─ 是 → 显示 "Sold out" → 结束
  └─ 否 → 继续
      ↓
标签开关是否关闭？(show_sale_badge == false)
  ├─ 是 → 不显示 Badge → 结束
  └─ 否 → 继续
      ↓
是否有划线价？(compare_at_price 存在且不为 0)
  ├─ 否 → 不显示 Badge → 结束
  └─ 是 → 继续
      ↓
划线价是否大于售价？(compare_at_price > price)
  ├─ 否 → 不显示 Badge → 结束
  └─ 是 → 继续
      ↓
显示促销 Badge
  ├─ percentage 模式 → "Save XX%"
  ├─ amount 模式 → "Save $XX.XX"
  └─ text 模式 → "Sale"
      ↓
结束
```

---

## ✅ 当前逻辑是否正确？

### 标准电商逻辑

在标准的电商场景中，**只有当商品有折扣时才显示促销标签**，即：
- ✅ 必须有划线价（compare_at_price）
- ✅ 划线价必须大于售价（有实际折扣）

**结论：当前逻辑 100% 正确！** ✅

---

## 🤔 可能的特殊需求

### 需求 A：即使没有划线价也想显示 "Sale"

如果有这种特殊需求，需要修改逻辑为：

```liquid
{%- elsif show_sale_badge != false and card_product.available -%}
  {%- if card_product.compare_at_price and card_product.compare_at_price > card_product.price -%}
    {%- liquid
      assign discount_percent = ...
      assign discount_amount = ...
    -%}
    {%- if sale_badge_type == 'percentage' -%}
      Save {{ discount_percent }}%
    {%- elsif sale_badge_type == 'amount' -%}
      Save {{ discount_amount | money_without_trailing_zeros }}
    {%- else -%}
      Sale
    {%- endif -%}
  {%- else -%}
    Sale
  {%- endif -%}
{%- endif -%}
```

**这样的逻辑：**
- 有折扣 + percentage 模式 → "Save 20%"
- 有折扣 + amount 模式 → "Save $20"
- 有折扣 + text 模式 → "Sale"
- **无折扣 + 任意模式 → "Sale"**

⚠️ **但这不是标准电商做法！** 可能会误导用户。

---

### 需求 B：基于产品标签（tags）显示 "Sale"

如果想基于产品的 tags 来显示 Sale：

```liquid
{%- elsif show_sale_badge != false and card_product.available -%}
  {%- if card_product.compare_at_price > card_product.price -%}
    {%- liquid
      计算折扣并显示
    -%}
  {%- elsif card_product.tags contains 'sale' or card_product.tags contains 'Sale' -%}
    Sale
  {%- endif -%}
{%- endif -%}
```

---

### 需求 C：基于 Metafield 控制

如果想通过产品的自定义字段控制：

```liquid
{%- elsif show_sale_badge != false and card_product.available -%}
  {%- if card_product.compare_at_price > card_product.price -%}
    {%- liquid
      计算折扣并显示
    -%}
  {%- elsif card_product.metafields.custom.show_sale_badge -%}
    Sale
  {%- endif -%}
{%- endif -%}
```

---

## 🎯 建议

### 当前逻辑适用场景

✅ **推荐使用当前逻辑，如果：**
1. 只想在有真实折扣时显示标签
2. 遵循标准电商最佳实践
3. 避免误导消费者
4. 符合大多数市场的法律要求

### 需要修改的场景

⚠️ **考虑修改逻辑，如果：**
1. 需要通过产品标签（tags）手动控制显示
2. 有特殊营销需求（如新品也标记为 Sale）
3. 需要基于时间、库存等其他条件显示
4. 需要支持"促销中"但价格未变的情况

---

## 📝 测试检查清单

请验证以下情况：

- [ ] 有划线价且有折扣的商品 → 显示促销标签 ✅
- [ ] 没有划线价的商品 → 不显示促销标签 ✅
- [ ] 划线价等于售价 → 不显示促销标签 ✅
- [ ] 划线价低于售价 → 不显示促销标签 ✅
- [ ] 售罄商品 → 显示 "Sold out" ✅
- [ ] 关闭标签开关 → 不显示任何促销标签 ✅

---

## 💡 结论

**当前的逻辑是正确的、符合标准电商实践的。**

如果发现某些商品应该显示但没有显示，请检查：
1. ✅ 商品是否设置了划线价（compare_at_price）
2. ✅ 划线价是否确实大于售价
3. ✅ 商品是否有货
4. ✅ 组件配置中"显示促销标签"是否开启

如果需要特殊的显示逻辑（如基于 tags 或无折扣也显示），请明确需求，我可以相应调整代码。
