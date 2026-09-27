// Archive submission system
const MAP_WIDTH = 4000;
const MAP_HEIGHT = 3000;
const GEO_SCALE = 1.0;
const WORLD_SCALE = 1.0;
const OFFSET_X = 0;
const OFFSET_Y = 0;
const SUBMISSION_ENDPOINT = 'https://ruin-archive-submission.lliquidcat.workers.dev/submit';
const TURNSTILE_SITE_KEY = '0x4AAAAAAERYVdvIxjBH2aXP';
const TURNSTILE_ACTION = 'archive_submit';
const TURNSTILE_ENABLED = Boolean(TURNSTILE_SITE_KEY && !TURNSTILE_SITE_KEY.startsWith('PASTE_'));
const ALLOWED_CLIENT_MIME_TYPES = new Set([
  'image/jpeg','image/png','image/webp','image/gif','image/heic','image/heif',
  'application/pdf','text/plain',
  'audio/mpeg','audio/mp4','audio/ogg','audio/wav','audio/x-wav',
  'video/mp4','video/quicktime','video/webm'
]);
const MAX_FILES = 5;
const MAX_TOTAL_FILE_BYTES = 8 * 1024 * 1024;

// Real-world locator (OpenStreetMap + button-triggered Nominatim search).
// Keep service URLs centralized so the provider can be swapped without touching the UI logic.
const REAL_MAP_TILE_URL = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
const REAL_MAP_TILE_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors';
const NOMINATIM_SEARCH_URL = 'https://nominatim.openstreetmap.org/search';
const NOMINATIM_CACHE_KEY = 'ruinArchive:nominatim:v1';
const NOMINATIM_CACHE_MAX_AGE = 30 * 24 * 60 * 60 * 1000;
const NOMINATIM_MIN_INTERVAL = 1100;

const EXISTING_SITES = [
  {
    "name": "瘟猪坝沉墟",
    "lat": 30.454417,
    "lng": 104.047667,
    "type": "garden",
    "archiveDate": "2025.04",
    "visitMode": "discovery"
  },
  {
    "name": "电台路焦土",
    "lat": 31.225833,
    "lng": 121.618333,
    "type": "garden",
    "archiveDate": "2026.03",
    "visitMode": "discovery"
  },
  {
    "name": "山葬灰脉",
    "lat": 32.04174,
    "lng": 119.83912,
    "type": "record",
    "archiveDate": "2017.08",
    "visitMode": "discovery"
  },
  {
    "name": "硅脉遗厂",
    "lat": 31.1936472,
    "lng": 121.6131444,
    "type": "record",
    "archiveDate": "2018.05",
    "visitMode": "discovery"
  },
  {
    "name": "琉棘庭",
    "lat": 31.2270054,
    "lng": 121.6191375,
    "type": "record",
    "archiveDate": "2018.07",
    "visitMode": "discovery"
  },
  {
    "name": "裂翼坪",
    "lat": 41.860278,
    "lng": -87.606111,
    "type": "record",
    "archiveDate": "2021.08",
    "visitMode": "discovery"
  },
  {
    "name": "轨畔孤构",
    "lat": 32.552507,
    "lng": -94.3644399,
    "type": "record",
    "archiveDate": "2022.06",
    "visitMode": "discovery"
  },
  {
    "name": "残柱林",
    "lat": 41.77502,
    "lng": -87.56954,
    "type": "record",
    "archiveDate": "2022.10",
    "visitMode": "discovery"
  },
  {
    "name": "钟寂残堂",
    "lat": 41.78746317602539,
    "lng": -87.63330678898134,
    "type": "record",
    "archiveDate": "2022.11",
    "recorder": "Sky Chen",
    "visitMode": "discovery"
  },
  {
    "name": "池骸湾",
    "lat": 37.7806,
    "lng": -122.5137,
    "type": "record",
    "archiveDate": "2023.08",
    "visitMode": "discovery"
  },
    {
    "name": "毒烬轮冢",
    "lat": 41.619424715904785,
    "lng": -87.39637364538571,
    "type": "record",
    "archiveDate": "2023.10",
    "recorder": "Sky Chen",
    "visitMode": "discovery"
  },
{
    "name": "褶层湾",
    "lat": 47.1808,
    "lng": -122.5537,
    "type": "record",
    "archiveDate": "2023.12",
    "visitMode": "pilgrimage"
  },
  {
    "name": "隐染悬里",
    "lat": 37.4543556,
    "lng": 141.0370611,
    "type": "record",
    "archiveDate": "2024.01",
    "recorder": "党骁",
    "visitMode": "discovery"
  },
    {
    "name": "锈祷圣堂",
    "lat": 41.6014,
    "lng": -87.3374,
    "type": "record",
    "archiveDate": "2024.02",
    "recorder": "Sky Chen",
    "visitMode": "discovery"
  },
{
    "name": "釉骸拓壁",
    "lat": 30.7023424,
    "lng": 104.0714623,
    "type": "record",
    "archiveDate": "2024.04",
    "visitMode": "discovery"
  },
  {
    "name": "叠骸构阵",
    "lat": 30.4416944,
    "lng": 104.03475,
    "type": "record",
    "archiveDate": "2024.05",
    "visitMode": "pilgrimage"
  },
  {
    "name": "苔网塬",
    "lat": 30.66457,
    "lng": 104.15798,
    "type": "record",
    "archiveDate": "2024.05",
    "visitMode": "discovery"
  },
  {
    "name": "陆坞舰骸",
    "lat": 30.5854444,
    "lng": 104.0365278,
    "type": "record",
    "archiveDate": "2024.06",
    "visitMode": "pilgrimage"
  },
  {
    "name": "墟响厅",
    "lat": 30.5886698,
    "lng": 104.0341997,
    "type": "record",
    "archiveDate": "2024.06",
    "visitMode": "discovery"
  },
  {
    "name": "波蚀脊堤",
    "lat": 30.8227055,
    "lng": 121.5305626,
    "type": "record",
    "archiveDate": "2024.07",
    "visitMode": "pilgrimage"
  },
  {
    "name": "曜原驿",
    "lat": 38.83587,
    "lng": 117.55678,
    "type": "record",
    "archiveDate": "2024.08",
    "visitMode": "discovery"
  },
  {
    "name": "溶境遗廊",
    "lat": 30.660271,
    "lng": 104.0676944,
    "type": "record",
    "archiveDate": "2024.08",
    "visitMode": "discovery"
  },
  {
    "name": "荒娱敖包",
    "lat": 41.72871,
    "lng": 110.51296,
    "type": "record",
    "archiveDate": "2024.12",
    "visitMode": "discovery"
  },
  {
    "name": "彩壳堡",
    "lat": 40.2368611,
    "lng": 116.16375,
    "type": "record",
    "archiveDate": "2025.01",
    "recorder": "王一川",
    "visitMode": "discovery"
  },
  {
    "name": "削岩残居",
    "lat": 30.425167,
    "lng": 104.096167,
    "type": "record",
    "archiveDate": "2025.02",
    "visitMode": "discovery"
  },
  {
    "name": "暮辉骸殿",
    "lat": 22.69915,
    "lng": 114.12291,
    "type": "record",
    "archiveDate": "2026.02",
    "visitMode": "discovery"
  },
  {
    "name": "迁痕空埠",
    "lat": 30.43251,
    "lng": 104.04063,
    "type": "record",
    "archiveDate": "2026.06",
    "visitMode": "discovery"
  },
  {
    "name": "山骸窟殿",
    "lat": 34.5275555,
    "lng": 119.1429722,
    "type": "record",
    "archiveDate": "2026.07",
    "visitMode": "pilgrimage"
  },
  {
    "name": "山融灶垣",
    "lat": 31.664444,
    "lng": 99.679444,
    "type": "record",
    "archiveDate": "2026.08",
    "recorder": "王一川",
    "visitMode": "discovery"
  },
  {
    "name": "崖隐蚀垣",
    "lat": 31.6727778,
    "lng": 99.675,
    "type": "record",
    "archiveDate": "2026.08",
    "recorder": "王一川",
    "visitMode": "discovery"
  },
  {
    "name": "褶脊胚庭",
    "lat": 34.6349414,
    "lng": 135.5036092,
    "type": "record",
    "archiveDate": "2026.08",
    "recorder": "Suni",
    "visitMode": "pilgrimage"
  },
  {
    "name": "雾蚀空庐",
    "lat": 37.4518,
    "lng": 141.0117028,
    "type": "record",
    "archiveDate": "2024.01",
    "recorder": "党骁",
    "visitMode": "discovery"
  },
  {
    "name": "隐阶空墅",
    "lat": 40.0366934,
    "lng": 116.4889296,
    "type": "record",
    "archiveDate": "2025.11",
    "recorder": "王一川",
    "visitMode": "discovery"
  }
];

