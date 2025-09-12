// 搜索功能相关函数模块

// 搜索词预处理
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

// 计算字符串相似度 - 基础版（简单编辑距离的变种）
function calculateSimilarity(str1, str2) {
  // 如果有一个为空，直接返回0
  if (!str1 || !str2) return 0;
  
  // 完全匹配直接返回1
  if (str1 === str2) return 1;
  
  // 计算编辑距离
  const distance = calculateEditDistance(str1, str2);
  
  // 计算相似度（基于长度的归一化）
  const maxLength = Math.max(str1.length, str2.length);
  
  // 对于短字符串，增强相似度计算（增强短字符串匹配的敏感度）
  let similarity = 1 - (distance / maxLength);
  
  // 短字符串加分机制
  if (maxLength <= 5) {
    similarity += (0.2 * (5 - maxLength) / 5);
    similarity = Math.min(1, similarity); // 确保不超过1
  }
  
  // 长度差异处理 - 如果一个字符串包含另一个，相似度更高
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

// 计算编辑距离（Levenshtein距离）
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

// 键盘相邻字符容错（键盘布局容错）
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
    'o': ['i', 'p', 'l', 'k'],
    'p': ['o', 'l'],
    'a': ['q', 'w', 's', 'z', 'x'],
    's': ['q', 'w', 'e', 'd', 'x', 'z', 'a'],
    'd': ['w', 'e', 'r', 'f', 'c', 'x', 's'],
    'f': ['e', 'r', 't', 'g', 'v', 'c', 'd'],
    'g': ['r', 't', 'y', 'h', 'b', 'v', 'f'],
    'h': ['t', 'y', 'u', 'j', 'n', 'b', 'g'],
    'j': ['y', 'u', 'i', 'k', 'm', 'n', 'h'],
    'k': ['u', 'i', 'o', 'l', 'm', 'j'],
    'l': ['i', 'o', 'p', 'k'],
    'z': ['a', 's', 'x'],
    'x': ['z', 'a', 's', 'd', 'c'],
    'c': ['x', 's', 'd', 'f', 'v'],
    'v': ['c', 'd', 'f', 'g', 'b'],
    'b': ['v', 'f', 'g', 'h', 'n'],
    'n': ['b', 'g', 'h', 'j', 'm'],
    'm': ['n', 'h', 'j', 'k']
  };
  
  return keyboardLayout[char1] && keyboardLayout[char1].includes(char2);
}

// 分词搜索匹配函数
function tokenBasedSearch(searchTerm, gameName) {
  // 将搜索词和游戏名分词
  const searchTokens = searchTerm.split(/\s+/);
  const gameTokens = gameName.split(/\s+/);
  
  // 计算匹配的词数
  let matchCount = 0;
  
  searchTokens.forEach(token => {
    if (gameTokens.some(gameToken => gameToken.includes(token))) {
      matchCount++;
    }
  });
  
  // 返回匹配比例
  return matchCount / searchTokens.length;
}

// 搜索过滤函数
function filterGamesBySearch(searchTerm, gamesData) {
  // 预处理搜索词
  const processedSearchTerm = preprocessSearchTerm(searchTerm);
  
  // 如果搜索词为空，返回所有游戏
  if (!processedSearchTerm) {
    return [...gamesData];
  }
  
  // 分词处理搜索词
  const searchWords = processedSearchTerm.split(/\s+/).filter(word => word.length > 0);
  
  // 根据多策略过滤游戏
  const filteredGames = gamesData.filter(game => {
    const gameName = preprocessSearchTerm(game.name.toLowerCase());
    
    // 策略1: 完全匹配
    if (gameName === processedSearchTerm) {
      return true;
    }
    
    // 策略2: 包含关系检查 - 所有搜索词都包含在游戏名中
    if (searchWords.every(word => gameName.includes(word))) {
      return true;
    }
    
    // 策略3: 分词匹配
    const tokenMatch = tokenBasedSearch(processedSearchTerm, gameName);
    if (tokenMatch >= 0.5) {
      return true;
    }
    
    // 策略4: 模糊相似度匹配
    const similarity = calculateSimilarity(processedSearchTerm, gameName);
    if (similarity >= 0.6) {
      return true;
    }
    
    // 策略5: 最长公共子序列匹配
    const lcsLength = longestCommonSubsequence(processedSearchTerm, gameName);
    const lcsRatio = lcsLength / Math.min(processedSearchTerm.length, gameName.length);
    
    // 如果最长公共子序列比例较高，认为是匹配
    if (lcsRatio > 0.6) {
      return true;
    }
    
    return false;
  });
  
  // 对结果按相关性排序
  filteredGames.sort((a, b) => {
    const aName = preprocessSearchTerm(a.name.toLowerCase());
    const bName = preprocessSearchTerm(b.name.toLowerCase());
    
    // 完全匹配优先
    if (aName === processedSearchTerm) return -1;
    if (bName === processedSearchTerm) return 1;
    
    // 包含关系优先 - 所有搜索词都包含在游戏名中的优先
    const aContainsAll = searchWords.every(word => aName.includes(word));
    const bContainsAll = searchWords.every(word => bName.includes(word));
    if (aContainsAll && !bContainsAll) return -1;
    if (!aContainsAll && bContainsAll) return 1;
    
    // 分词匹配度优先
    const aTokenMatch = tokenBasedSearch(processedSearchTerm, aName);
    const bTokenMatch = tokenBasedSearch(processedSearchTerm, bName);
    if (aTokenMatch !== bTokenMatch) {
      return bTokenMatch - aTokenMatch;
    }
    
    // 相似度优先
    const aSimilarity = calculateSimilarity(processedSearchTerm, aName);
    const bSimilarity = calculateSimilarity(processedSearchTerm, bName);
    if (aSimilarity !== bSimilarity) {
      return bSimilarity - aSimilarity;
    }
    
    // 额外的排序因子：长度差异
    const aLenDiff = Math.abs(aName.length - processedSearchTerm.length);
    const bLenDiff = Math.abs(bName.length - processedSearchTerm.length);
    if (aLenDiff !== bLenDiff) {
      return aLenDiff - bLenDiff;
    }
    
    // 最后按游戏名称字母顺序排序
    return aName.localeCompare(bName);
  });
  
  return filteredGames;
}

// 计算最长公共子序列长度 - 用于增强的多字少字处理
function longestCommonSubsequence(str1, str2) {
  const m = str1.length;
  const n = str2.length;
  
  // 创建DP表
  const dp = Array(m + 1).fill().map(() => Array(n + 1).fill(0));
  
  // 填充DP表
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }
  
  return dp[m][n];
}

// 防抖函数 - 增强版支持立即执行
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

// 在普通脚本模式下，不需要导出语句
// 所有函数将自动成为全局作用域的一部分