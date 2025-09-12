// 主入口文件，整合所有功能模块

// 由于我们现在使用普通脚本模式，不需要导入语句
// 所有函数都可以通过全局作用域访问
// 注意：search-functions.js和state-management.js必须在main.js之前加载

// 直接定义debounce函数，确保它在任何地方都可用
function debounce(func, wait, immediate = false) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      timeout = null;
      if (!immediate) func.apply(this, args);
    };
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(this, args);
  };
}

// 直接定义状态管理函数
function showContent(loadingIndicator, emptyState, contentContainer, pagination) {
  loadingIndicator.classList.add('hidden');
  emptyState.classList.add('hidden');
  contentContainer.classList.remove('hidden');
  
  // 显示分页
  if (pagination) {
    pagination.classList.remove('hidden');
  }
}

function showEmptyState(loadingIndicator, contentContainer, pagination, emptyState) {
  loadingIndicator.classList.add('hidden');
  contentContainer.classList.add('hidden');
  
  // 隐藏分页
  if (pagination) {
    pagination.classList.add('hidden');
  }
  
  emptyState.classList.remove('hidden');
}

function showLoading(loadingIndicator, emptyState, contentContainer, pagination) {
  loadingIndicator.classList.remove('hidden');
  emptyState.classList.add('hidden');
  contentContainer.classList.add('hidden');
  
  // 隐藏分页
  if (pagination) {
    pagination.classList.add('hidden');
  }
}

// 定义搜索相关函数
function preprocessSearchTerm(term) {
  // 转换为小写
  let processed = term.toLowerCase();
  
  // 移除常见标点符号
  processed = processed.replace(/[.,;:!?"'()\[\]{}]/g, '');
  
  // 替换多个空格为单个空格
  processed = processed.replace(/\s+/g, ' ');
  
  // 去除首尾空格
  processed = processed.trim();
  
  return processed;
}

function calculateSimilarity(str1, str2) {
  // 如果有一个为空，直接返回0
  if (!str1 || !str2) return 0;
  
  // 完全匹配直接返回1
  if (str1 === str2) return 1;
  
  // 计算编辑距离
  const distance = calculateEditDistance(str1, str2);
  
  // 计算相似度（基于长度的归一化）
  const maxLength = Math.max(str1.length, str2.length);
  
  // 对于短字符串，增强相似度计算
  let similarity = 1 - (distance / maxLength);
  
  // 短字符串加分机制
  if (maxLength <= 5) {
    similarity += (0.2 * (5 - maxLength) / 5);
    similarity = Math.min(1, similarity); // 确保不超过1
  }
  
  // 长度差异处理
  if (maxLength > 0) {
    const minLength = Math.min(str1.length, str2.length);
    const lengthRatio = minLength / maxLength;
    
    // 如果长度差异超过50%，但一个包含另一个，给予额外加分
    if (lengthRatio < 0.5) {
      const longerStr = str1.length > str2.length ? str1 : str2;
      const shorterStr = str1.length > str2.length ? str2 : str1;
      
      if (longerStr.includes(shorterStr)) {
        similarity += 0.1; // 额外加分
        similarity = Math.min(1, similarity); // 确保不超过1
      }
    }
  }
  
  return similarity;
}

function calculateEditDistance(str1, str2) {
  const m = str1.length;
  const n = str2.length;
  
  // 创建DP表
  const dp = Array(m + 1).fill().map(() => Array(n + 1).fill(0));
  
  // 初始化边界条件
  for (let i = 0; i <= m; i++) {
    dp[i][0] = i;
  }
  
  for (let j = 0; j <= n; j++) {
    dp[0][j] = j;
  }
  
  // 填充DP表
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,       // 删除
        dp[i][j - 1] + 1,       // 插入
        dp[i - 1][j - 1] + cost // 替换
      );
    }
  }
  
  return dp[m][n];
}

function isKeyboardAdjacent(char1, char2) {
  // 简化的键盘布局映射（QWERTY）
  const keyboardLayout = {
    'q': ['w', 'a', 's'],
    'w': ['q', 'e', 's', 'd', 'a'],
    'e': ['w', 'r', 'd', 'f', 's'],
    'r': ['e', 't', 'f', 'g', 'd'],
    't': ['r', 'y', 'g', 'h', 'f'],
    'y': ['t', 'u', 'h', 'j', 'g'],
    'u': ['y', 'i', 'j', 'k', 'h'],
    'i': ['u', 'o', 'k', 'l', 'j'],
    'o': ['i', 'p', 'l'],
    'p': ['o', 'l'],
    'a': ['q', 'w', 's', 'x', 'z'],
    's': ['a', 'w', 'e', 'd', 'c', 'x', 'z'],
    'd': ['s', 'e', 'r', 'f', 'v', 'c', 'x'],
    'f': ['d', 'r', 't', 'g', 'b', 'v', 'c'],
    'g': ['f', 't', 'y', 'h', 'n', 'b', 'v'],
    'h': ['g', 'y', 'u', 'j', 'm', 'n', 'b'],
    'j': ['h', 'u', 'i', 'k', 'm', 'n'],
    'k': ['j', 'i', 'o', 'l', 'm'],
    'l': ['k', 'o', 'p'],
    'z': ['a', 's', 'x'],
    'x': ['z', 'a', 's', 'd', 'c'],
    'c': ['x', 's', 'd', 'f', 'v'],
    'v': ['c', 'd', 'f', 'g', 'b'],
    'b': ['v', 'f', 'g', 'h', 'n'],
    'n': ['b', 'g', 'h', 'j', 'm'],
    'm': ['n', 'h', 'j', 'k']
  };
  
  // 转换为小写
  char1 = char1.toLowerCase();
  char2 = char2.toLowerCase();
  
  // 检查是否在布局中并且相邻
  return keyboardLayout[char1] && keyboardLayout[char1].includes(char2);
}