const i18n = {
  "zh": {
    "document_title": "遗构馆 · 档案系统",
    "panel_title": "遗构馆 · 档案系统",
    "form_title": "档案投稿",
    "mark_location": "标记地点",
    "coord_mode": "坐标格式",
    "coord_decimal": "十进制",
    "coord_dms": "度分秒",
    "real_map_open": "现实地图定位",
    "real_map_entry_hint": "搜索地点、点击地图或拖动标记获取坐标。",
    "real_map_enter": "打开",
    "real_map_title": "现实定位",
    "real_map_search": "搜索",
    "real_map_search_placeholder": "地点名称／地址",
    "real_map_use": "使用此位置",
    "real_map_locate_me": "我的位置",
    "real_map_hint": "点击地图或拖动标记微调位置。",
    "real_map_searching": "正在搜索…",
    "real_map_no_results": "没有找到匹配的地点。",
    "real_map_search_error": "搜索暂时不可用。",
    "real_map_rate_wait": "请稍候再搜索。",
    "real_map_coords": "坐标",
    "real_map_geolocating": "正在获取当前位置…",
    "real_map_geolocation_error": "无法获取当前位置。",
    "real_map_location_used": "已使用现实地图位置，坐标已同步。",
    "layers_title": "图层",
    "contributors_label": "共同记录者 / CONTRIBUTORS",
    "layer_border": "疆界",
    "layer_satellite": "卫星影像",
    "layer_terrain": "地形线",
    "layer_human": "聚居痕迹",
    "layer_archive": "馆藏遗构",
    "layer_visitors": "客录遗构",
    "layer_discovery": "发现",
    "layer_pilgrimage": "循景",
    "archive_label": "归档：",
    "recorder_label": "记录者：",
    "section_meta": "定位与归档",
    "visit_mode_label": "发现方式",
    "visit_mode_discovery": "发现",
    "visit_mode_pilgrimage": "循景",
    "section_record": "档案内容",
    "section_submit": "提交方式",
    "archivist_label": "归档者",
    "coordinate_label": "坐标",
    "place_reference_label": "地点名称",
    "date_label": "时间",
    "place_title_label": "地名标题",
    "description_label": "简介",
    "archivist": "归档者",
    "coordinate": "坐标",
    "place_reference": "地点名称／地址",
    "attachment": "添加附件",
    "drag_pin": "拖放标记",
    "place_title": "地名标题",
    "description": "简介",
    "admin_archive": "归档",
    "visitor_submit": "访客投稿",
    "admin_password": "需要管理员密码",
    "mobile_pick_map": "在地图上选点",
    "location_hint": "坐标与地点名称任填其一。若不清楚坐标，可直接填写地址。",
    "dms_title": "度分秒坐标",
    "dms_lat": "纬",
    "dms_lng": "经",
    "dms_convert": "转为十进制度",
    "dms_invalid": "度分秒坐标格式无效。",
    "dms_converted": "已转为十进制度，可继续标记地点。",
    "coord_invalid": "坐标格式无效。",
    "locating": "正在定位坐标…",
    "locate_ready": "已定位。可拖动地图检查位置，或点击地图微调。",
    "add_location": "添加地点",
    "location_added": "地点已添加，档案投稿已展开。",
    "draft_tooltip": "待归档地点",
    "required": "请完整填写归档者、时间、地名与简介，并填写坐标或地点名称其中一项。",
    "sending": "正在传送档案…",
    "sent_admin": "管理员档案已送出。",
    "sent_visitor": "访客投稿已送出。",
    "submit_failed": "投稿失败。",
    "files_too_large": "附件最多 5 个，总大小不超过 8 MB。",
    "unsupported_file": "附件格式不支持。",
    "human_required": "请完成人机验证。",
    "rate_limited": "提交过于频繁，请稍后再试。",
    "new_record_confirm_title": "新建档案",
    "new_record_confirm_body": "清除当前未提交的内容并建立一份新档案？",
    "confirm": "确认",
    "cancel": "取消",
    "new_record_title": "新建档案",
    "form_open": "展开档案投稿",
    "form_close": "收起档案投稿"
  },
  "en": {
    "document_title": "Relic Archive · Filing System",
    "panel_title": "Relic Archive · Filing System",
    "form_title": "Submit a Record",
    "mark_location": "Mark Location",
    "coord_mode": "Format",
    "coord_decimal": "Decimal",
    "coord_dms": "DMS",
    "real_map_open": "Real-World Locator",
    "real_map_entry_hint": "Search, click, or drag a marker to obtain coordinates.",
    "real_map_enter": "Open",
    "real_map_title": "Real-World Locator",
    "real_map_search": "Search",
    "real_map_search_placeholder": "Place name / address",
    "real_map_use": "Use This Position",
    "real_map_locate_me": "My Location",
    "real_map_hint": "Click the map or drag the marker to refine the point.",
    "real_map_searching": "Searching…",
    "real_map_no_results": "No matching place found.",
    "real_map_search_error": "Search is temporarily unavailable.",
    "real_map_rate_wait": "Please wait before searching again.",
    "real_map_coords": "Coordinates",
    "real_map_geolocating": "Locating current position…",
    "real_map_geolocation_error": "Unable to access the current location.",
    "real_map_location_used": "Real-world position applied; coordinates synchronized.",
    "layers_title": "Layers",
    "contributors_label": "CONTRIBUTORS / SHARED RECORDS",
    "layer_border": "Boundaries",
    "layer_satellite": "Satellite Imagery",
    "layer_terrain": "Terrain Lines",
    "layer_human": "Settlement Traces",
    "layer_archive": "Collection Relics",
    "layer_visitors": "Guest-Recorded Relics",
    "layer_discovery": "Discovery",
    "layer_pilgrimage": "Scene Tracing",
    "archive_label": "Archived: ",
    "recorder_label": "Recorder: ",
    "section_meta": "Location / Record",
    "visit_mode_label": "Encounter Type",
    "visit_mode_discovery": "Discovery",
    "visit_mode_pilgrimage": "Scene Tracing",
    "section_record": "Record Content",
    "section_submit": "Submission",
    "archivist_label": "Recorder",
    "coordinate_label": "Coordinates",
    "place_reference_label": "Place / Address",
    "date_label": "Date",
    "place_title_label": "Record Title",
    "description_label": "Description",
    "archivist": "Recorder",
    "coordinate": "Coordinates",
    "place_reference": "Place Name / Address",
    "attachment": "Add Attachment",
    "drag_pin": "Drag Marker",
    "place_title": "Record Title",
    "description": "Description",
    "admin_archive": "Add to Collection",
    "visitor_submit": "Submit Guest Record",
    "admin_password": "Administrator password required",
    "mobile_pick_map": "Pick on Map",
    "location_hint": "Enter either coordinates or a place name/address. If the coordinates are unknown, an address alone is sufficient.",
    "dms_title": "DMS Coordinates",
    "dms_lat": "Lat",
    "dms_lng": "Lng",
    "dms_convert": "Convert to Decimal",
    "dms_invalid": "Invalid DMS coordinates.",
    "dms_converted": "Converted to decimal degrees. The location is ready to be marked.",
    "coord_invalid": "Invalid coordinates.",
    "locating": "Locating…",
    "locate_ready": "Location found. Move the map to inspect it, or click the map to refine the point.",
    "add_location": "Add Location",
    "location_added": "Location added. The submission form is now open.",
    "draft_tooltip": "Pending record point",
    "required": "Enter the recorder, date, record title, and description, plus either coordinates or a place name/address.",
    "sending": "Submitting record…",
    "sent_admin": "Record added to the collection.",
    "sent_visitor": "Guest record submitted.",
    "submit_failed": "Submission failed.",
    "files_too_large": "Up to 5 attachments, 8 MB total.",
    "unsupported_file": "Unsupported attachment type.",
    "human_required": "Complete the human-verification check.",
    "rate_limited": "Too many submissions. Please try again later.",
    "new_record_confirm_title": "New Record",
    "new_record_confirm_body": "Clear all unsent content and start a new record?",
    "confirm": "Confirm",
    "cancel": "Cancel",
    "new_record_title": "New Record",
    "form_open": "Open submission form",
    "form_close": "Close submission form"
  },
  "ja": {
    "document_title": "遺構館・記録システム",
    "panel_title": "遺構館・記録システム",
    "form_title": "記録を投稿",
    "mark_location": "地点をマーク",
    "coord_mode": "座標形式",
    "coord_decimal": "十進",
    "coord_dms": "度分秒",
    "real_map_open": "現実地図で定位",
    "real_map_entry_hint": "検索・地図クリック・マーカー移動で座標を取得。",
    "real_map_enter": "開く",
    "real_map_title": "現実地図定位",
    "real_map_search": "検索",
    "real_map_search_placeholder": "地点名／住所",
    "real_map_use": "この位置を使用",
    "real_map_locate_me": "現在地",
    "real_map_hint": "地図をクリックするか、マーカーをドラッグして位置を調整します。",
    "real_map_searching": "検索中…",
    "real_map_no_results": "一致する地点が見つかりません。",
    "real_map_search_error": "現在、検索を利用できません。",
    "real_map_rate_wait": "少し待ってから再検索してください。",
    "real_map_coords": "座標",
    "real_map_geolocating": "現在地を取得中…",
    "real_map_geolocation_error": "現在地を取得できません。",
    "real_map_location_used": "現実地図の位置を使用し、座標を同期しました。",
    "layers_title": "レイヤー",
    "contributors_label": "共同記録者 / CONTRIBUTORS",
    "layer_border": "境界",
    "layer_satellite": "衛星画像",
    "layer_terrain": "地形線",
    "layer_human": "居住の痕跡",
    "layer_archive": "収蔵遺構",
    "layer_visitors": "客録遺構",
    "layer_discovery": "発見",
    "layer_pilgrimage": "景を辿る",
    "archive_label": "収蔵日：",
    "recorder_label": "記録者：",
    "section_meta": "位置・記録情報",
    "visit_mode_label": "訪問の契機",
    "visit_mode_discovery": "発見",
    "visit_mode_pilgrimage": "景を辿る",
    "section_record": "記録内容",
    "section_submit": "送信",
    "archivist_label": "記録者",
    "coordinate_label": "座標",
    "place_reference_label": "地点／住所",
    "date_label": "日付",
    "place_title_label": "記録タイトル",
    "description_label": "概要",
    "archivist": "記録者",
    "coordinate": "座標",
    "place_reference": "地点名／住所",
    "attachment": "添付ファイルを追加",
    "drag_pin": "マーカーをドラッグ",
    "place_title": "記録タイトル",
    "description": "概要",
    "admin_archive": "収蔵登録",
    "visitor_submit": "客録として投稿",
    "admin_password": "管理者パスワードが必要です",
    "mobile_pick_map": "地図上で選択",
    "location_hint": "座標または地点名／住所のいずれかを入力してください。座標が不明な場合は、住所だけでも登録できます。",
    "dms_title": "度・分・秒（DMS）",
    "dms_lat": "緯度",
    "dms_lng": "経度",
    "dms_convert": "十進度へ変換",
    "dms_invalid": "度・分・秒の座標が正しくありません。",
    "dms_converted": "十進度に変換しました。地点をマークできます。",
    "coord_invalid": "座標が正しくありません。",
    "locating": "位置を特定中…",
    "locate_ready": "位置を特定しました。地図を動かして確認するか、地図をクリックして位置を微調整できます。",
    "add_location": "地点を追加",
    "location_added": "地点を追加しました。投稿フォームを開きます。",
    "draft_tooltip": "登録待ち地点",
    "required": "記録者・日付・記録タイトル・概要を入力し、さらに座標または地点名／住所のどちらかを入力してください。",
    "sending": "記録を送信中…",
    "sent_admin": "収蔵記録を送信しました。",
    "sent_visitor": "客録を送信しました。",
    "submit_failed": "送信に失敗しました。",
    "files_too_large": "添付ファイルは5件まで、合計8 MBまでです。",
    "unsupported_file": "対応していない添付ファイル形式です。",
    "human_required": "人間であることの確認を完了してください。",
    "rate_limited": "送信回数が多すぎます。時間をおいてもう一度お試しください。",
    "new_record_confirm_title": "新規記録",
    "new_record_confirm_body": "未送信の内容をすべて消去して、新しい記録を作成しますか？",
    "confirm": "確認",
    "cancel": "キャンセル",
    "new_record_title": "新規記録",
    "form_open": "投稿フォームを開く",
    "form_close": "投稿フォームを閉じる"
  }
};
const decodeTokens = new WeakMap();
const decodeAnimations = new Map();
let decodeAnimationRaf = null;
let languageSwitchToken = 0;
let initialLanguageTimer = null;
const archiveRequestedLang = window.RuinSiteLanguage?.normalize?.(new URL(location.href).searchParams.get('lang'));
let currentLang = archiveRequestedLang || window.RuinSiteLanguage?.read?.() || 'en';

