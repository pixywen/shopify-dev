方案 A 实施指南 - GG特色产品系列(标签增强)
📁 一、文件操作清单
需要创建的文件（2个）
序号	源文件	新文件	说明
1	sections/featured-collection.liquid	sections/gg-featured-collection-base.liquid	主组件文件
2	snippets/card-product.liquid	snippets/gg-card-product-base.liquid	产品卡片组件
共用的文件（无需复制）
✅ 所有 CSS 文件（原生样式）
✅ 所有 JavaScript 文件（原生脚本）
🔧 二、文件修改详细说明
文件 1：gg-featured-collection-base.liquid
修改位置 1 - 组件名称（第 202 行）
原代码：
"name": "t:sections.featured-collection.name",

修改为：
"name": "GG-特色产品系列(标签增强)",
原代码："name": "t:sections.featured-collection.name",修改为："name": "GG-特色产品系列(标签增强)",
修改位置 2 - Snippet 调用（第 107 行和 139 行）
原代码：
{% render 'card-product',

修改为：
{% render 'gg-card-product-base',
原代码：{% render 'card-product',修改为：{% render 'gg-card-product-base',
同时添加新参数：
{% render 'gg-card-product-base',
  card_product: product,
  media_aspect_ratio: section.settings.image_ratio,
  image_shape: section.settings.image_shape,
  show_secondary_image: section.settings.show_secondary_image,
  show_vendor: section.settings.show_vendor,
  show_rating: section.settings.show_rating,
  skip_styles: skip_card_product_styles,
  section_id: section.id,
  quick_add: section.settings.quick_add,
  show_sale_badge: section.settings.show_sale_badge,        ← 新增
  sale_badge_type: section.settings.sale_badge_type         ← 新增
%}
{% render 'gg-card-product-base',  card_product: product,  media_aspect_ratio: section.settings.image_ratio,  image_shape: section.settings.image_shape,  show_secondary_image: section.settings.show_secondary_image,  show_vendor: section.settings.show_vendor,  show_rating: section.settings.show_rating,  skip_styles: skip_card_product_styles,  section_id: section.id,  quick_add: section.settings.quick_add,  show_sale_badge: section.settings.show_sale_badge,        ← 新增  sale_badge_type: section.settings.sale_badge_type         ← 新增%}
修改位置 3 - Schema 配置（在 quick_add 配置后插入，约第 446 行）
在 quick_add 配置项之后、移动端 header 之前插入：
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
},
{  "type": "header",  "content": "促销标签设置"},{  "type": "checkbox",  "id": "show_sale_badge",  "label": "显示促销标签",  "default": true,  "info": "开启后，在有折扣的产品左上角显示促销标签"},{  "type": "select",  "id": "sale_badge_type",  "label": "标签显示模式",  "options": [    {      "value": "percentage",      "label": "百分比折扣 (Save XX%)"    },    {      "value": "amount",      "label": "金额折扣 (Save $XX.XX)"    },    {      "value": "text",      "label": "文本标签 (Sale)"    }  ],  "default": "percentage",  "info": "选择促销标签的显示方式"},
修改位置 4 - Presets（第 498 行）
原代码：
"presets": [
  {
    "name": "t:sections.featured-collection.presets.name"
  }
]

修改为：
"presets": [
  {
    "name": "GG-特色产品系列(标签增强)"
  }
]
原代码："presets": [  {    "name": "t:sections.featured-collection.presets.name"  }]修改为："presets": [  {    "name": "GG-特色产品系列(标签增强)"  }]
文件 2：gg-card-product-base.liquid
修改位置 1 - 接收新参数（文件顶部注释，约第 14 行后添加）
在 Accepts 注释部分添加：
- show_sale_badge: {Boolean} Show custom sale badge. Default: true (optional)
- sale_badge_type: {String} Sale badge display type: "percentage", "amount", or "text". Default: "percentage" (optional)
在 Accepts 注释部分添加：- show_sale_badge: {Boolean} Show custom sale badge. Default: true (optional)- sale_badge_type: {String} Sale badge display type: "percentage", "amount", or "text". Default: "percentage" (optional)
修改位置 2 - Badge 逻辑区域 1（约第 127-142 行）
找到这段代码（用于无图片商品卡片）：
原代码：
<div class="card__badge {{ settings.badge_position }}">
  {%- if card_product.available == false -%}
    <span
      id="NoMediaStandardBadge-{{ section_id }}-{{ card_product.id }}"
      class="badge badge--bottom-left color-{{ settings.sold_out_badge_color_scheme }}"
    >
      {{ 'products.product.sold_out' | t }}
    </span>
  {%- elsif card_product.compare_at_price > card_product.price -%}
    <span
      id="NoMediaStandardBadge-{{ section_id }}-{{ card_product.id }}"
      class="badge badge--bottom-left color-{{ settings.sale_badge_color_scheme }}"
    >
      {{ 'products.product.on_sale' | t }}
    </span>
  {%- endif -%}
</div>
原代码：<div class="card__badge {{ settings.badge_position }}">  {%- if card_product.available == false -%}    <span      id="NoMediaStandardBadge-{{ section_id }}-{{ card_product.id }}"      class="badge badge--bottom-left color-{{ settings.sold_out_badge_color_scheme }}"    >      {{ 'products.product.sold_out' | t }}    </span>  {%- elsif card_product.compare_at_price > card_product.price -%}    <span      id="NoMediaStandardBadge-{{ section_id }}-{{ card_product.id }}"      class="badge badge--bottom-left color-{{ settings.sale_badge_color_scheme }}"    >      {{ 'products.product.on_sale' | t }}    </span>  {%- endif -%}</div>
替换为：
<div class="card__badge {{ settings.badge_position }}">
  {%- if card_product.available == false -%}
    <span
      id="NoMediaStandardBadge-{{ section_id }}-{{ card_product.id }}"
      class="badge badge--bottom-left color-{{ settings.sold_out_badge_color_scheme }}"
    >
      {{ 'products.product.sold_out' | t }}
    </span>
  {%- elsif show_sale_badge and card_product.compare_at_price > card_product.price -%}
    {%- liquid
      assign discount_percent = card_product.compare_at_price | minus: card_product.price | times: 100.0 | divided_by: card_product.compare_at_price | floor
      assign discount_amount = card_product.compare_at_price | minus: card_product.price
    -%}
    <span
      id="NoMediaStandardBadge-{{ section_id }}-{{ card_product.id }}"
      class="badge badge--bottom-left color-{{ settings.sale_badge_color_scheme }}"
    >
      {%- if sale_badge_type == 'percentage' -%}
        Save {{ discount_percent }}%
      {%- elsif sale_badge_type == 'amount' -%}
        Save {{ discount_amount | money_without_trailing_zeros }}
      {%- else -%}
        Sale
      {%- endif -%}
    </span>
  {%- endif -%}
</div>
<div class="card__badge {{ settings.badge_position }}">  {%- if card_product.available == false -%}    <span      id="NoMediaStandardBadge-{{ section_id }}-{{ card_product.id }}"      class="badge badge--bottom-left color-{{ settings.sold_out_badge_color_scheme }}"    >      {{ 'products.product.sold_out' | t }}    </span>  {%- elsif show_sale_badge and card_product.compare_at_price > card_product.price -%}    {%- liquid      assign discount_percent = card_product.compare_at_price | minus: card_product.price | times: 100.0 | divided_by: card_product.compare_at_price | floor      assign discount_amount = card_product.compare_at_price | minus: card_product.price    -%}    <span      id="NoMediaStandardBadge-{{ section_id }}-{{ card_product.id }}"      class="badge badge--bottom-left color-{{ settings.sale_badge_color_scheme }}"    >      {%- if sale_badge_type == 'percentage' -%}        Save {{ discount_percent }}%      {%- elsif sale_badge_type == 'amount' -%}        Save {{ discount_amount | money_without_trailing_zeros }}      {%- else -%}        Sale      {%- endif -%}    </span>  {%- endif -%}</div>
修改位置 3 - Badge 逻辑区域 2（约第 551-566 行）
找到这段代码（用于有图片商品卡片）：
原代码：
<div class="card__badge {{ settings.badge_position }}">
  {%- if card_product.available == false -%}
    <span
      id="Badge-{{ section_id }}-{{ card_product.id }}"
      class="badge badge--bottom-left color-{{ settings.sold_out_badge_color_scheme }}"
    >
      {{ 'products.product.sold_out' | t }}
    </span>
  {%- elsif card_product.compare_at_price > card_product.price -%}
    <span
      id="Badge-{{ section_id }}-{{ card_product.id }}"
      class="badge badge--bottom-left color-{{ settings.sale_badge_color_scheme }}"
    >
      {{ 'products.product.on_sale' | t }}
    </span>
  {%- endif -%}
</div>
原代码：<div class="card__badge {{ settings.badge_position }}">  {%- if card_product.available == false -%}    <span      id="Badge-{{ section_id }}-{{ card_product.id }}"      class="badge badge--bottom-left color-{{ settings.sold_out_badge_color_scheme }}"    >      {{ 'products.product.sold_out' | t }}    </span>  {%- elsif card_product.compare_at_price > card_product.price -%}    <span      id="Badge-{{ section_id }}-{{ card_product.id }}"      class="badge badge--bottom-left color-{{ settings.sale_badge_color_scheme }}"    >      {{ 'products.product.on_sale' | t }}    </span>  {%- endif -%}</div>
替换为：
<div class="card__badge {{ settings.badge_position }}">
  {%- if card_product.available == false -%}
    <span
      id="Badge-{{ section_id }}-{{ card_product.id }}"
      class="badge badge--bottom-left color-{{ settings.sold_out_badge_color_scheme }}"
    >
      {{ 'products.product.sold_out' | t }}
    </span>
  {%- elsif show_sale_badge and card_product.compare_at_price > card_product.price -%}
    {%- liquid
      assign discount_percent = card_product.compare_at_price | minus: card_product.price | times: 100.0 | divided_by: card_product.compare_at_price | floor
      assign discount_amount = card_product.compare_at_price | minus: card_product.price
    -%}
    <span
      id="Badge-{{ section_id }}-{{ card_product.id }}"
      class="badge badge--bottom-left color-{{ settings.sale_badge_color_scheme }}"
    >
      {%- if sale_badge_type == 'percentage' -%}
        Save {{ discount_percent }}%
      {%- elsif sale_badge_type == 'amount' -%}
        Save {{ discount_amount | money_without_trailing_zeros }}
      {%- else -%}
        Sale
      {%- endif -%}
    </span>
  {%- endif -%}
</div>
<div class="card__badge {{ settings.badge_position }}">  {%- if card_product.available == false -%}    <span      id="Badge-{{ section_id }}-{{ card_product.id }}"      class="badge badge--bottom-left color-{{ settings.sold_out_badge_color_scheme }}"    >      {{ 'products.product.sold_out' | t }}    </span>  {%- elsif show_sale_badge and card_product.compare_at_price > card_product.price -%}    {%- liquid      assign discount_percent = card_product.compare_at_price | minus: card_product.price | times: 100.0 | divided_by: card_product.compare_at_price | floor      assign discount_amount = card_product.compare_at_price | minus: card_product.price    -%}    <span      id="Badge-{{ section_id }}-{{ card_product.id }}"      class="badge badge--bottom-left color-{{ settings.sale_badge_color_scheme }}"    >      {%- if sale_badge_type == 'percentage' -%}        Save {{ discount_percent }}%      {%- elsif sale_badge_type == 'amount' -%}        Save {{ discount_amount | money_without_trailing_zeros }}      {%- else -%}        Sale      {%- endif -%}    </span>  {%- endif -%}</div>
📐 三、核心逻辑说明
1. 折扣计算逻辑
百分比计算（percentage）：
discount_percent = (划线价 - 售价) × 100 ÷ 划线价，向下取整
显示格式: "Save 25%"
discount_percent = (划线价 - 售价) × 100 ÷ 划线价，向下取整显示格式: "Save 25%"
金额计算（amount）：
discount_amount = 划线价 - 售价
使用 money_without_trailing_zeros 过滤器自动处理货币符号和小数
显示格式: "Save $10.50" 或 "Save $10"（自动去除无意义的 .00）
discount_amount = 划线价 - 售价使用 money_without_trailing_zeros 过滤器自动处理货币符号和小数显示格式: "Save $10.50" 或 "Save $10"（自动去除无意义的 .00）
文本模式（text）：
直接显示: "Sale"
直接显示: "Sale"
2. 显示条件
标签显示需要同时满足：
✅ show_sale_badge 为 true（用户开启了标签）
✅ card_product.compare_at_price > card_product.price（存在折扣）
✅ card_product.available 为 true（产品有货，优先显示 Sold out）
🎨 四、样式说明
使用原生 Badge 样式类：
.badge - 基础标签样式（来自 base.css）
.badge--bottom-left - 位置样式（左下角）
color-{{ settings.sale_badge_color_scheme }} - 颜色方案（主题设置控制）
.card__badge - 卡片内标签容器（来自 component-card.css）
{{ settings.badge_position }} - 动态位置类（支持 top/bottom）
无需额外 CSS 文件，标签视觉效果完全继承主题设置。
⚙️ 五、配置面板效果
在 Shopify 编辑器中，该组件将显示为：
📦 GG-特色产品系列(标签增强)

   [所有原有配置项...]
   
   ━━━━━━━━━━━━━━━━━━━━━━━━━
   促销标签设置
   ━━━━━━━━━━━━━━━━━━━━━━━━━
   
   ☑️ 显示促销标签
   ⓘ 开启后，在有折扣的产品左上角显示促销标签
   
   标签显示模式  [下拉选择]
   • 百分比折扣 (Save XX%)
   • 金额折扣 (Save $XX.XX)  
   • 文本标签 (Sale)
   ⓘ 选择促销标签的显示方式
   
   [移动端设置...]
📦 GG-特色产品系列(标签增强)   [所有原有配置项...]      ━━━━━━━━━━━━━━━━━━━━━━━━━   促销标签设置   ━━━━━━━━━━━━━━━━━━━━━━━━━      ☑️ 显示促销标签   ⓘ 开启后，在有折扣的产品左上角显示促销标签      标签显示模式  [下拉选择]   • 百分比折扣 (Save XX%)   • 金额折扣 (Save $XX.XX)     • 文本标签 (Sale)   ⓘ 选择促销标签的显示方式      [移动端设置...]
✅ 六、验证清单
实施完成后，请检查：
[ ] 组件名称在编辑器中显示为 "GG-特色产品系列(标签增强)"
[ ] 能够正常添加到页面
[ ] 配置项中有"促销标签设置"区域
[ ] 有折扣的产品显示标签（开启时）
[ ] 无折扣的产品不显示促销标签
[ ] 售罄产品优先显示 "Sold out"
[ ] 三种标签模式切换正常
[ ] 关闭标签开关后不显示促销标签
[ ] 所有原有功能正常（滑块、快速购买等）
[ ] 移动端和桌面端显示正常
🚀 七、实施顺序
创建 snippets/gg-card-product-base.liquid
复制 card-product.liquid 全部内容
修改两处 badge 逻辑区域
创建 sections/gg-featured-collection-base.liquid
复制 featured-collection.liquid 全部内容
修改组件名称
修改 snippet 调用
添加新配置项
测试验证
在主题编辑器中添加组件
测试各项配置
检查不同产品状态的显示
📝 八、注意事项
⚠️ 重要提示：
不要修改原文件 - 确保复制后再修改，保持原组件完整
Liquid 语法 - 注意 {%- liquid -%} 块中不要有额外空行
货币过滤器 - money_without_trailing_zeros 会自动处理货币符号，无需手动添加
默认值处理 - 如果 show_sale_badge 未传递，Liquid 会将其视为 false
位置继承 - 标签位置由主题的 badge_position 设置控制，无需额外配置
总结
这个方案是最小改动、最大复用的实现方式：
✅ 只创建 2 个文件
✅ 0 个新 CSS 文件
✅ 0 个新 JS 文件
✅ 保留所有原生功能
✅ 完全向后兼容