function filterGamesBySearch(games, searchTerm, category = 'all') {
  // 如果搜索词为空，返回当前分类的所有游戏
  if (!searchTerm.trim()) {
    if (category === 'all') {
      return games;
    } else {
      return games.filter(game => game.category === category);
    }
  }
  
  // 预处理搜索词
  const processedSearchTerm = preprocessSearchTerm(searchTerm);
  
  // 过滤游戏
  const filtered = games.filter(game => {
    // 检查分类
    if (category !== 'all' && game.category !== category) {
      return false;
    }
    
    // 预处理游戏名称
    const processedGameName = preprocessSearchTerm(game.name);
    
    // 检查是否直接包含搜索词
    if (processedGameName.includes(processedSearchTerm)) {
      return true;
    }
    
    // 计算相似度
    const similarity = calculateSimilarity(processedGameName, processedSearchTerm);
    
    // 相似度阈值
    return similarity > 0.5; // 可以根据需要调整阈值
  });
  
  return filtered;
}

// 全局变量
let gamesData = [];
let filteredGames = [];
let currentPage = 1;
let gamesPerPage = calculateGamesPerPage(); // 根据屏幕宽度动态计算每页游戏数量
let searchInput;
let gameGrid;
let pagination;
let pageNumbers;
let currentPageNum;
let totalPagesNum;
let prevPageBtn;
let nextPageBtn;
let loadingIndicator;
let emptyState;
let categoryButtons;
let currentCategory = 'all';

// 根据屏幕宽度计算每页显示的游戏数量
function calculateGamesPerPage() {
  const screenWidth = window.innerWidth;
  // 根据屏幕宽度动态调整每页显示的游戏数量
  if (screenWidth >= 1600) return 24;  // 超大屏幕显示24个游戏
  if (screenWidth >= 1200) return 20;  // 大屏幕显示20个游戏
  if (screenWidth >= 992) return 16;   // 中屏幕显示16个游戏
  if (screenWidth >= 768) return 12;   // 小屏幕显示12个游戏
  return 8;  // 超小屏幕显示8个游戏
}

// 游戏分类关键词映射 - 全面优化版
const categoryKeywords = {
  '热门游戏': [
    'GTA', '侠盗猎车手', '赛博朋克', '艾尔登法环', '艾尔登', '星空', 
    '原神', '只狼', '黑神话', '博德之门', '巫师', '刺客信条',
    '荒野大镖客', '战神', '塞尔达', '马里奥', '动物森友会',
    '赛博朋克2077', '死亡搁浅', '最后生还者', '地平线', '守望先锋'
  ],
  '动作冒险': [
    '动作', '冒险', 'ACT', 'ADV', '动作冒险', '刺客', '忍者', 
    '战士', '盗墓', '孤岛危机', '古墓丽影', '波斯王子', '恶魔城',
    '尼尔', '地平线', '战神', '塞尔达', '怪物猎人', '黑暗之魂',
    '只狼', '控制', '死亡搁浅', '合金装备', '神秘海域', '神海'
  ],
  '角色扮演': [
    'RPG', '角色扮演', 'rpg', '暗黑', '暗黑破坏神', '巫师', 
    '辐射', '上古卷轴', '原神', '艾尔登法环', '博德之门', 
    '最终幻想', '女神异闻录', '火焰纹章', '勇者斗恶龙',
    '异度之刃', '塞尔达', '巫师3', '辐射4', '上古卷轴5',
    '巫师之昆特牌', '黑神话悟空', '永劫无间', '星穹铁道'
  ],
  '策略战术': [
    '策略', '战术', '战棋', 'SLG', '策略游戏', '文明', '全战', 
    '全面战争', '钢铁雄心', '欧陆风云', '三国志', '王国风云',
    '信长之野望', '命令与征服', '红色警戒', '星际争霸', '魔兽争霸',
    'DOTA', '英雄联盟', '王者荣耀', '炉石传说', '英雄无敌',
    '文明6', '全面战争三国', '三国志14'
  ],
  '模拟经营': [
    '模拟', '经营', 'SIM', '模拟游戏', '模拟人生', '城市', 
    '都市', '农场', '星露谷物语', '纪元', '海岛大亨', '双点医院',
    '模拟城市', '过山车大亨', '动物园之星', '主题医院', '植物大战僵尸',
    '我的世界', '动物森友会', '牧场物语', '波西亚时光', '星露谷'
  ],
  '体育竞技': [
    '体育', '竞技', '足球', '篮球', 'FIFA', 'NBA', '赛车', 
    'F1', '2K', '实况足球', '极限竞速', '马里奥赛车', '网球',
    '高尔夫', '橄榄球', '棒球', '冰球', '拳击', '格斗', '摔跤',
    'FIFA 23', 'NBA 2K23', 'F1 23', '极限竞速地平线', 'WWE'
  ],
  '恐怖游戏': [
    '恐怖', '惊悚', 'horror', '寂静岭', '生化危机', '恶灵附身', 
    '逃生', '死亡空间', '咒怨', '鬼影实录', '僵尸', '鬼屋',
    '午夜凶铃', '招魂', '阴儿房', '安娜贝尔', '德州电锯杀人狂',
    '电锯惊魂', '咒', '恐惧', '黑暗', '幽灵', '闹鬼', '驱魔人',
    '死亡搁浅', '寂静岭', '寂静岭2', '寂静岭3', '寂静岭4',
    '生化危机2', '生化危机3', '生化危机7', '生化危机8', '生化危机4',
    '逃生2', '层层恐惧', '纸人', '港诡实录', '咒', '恐惧之间'
  ]
};

// 搜索功能相关函数 - 从search-functions.js导入