function tr(key) {
  return i18n[currentLang][key] || i18n.zh[key] || key;
}

// One shared animation clock preserves the authored cyber-decode effect while
// avoiding one requestAnimationFrame loop per translated DOM node.
function runDecodeAnimations(now) {
  decodeAnimationRaf = null;
  for (const [element, task] of decodeAnimations) {
    if (decodeTokens.get(element) !== task.token) {
      decodeAnimations.delete(element);
      continue;
    }

    const progress = Math.min((now - task.startTime) / task.duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const targetCut = Math.round(task.targetLen * eased);
    const originalCut = Math.round(task.originalLen * eased);
    const nextText = task.targetText.substring(0, targetCut) + task.originalText.substring(originalCut);

    if (nextText !== task.lastString) {
      element.textContent = nextText;
      task.lastString = nextText;
    }

    if (progress >= 1) {
      if (element.textContent !== task.targetText) element.textContent = task.targetText;
      decodeAnimations.delete(element);
    }
  }

  if (decodeAnimations.size) decodeAnimationRaf = requestAnimationFrame(runDecodeAnimations);
}

function cyberDecodeTranslate(element, targetText, duration = 1000) {
  const originalText = element.textContent || '';
  const token = (decodeTokens.get(element) || 0) + 1;
  decodeTokens.set(element, token);
  decodeAnimations.set(element, {
    token,
    originalText,
    originalLen: originalText.length,
    targetText,
    targetLen: targetText.length,
    startTime: performance.now(),
    duration,
    lastString: null
  });
  if (decodeAnimationRaf === null) decodeAnimationRaf = requestAnimationFrame(runDecodeAnimations);
}

function isElementOnScreen(element) {
  const style = getComputedStyle(element);
  if (style.display === 'none' || style.visibility === 'hidden') return false;
  const rect = element.getBoundingClientRect();
  return rect.width > 0 && rect.height > 0 &&
    rect.bottom >= 0 && rect.right >= 0 &&
    rect.top <= window.innerHeight && rect.left <= window.innerWidth;
}

function applyI18n({ animate = false } = {}) {
  const switchToken = ++languageSwitchToken;
  document.documentElement.lang = currentLang === 'ja' ? 'ja' : currentLang === 'en' ? 'en' : 'zh-Hans';
  document.title = tr('document_title');

  document.querySelectorAll('[data-i18n]').forEach(el => {
    const targetText = tr(el.dataset.i18n);
    if (el.textContent === targetText) return;

    if (!animate || !isElementOnScreen(el)) {
      decodeTokens.set(el, (decodeTokens.get(el) || 0) + 1);
      el.textContent = targetText;
      return;
    }

    const delay = Math.random() * 200;
    setTimeout(() => {
      if (switchToken !== languageSwitchToken) return;
      if (!isElementOnScreen(el)) {
        decodeTokens.set(el, (decodeTokens.get(el) || 0) + 1);
        el.textContent = targetText;
        return;
      }
      cyberDecodeTranslate(el, targetText, 1000);
    }, delay);
  });

  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    el.placeholder = tr(el.dataset.i18nPlaceholder);
  });

  document.querySelectorAll('#language-switcher [data-lang]').forEach(button => {
    button.classList.toggle('active', button.dataset.lang === currentLang);
  });

  const handle = document.getElementById('form-handle');
  if (handle) handle.title = tr(document.body.classList.contains('form-open') ? 'form_close' : 'form_open');
  const newRecord = document.getElementById('new-record');
  if (newRecord) newRecord.title = tr('new_record_title');
  if (locatorActive && candidateGeo) showCandidatePopup();
  if (draftMarker) draftMarker.setTooltipContent(tr('draft_tooltip'));
}

function switchLanguage(lang, { animate = true, updateUrl = true, persist = true } = {}) {
  if (!i18n[lang]) return;
  currentLang = lang;
  if (persist) window.RuinSiteLanguage?.save?.(lang);
  if (updateUrl) {
    const url = new URL(location.href);
    url.searchParams.set('lang', lang);
    history.replaceState(null, '', url);
  }
  applyI18n({ animate });
}

document.querySelectorAll('#language-switcher [data-lang]').forEach(button => {
  button.addEventListener('click', () => {
    if (initialLanguageTimer) {
      clearTimeout(initialLanguageTimer);
      initialLanguageTimer = null;
    }
    if (button.dataset.lang === currentLang) return;
    switchLanguage(button.dataset.lang, { animate: true, updateUrl: true });
  });
});

function geoToSVG(lat, lng) {
  let shiftedLng = lng + 180;
  if (shiftedLng > 180) shiftedLng -= 360;
  let x = ((shiftedLng + 180) / 360 - 0.5) * GEO_SCALE + 0.5;
  let y = ((lat + 90) / 180 - 0.5) * GEO_SCALE + 0.5;
  x = (x - 0.5) * WORLD_SCALE + 0.5;
  y = (y - 0.5) * WORLD_SCALE + 0.5;
  x += OFFSET_X;
  y += OFFSET_Y;
  x = Math.max(0, Math.min(1, x));
  y = Math.max(0, Math.min(1, y));
  return [y * MAP_HEIGHT, x * MAP_WIDTH];
}

function mapToGeo(y, x) {
  x /= MAP_WIDTH;
  y /= MAP_HEIGHT;
  x -= OFFSET_X;
  y -= OFFSET_Y;
  x = (x - 0.5) / WORLD_SCALE + 0.5;
  y = (y - 0.5) / WORLD_SCALE + 0.5;
  x = (x - 0.5) / GEO_SCALE + 0.5;
  y = (y - 0.5) / GEO_SCALE + 0.5;
  // JS remainder is negative for negative numbers, so normalize explicitly.
  const wrappedUnit = ((((x + 0.5) % 1) + 1) % 1);
  const lng = wrappedUnit * 360 - 180;
  const lat = Math.max(-90, Math.min(90, y * 180 - 90));
  return { lat, lng };
}

const map = L.map('archive-map', {
  crs: L.CRS.Simple,
  minZoom: -1.8,
  maxZoom: 8,
  zoomControl: false,
  attributionControl: false,
  inertia: true
});
const bounds = [[0, 0], [MAP_HEIGHT, MAP_WIDTH]];

// v59 · Cylindrical archive map. Three visual worlds allow a continuous drag
// across the left/right seam, matching the main archive site.
const ARCHIVE_WORLD_WIDTH = MAP_WIDTH;
const ARCHIVE_WORLD_COPY_OFFSETS = [-1, 0, 1];
const ARCHIVE_WORLD_WRAP_MIN = -ARCHIVE_WORLD_WIDTH * 0.5;
const ARCHIVE_WORLD_WRAP_MAX = ARCHIVE_WORLD_WIDTH * 1.5;
const ARCHIVE_WORLD_VERTICAL_MARGIN = MAP_WIDTH / 8;
let archiveWorldRecenterGuard = false;

function wrapArchiveWorldX(x) {
  return ((x % ARCHIVE_WORLD_WIDTH) + ARCHIVE_WORLD_WIDTH) % ARCHIVE_WORLD_WIDTH;
}

function nearestArchiveWorldX(baseX, referenceX = map.getCenter().lng) {
  const canonicalX = wrapArchiveWorldX(baseX);
  const shift = Math.round((referenceX - canonicalX) / ARCHIVE_WORLD_WIDTH);
  return canonicalX + shift * ARCHIVE_WORLD_WIDTH;
}

function canonicalMapPointFromGeo(lat, lng) {
  const [y, x] = geoToSVG(lat, lng);
  return L.latLng(y, x);
}

function mapPointFromGeo(lat, lng, referenceX = map.getCenter().lng) {
  const point = canonicalMapPointFromGeo(lat, lng);
  return L.latLng(point.lat, nearestArchiveWorldX(point.lng, referenceX));
}

function archiveWorldBounds(copyOffset = 0) {
  const x0 = copyOffset * ARCHIVE_WORLD_WIDTH;
  return [[0, x0], [MAP_HEIGHT, x0 + ARCHIVE_WORLD_WIDTH]];
}

function createArchiveWorldOverlays(file, pane) {
  return ARCHIVE_WORLD_COPY_OFFSETS.map(copyOffset => L.imageOverlay(
    file,
    archiveWorldBounds(copyOffset),
    { pane, interactive: false }
  ));
}

