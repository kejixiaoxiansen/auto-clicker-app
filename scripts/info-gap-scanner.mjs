import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const CONFIG_PATH = path.join(ROOT, 'config', 'info-gap-sources.json');
const OUTPUT_DIR = path.join(ROOT, 'output');
const JSON_OUTPUT = path.join(OUTPUT_DIR, 'info-gap-report.json');
const CSV_OUTPUT = path.join(OUTPUT_DIR, 'info-gap-report.csv');
const EXCEL_XML_OUTPUT = path.join(OUTPUT_DIR, 'info-gap-report.xml');

const PHYSICAL_KEYWORDS = ['hardware', 'device', 'robot', 'manufactur', '工厂', '硬件', '设备', '机器人', '供应链', '物流'];
const DIGITAL_KEYWORDS = ['saas', 'ai', 'app', 'platform', 'software', 'plugin', 'dataset', 'api', '模型', '软件', '平台', '应用'];

function stripTags(value) {
  return value.replace(/<[^>]+>/g, ' ');
}

function decodeHtml(value) {
  return value
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ');
}

function sanitizeText(value) {
  return decodeHtml(stripTags((value ?? '').toString())).replace(/\s+/g, ' ').trim();
}

function includesAny(text, keywords) {
  const lower = text.toLowerCase();
  return keywords.some(keyword => lower.includes(keyword));
}

function classifyAssetType(text) {
  if (includesAny(text, PHYSICAL_KEYWORDS)) return '实物';
  if (includesAny(text, DIGITAL_KEYWORDS)) return '虚拟资料/数字产品';
  return '待人工判断';
}

function buildDirection(region) {
  return region === 'CN' ? '中国有 -> 国外可能需要' : '国外有 -> 中国可能需要';
}

function buildNeed(region) {
  return region === 'CN'
    ? '海外需求验证、目标市场合规、跨境物流与支付可行性'
    : '中国本地化需求、监管适配、渠道合作与价格带验证';
}

function getTagValue(block, tags) {
  for (const tag of tags) {
    const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i');
    const match = block.match(re);
    if (match?.[1]) return sanitizeText(match[1]);
  }
  return '';
}

function getLink(block) {
  const rssLink = block.match(/<link[^>]*>([\s\S]*?)<\/link>/i)?.[1];
  if (rssLink) return sanitizeText(rssLink);

  const atomLink = block.match(/<link[^>]*href=["']([^"']+)["'][^>]*\/?\s*>/i)?.[1];
  return sanitizeText(atomLink || '');
}

function parseFeedItems(xml) {
  const itemBlocks = [...xml.matchAll(/<item[\s\S]*?<\/item>/gi)].map(m => m[0]);
  if (itemBlocks.length > 0) {
    return itemBlocks.map(block => ({
      title: getTagValue(block, ['title']),
      link: getLink(block),
      pubDate: getTagValue(block, ['pubDate', 'published', 'updated']),
      summary: getTagValue(block, ['description', 'content:encoded', 'content'])
    }));
  }

  const entryBlocks = [...xml.matchAll(/<entry[\s\S]*?<\/entry>/gi)].map(m => m[0]);
  return entryBlocks.map(block => ({
    title: getTagValue(block, ['title']),
    link: getLink(block),
    pubDate: getTagValue(block, ['published', 'updated']),
    summary: getTagValue(block, ['summary', 'content'])
  }));
}

function normalizeItem(source, item) {
  const combinedText = `${item.title} ${item.summary}`;
  return {
    方向: buildDirection(source.region),
    类型: classifyAssetType(combinedText),
    标题: item.title || '(无标题)',
    摘要: item.summary || '',
    来源站点: source.name,
    来源链接: item.link || source.url,
    发布时间: item.pubDate || '',
    信息需求: buildNeed(source.region),
    抓取时间UTC: new Date().toISOString()
  };
}

function dedupe(items) {
  const seen = new Set();
  return items.filter(item => {
    const key = `${item.标题}@@${item.来源链接}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function csvEscape(value) {
  const text = (value ?? '').toString().replace(/"/g, '""');
  return `"${text}"`;
}

function buildCsv(rows) {
  if (rows.length === 0) return '';
  const headers = Object.keys(rows[0]);
  const lines = [headers.map(csvEscape).join(',')];
  for (const row of rows) {
    lines.push(headers.map(h => csvEscape(row[h])).join(','));
  }
  return lines.join('\n');
}

function xmlEscape(value) {
  return (value ?? '')
    .toString()
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function buildExcelXml(rows) {
  const headers = rows.length > 0 ? Object.keys(rows[0]) : [];
  const headerRow = `<Row>${headers.map(h => `<Cell><Data ss:Type="String">${xmlEscape(h)}</Data></Cell>`).join('')}</Row>`;
  const dataRows = rows
    .map(row => `<Row>${headers.map(h => `<Cell><Data ss:Type="String">${xmlEscape(row[h])}</Data></Cell>`).join('')}</Row>`)
    .join('');

  return `<?xml version="1.0"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
 <Worksheet ss:Name="InfoGap">
  <Table>
   ${headerRow}
   ${dataRows}
  </Table>
 </Worksheet>
</Workbook>`;
}

async function loadConfig() {
  const raw = await fs.readFile(CONFIG_PATH, 'utf-8');
  return JSON.parse(raw);
}

async function fetchSource(source, maxItemsPerSource) {
  try {
    const response = await fetch(source.url, {
      headers: { 'User-Agent': 'InfoGapScanner/1.0 (+rss)' }
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const xml = await response.text();
    const items = parseFeedItems(xml)
      .slice(0, maxItemsPerSource)
      .map(item => normalizeItem(source, item));

    return { source: source.name, ok: true, items };
  } catch (error) {
    return {
      source: source.name,
      ok: false,
      error: error instanceof Error ? error.message : String(error),
      items: []
    };
  }
}

async function ensureOutputDir() {
  await fs.mkdir(OUTPUT_DIR, { recursive: true });
}

async function exportOutputs(rows, meta) {
  await fs.writeFile(JSON_OUTPUT, JSON.stringify({ generatedAt: new Date().toISOString(), count: rows.length, rows, meta }, null, 2), 'utf-8');
  await fs.writeFile(CSV_OUTPUT, buildCsv(rows), 'utf-8');
  await fs.writeFile(EXCEL_XML_OUTPUT, buildExcelXml(rows), 'utf-8');
}

async function run() {
  const config = await loadConfig();
  const maxItemsPerSource = Number(config.maxItemsPerSource || 10);
  const jobs = config.sources.map(source => fetchSource(source, maxItemsPerSource));
  const results = await Promise.all(jobs);

  const rows = dedupe(results.flatMap(result => result.items));
  const meta = results.map(result => ({
    source: result.source,
    status: result.ok ? 'ok' : 'error',
    itemCount: result.items.length,
    error: result.error || ''
  }));

  await ensureOutputDir();
  await exportOutputs(rows, meta);

  const failed = meta.filter(x => x.status === 'error').length;
  console.log(`扫描完成: ${rows.length} 条，来源 ${meta.length} 个，失败 ${failed} 个`);
  console.log(`Excel(XML): ${EXCEL_XML_OUTPUT}`);
  console.log(`CSV:        ${CSV_OUTPUT}`);
  console.log(`JSON:       ${JSON_OUTPUT}`);
}

run().catch(error => {
  console.error('扫描失败', error);
  process.exitCode = 1;
});