// 游戏特定分类映射 - 用于特定游戏的精确分类
const gameSpecificCategories = {
  // 生化危机系列 - 明确分类为恐怖游戏
  '生化危机': '恐怖游戏',
  'resident evil': '恐怖游戏',
  'biohazard': '恐怖游戏',
  // 寂静岭系列 - 明确分类为恐怖游戏
  '寂静岭': '恐怖游戏',
  'silent hill': '恐怖游戏',
  // 逃生系列 - 明确分类为恐怖游戏
  '逃生': '恐怖游戏',
  'outlast': '恐怖游戏',
  // 死亡空间系列 - 明确分类为恐怖游戏
  '死亡空间': '恐怖游戏',
  'dead space': '恐怖游戏',
  // 层层恐惧系列 - 明确分类为恐怖游戏
  '层层恐惧': '恐怖游戏',
  'layers of fear': '恐怖游戏',
  // 黑暗之魂系列 - 明确分类为动作冒险
  '黑暗之魂': '动作冒险',
  'dark souls': '动作冒险',
  // 艾尔登法环 - 明确分类为动作冒险
  '艾尔登法环': '动作冒险',
  'elden ring': '动作冒险',
  // 赛博朋克系列 - 明确分类为动作冒险
  '赛博朋克': '动作冒险',
  'cyberpunk': '动作冒险'
};

// 根据游戏名称自动分类 - 优化性能版
function categorizeGame(gameName) {
  const lowerName = gameName.toLowerCase();
  
  // 1. 首先检查游戏特定分类映射 - 优先级最高
  for (const [gameKeyword, category] of Object.entries(gameSpecificCategories)) {
    if (lowerName.includes(gameKeyword.toLowerCase())) {
      // 生产环境移除日志
      // console.log(`游戏 '${gameName}' 通过特定映射分类为: ${category}`);
      return category;
    }
  }
  
  // 2. 计算每个分类的匹配分数 - 优化版本
  const categoryScores = {};
  
  // 初始化所有分类的分数为0
  Object.keys(categoryKeywords).forEach(category => {
    categoryScores[category] = 0;
  });
  
  // 计算每个关键词的匹配分数 - 减少不必要的相似度计算
  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    for (const keyword of keywords) {
      const lowerKeyword = keyword.toLowerCase();
      
      // 完全匹配加分最高
      if (lowerName === lowerKeyword) {
        categoryScores[category] += 3;
      }
      // 包含关键词加分
      else if (lowerName.includes(lowerKeyword)) {
        // 根据关键词长度调整分数权重
        const keywordLength = keyword.length;
        const baseScore = 1;
        // 关键词越长，匹配分数越高
        const lengthBonus = Math.min(1, keywordLength / 10); // 最多额外加1分
        categoryScores[category] += baseScore + lengthBonus;
      }
      // 只有在必要时才进行相似度计算
      // 这里我们只对长度相近的词进行相似度计算，减少计算量
      else if (Math.abs(lowerName.length - lowerKeyword.length) < 5) {
        const similarity = calculateSimilarity(lowerName, lowerKeyword);
        if (similarity > 0.7) { // 只考虑高相似度
          categoryScores[category] += similarity * 0.5; // 相似度分数权重
        }
      }
    }
  }
  
  // 3. 找出分数最高的分类
  let highestScore = 0;
  let bestCategory = '其他';
  
  for (const [category, score] of Object.entries(categoryScores)) {
    if (score > highestScore) {
      highestScore = score;
      bestCategory = category;
    }
  }
  
  // 4. 如果最高分数超过阈值，返回对应分类
  if (highestScore > 0.5) { // 设置一个合理的阈值
    // 生产环境移除日志
    // console.log(`游戏 '${gameName}' 通过关键词匹配分类为: ${bestCategory} (分数: ${highestScore.toFixed(2)})`);
    return bestCategory;
  }
  
  // 5. 最后的兜底分类逻辑 - 检查通用词汇
  // 检查是否包含数字（可能是版本号）
  if (/\d/.test(lowerName)) {
    // 尝试根据常见的游戏类型关键词进行最后判断
    const actionKeywords = ['动作', 'act', 'adventure', '冒险', 'warrior', 'fighter'];
    const rpgKeywords = ['rpg', 'role', 'play', '角色扮演', 'rpg', 'rpg\d'];
    const strategyKeywords = ['strategy', 'tactics', '策略', 'tactic', '战棋'];
    
    for (const keyword of actionKeywords) {
      if (lowerName.includes(keyword)) {
        return '动作冒险';
      }
    }
    
    for (const keyword of rpgKeywords) {
      if (lowerName.includes(keyword)) {
        return '角色扮演';
      }
    }
    
    for (const keyword of strategyKeywords) {
      if (lowerName.includes(keyword)) {
        return '策略战术';
      }
    }
  }
  
  // 默认分类
  // 生产环境移除日志
  // console.log(`游戏 '${gameName}' 未找到匹配分类，归为: 其他`);
  return '其他';
}

// 根据分类筛选游戏
function filterGamesByCategory(category, gamesData) {
  if (category === 'all') {
    return gamesData;
  }
  
  return gamesData.filter(game => game.category === category);
}
  
  // 不同场景的防抖函数配置
const debounceConfigs = {
  // 搜索输入防抖 - 标准延迟
  search: (func) => debounce(func, 300),
  // 窗口调整防抖 - 稍短延迟以提高响应性
  resize: (func) => debounce(func, 200),
  // 按钮点击防抖 - 立即执行模式
  click: (func) => debounce(func, 100, true)
};