function addArchiveOverlaySet(layers) {
  layers.forEach(layer => {
    if (!map.hasLayer(layer)) layer.addTo(map);
  });
}

function removeArchiveOverlaySet(layers) {
  layers.forEach(layer => {
    if (map.hasLayer(layer)) map.removeLayer(layer);
  });
}

function normalizeArchiveWorldPosition() {
  if (archiveWorldRecenterGuard) return;
  const center = map.getCenter();
  let nextX = center.lng;
  let nextY = center.lat;

  while (nextX < ARCHIVE_WORLD_WRAP_MIN) nextX += ARCHIVE_WORLD_WIDTH;
  while (nextX > ARCHIVE_WORLD_WRAP_MAX) nextX -= ARCHIVE_WORLD_WIDTH;

  nextY = Math.max(
    -ARCHIVE_WORLD_VERTICAL_MARGIN,
    Math.min(MAP_HEIGHT + ARCHIVE_WORLD_VERTICAL_MARGIN, nextY)
  );

  if (Math.abs(nextX - center.lng) < 0.001 && Math.abs(nextY - center.lat) < 0.001) return;

  archiveWorldRecenterGuard = true;
  map.setView([nextY, nextX], map.getZoom(), { animate: false });
  requestAnimationFrame(() => { archiveWorldRecenterGuard = false; });
}

map.createPane('satelliteArchivePane');
map.createPane('terrainArchivePane');
map.createPane('humanArchivePane');
map.createPane('borderArchivePane');
map.getPane('satelliteArchivePane').style.zIndex = '160';
map.getPane('terrainArchivePane').style.zIndex = '180';
map.getPane('humanArchivePane').style.zIndex = '200';
map.getPane('borderArchivePane').style.zIndex = '220';
for (const paneName of ['satelliteArchivePane', 'terrainArchivePane', 'humanArchivePane', 'borderArchivePane']) {
  map.getPane(paneName).style.pointerEvents = 'none';
}

const ruinLayers = createArchiveWorldOverlays('assets/ruin-map-clean.svg', 'humanArchivePane');
const ruinLayer = ruinLayers[1]; // compatibility alias for older code paths
addArchiveOverlaySet(ruinLayers);
map.fitBounds(bounds, { animate: false });
requestAnimationFrame(() => {
  const initialShift = map.getSize().x * 0.10;
  map.panBy([-initialShift, 0], { animate: false });
});
map.on('moveend', normalizeArchiveWorldPosition);

const OWNER_RECORDER_NAMES = new Set(['羅清源', '罗清源', 'Qingyuan Luo']);
// Secondary recorders whose contributions live inside an existing site record
// rather than as a standalone EXISTING_SITES entry.
const CONTRIBUTOR_CREDITS = ['陈佳翔'];

function recorderOf(site) {
  const recorder = String(site.recorder || '羅清源').trim();
  return recorder || '羅清源';
}

function isVisitorRecord(site) {
  return site.type === 'record' && !OWNER_RECORDER_NAMES.has(recorderOf(site));
}

function renderContributorWall() {
  const wall = document.getElementById('contributors-wall-names');
  if (!wall) return;
  const names = [];
  const seen = new Set();
  EXISTING_SITES.forEach(site => {
    if (!isVisitorRecord(site)) return;
    const name = recorderOf(site);
    if (!name || seen.has(name)) return;
    seen.add(name);
    names.push(name);
  });
  CONTRIBUTOR_CREDITS.forEach(name => {
    if (!name || seen.has(name)) return;
    seen.add(name);
    names.push(name);
  });
  wall.textContent = names.length ? `${names.join(' · ')} ·` : '—';
  wall.title = names.join(' · ');
}

function visitModeOf(site) {
  // All archive records are explicitly classified; fallback is only defensive.
  return site.visitMode === 'pilgrimage' ? 'pilgrimage' : 'discovery';
}

function markerGroupOf(site) {
  return isVisitorRecord(site) ? 'visitors' : 'archive';
}

function markerGroupControls(group) {
  const prefix = group === 'visitors' ? 'visitors' : 'archive';
  return {
    parent: document.getElementById(`layer-${prefix}`)
  };
}

const sharedVisitModeControls = {
  discovery: document.getElementById('layer-discovery'),
  pilgrimage: document.getElementById('layer-pilgrimage'),
  groupEl: document.getElementById('layer-record-group'),
  childrenEl: document.getElementById('layer-visit-group'),
  wasAnyEnabled: false
};

function visitModeEnabled(site) {
  return visitModeOf(site) === 'pilgrimage'
    ? Boolean(sharedVisitModeControls.pilgrimage?.checked)
    : Boolean(sharedVisitModeControls.discovery?.checked);
}

function parentMarkerLayerEnabled(site) {
  return Boolean(markerGroupControls(markerGroupOf(site)).parent?.checked);
}

const markerLayerBuckets = {
  archive: {
    discovery: L.layerGroup(),
    pilgrimage: L.layerGroup()
  },
  visitors: {
    discovery: L.layerGroup(),
    pilgrimage: L.layerGroup()
  }
};
let hoverSiteMarker = null;
let lockedSiteMarker = null;

const markerRippleOverlay = document.createElement('div');
markerRippleOverlay.className = 'marker-ripple-overlay';
markerRippleOverlay.setAttribute('aria-hidden', 'true');
document.body.appendChild(markerRippleOverlay);
let markerPulseToken = 0;
let markerPulseTimers = [];

function clearMarkerRippleSequence() {
  markerPulseToken += 1;
  markerPulseTimers.forEach(timer => window.clearTimeout(timer));
  markerPulseTimers = [];
  markerRippleOverlay.replaceChildren();
}

function sitePopupContent(site, showRecorder = false) {
  const content = document.createElement('div');
  content.className = 'site-info-popup-content';

  const name = document.createElement('div');
  name.className = 'site-info-name';
  name.textContent = site.name;

  const coords = document.createElement('div');
  coords.className = 'site-info-coords';
  coords.textContent = `${Number(site.lat).toFixed(7)}, ${Number(site.lng).toFixed(7)}`;

  const date = document.createElement('div');
  date.className = 'site-info-meta';
  const dateLabel = document.createElement('span');
  dateLabel.dataset.i18n = 'archive_label';
  dateLabel.textContent = tr('archive_label');
  date.append(dateLabel, document.createTextNode(site.archiveDate || '—'));

  content.append(name, coords, date);

  if (showRecorder) {
    const recorder = document.createElement('div');
    recorder.className = 'site-info-meta site-info-recorder';
    const recorderLabel = document.createElement('span');
    recorderLabel.dataset.i18n = 'recorder_label';
    recorderLabel.textContent = tr('recorder_label');
    recorder.append(recorderLabel, document.createTextNode(recorderOf(site)));
    content.appendChild(recorder);
  }

  return content;
}

function bindSitePopup(marker, site, showRecorder = false) {
  marker.bindPopup(sitePopupContent(site, showRecorder), {
    closeButton: false,
    autoClose: false,
    closeOnClick: false,
    className: 'archive-site-popup',
    offset: [18, -18]
  });

  marker.on('mouseover', () => {
    if (hoverSiteMarker && hoverSiteMarker !== marker && hoverSiteMarker !== lockedSiteMarker) {
      hoverSiteMarker.closePopup();
    }
    marker.openPopup();
    hoverSiteMarker = marker;
  });

  marker.on('mouseout', () => {
    window.setTimeout(() => {
      if (lockedSiteMarker === marker) return;
      if (hoverSiteMarker === marker) {
        marker.closePopup();
        hoverSiteMarker = null;
      }
    }, 120);
  });

  marker.on('click', e => {
    if (lockedSiteMarker && lockedSiteMarker !== marker) lockedSiteMarker.closePopup();
    lockedSiteMarker = marker;
    marker.openPopup();
    hoverSiteMarker = marker;
    L.DomEvent.stopPropagation(e);
  });
}

const markerSourceBuilt = { archive: false, visitors: false };
function buildMarkerSource(source) {
  if (markerSourceBuilt[source]) return;
  markerSourceBuilt[source] = true;

  for (const site of EXISTING_SITES) {
    if (markerGroupOf(site) !== source) continue;
    const visitMode = visitModeOf(site);
    const bucket = markerLayerBuckets[source][visitMode];
    const cls = site.type === 'garden' ? 'garden-dot' : 'record-dot';
    const icon = L.divIcon({
      className: 'archive-marker',
      html: `<span class="${cls}"></span>`,
      iconSize: [10, 10],
      iconAnchor: [5, 5]
    });
    const basePoint = canonicalMapPointFromGeo(site.lat, site.lng);

    ARCHIVE_WORLD_COPY_OFFSETS.forEach(copyOffset => {
      const marker = L.marker(
        [basePoint.lat, basePoint.lng + copyOffset * ARCHIVE_WORLD_WIDTH],
        { icon, keyboard: false }
      );
      marker._archiveSite = site;
      marker._archiveWorldCopyOffset = copyOffset;
      bindSitePopup(marker, site, source === 'visitors');
      marker.addTo(bucket);
    });
  }
}

