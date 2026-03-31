# 双向信息差搜寻与整理工具

这个工具会自动抓取中国与海外站点的最新信息，输出「中国有 -> 国外可能需要」和「国外有 -> 中国可能需要」两类机会清单，并导出为 Excel 可打开格式。

## 已实现能力

- 双向信息差识别：
  - 中国源站内容默认归类为：`中国有 -> 国外可能需要`
  - 海外源站内容默认归类为：`国外有 -> 中国可能需要`
- 支持实物 / 虚拟资料分类（关键词规则）
- 自动记录来源站点、原始链接、发布时间、信息需求建议
- 导出：
  - `output/info-gap-report.xml`（Excel 可直接打开）
  - `output/info-gap-report.csv`（Excel 可导入）
  - `output/info-gap-report.json`
- 全自动定时执行：
  - 本地守护进程定时扫描
  - GitHub Actions 每 8 小时自动扫描并产出附件

## 使用方式

### 1) 手动扫描一次

```bash
npm run scan:infogap
```

### 2) 本地全自动定时扫描

默认每 360 分钟执行一次：

```bash
npm run scan:infogap:watch
```

可通过环境变量修改频率（单位：分钟）：

```bash
SCAN_INTERVAL_MINUTES=60 npm run scan:infogap:watch
```

### 3) 修改数据源

编辑：`config/info-gap-sources.json`

- `region: "CN"` 表示中国来源
- `region: "GLOBAL"` 表示海外来源
- `maxItemsPerSource` 控制每个站点抓取上限

## 字段说明

输出表格中包含以下关键字段：

- `方向`：双向信息差方向
- `类型`：实物 / 虚拟资料/数字产品 / 待人工判断
- `标题`
- `摘要`
- `来源站点`
- `来源链接`
- `发布时间`
- `信息需求`：后续验证建议（如合规、本地化、物流、支付、渠道等）
- `抓取时间UTC`

## 注意事项

- RSS 源稳定性各不相同，失败来源会记录在 JSON meta 中。
- 这是筛选与线索工具，不替代人工尽调。
- 如需更精确分类，可增加行业关键词或接入 LLM 做语义判断。