// 游戏网格渲染相关函数 - 优化性能版（使用requestAnimationFrame优化DOM操作）
function renderGameGrid(gameGrid, filteredGames, currentPage, gamesPerPage) {
  // 使用requestAnimationFrame批量处理DOM操作，减少浏览器重排重绘
  requestAnimationFrame(() => {
    // 清空容器
    gameGrid.innerHTML = '';
    
    if (filteredGames.length === 0) {
      const noResults = document.createElement('div');
      noResults.className = 'col-span-full flex flex-col items-center justify-center py-20 text-center';
      noResults.innerHTML = `
        <div class="w-32 h-32 flex items-center justify-center mb-6 text-primary/50">
          <i class="fa fa-search text-8xl"></i>
        </div>
        <h2 class="text-2xl font-bold text-neutral-800 mb-2">未找到游戏</h2>
        <p class="text-neutral-600 mb-4">建议使用Wemod平台或使用其他关键词搜索</p>
        <a href="wemod_platform.html" class="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-bold rounded-lg shadow-lg hover:bg-blue-700 transition-all duration-300 transform hover:scale-105">
          <i class="fa fa-external-link mr-2"></i> 前往Wemod平台
        </a>
      `;
      gameGrid.appendChild(noResults);
      return;
    }
    
    // 计算当前页显示的游戏
    const startIndex = (currentPage - 1) * gamesPerPage;
    const endIndex = Math.min(startIndex + gamesPerPage, filteredGames.length);
    const currentGames = filteredGames.slice(startIndex, endIndex);
    
    // 预创建所有卡片的HTML字符串，减少DOM操作
    let cardsHtml = '';
    
    // 图标颜色数组 - 提高对比度的颜色
    const iconColors = ['text-primary', 'text-secondary', 'text-red-500', 'text-purple-500', 'text-amber-500'];
    const iconClasses = [
      'fa-gamepad', 'fa-rocket', 'fa-diamond', 'fa-star', 'fa-trophy',
      'fa-shield', 'fa-sword', 'fa-car', 'fa-plane', 'fa-space-shuttle'
    ];
    
    // 构建所有卡片的HTML
    for (let i = 0; i < currentGames.length; i++) {
      const game = currentGames[i];
      
      const colorClass = iconColors[game.iconIndex % iconColors.length];
      const iconClass = iconClasses[game.iconIndex % iconClasses.length];
      
      // 如果有图片URL，使用图片，否则使用图标
      let imageHtml = '';
      if (game.imageUrl && game.imageUrl.trim() !== '') {
        imageHtml = `
          <div class="w-full h-40 mb-4 overflow-hidden rounded-lg border border-neutral-200 bg-neutral-50 flex items-center justify-center">
            <img 
              data-src="${game.imageUrl}" 
              src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1 1'%3E%3C/svg%3E" 
              alt="${game.name}" 
              class="lazy max-w-full max-h-full object-cover transition-transform duration-500 hover:scale-110"
            >
          </div>
        `;
      } else {
        imageHtml = `
          <div class="w-20 h-20 rounded-full bg-neutral-50 flex items-center justify-center mb-4 border border-neutral-200 transition-all duration-300">
            <i class="fa ${iconClass} text-3xl ${colorClass}"></i>
          </div>
        `;
      }
      
      // 如果有下载地址，创建下载按钮，否则显示普通按钮
      let buttonHtml = '';
      if (game.downloadUrl && game.downloadUrl.trim() !== '') {
        buttonHtml = `
          <a href="${game.downloadUrl}" target="_blank" class="w-full py-3 bg-primary hover:bg-primary/90 text-white font-medium rounded-lg transition-all duration-300 shadow-sm flex items-center justify-center gap-2">
            <i class="fa fa-download"></i>
            下载修改器
          </a>
        `;
      } else {
        buttonHtml = `
          <button class="no-download-btn w-full py-3 bg-primary hover:bg-primary/90 text-white font-medium rounded-lg transition-all duration-300 shadow-sm">
            查看修改器
          </button>
        `;
      }
      
      // 创建按钮HTML
      let buttonContainerHtml = '';
      
      // 改进反作弊按钮判断逻辑，减少不必要的日志输出
      const hasAntiCheatUrl = (game.antiCheatUrl && 
                             game.antiCheatUrl.trim() !== '' && 
                             game.antiCheatUrl.trim().toLowerCase() !== '#n/a') ||
                             game.name.includes('(有反作弊文件)');
      
      // 如果游戏名称中包含标记但没有URL，使用修改器URL作为默认地址
      let finalAntiCheatUrl = game.antiCheatUrl;
      if (!game.antiCheatUrl && game.name.includes('(有反作弊文件)')) {
        finalAntiCheatUrl = game.downloadUrl; // 使用修改器URL作为替代
      }
        
      if (hasAntiCheatUrl) {
        // 有反作弊文件下载地址，显示反作弊按钮和修改器按钮
        buttonContainerHtml = `
          <div class="w-full space-y-3">
            ${buttonHtml}
            <a href="${finalAntiCheatUrl}" target="_blank" class="w-full py-3 bg-red-50 border border-red-500 text-red-600 font-medium rounded-lg hover:bg-red-100 transition-all duration-300 flex items-center justify-center gap-2">
              <i class="fa fa-shield"></i>
              反作弊文件/必下载！
            </a>
          </div>
        `;
      } else {
        // 没有反作弊文件下载地址，只显示修改器按钮
        buttonContainerHtml = buttonHtml;
      }
      
      // 添加卡片HTML到字符串
      cardsHtml += `
        <div class="bg-white rounded-lg shadow-md p-5 card-hover transition-all duration-300 flex flex-col items-center text-center border border-neutral-100 w-full max-w-[320px] min-h-[320px]">
          ${imageHtml}
          <h3 class="font-bold text-lg text-neutral-800 mb-4 w-full text-wrap break-words">${game.name}</h3>
          ${buttonContainerHtml}
        </div>
      `;
    }
    
    // 一次性将所有卡片添加到DOM，减少重排和重绘
    gameGrid.innerHTML = cardsHtml;
    
    // 为没有下载URL的按钮添加事件监听
    const noDownloadButtons = gameGrid.querySelectorAll('.no-download-btn');
    noDownloadButtons.forEach((button, index) => {
      const game = currentGames[index];
      button.addEventListener('click', () => {
        alert(`查看游戏：${game.name} 的修改器`);
      });
    });
    
    // 初始化图片懒加载
    initLazyLoad();
  });
}