function shuffledSites(sites) {
  const result = [...sites];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function appendMarkerRipple(site, token) {
  if (token !== markerPulseToken) return;

  const mapRect = map.getContainer().getBoundingClientRect();
  const point = map.latLngToContainerPoint(mapPointFromGeo(site.lat, site.lng));
  const x = mapRect.left + point.x;
  const y = mapRect.top + point.y;
  if (x < -120 || x > window.innerWidth + 120 || y < -120 || y > window.innerHeight + 120) return;

  const node = document.createElement('span');
  node.className = 'marker-ripple-node';
  node.style.left = `${x}px`;
  node.style.top = `${y}px`;
  node.style.setProperty('--ripple-scale', (11 + Math.random() * 5).toFixed(2));
  node.style.setProperty('--ripple-duration', `${Math.round(1750 + Math.random() * 550)}ms`);
  markerRippleOverlay.appendChild(node);

  const cleanup = window.setTimeout(() => node.remove(), 2500);
  markerPulseTimers.push(cleanup);
}

function pulseMarkerSites(sites) {
  clearMarkerRippleSequence();
  const token = markerPulseToken;
  const ordered = shuffledSites(sites);
  let delay = 40 + Math.random() * 80;

  ordered.forEach(site => {
    const timer = window.setTimeout(() => appendMarkerRipple(site, token), Math.round(delay));
    markerPulseTimers.push(timer);
    delay += 150 + Math.random() * 260;
  });
}

function bindMarkerLayerPulse(inputId, filterFn) {
  const input = document.getElementById(inputId);
  const row = input?.closest('.layer-row');
  if (!row) return;
  const pulse = () => pulseMarkerSites(EXISTING_SITES.filter(filterFn));
  row.addEventListener('mouseenter', pulse);
  row.addEventListener('focusin', pulse);
}

const optionalLayers = {};
function setImageLayer(key, file, enabled, pane) {
  if (enabled) {
    if (!optionalLayers[key]) optionalLayers[key] = createArchiveWorldOverlays(file, pane);
    addArchiveOverlaySet(optionalLayers[key]);
  } else if (optionalLayers[key]) {
    removeArchiveOverlaySet(optionalLayers[key]);
  }
}

setImageLayer('terrain', 'assets/terrain-map.svg', true, 'terrainArchivePane');

document.getElementById('layer-human').addEventListener('change', e => e.target.checked ? addArchiveOverlaySet(ruinLayers) : removeArchiveOverlaySet(ruinLayers));
document.getElementById('layer-border').addEventListener('change', e => setImageLayer('border', 'assets/border-map.svg', e.target.checked, 'borderArchivePane'));
document.getElementById('layer-satellite').addEventListener('change', e => setImageLayer('satellite', 'assets/satellite.jpg', e.target.checked, 'satelliteArchivePane'));
document.getElementById('layer-terrain').addEventListener('change', e => setImageLayer('terrain', 'assets/terrain-map.svg', e.target.checked, 'terrainArchivePane'));

const markerLayerGroups = {
  archive: markerGroupControls('archive'),
  visitors: markerGroupControls('visitors')
};

function anyMarkerLibraryEnabled() {
  return Boolean(
    markerLayerGroups.archive.parent?.checked ||
    markerLayerGroups.visitors.parent?.checked
  );
}

function syncSharedVisitModeAvailability() {
  const enabled = anyMarkerLibraryEnabled();

  // Re-entering the archive libraries always starts with both visit modes visible.
  if (enabled && !sharedVisitModeControls.wasAnyEnabled) {
    if (sharedVisitModeControls.discovery) sharedVisitModeControls.discovery.checked = true;
    if (sharedVisitModeControls.pilgrimage) sharedVisitModeControls.pilgrimage.checked = true;
  }

  for (const input of [sharedVisitModeControls.discovery, sharedVisitModeControls.pilgrimage]) {
    if (input) input.disabled = !enabled;
  }
  sharedVisitModeControls.groupEl?.classList.toggle('is-disabled', !enabled);
  sharedVisitModeControls.wasAnyEnabled = enabled;
}

function setMarkerBucketVisibility(bucket, visible) {
  if (visible) {
    if (!map.hasLayer(bucket)) bucket.addTo(map);
  } else if (map.hasLayer(bucket)) {
    map.removeLayer(bucket);
  }
}

function refreshMarkerLayers() {
  syncSharedVisitModeAvailability();
  const archiveEnabled = Boolean(markerLayerGroups.archive.parent?.checked);
  const visitorsEnabled = Boolean(markerLayerGroups.visitors.parent?.checked);
  const discoveryEnabled = Boolean(sharedVisitModeControls.discovery?.checked);
  const pilgrimageEnabled = Boolean(sharedVisitModeControls.pilgrimage?.checked);

  // Build a source only the first time it is actually requested. Guest markers
  // are off by default, so they no longer cost startup DOM/event allocations.
  if (archiveEnabled) buildMarkerSource('archive');
  if (visitorsEnabled) buildMarkerSource('visitors');

  setMarkerBucketVisibility(markerLayerBuckets.archive.discovery, archiveEnabled && discoveryEnabled);
  setMarkerBucketVisibility(markerLayerBuckets.archive.pilgrimage, archiveEnabled && pilgrimageEnabled);
  setMarkerBucketVisibility(markerLayerBuckets.visitors.discovery, visitorsEnabled && discoveryEnabled);
  setMarkerBucketVisibility(markerLayerBuckets.visitors.pilgrimage, visitorsEnabled && pilgrimageEnabled);
}

markerLayerGroups.archive.parent?.addEventListener('change', refreshMarkerLayers);
markerLayerGroups.visitors.parent?.addEventListener('change', refreshMarkerLayers);
sharedVisitModeControls.discovery?.addEventListener('change', refreshMarkerLayers);
sharedVisitModeControls.pilgrimage?.addEventListener('change', refreshMarkerLayers);

refreshMarkerLayers();

bindMarkerLayerPulse('layer-archive', site => !isVisitorRecord(site) && visitModeEnabled(site));
bindMarkerLayerPulse('layer-visitors', site => isVisitorRecord(site) && visitModeEnabled(site));
bindMarkerLayerPulse('layer-discovery', site => parentMarkerLayerEnabled(site) && visitModeOf(site) === 'discovery');
bindMarkerLayerPulse('layer-pilgrimage', site => parentMarkerLayerEnabled(site) && visitModeOf(site) === 'pilgrimage');

const dragLocationPin = document.getElementById('drag-location-pin');
let pinDragGhost = null;
let pinDragPointerId = null;
let pinGhostRaf = null;
let pendingPinGhostPoint = null;

function movePinGhost(clientX, clientY) {
  if (!pinDragGhost) return;
  pendingPinGhostPoint = { x: clientX, y: clientY };
  if (pinGhostRaf !== null) return;
  pinGhostRaf = requestAnimationFrame(() => {
    pinGhostRaf = null;
    if (!pinDragGhost || !pendingPinGhostPoint) return;
    pinDragGhost.style.transform = `translate3d(${pendingPinGhostPoint.x}px, ${pendingPinGhostPoint.y}px, 0)`;
  });
}

function clearPinDrag() {
  document.body.classList.remove('pin-dragging');
  if (pinGhostRaf !== null) cancelAnimationFrame(pinGhostRaf);
  pinGhostRaf = null;
  pendingPinGhostPoint = null;
  if (pinDragGhost) pinDragGhost.remove();
  pinDragGhost = null;
  pinDragPointerId = null;
}

function isMapDropTarget(clientX, clientY) {
  const target = document.elementFromPoint(clientX, clientY);
  return Boolean(target && target.closest('#archive-map'));
}

dragLocationPin.addEventListener('pointerdown', event => {
  if (event.pointerType === 'mouse' && event.button !== 0) return;
  event.preventDefault();
  pinDragPointerId = event.pointerId;
  document.body.classList.add('pin-dragging');

  pinDragGhost = document.createElement('div');
  pinDragGhost.className = 'pin-drag-ghost';
  pinDragGhost.innerHTML = dragLocationPin.innerHTML;
  document.body.appendChild(pinDragGhost);
  movePinGhost(event.clientX, event.clientY);

  try { dragLocationPin.setPointerCapture(event.pointerId); } catch (_) {}
});

window.addEventListener('pointermove', event => {
  if (pinDragPointerId !== event.pointerId || !pinDragGhost) return;
  movePinGhost(event.clientX, event.clientY);
});

window.addEventListener('pointerup', event => {
  if (pinDragPointerId !== event.pointerId || !pinDragGhost) return;

  if (isMapDropTarget(event.clientX, event.clientY)) {
    const rect = map.getContainer().getBoundingClientRect();
    const mapPoint = L.point(event.clientX - rect.left, event.clientY - rect.top);
    const latLng = map.containerPointToLatLng(mapPoint);
    const point = mapToGeo(latLng.lat, latLng.lng);
    setCandidate(point, { fly: false });
  }

  clearPinDrag();
});

window.addEventListener('pointercancel', event => {
  if (pinDragPointerId === event.pointerId) clearPinDrag();
});

const latInput = document.getElementById('coord-lat');
const lngInput = document.getElementById('coord-lng');
const dmsInputs = {
  latDeg: document.getElementById('dms-lat-deg'),
  latMin: document.getElementById('dms-lat-min'),
  latSec: document.getElementById('dms-lat-sec'),
  latDir: document.getElementById('dms-lat-dir'),
  lngDeg: document.getElementById('dms-lng-deg'),
  lngMin: document.getElementById('dms-lng-min'),
  lngSec: document.getElementById('dms-lng-sec'),
  lngDir: document.getElementById('dms-lng-dir')
};
const searchStatus = document.getElementById('search-status');
const crosshair = document.getElementById('archive-crosshair');
const coordinateModeButtons = Array.from(document.querySelectorAll('[data-coordinate-mode]'));
const coordinateModePanels = Array.from(document.querySelectorAll('[data-coordinate-panel]'));
const COORDINATE_MODE_STORAGE_KEY = 'ruinArchive:coordinateMode:v1';

function setCoordinateMode(mode, { persist = true } = {}) {
  const nextMode = mode === 'dms' ? 'dms' : 'decimal';
  coordinateModeButtons.forEach(button => {
    const active = button.dataset.coordinateMode === nextMode;
    button.classList.toggle('active', active);
    button.setAttribute('aria-selected', active ? 'true' : 'false');
  });
  coordinateModePanels.forEach(panel => {
    const active = panel.dataset.coordinatePanel === nextMode;
    panel.classList.toggle('active', active);
    panel.hidden = !active;
  });
  if (nextMode === 'dms') syncDMSFromDecimalInputs();
  if (persist) {
    try { localStorage.setItem(COORDINATE_MODE_STORAGE_KEY, nextMode); } catch (_) {}
  }
}

coordinateModeButtons.forEach(button => {
  button.addEventListener('click', () => setCoordinateMode(button.dataset.coordinateMode));
});

let initialCoordinateMode = 'decimal';
try { initialCoordinateMode = localStorage.getItem(COORDINATE_MODE_STORAGE_KEY) || 'decimal'; } catch (_) {}
window.setTimeout(() => setCoordinateMode(initialCoordinateMode, { persist: false }), 0);

let locatorActive = false;
let candidateGeo = null;
let locatorPopup = null;
let draftMarker = null;
let crossRaf = null;

function syncWrappedDynamicMapObjects() {
  if (!candidateGeo) return;
  const wrappedPoint = mapPointFromGeo(candidateGeo.lat, candidateGeo.lng);
  if (locatorPopup) locatorPopup.setLatLng(wrappedPoint);
  if (draftMarker) draftMarker.setLatLng(wrappedPoint);
  updateCrosshair();
}

map.on('moveend', syncWrappedDynamicMapObjects);

function readCoordInputs() {
  const latText = latInput.value.trim();
  const lngText = lngInput.value.trim();
  if (!latText || !lngText) return null;
  const lat = Number(latText);
  const lng = Number(lngText);
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) return null;
  return { lat, lng };
}

function decimalToDMS(value, axis) {
  const abs = Math.abs(value);
  let deg = Math.floor(abs);
  const minutesRaw = (abs - deg) * 60;
  let min = Math.floor(minutesRaw);
  let sec = Math.round((minutesRaw - min) * 60 * 1000) / 1000;

  if (sec >= 60) { sec = 0; min += 1; }
  if (min >= 60) { min = 0; deg += 1; }

  const dir = axis === 'lat' ? (value < 0 ? 'S' : 'N') : (value < 0 ? 'W' : 'E');
  return { deg, min, sec, dir };
}

function writeDMSInputs(point) {
  const lat = decimalToDMS(point.lat, 'lat');
  const lng = decimalToDMS(point.lng, 'lng');
  dmsInputs.latDeg.value = String(lat.deg);
  dmsInputs.latMin.value = String(lat.min);
  dmsInputs.latSec.value = lat.sec.toFixed(3).replace(/\.?0+$/, '');
  dmsInputs.latDir.value = lat.dir;
  dmsInputs.lngDeg.value = String(lng.deg);
  dmsInputs.lngMin.value = String(lng.min);
  dmsInputs.lngSec.value = lng.sec.toFixed(3).replace(/\.?0+$/, '');
  dmsInputs.lngDir.value = lng.dir;
}

function clearDMSInputs() {
  for (const key of ['latDeg','latMin','latSec','lngDeg','lngMin','lngSec']) dmsInputs[key].value = '';
  dmsInputs.latDir.value = 'N';
  dmsInputs.lngDir.value = 'E';
}

function dmsAxisToDecimal(degValue, minValue, secValue, dir, maxDeg) {
  if (degValue === '' || minValue === '' || secValue === '') return null;
  const deg = Number(degValue);
  const min = Number(minValue);
  const sec = Number(secValue);
  if (!Number.isFinite(deg) || !Number.isFinite(min) || !Number.isFinite(sec)) return null;
  if (deg < 0 || deg > maxDeg || min < 0 || min >= 60 || sec < 0 || sec >= 60) return null;
  if (deg === maxDeg && (min !== 0 || sec !== 0)) return null;
  const sign = dir === 'S' || dir === 'W' ? -1 : 1;
  return sign * (deg + min / 60 + sec / 3600);
}

function readDMSInputs() {
  const lat = dmsAxisToDecimal(dmsInputs.latDeg.value.trim(), dmsInputs.latMin.value.trim(), dmsInputs.latSec.value.trim(), dmsInputs.latDir.value, 90);
  const lng = dmsAxisToDecimal(dmsInputs.lngDeg.value.trim(), dmsInputs.lngMin.value.trim(), dmsInputs.lngSec.value.trim(), dmsInputs.lngDir.value, 180);
  if (lat === null || lng === null) return null;
  return { lat, lng };
}

function writeCoordInputs(point) {
  latInput.value = point.lat.toFixed(7);
  lngInput.value = point.lng.toFixed(7);
  writeDMSInputs(point);
}

function coordinateString(point) {
  return `${point.lat.toFixed(7)}, ${point.lng.toFixed(7)}`;
}

function syncDMSFromDecimalInputs() {
  const point = readCoordInputs();
  if (point) writeDMSInputs(point);
}

latInput.addEventListener('change', syncDMSFromDecimalInputs);
lngInput.addEventListener('change', syncDMSFromDecimalInputs);

document.getElementById('convert-dms').addEventListener('click', () => {
  const point = readDMSInputs();
  if (!point) { searchStatus.textContent = tr('dms_invalid'); return; }
  writeCoordInputs(point);
  if (draftMarker) { map.removeLayer(draftMarker); draftMarker = null; }
  setCandidate(point, { fly: true });
});

for (const input of [dmsInputs.latDeg, dmsInputs.latMin, dmsInputs.latSec, dmsInputs.lngDeg, dmsInputs.lngMin, dmsInputs.lngSec]) {
  input.addEventListener('keydown', event => {
    if (event.key === 'Enter') {
      event.preventDefault();
      document.getElementById('convert-dms').click();
    }
  });
}


function updateCrosshair() {
  if (!locatorActive || !candidateGeo || crossRaf) return;
  crossRaf = requestAnimationFrame(() => {
    const point = map.latLngToContainerPoint(mapPointFromGeo(candidateGeo.lat, candidateGeo.lng));
    const x = Math.max(0, Math.min(window.innerWidth, point.x));
    const y = Math.max(0, Math.min(window.innerHeight, point.y));
    crosshair.style.setProperty('--cross-x', `${x}px`);
    crosshair.style.setProperty('--cross-y', `${y}px`);
    crossRaf = null;
  });
}

function setCandidate(point, { fly = false } = {}) {
  candidateGeo = { lat: point.lat, lng: point.lng };
  locatorActive = true;
  writeCoordInputs(candidateGeo);
  crosshair.classList.add('active');
  updateCrosshair();
  showCandidatePopup();

  if (fly) {
    searchStatus.textContent = tr('locating');
    const target = mapPointFromGeo(candidateGeo.lat, candidateGeo.lng);
    map.flyTo(target, Math.max(map.getZoom(), 4.8), { duration: 1.25 });
    window.setTimeout(() => {
      if (locatorActive) searchStatus.textContent = tr('locate_ready');
    }, 1300);
  } else {
    searchStatus.textContent = tr('locate_ready');
  }
}

function showCandidatePopup() {
  if (!candidateGeo) return;
  if (locatorPopup) map.closePopup(locatorPopup);

  const content = document.createElement('div');
  content.className = 'locator-popup-content';

  const coords = document.createElement('div');
  coords.className = 'locator-popup-coord';
  coords.textContent = coordinateString(candidateGeo);

  const addButton = document.createElement('button');
  addButton.type = 'button';
  addButton.className = 'add-location-button';
  addButton.textContent = `[${tr('add_location')}]`;
  addButton.addEventListener('click', addCandidateLocation);

  content.append(coords, addButton);
  locatorPopup = L.popup({ className: 'locator-popup', closeButton: false, autoPan: false, offset: [0, -10] })
    .setLatLng(mapPointFromGeo(candidateGeo.lat, candidateGeo.lng))
    .setContent(content)
    .openOn(map);
}

function addCandidateLocation() {
  if (!candidateGeo) return;
  if (draftMarker) map.removeLayer(draftMarker);

  const icon = L.divIcon({ className: 'archive-marker', html: '<span class="draft-dot"></span>', iconSize: [12, 12], iconAnchor: [6, 6] });
  draftMarker = L.marker(mapPointFromGeo(candidateGeo.lat, candidateGeo.lng), { icon, draggable: true })
    .bindTooltip(tr('draft_tooltip'), { className: 'archive-tooltip', direction: 'top', offset: [0, -6] })
    .addTo(map);

  draftMarker.on('dragend', () => {
    const p = draftMarker.getLatLng();
    candidateGeo = mapToGeo(p.lat, p.lng);
    writeCoordInputs(candidateGeo);
    document.getElementById('archive-coordinate').value = coordinateString(candidateGeo);
    });

  document.getElementById('archive-coordinate').value = coordinateString(candidateGeo);
  locatorActive = false;
  crosshair.classList.remove('active');
  map.closePopup();
  locatorPopup = null;
  searchStatus.textContent = tr('location_added');
  setFormOpen(true);
}

const mobileMapPick = document.getElementById('mobile-map-pick');
if (mobileMapPick) {
  mobileMapPick.addEventListener('click', () => {
    const center = map.getCenter();
    const point = mapToGeo(center.lat, center.lng);
    if (draftMarker) { map.removeLayer(draftMarker); draftMarker = null; }
    setCandidate(point, { fly: false });
    window.scrollTo({ top: 0, behavior: 'smooth' });
    window.setTimeout(() => map.invalidateSize({ pan: false }), 260);
  });
}

document.getElementById('locate-coordinate').addEventListener('click', () => {
  const point = readCoordInputs();
  if (!point) { searchStatus.textContent = tr('coord_invalid'); return; }
  if (draftMarker) { map.removeLayer(draftMarker); draftMarker = null; }
  setCandidate(point, { fly: true });
});

map.on('click', e => {
  if (!locatorActive) {
    if (lockedSiteMarker) {
      lockedSiteMarker.closePopup();
      lockedSiteMarker = null;
      hoverSiteMarker = null;
    }
    return;
  }
  const point = mapToGeo(e.latlng.lat, e.latlng.lng);
  setCandidate(point, { fly: false });
});

map.on('move zoom resize', updateCrosshair);

// ---------------------------------------------------------------------------
// Real-world locator: a separate EPSG:3857 Leaflet map used only for finding
// geographic coordinates. It never replaces the CRS.Simple archive map.
// ---------------------------------------------------------------------------
const realMapLocator = document.getElementById('real-map-locator');
const realMapOpenButton = document.getElementById('open-real-map');
const realMapCloseButton = document.getElementById('real-map-close');
const realMapBackdrop = document.getElementById('real-map-backdrop');
const realMapSearchInput = document.getElementById('real-map-search-input');
const realMapSearchButton = document.getElementById('real-map-search-button');
const realMapSearchResults = document.getElementById('real-map-search-results');
const realMapCoordinate = document.getElementById('real-map-coordinate');
const realMapStatus = document.getElementById('real-map-status');
const realMapUseButton = document.getElementById('real-map-use');
const realMapGeolocateButton = document.getElementById('real-map-geolocate');