// 初始化图片懒加载 - 增强版（支持占位符、错误处理、性能优化）
function initLazyLoad() {
  const lazyImages = document.querySelectorAll('.lazy');
  
  // 防止重复初始化
  if (!lazyImages.length) return;
  
  // 预定义占位图片样式
  const placeholderStyle = `
    background-color: #f0f0f0;
    background-image: linear-gradient(45deg, #f9f9f9 25%, transparent 25%, transparent 50%, #f9f9f9 50%, #f9f9f9 75%, transparent 75%, transparent);
    background-size: 20px 20px;
    animation: placeholder-loading 1.5s infinite;
  `;
  
  // 为所有懒加载图片添加占位符样式
  lazyImages.forEach(image => {
    if (!image.style.backgroundColor) {
      image.style.cssText += placeholderStyle;
    }
  });
  
  // 处理图片加载
  const handleImageLoad = (image) => {
    // 图片加载完成后移除占位符样式和lazy类
    image.style.animation = 'none';
    image.style.background = 'none';
    image.classList.remove('lazy');
  };
  
  // 处理图片加载失败
  const handleImageError = (image) => {
    console.warn('图片加载失败:', image.dataset.src);
    // 使用默认图标替代加载失败的图片
    image.src = '/assets/images/default-game-icon.png';
    image.alt = '游戏图标';
    handleImageLoad(image);
  };
  
  if ('IntersectionObserver' in window) {
    // 配置IntersectionObserver以获得更好的性能
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const image = entry.target;
          
          // 检查是否已经加载过
          if (image.dataset.loaded) return;
          
          // 标记为已加载
          image.dataset.loaded = 'true';
          
          // 设置图片加载和错误事件监听
          image.onload = () => handleImageLoad(image);
          image.onerror = () => handleImageError(image);
          
          // 开始加载图片
          image.src = image.dataset.src;
          
          // 停止观察已处理的图片
          imageObserver.unobserve(image);
        }
      });
    }, {
      // 优化配置
      rootMargin: '50px 0px', // 预加载视口边缘外50px的图片
      threshold: 0.01, // 只要图片有1%可见就开始加载
      delay: 100 // 延迟100ms，避免快速滚动时的不必要加载
    });
    
    // 批量观察所有懒加载图片
    lazyImages.forEach(image => {
      imageObserver.observe(image);
    });
    
    // 添加清理函数，避免内存泄漏
    if (!window.imageObserverCleanup) {
      window.imageObserverCleanup = [];
      
      window.addEventListener('unload', () => {
        window.imageObserverCleanup.forEach(observer => {
          if (observer && typeof observer.disconnect === 'function') {
            observer.disconnect();
          }
        });
      });
    }
    
    window.imageObserverCleanup.push(imageObserver);
  } else {
    // 降级方案 - 对于不支持IntersectionObserver的浏览器
    // 使用防抖的滚动事件处理
    const loadImagesOnScroll = debounce(() => {
      const scrollY = window.pageYOffset;
      
      lazyImages.forEach(image => {
        const rect = image.getBoundingClientRect();
        
        // 当图片进入视口时加载
        if (rect.top <= window.innerHeight + 100 && rect.bottom >= 0 && !image.dataset.loaded) {
          image.dataset.loaded = 'true';
          image.onload = () => handleImageLoad(image);
          image.onerror = () => handleImageError(image);
          image.src = image.dataset.src;
        }
      });
      
      // 检查是否所有图片都已加载
      const remainingImages = document.querySelectorAll('.lazy:not([data-loaded="true"])');
      if (!remainingImages.length && window.lazyLoadScrollHandler) {
        window.removeEventListener('scroll', window.lazyLoadScrollHandler);
        window.removeEventListener('resize', window.lazyLoadScrollHandler);
        window.removeEventListener('orientationchange', window.lazyLoadScrollHandler);
      }
    }, 150);
    
    // 保存处理函数引用以便后续清理
    window.lazyLoadScrollHandler = loadImagesOnScroll;
    
    // 添加事件监听
    window.addEventListener('scroll', loadImagesOnScroll);
    window.addEventListener('resize', loadImagesOnScroll);
    window.addEventListener('orientationchange', loadImagesOnScroll);
    
    // 立即执行一次，加载视口中的图片
    loadImagesOnScroll();
  }
}

// 分页功能相关函数
function renderPagination(pageNumbers, currentPageNum, totalPagesNum, prevPageBtn, nextPageBtn, filteredGames, gamesPerPage, currentPage) {
  pageNumbers.innerHTML = '';
  
  const totalPages = Math.ceil(filteredGames.length / gamesPerPage);
  currentPageNum.textContent = currentPage;
  totalPagesNum.textContent = totalPages;
  
  // 更新按钮状态
  prevPageBtn.disabled = currentPage === 1;
  nextPageBtn.disabled = currentPage === totalPages;
  
  // 生成页码按钮
  const maxVisiblePages = 5;
  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
  let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
  
  // 调整开始页码，确保显示足够的页码
  if (endPage - startPage + 1 < maxVisiblePages) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }
  
  // 添加第一页和省略号
  if (startPage > 1) {
    addPageButton(pageNumbers, 1, currentPage);
    if (startPage > 2) {
      addEllipsis(pageNumbers);
    }
  }
  
  // 添加可见页码
  for (let i = startPage; i <= endPage; i++) {
    addPageButton(pageNumbers, i, currentPage);
  }
  
  // 添加省略号和最后一页
  if (endPage < totalPages) {
    if (endPage < totalPages - 1) {
      addEllipsis(pageNumbers);
    }
    addPageButton(pageNumbers, totalPages, currentPage);
  }
}

// 添加页码按钮
function addPageButton(pageNumbers, pageNum, currentPage) {
  const button = document.createElement('button');
  button.className = `px-3 py-2 rounded-lg transition-all duration-300 ${currentPage === pageNum ? 'bg-primary text-white' : 'bg-white border border-neutral-200 text-neutral-700 hover:border-primary hover:text-primary'}`;
  button.textContent = pageNum;
  
  // 注意：这里不直接添加事件监听器，是在主文件中处理
  button.dataset.page = pageNum;
  
  pageNumbers.appendChild(button);
}

// 添加省略号
function addEllipsis(pageNumbers) {
  const ellipsis = document.createElement('span');
  ellipsis.className = 'px-2 text-neutral-400';
  ellipsis.textContent = '...';
  pageNumbers.appendChild(ellipsis);
}

// 模态框处理相关函数
function initUsageGuideModal() {
  const usageGuideBtn = document.getElementById('usageGuideBtn');
  const usageGuideModal = document.getElementById('usageGuideModal');
  const closeUsageGuideModal = document.getElementById('closeUsageGuideModal');
  const confirmUsageGuideBtn = document.getElementById('confirmUsageGuideBtn');
  
  if (!usageGuideBtn || !usageGuideModal || !closeUsageGuideModal || !confirmUsageGuideBtn) {
    console.warn('Usage guide modal elements not found');
    return;
  }
  
  // 关闭模态框函数
  function closeModal() {
    usageGuideModal.classList.add('hidden');
  }
  
  // 打开模态框
  usageGuideBtn.addEventListener('click', function() {
    usageGuideModal.classList.remove('hidden');
  });
  
  // 点击关闭按钮
  closeUsageGuideModal.addEventListener('click', closeModal);
  
  // 点击确认按钮
  confirmUsageGuideBtn.addEventListener('click', closeModal);
  
  // 点击模态框外部关闭
  usageGuideModal.addEventListener('click', function(event) {
    if (event.target === usageGuideModal) {
      closeModal();
    }
  });
  
  // 按ESC键关闭
  document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape' && !usageGuideModal.classList.contains('hidden')) {
      closeModal();
    }
  });
}

function initSponsorModal() {
  const sponsorBtn = document.getElementById('sponsorBtn');
  const sponsorModal = document.getElementById('sponsorModal');
  const closeSponsorModal = document.getElementById('closeSponsorModal');
  
  if (!sponsorBtn || !sponsorModal || !closeSponsorModal) {
    console.warn('Sponsor modal elements not found');
    return;
  }
  
  sponsorBtn.addEventListener('click', () => {
    sponsorModal.classList.remove('hidden');
  });
  
  closeSponsorModal.addEventListener('click', () => {
    sponsorModal.classList.add('hidden');
  });
  
  // 点击弹窗外部关闭
  sponsorModal.addEventListener('click', (e) => {
    if (e.target === sponsorModal) {
      sponsorModal.classList.add('hidden');
    }
  });
  
  // 按ESC键关闭
  document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape' && !sponsorModal.classList.contains('hidden')) {
      sponsorModal.classList.add('hidden');
    }
  });
}

// 初始化函数
function init() {
  console.log('页面初始化...');
  
  // 获取DOM元素
  searchInput = document.getElementById('searchInput');
  gameGrid = document.getElementById('gameGrid');
  pagination = document.getElementById('pagination');
  pageNumbers = document.getElementById('pageNumbers');
  currentPageNum = document.getElementById('currentPageNum');
  totalPagesNum = document.getElementById('totalPagesNum');
  // 直接使用HTML中定义的正确ID
  prevPageBtn = document.getElementById('prevPage');
  nextPageBtn = document.getElementById('nextPage');
  loadingIndicator = document.getElementById('loadingIndicator');
  emptyState = document.getElementById('emptyState');
  
  // 获取刷新按钮
  const refreshButton = document.getElementById('refreshButton');
  
  // 搜索输入事件监听
  if (searchInput) {
    searchInput.addEventListener('input', debounce(handleSearch, 300));
  }
  
  // 刷新按钮事件监听
  if (refreshButton) {
    refreshButton.addEventListener('click', function() {
      console.log('刷新数据...');
      // 清空搜索框
      if (searchInput) {
        searchInput.value = '';
      }
      // 重新加载游戏数据
      loadGameData();
      // 显示加载状态
      if (loadingIndicator && emptyState && gameGrid && pagination) {
        showLoading(loadingIndicator, emptyState, gameGrid, pagination);
      }
    });
  }
  
  // 分页按钮事件监听
  if (prevPageBtn) {
    prevPageBtn.addEventListener('click', () => {
      if (currentPage > 1) {
        currentPage--;
        renderGameGrid(gameGrid, filteredGames, currentPage, gamesPerPage);
        renderPagination(pageNumbers, currentPageNum, totalPagesNum, prevPageBtn, nextPageBtn, filteredGames, gamesPerPage, currentPage);
      }
    });
  }
  
  if (nextPageBtn) {
    nextPageBtn.addEventListener('click', () => {
      const totalPages = Math.ceil(filteredGames.length / gamesPerPage);
      if (currentPage < totalPages) {
        currentPage++;
        renderGameGrid(gameGrid, filteredGames, currentPage, gamesPerPage);
        renderPagination(pageNumbers, currentPageNum, totalPagesNum, prevPageBtn, nextPageBtn, filteredGames, gamesPerPage, currentPage);
      }
    });
  }
  
  // 页码按钮事件委托
  if (pageNumbers) {
    pageNumbers.addEventListener('click', (e) => {
      const pageButton = e.target.closest('button[data-page]');
      if (pageButton) {
        const pageNum = parseInt(pageButton.dataset.page);
        if (pageNum !== currentPage) {
          currentPage = pageNum;
          renderGameGrid(gameGrid, filteredGames, currentPage, gamesPerPage);
          renderPagination(pageNumbers, currentPageNum, totalPagesNum, prevPageBtn, nextPageBtn, filteredGames, gamesPerPage, currentPage);
        }
      }
    });
  }
  
  // 初始化分类按钮
  initCategoryButtons();
  
  // 初始化模态框
  initUsageGuideModal();
  initSponsorModal();
  
  // 加载更新信息
  loadUpdateInfo();
  
  // 加载游戏数据
  loadGameData();
}