let realMap = null;
let realMapMarker = null;
let realMapPoint = null;
let realMapPlaceName = '';
let lastNominatimRequestAt = 0;
let nominatimSearching = false;

function parseCoordinateText(text) {
  const match = String(text || '').trim().match(/^\s*(-?\d+(?:\.\d+)?)\s*[,，]\s*(-?\d+(?:\.\d+)?)\s*$/);
  if (!match) return null;
  const lat = Number(match[1]);
  const lng = Number(match[2]);
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) return null;
  return { lat, lng };
}

function existingRealWorldPoint() {
  return candidateGeo || readCoordInputs() || parseCoordinateText(document.getElementById('archive-coordinate').value);
}

function createRealMapMarker(point) {
  const icon = L.divIcon({
    className: 'real-locator-marker',
    html: '<span class="real-locator-marker-sphere"></span><span class="real-locator-marker-stem"></span><span class="real-locator-marker-point"></span>',
    iconSize: [24, 38],
    iconAnchor: [12, 34]
  });
  realMapMarker = L.marker([point.lat, point.lng], { icon, draggable: true, keyboard: false }).addTo(realMap);
  realMapMarker.on('drag', event => setRealMapPoint(event.target.getLatLng(), { moveMarker: false, pan: false, clearPlace: false }));
  realMapMarker.on('dragend', event => setRealMapPoint(event.target.getLatLng(), { moveMarker: false, pan: false, clearPlace: false }));
}

function setRealMapPoint(pointLike, { moveMarker = true, pan = false, zoom = null, clearPlace = true } = {}) {
  const point = { lat: Number(pointLike.lat), lng: Number(pointLike.lng) };
  if (!Number.isFinite(point.lat) || !Number.isFinite(point.lng)) return;
  realMapPoint = point;
  if (clearPlace) realMapPlaceName = '';
  if (!realMapMarker) createRealMapMarker(point);
  else if (moveMarker) realMapMarker.setLatLng([point.lat, point.lng]);
  realMapCoordinate.textContent = coordinateString(point);
  realMapUseButton.disabled = false;
  if (realMap && pan) realMap.setView([point.lat, point.lng], zoom ?? Math.max(realMap.getZoom(), 16), { animate: true });
}

function initRealMap() {
  if (realMap) return;
  realMap = L.map('real-map', {
    zoomControl: false,
    attributionControl: true,
    minZoom: 2,
    maxZoom: 19,
    worldCopyJump: true,
    preferCanvas: true
  });
  L.tileLayer(REAL_MAP_TILE_URL, {
    minZoom: 2,
    maxZoom: 19,
    maxNativeZoom: 19,
    attribution: REAL_MAP_TILE_ATTRIBUTION
  }).addTo(realMap);
  realMap.attributionControl.setPrefix(false);
  realMap.setView([34.5, 116], 4, { animate: false });
  realMap.on('click', event => {
    setRealMapPoint(event.latlng, { moveMarker: true, pan: false, clearPlace: true });
    realMapStatus.textContent = tr('real_map_hint');
    realMapSearchResults.hidden = true;
  });
  document.getElementById('real-map-zoom-in').addEventListener('click', () => realMap.zoomIn());
  document.getElementById('real-map-zoom-out').addEventListener('click', () => realMap.zoomOut());
}

function openRealMapLocator() {
  initRealMap();
  realMapLocator.hidden = false;
  realMapLocator.setAttribute('aria-hidden', 'false');
  document.body.classList.add('real-map-opened');
  const placeReference = document.getElementById('archive-place-reference').value.trim();
  if (!realMapSearchInput.value.trim() && placeReference) realMapSearchInput.value = placeReference;
  const point = existingRealWorldPoint();
  requestAnimationFrame(() => {
    realMap.invalidateSize({ pan: false });
    if (point) {
      setRealMapPoint(point, { moveMarker: true, pan: true, zoom: Math.max(realMap.getZoom(), 16), clearPlace: false });
    }
    realMapStatus.textContent = tr('real_map_hint');
    realMapSearchInput.focus({ preventScroll: true });
  });
}

function closeRealMapLocator() {
  if (realMapLocator.hidden) return;
  realMapLocator.hidden = true;
  realMapLocator.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('real-map-opened');
  realMapSearchResults.hidden = true;
}

function readNominatimCache() {
  try {
    const parsed = JSON.parse(localStorage.getItem(NOMINATIM_CACHE_KEY) || '{}');
    const now = Date.now();
    for (const [key, entry] of Object.entries(parsed)) {
      if (!entry || !entry.time || now - entry.time > NOMINATIM_CACHE_MAX_AGE) delete parsed[key];
    }
    return parsed;
  } catch (_) { return {}; }
}

function writeNominatimCache(cache) {
  try {
    const entries = Object.entries(cache).sort((a, b) => (b[1]?.time || 0) - (a[1]?.time || 0)).slice(0, 80);
    localStorage.setItem(NOMINATIM_CACHE_KEY, JSON.stringify(Object.fromEntries(entries)));
  } catch (_) {}
}

function nominatimLanguage() {
  if (currentLang === 'ja') return 'ja';
  if (currentLang === 'zh') return 'zh-CN,zh';
  return 'en';
}

function renderRealMapSearchResults(results) {
  realMapSearchResults.replaceChildren();
  if (!results.length) {
    realMapSearchResults.hidden = true;
    realMapStatus.textContent = tr('real_map_no_results');
    return;
  }
  results.slice(0, 6).forEach(result => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'real-map-result';
    const name = document.createElement('span');
    name.className = 'real-map-result-name';
    name.textContent = result.display_name || `${result.lat}, ${result.lon}`;
    const type = document.createElement('span');
    type.className = 'real-map-result-type';
    type.textContent = [result.type, result.category].filter(Boolean).join(' · ');
    button.append(name, type);
    button.addEventListener('click', () => {
      const lat = Number(result.lat);
      const lng = Number(result.lon);
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;
      realMapPlaceName = result.display_name || '';
      setRealMapPoint({ lat, lng }, { moveMarker: true, pan: false, clearPlace: false });
      const bbox = Array.isArray(result.boundingbox) ? result.boundingbox.map(Number) : [];
      if (bbox.length === 4 && bbox.every(Number.isFinite)) {
        realMap.fitBounds([[bbox[0], bbox[2]], [bbox[1], bbox[3]]], { padding: [38, 38], maxZoom: 17, animate: true });
      } else {
        realMap.setView([lat, lng], 16, { animate: true });
      }
      realMapSearchResults.hidden = true;
      realMapStatus.textContent = result.display_name || tr('real_map_hint');
    });
    realMapSearchResults.append(button);
  });
  realMapSearchResults.hidden = false;
}

async function searchRealMap() {
  const query = realMapSearchInput.value.trim();
  if (!query || nominatimSearching) return;
  const lang = nominatimLanguage();
  const cacheKey = `${lang}|${query.toLocaleLowerCase()}`;
  const cache = readNominatimCache();
  if (cache[cacheKey]?.results) {
    renderRealMapSearchResults(cache[cacheKey].results);
    return;
  }
  const now = Date.now();
  if (now - lastNominatimRequestAt < NOMINATIM_MIN_INTERVAL) {
    realMapStatus.textContent = tr('real_map_rate_wait');
    return;
  }
  lastNominatimRequestAt = now;
  nominatimSearching = true;
  realMapSearchButton.disabled = true;
  realMapStatus.textContent = tr('real_map_searching');
  try {
    const url = new URL(NOMINATIM_SEARCH_URL);
    url.searchParams.set('q', query);
    url.searchParams.set('format', 'jsonv2');
    url.searchParams.set('limit', '6');
    url.searchParams.set('addressdetails', '1');
    url.searchParams.set('accept-language', lang);
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      credentials: 'omit',
      referrerPolicy: 'strict-origin-when-cross-origin'
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const results = await response.json();
    cache[cacheKey] = { time: Date.now(), results };
    writeNominatimCache(cache);
    renderRealMapSearchResults(results);
  } catch (error) {
    console.error('Nominatim search failed:', error);
    realMapSearchResults.hidden = true;
    realMapStatus.textContent = tr('real_map_search_error');
  } finally {
    nominatimSearching = false;
    realMapSearchButton.disabled = false;
  }
}

realMapOpenButton.addEventListener('click', openRealMapLocator);
realMapCloseButton.addEventListener('click', closeRealMapLocator);
realMapBackdrop.addEventListener('click', closeRealMapLocator);
realMapSearchButton.addEventListener('click', () => void searchRealMap());
realMapSearchInput.addEventListener('keydown', event => {
  if (event.key === 'Enter') {
    event.preventDefault();
    void searchRealMap();
  }
});

realMapGeolocateButton.addEventListener('click', () => {
  if (!navigator.geolocation) {
    realMapStatus.textContent = tr('real_map_geolocation_error');
    return;
  }
  realMapStatus.textContent = tr('real_map_geolocating');
  navigator.geolocation.getCurrentPosition(
    position => {
      const point = { lat: position.coords.latitude, lng: position.coords.longitude };
      setRealMapPoint(point, { moveMarker: true, pan: true, zoom: 17, clearPlace: true });
      realMapStatus.textContent = tr('real_map_hint');
    },
    () => { realMapStatus.textContent = tr('real_map_geolocation_error'); },
    { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
  );
});

realMapUseButton.addEventListener('click', () => {
  if (!realMapPoint) return;
  setCandidate(realMapPoint, { fly: true });
  addCandidateLocation();
  const placeReference = document.getElementById('archive-place-reference');
  if (!placeReference.value.trim() && realMapPlaceName) placeReference.value = realMapPlaceName;
  searchStatus.textContent = tr('real_map_location_used');
  closeRealMapLocator();
});

document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && !realMapLocator.hidden) closeRealMapLocator();
});