// 加载更新信息
function loadUpdateInfo() {
  const updateContainer = document.getElementById('updateInfoContainer');
  
  fetch('data/修改器近期更新.txt')
    .then(response => {
      if (!response.ok) {
        throw new Error(`无法加载更新信息文件`);
      }
      return response.text();
    })
    .then(text => {
      // 将txt内容按行分割并格式化显示
      const lines = text.trim().split('\n');
      const formattedContent = lines.map(line => {
        // 为每行添加适当的样式
        if (line.startsWith('更新时间')) {
          return `<div class="text-primary font-semibold mb-2">${line}</div>`;
        } else {
          return `<div class="ml-4 py-1">${line}</div>`;
        }
      }).join('');
      
      updateContainer.innerHTML = formattedContent;
    })
    .catch(error => {
      console.error('加载更新信息失败:', error);
      // 如果加载失败，显示一个简单的提示
      updateContainer.innerHTML = '<div class="text-neutral-600">暂无更新信息</div>';
    });
}

// 加载游戏数据 - 仅使用JSON文件
function loadGameData() {
  console.log('开始加载游戏数据...');
  
  // 检查DOM元素是否都存在
  if (!loadingIndicator || !emptyState || !gameGrid || !pagination) {
    console.error('必要的DOM元素不存在，无法继续加载游戏数据');
    console.log('loadingIndicator:', loadingIndicator);
    console.log('emptyState:', emptyState);
    console.log('gameGrid:', gameGrid);
    console.log('pagination:', pagination);
    return;
  }
  
  // 显示加载状态
  showLoading(loadingIndicator, emptyState, gameGrid, pagination);
  
  // 数据文件的相对路径 - 仅使用JSON文件
  const jsonDataPath = 'data/modifiers_data.json';
  console.log('加载JSON数据文件:', jsonDataPath);
  
  // 尝试加载JSON文件
  fetch(jsonDataPath, { 
    cache: 'no-store' 
  })
    .then(response => {
      console.log('JSON文件请求响应状态:', response.status, response.statusText);
      
      if (!response.ok) {
        throw new Error(`JSON文件加载失败: ${response.status} ${response.statusText}`);
      }
      
      return response.json();
    })
    .then(jsonData => {
      console.log('JSON文件加载成功，共', jsonData.length, '条记录');
      
      // 处理并渲染数据
      processAndRenderData(jsonData); // JSON格式不需要XLSX库
      
      // 缓存数据到本地存储
      try {
        localStorage.setItem('gameModifiersData', JSON.stringify(jsonData));
        localStorage.setItem('gameModifiersCacheTimestamp', Date.now().toString());
      } catch (e) {
        console.warn('无法缓存数据到本地存储:', e);
      }
    })
    .catch(error => {
      console.error('数据加载失败:', error);
      
      // 尝试使用本地缓存数据
      const cachedData = localStorage.getItem('gameModifiersData');
      if (cachedData) {
        console.log('尝试使用本地缓存的数据');
        try {
          const parsedData = JSON.parse(cachedData);
          
          // 使用缓存数据更新UI
          requestAnimationFrame(() => {
            gamesData = parsedData;
            filteredGames = [...gamesData];
            
            showContent(loadingIndicator, emptyState, gameGrid, pagination);
            renderGameGrid(gameGrid, filteredGames, currentPage, gamesPerPage);
            renderPagination(pageNumbers, currentPageNum, totalPagesNum, prevPageBtn, nextPageBtn, filteredGames, gamesPerPage, currentPage);
            
            console.log(`从缓存加载 ${gamesData.length} 个游戏条目`);
          });
          return;
        } catch (cacheError) {
          console.error('缓存数据解析失败:', cacheError);
          localStorage.removeItem('gameModifiersData');
        }
      }
      
      // 显示加载失败信息
      handleLoadFailure(error);
    });
  
  // 处理加载失败逻辑
  function handleLoadFailure(error) {
    console.error('加载失败详情:', {
      errorType: error.name,
      errorMessage: error.message
    });
    
    // 显示空状态和错误信息
    loadingIndicator.classList.add('hidden');
    gameGrid.classList.add('hidden');
    pagination.classList.add('hidden');
    
    emptyState.innerHTML = `
      <div class="text-center py-12">
        <div class="text-6xl text-red-400 mb-4">
          <i class="fa fa-exclamation-circle"></i>
        </div>
        <h3 class="text-xl font-semibold text-neutral-800 mb-2">数据加载失败</h3>
        <p class="text-neutral-600 mb-6">无法加载修改器数据，请检查网络连接或稍后再试</p>
        <button id="retryButton" class="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
          重新加载
        </button>
      </div>
    `;
    
    emptyState.classList.remove('hidden');
    
    // 为重试按钮添加点击事件
    const retryButton = document.getElementById('retryButton');
    if (retryButton) {
      retryButton.addEventListener('click', loadGameData);
    }
  }
  
  // 处理并渲染数据的函数
  function processAndRenderData(jsonData) {
    // 通过requestAnimationFrame优化UI更新，减少卡顿
    requestAnimationFrame(() => {
      try {
        // 处理游戏数据
        gamesData = processGameData(jsonData);
        
        // 更新UI
        filteredGames = [...gamesData];
        
        showContent(loadingIndicator, emptyState, gameGrid, pagination);
        renderGameGrid(gameGrid, filteredGames, currentPage, gamesPerPage);
        renderPagination(pageNumbers, currentPageNum, totalPagesNum, prevPageBtn, nextPageBtn, filteredGames, gamesPerPage, currentPage);
        
        console.log(`成功导入 ${gamesData.length} 个游戏条目`);
        
        // 缓存数据到本地存储
        try {
          localStorage.setItem('gameModifiersData', JSON.stringify(gamesData));
          localStorage.setItem('gameModifiersCacheTimestamp', Date.now().toString());
        } catch (e) {
          console.warn('无法缓存数据到本地存储:', e);
        }
      } catch (error) {
        console.error('数据处理或渲染错误:', error);
        handleLoadFailure(new Error('数据处理失败，请刷新页面重试'));
      }
    });
  }
}


// 处理游戏数据 - 优化性能版
function processGameData(jsonData) {
  // 清空现有数据
  const processedGames = [];
  
  // 使用更高效的方式处理游戏数据
  const len = jsonData.length;
  
  // 预定义正则表达式以避免重复创建
  const versionPattern = /(?:v?\d+\.\d+(?:\.\d+)?)/i;
  const antiCheatMarkerPattern = /\s*\(有反作弊文件\)\s*/;
  
  // 处理每个游戏条目 - 使用for循环而不是forEach以提高性能
  for (let index = 0; index < len; index++) {
    const item = jsonData[index];
    
    // 直接使用中文键名获取数据
    let gameName = item["游戏名字"] || '未知游戏';
    let imageUrl = item["图片地址"] || '';
    let downloadUrl = item["下载地址"] || '';
    let antiCheatUrl = item["反作弊文件下载"] || '';
    
    // 确保数据是字符串类型
    gameName = gameName.toString().trim();
    imageUrl = imageUrl.toString().trim();
    downloadUrl = downloadUrl.toString().trim();
    antiCheatUrl = antiCheatUrl.toString().trim();
    
    // 尝试从游戏名称中提取版本信息并移除
    const versionMatch = gameName.match(versionPattern);
    if (versionMatch) {
      gameName = gameName.replace(versionMatch[0], '').trim();
    }
    
    // 从游戏名称中移除"(有反作弊文件)"标记
    if (antiCheatMarkerPattern.test(gameName)) {
      gameName = gameName.replace(antiCheatMarkerPattern, '').trim();
    }
    
    // 自动分类
    const category = categorizeGame(gameName);
    
    // 使用对象字面量直接创建游戏对象
    processedGames.push({
      id: index + 1,
      name: gameName,
      imageUrl: imageUrl,
      downloadUrl: downloadUrl,
      antiCheatUrl: antiCheatUrl,
      category: category,
      // 使用更高效的方式生成随机图标索引
      iconIndex: index % 10 // 使用索引取模代替随机数生成
    });
  }
  
  // 统计各分类的游戏数量
  const categoryStats = {};
  for (let i = 0; i < processedGames.length; i++) {
    const game = processedGames[i];
    categoryStats[game.category] = (categoryStats[game.category] || 0) + 1;
  }
  
  // 只在控制台输出汇总信息，减少日志输出
  console.log(`总共导入 ${processedGames.length} 个游戏条目`);
  return processedGames;
}

// 处理搜索和分类 - 优化性能版
function handleSearch() {
  const searchTerm = searchInput.value.trim();
  
  // 快速路径：如果搜索词为空且分类为全部，直接显示所有游戏
  if (searchTerm === '' && currentCategory === 'all') {
    filteredGames = [...gamesData];
    currentPage = 1;
    
    renderGameGrid(gameGrid, filteredGames, currentPage, gamesPerPage);
    renderPagination(pageNumbers, currentPageNum, totalPagesNum, prevPageBtn, nextPageBtn, filteredGames, gamesPerPage, currentPage);
    showContent(loadingIndicator, emptyState, gameGrid, pagination);
    return;
  }
  
  // 首先进行分类筛选
  let filteredByCategory = gamesData;
  if (currentCategory !== 'all') {
    // 使用数组方法filter进行高效分类筛选
    filteredByCategory = gamesData.filter(game => game.category === currentCategory);
  }
  
  // 然后进行搜索筛选
  if (searchTerm === '') {
    filteredGames = filteredByCategory;
  } else {
    filteredGames = filterGamesBySearch(searchTerm, filteredByCategory);
  }
  
  currentPage = 1;
  
  // 批量渲染UI，减少DOM操作
  renderGameGrid(gameGrid, filteredGames, currentPage, gamesPerPage);
  renderPagination(pageNumbers, currentPageNum, totalPagesNum, prevPageBtn, nextPageBtn, filteredGames, gamesPerPage, currentPage);
  
  // 智能状态管理
  if (filteredGames.length === 0) {
    showEmptyState(loadingIndicator, gameGrid, pagination, emptyState);
  } else {
    showContent(loadingIndicator, emptyState, gameGrid, pagination);
  }
}

// 处理分类切换
function handleCategoryChange(category) {
  currentCategory = category;
  
  // 更新按钮样式
  if (categoryButtons) {
    categoryButtons.forEach(button => {
      if (button.dataset.category === category) {
        button.classList.add('bg-primary', 'text-white');
        button.classList.remove('bg-white', 'border', 'border-neutral-200', 'text-neutral-700', 'hover:border-primary', 'hover:text-primary');
      } else {
        button.classList.remove('bg-primary', 'text-white');
        button.classList.add('bg-white', 'border', 'border-neutral-200', 'text-neutral-700', 'hover:border-primary', 'hover:text-primary');
      }
    });
  }
  
  // 重新筛选游戏
  handleSearch();
}

// 初始化分类按钮
function initCategoryButtons() {
  const categoryContainer = document.getElementById('categoryButtons');
  if (!categoryContainer) {
    console.warn('分类按钮容器不存在');
    return;
  }
  
  categoryButtons = categoryContainer.querySelectorAll('button[data-category]');
  
  // 添加点击事件监听
  categoryButtons.forEach(button => {
    button.addEventListener('click', () => {
      const category = button.dataset.category;
      handleCategoryChange(category);
    });
  });
  
  // 设置默认选中的分类
  handleCategoryChange('all');
}

// 页面加载完成后初始化
window.addEventListener('DOMContentLoaded', () => {
  init();
  // 添加窗口大小变化的监听事件
  window.addEventListener('resize', debounce(() => {
    const newGamesPerPage = calculateGamesPerPage();
    if (newGamesPerPage !== gamesPerPage) {
      gamesPerPage = newGamesPerPage;
      currentPage = 1; // 重置为第一页
      renderGameGrid(gameGrid, filteredGames, currentPage, gamesPerPage);
      renderPagination(pageNumbers, currentPageNum, totalPagesNum, prevPageBtn, nextPageBtn, filteredGames, gamesPerPage, currentPage);
    }
  }, 300));
});