const formShell = document.getElementById('archive-form-shell');
const formHandle = document.getElementById('form-handle');
const formHandleGlyph = formHandle.querySelector('.form-handle-glyph');
function setFormOpen(open) {
  formShell.classList.toggle('open', open);
  document.body.classList.toggle('form-open', open);
  formShell.setAttribute('aria-hidden', String(!open));
  formHandle.setAttribute('aria-expanded', String(open));
  formHandleGlyph.textContent = open ? '›' : '‹';
  formHandle.title = tr(open ? 'form_close' : 'form_open');
  if (open) void ensureTurnstileLoaded().catch(() => {});
}
formHandle.addEventListener('click', () => setFormOpen(!formShell.classList.contains('open')));

let turnstileWidgetId = null;
let turnstileLoadPromise = null;
let currentSubmissionId = (crypto && typeof crypto.randomUUID === 'function') ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
let submitting = false;

function ensureTurnstileLoaded() {
  if (!TURNSTILE_ENABLED || turnstileWidgetId !== null) return Promise.resolve();
  if (turnstileLoadPromise) return turnstileLoadPromise;

  turnstileLoadPromise = new Promise((resolve, reject) => {
    const renderWidget = () => {
      try {
        if (turnstileWidgetId === null && window.turnstile) {
          turnstileWidgetId = turnstile.render('#turnstile-slot', {
            sitekey: TURNSTILE_SITE_KEY,
            theme: 'light',
            size: 'flexible',
            action: TURNSTILE_ACTION,
            'refresh-expired': 'auto'
          });
        }
        resolve();
      } catch (error) {
        turnstileLoadPromise = null;
        reject(error);
      }
    };

    if (window.turnstile) {
      renderWidget();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
    script.async = true;
    script.defer = true;
    script.onload = renderWidget;
    script.onerror = () => {
      turnstileLoadPromise = null;
      reject(new Error('Turnstile failed to load'));
    };
    document.head.appendChild(script);
  });

  return turnstileLoadPromise;
}

function refreshSubmissionId() {
  currentSubmissionId = (crypto && typeof crypto.randomUUID === 'function') ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function resetTurnstileWidget() {
  if (TURNSTILE_ENABLED && window.turnstile && turnstileWidgetId !== null) {
    try { turnstile.reset(turnstileWidgetId); } catch (_) {}
  }
}

function setSubmittingState(active) {
  submitting = active;
  document.getElementById('admin-submit').disabled = active;
  document.getElementById('visitor-submit').disabled = active;
}

const attachments = document.getElementById('attachments');
const attachmentCount = document.getElementById('attachment-count');
const fileList = document.getElementById('file-list');
attachments.addEventListener('change', () => {
  const files = [...attachments.files];
  attachmentCount.textContent = String(files.length);
  fileList.textContent = files.map(f => `${f.name} · ${(f.size / 1024 / 1024).toFixed(2)} MB`).join(' / ');
});

const newRecordDialog = document.getElementById('new-record-dialog');
const newRecordConfirm = document.getElementById('new-record-confirm');
const newRecordCancel = document.getElementById('new-record-cancel');

function hasArchiveWork() {
  const form = document.getElementById('archive-form');
  const hasFormValue = [...form.querySelectorAll('input:not([type="file"]):not([type="radio"]):not([type="checkbox"]), textarea')].some(el => el.value.trim());
  const hasCoordinateValue = [
    latInput, lngInput,
    dmsInputs.latDeg, dmsInputs.latMin, dmsInputs.latSec,
    dmsInputs.lngDeg, dmsInputs.lngMin, dmsInputs.lngSec
  ].some(el => el.value.trim());
  return hasFormValue || hasCoordinateValue || attachments.files.length > 0 || Boolean(candidateGeo) || Boolean(draftMarker) || locatorActive;
}

function openNewRecordDialog() {
  newRecordDialog.hidden = false;
  newRecordDialog.setAttribute('aria-hidden', 'false');
}

function closeNewRecordDialog() {
  newRecordDialog.hidden = true;
  newRecordDialog.setAttribute('aria-hidden', 'true');
}

function resetArchiveWorkspace() {
  document.getElementById('archive-form').reset();
  attachmentCount.textContent = '0';
  fileList.textContent = '';
  const status = document.getElementById('submit-status');
  status.textContent = '';
  status.className = 'submit-status';
  searchStatus.textContent = '';
  latInput.value = '';
  lngInput.value = '';
  clearDMSInputs();
  candidateGeo = null;
  locatorActive = false;
  crosshair.classList.remove('active');
  if (locatorPopup) { map.closePopup(locatorPopup); locatorPopup = null; }
  if (draftMarker) { map.removeLayer(draftMarker); draftMarker = null; }
  if (!realMapLocator.hidden) closeRealMapLocator();
  if (realMapMarker && realMap) { realMap.removeLayer(realMapMarker); realMapMarker = null; }
  realMapPoint = null;
  realMapPlaceName = '';
  if (realMapCoordinate) realMapCoordinate.textContent = '—';
  if (realMapUseButton) realMapUseButton.disabled = true;
  if (realMapSearchInput) realMapSearchInput.value = '';
  if (realMapSearchResults) { realMapSearchResults.replaceChildren(); realMapSearchResults.hidden = true; }
  refreshSubmissionId();
  resetTurnstileWidget();
  setFormOpen(true);
}

document.getElementById('new-record').addEventListener('click', () => {
  if (hasArchiveWork()) openNewRecordDialog();
  else resetArchiveWorkspace();
});
newRecordCancel.addEventListener('click', closeNewRecordDialog);
newRecordConfirm.addEventListener('click', () => { closeNewRecordDialog(); resetArchiveWorkspace(); });
newRecordDialog.querySelector('.system-dialog-backdrop').addEventListener('click', closeNewRecordDialog);
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && !newRecordDialog.hidden) closeNewRecordDialog();
});

function formValid() {
  const requiredIds = ['archivist', 'archive-date', 'place-title', 'description'];
  const requiredFilled = requiredIds.every(id => document.getElementById(id).value.trim());
  const hasLocationReference = Boolean(document.getElementById('archive-coordinate').value.trim() || document.getElementById('archive-place-reference').value.trim());
  return requiredFilled && hasLocationReference;
}
function filesValid() {
  const files = [...attachments.files];
  return files.length <= MAX_FILES && files.reduce((sum, file) => sum + file.size, 0) <= MAX_TOTAL_FILE_BYTES;
}
function fileTypesValid() {
  return [...attachments.files].every(file => ALLOWED_CLIENT_MIME_TYPES.has((file.type || '').toLowerCase()));
}

async function submitArchive(mode) {
  if (submitting) return;
  const status = document.getElementById('submit-status');
  if (!formValid()) { status.className = 'submit-status error'; status.textContent = tr('required'); return; }
  if (!filesValid()) { status.className = 'submit-status error'; status.textContent = tr('files_too_large'); return; }
  if (!fileTypesValid()) { status.className = 'submit-status error'; status.textContent = tr('unsupported_file'); return; }
  const turnstileInput = document.querySelector('[name="cf-turnstile-response"]');
  if (TURNSTILE_ENABLED && (!turnstileInput || !turnstileInput.value)) { status.className = 'submit-status error'; status.textContent = tr('human_required'); return; }

  const data = new FormData();
  data.set('mode', mode);
  data.set('submissionId', currentSubmissionId);
  data.set('website', document.getElementById('contact-website').value || '');
  data.set('archivist', document.getElementById('archivist').value.trim());
  data.set('coordinate', document.getElementById('archive-coordinate').value.trim());
  data.set('date', document.getElementById('archive-date').value);
  data.set('title', document.getElementById('place-title').value.trim());
  data.set('description', document.getElementById('description').value.trim());
  data.set('placeSearch', document.getElementById('archive-place-reference').value.trim());
  data.set('visitMode', document.querySelector('input[name="visitMode"]:checked')?.value || 'discovery');
  if (mode === 'admin') data.set('adminPassword', document.getElementById('admin-password').value);
  for (const file of attachments.files) data.append('attachments', file, file.name);

  const turnstile = document.querySelector('[name="cf-turnstile-response"]');
  if (turnstile) data.set('turnstileToken', turnstile.value);

  status.className = 'submit-status';
  status.textContent = tr('sending');
  setSubmittingState(true);
  try {
    const res = await fetch(SUBMISSION_ENDPOINT, { method: 'POST', body: data });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      if (res.status === 429) throw new Error(tr('rate_limited'));
      throw new Error(body.error || `HTTP ${res.status}`);
    }
    status.className = 'submit-status success';
    status.textContent = mode === 'admin' ? tr('sent_admin') : tr('sent_visitor');
    if (mode === 'visitor') document.getElementById('admin-password').value = '';
    refreshSubmissionId();
  } catch (err) {
    console.error(err);
    status.className = 'submit-status error';
    status.textContent = `${tr('submit_failed')} ${err.message || ''}`;
  } finally {
    setSubmittingState(false);
    resetTurnstileWidget();
  }
}

document.getElementById('admin-submit').addEventListener('click', () => void submitArchive('admin'));
document.getElementById('visitor-submit').addEventListener('click', () => void submitArchive('visitor'));

const dmsPanel = document.querySelector('[data-coordinate-panel="dms"]');
let compactLayoutTimer = null;
function syncArchiveCompactLayout() {
  const portraitPhone = window.innerWidth <= 760 && window.innerHeight >= window.innerWidth;
  if (portraitPhone) setFormOpen(true);
  if (compactLayoutTimer !== null) window.clearTimeout(compactLayoutTimer);
  compactLayoutTimer = window.setTimeout(() => {
    compactLayoutTimer = null;
    map.invalidateSize({ pan: false });
  }, 80);
}
syncArchiveCompactLayout();
window.addEventListener('resize', syncArchiveCompactLayout, { passive: true });
renderContributorWall();

applyI18n({ animate: false });
initialLanguageTimer = null;

