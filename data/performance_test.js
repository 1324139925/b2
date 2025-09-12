// 性能测试脚本 - 用于验证优化效果
console.log('=== 性能测试开始 ===');

// 读取原始数据
const fs = require('fs');
const path = require('path');

// 读取压缩后的JSON文件
const jsonData = JSON.parse(fs.readFileSync(path.join(__dirname, 'optimized', 'modifiers_data.min.json'), 'utf8'));

console.log(`数据量: ${jsonData.length} 个游戏条目`);

// 模拟浏览器环境的简单实现
function mockCalculateSimilarity(str1, str2) {
  // 原始的相似度计算函数 (基于编辑距离)
  if (!str1 || !str2) return 0;
  if (str1 === str2) return 1;
  
  const calculateEditDistance = (s1, s2) => {
    const m = s1.length;
    const n = s2.length;
    const dp = Array(m + 1).fill().map(() => Array(n + 1).fill(0));
    
    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;
    
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
        dp[i][j] = Math.min(
          dp[i - 1][j] + 1,
          dp[i][j - 1] + 1,
          dp[i - 1][j - 1] + cost
        );
      }
    }
    
    return dp[m][n];
  };
  
  const distance = calculateEditDistance(str1, str2);
  const maxLength = Math.max(str1.length, str2.length);
  let similarity = 1 - (distance / maxLength);
  
  if (maxLength <= 5) {
    similarity += (0.2 * (5 - maxLength) / 5);
    similarity = Math.min(1, similarity);
  }
  
  if (maxLength > 0) {
    const minLength = Math.min(str1.length, str2.length);
    const lengthRatio = minLength / maxLength;
    
    if (lengthRatio < 0.5) {
      const longerStr = str1.length > str2.length ? str1 : str2;
      const shorterStr = str1.length > str2.length ? str2 : str1;
      
      if (longerStr.includes(shorterStr)) {
        similarity += 0.1;
        similarity = Math.min(1, similarity);
      }
    }
  }
  
  return similarity;
}

// 优化后的相似度计算函数
const similarityCache = new Map();
function optimizedCalculateSimilarity(str1, str2) {
  if (!str1 || !str2) return 0;
  if (str1 === str2) return 1;
  
  const cacheKey = `${str1}|${str2}`;
  if (similarityCache.has(cacheKey)) {
    return similarityCache.get(cacheKey);
  }
  
  if (str1.includes(str2) || str2.includes(str1)) {
    const similarity = Math.min(str1.length, str2.length) / Math.max(str1.length, str2.length);
    similarityCache.set(cacheKey, similarity);
    return similarity;
  }
  
  const set1 = new Set(str1);
  const intersection = new Set([...str1].filter(char => set1.has(char)));
  const similarity = intersection.size / Math.max(str1.length, str2.length);
  
  similarityCache.set(cacheKey, similarity);
  return similarity;
}

// 模拟游戏特定分类映射
const gameSpecificCategories = {
  '赛博朋克': '动作冒险',
  'cyberpunk': '动作冒险',
  'gta': '动作冒险',
  'grand theft auto': '动作冒险',
  'minecraft': '沙盒游戏',
  '我的世界': '沙盒游戏',
  '文明': '策略战术',
  'civ': '策略战术',
  'pokemon': '角色扮演',
  '宝可梦': '角色扮演',
  'fifa': '体育游戏',
  'nba': '体育游戏',
  'cod': '射击游戏',
  'call of duty': '射击游戏',
  'cs:go': '射击游戏',
  'counter-strike': '射击游戏',
  'lol': '竞技游戏',
  'league of legends': '竞技游戏',
  'dota': '竞技游戏'
};

// 原始的分类函数
function originalCategorizeGame(gameName) {
  const lowerName = gameName.toLowerCase();
  
  for (const [gameKeyword, category] of Object.entries(gameSpecificCategories)) {
    if (lowerName.includes(gameKeyword.toLowerCase())) {
      return category;
    }
  }
  
  const actionKeywords = ['动作', 'act', 'adventure', '冒险', 'warrior', 'fighter'];
  const rpgKeywords = ['rpg', 'role', 'play', '角色扮演', 'rpg', 'rpg\\d'];
  const strategyKeywords = ['strategy', 'tactics', '策略', 'tactic', '战棋'];
  const shootingKeywords = ['射击', 'shoot', 'fps', 'tps'];
  const sportsKeywords = ['体育', 'sport', 'football', 'basketball', 'soccer', 'fifa', 'nba'];
  
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
  
  for (const keyword of shootingKeywords) {
    if (lowerName.includes(keyword)) {
      return '射击游戏';
    }
  }
  
  for (const keyword of sportsKeywords) {
    if (lowerName.includes(keyword)) {
      return '体育游戏';
    }
  }
  
  return '其他';
}

// 优化后的分类函数
function optimizedCategorizeGame(gameName) {
  if (!gameName || gameName.length < 2) {
    return '其他';
  }
  
  const lowerName = gameName.toLowerCase();
  
  for (const [gameKeyword, category] of Object.entries(gameSpecificCategories)) {
    if (lowerName.includes(gameKeyword.toLowerCase())) {
      return category;
    }
  }
  
  if (lowerName.includes('动作') || lowerName.includes('act') || lowerName.includes('adventure') || 
      lowerName.includes('冒险') || lowerName.includes('warrior') || lowerName.includes('fighter')) {
    return '动作冒险';
  }
  
  if (lowerName.includes('rpg') || lowerName.includes('role') || lowerName.includes('play') || 
      lowerName.includes('角色扮演')) {
    return '角色扮演';
  }
  
  if (lowerName.includes('策略') || lowerName.includes('strategy') || lowerName.includes('tactics') || 
      lowerName.includes('tactic') || lowerName.includes('战棋')) {
    return '策略战术';
  }
  
  if (lowerName.includes('射击') || lowerName.includes('shoot') || lowerName.includes('fps') || 
      lowerName.includes('tps')) {
    return '射击游戏';
  }
  
  if (gameName.length <= 4) {
    return '其他';
  }
  
  if (/\d/.test(lowerName) && lowerName.length > 8) {
    return '动作冒险';
  }
  
  return '其他';
}

// 原始的数据处理函数
function originalProcessGameData(data) {
  const startTime = performance.now();
  const processedGames = [];
  const len = data.length;
  const versionPattern = /(?:v?\d+\.\d+(?:\.\d+)?)/i;
  const antiCheatMarkerPattern = /\s*\(有反作弊文件\)\s*/;
  
  for (let index = 0; index < len; index++) {
    const item = data[index];
    let gameName = item["游戏名字"] || '未知游戏';
    let imageUrl = item["图片地址"] || '';
    let downloadUrl = item["下载地址"] || '';
    let antiCheatUrl = item["反作弊文件下载"] || '';
    
    gameName = gameName.toString().trim();
    imageUrl = imageUrl.toString().trim();
    downloadUrl = downloadUrl.toString().trim();
    antiCheatUrl = antiCheatUrl.toString().trim();
    
    const versionMatch = gameName.match(versionPattern);
    if (versionMatch) {
      gameName = gameName.replace(versionMatch[0], '').trim();
    }
    
    if (antiCheatMarkerPattern.test(gameName)) {
      gameName = gameName.replace(antiCheatMarkerPattern, '').trim();
    }
    
    const category = originalCategorizeGame(gameName);
    
    processedGames.push({
      id: index + 1,
      name: gameName,
      imageUrl: imageUrl,
      downloadUrl: downloadUrl,
      antiCheatUrl: antiCheatUrl,
      category: category,
      iconIndex: index % 10
    });
  }
  
  const endTime = performance.now();
  const time = (endTime - startTime).toFixed(2);
  console.log(`原始处理函数耗时: ${time}ms`);
  return { games: processedGames, time: time };
}

// 优化的数据处理函数
function optimizedProcessGameData(data) {
  const startTime = performance.now();
  const len = data.length;
  const processedGames = new Array(len); // 预分配空间
  const versionPattern = /(?:v?\d+\.\d+(?:\.\d+)?)/i;
  const antiCheatMarkerPattern = /\s*\(有反作弊文件\)\s*/;
  
  for (let index = 0; index < len; index++) {
    const item = data[index];
    let gameName = item["游戏名字"] || '未知游戏';
    let imageUrl = item["图片地址"] || '';
    let downloadUrl = item["下载地址"] || '';
    let antiCheatUrl = item["反作弊文件下载"] || '';
    
    gameName = gameName.toString().trim();
    
    if (gameName.length > 2) {
      const versionMatch = gameName.match(versionPattern);
      if (versionMatch) {
        gameName = gameName.replace(versionMatch[0], '').trim();
      }
      
      if (antiCheatMarkerPattern.test(gameName)) {
        gameName = gameName.replace(antiCheatMarkerPattern, '').trim();
      }
    }
    
    imageUrl = imageUrl.toString().trim();
    downloadUrl = downloadUrl.toString().trim();
    antiCheatUrl = antiCheatUrl.toString().trim();
    
    const category = optimizedCategorizeGame(gameName);
    
    processedGames[index] = {
      id: index + 1,
      name: gameName,
      imageUrl: imageUrl,
      downloadUrl: downloadUrl,
      antiCheatUrl: antiCheatUrl,
      category: category,
      iconIndex: index % 10
    };
  }
  
  const endTime = performance.now();
  const time = (endTime - startTime).toFixed(2);
  console.log(`优化处理函数耗时: ${time}ms`);
  return { games: processedGames, time: time };
}

// 运行多次以获得更准确的结果
console.log('\n--- 数据处理函数性能测试 ---');

// 预热
originalProcessGameData(jsonData.slice(0, 100));
optimizedProcessGameData(jsonData.slice(0, 100));

// 执行测试
const runs = 5;
let totalOriginalTime = 0;
let totalOptimizedTime = 0;

for (let i = 0; i < runs; i++) {
  console.log(`\n运行 ${i+1}/${runs}:`);
  
  const originalResult = originalProcessGameData(jsonData);
  totalOriginalTime += parseFloat(originalResult.time || 0);
  
  const optimizedResult = optimizedProcessGameData(jsonData);
  totalOptimizedTime += parseFloat(optimizedResult.time || 0);
}

// 计算平均值
const avgOriginalTime = totalOriginalTime / runs;
const avgOptimizedTime = totalOptimizedTime / runs;
const speedupFactor = avgOriginalTime / avgOptimizedTime;

console.log('\n=== 性能测试结果汇总 ===');
console.log(`原始处理函数平均耗时: ${avgOriginalTime.toFixed(2)}ms`);
console.log(`优化处理函数平均耗时: ${avgOptimizedTime.toFixed(2)}ms`);
console.log(`性能提升: ${(speedupFactor * 100 - 100).toFixed(1)}% (${speedupFactor.toFixed(2)}倍)`);

// 测试相似度计算函数
console.log('\n--- 相似度计算函数性能测试 ---');
const testStrings = [
  ['赛博朋克2077', '赛博朋克'],
  ['GTA5', 'Grand Theft Auto V'],
  ['我的世界', 'minecraft'],
  ['文明6', 'Civilization VI'],
  ['英雄联盟', 'League of Legends'],
  ['非常长的游戏名称测试用例', '很短']
];

console.log('原始相似度函数:');
const startMockTime = performance.now();
for (let i = 0; i < 1000; i++) {
  testStrings.forEach(pair => mockCalculateSimilarity(pair[0], pair[1]));
}
const endMockTime = performance.now();
console.log(`执行1000次耗时: ${(endMockTime - startMockTime).toFixed(2)}ms`);

console.log('\n优化相似度函数:');
const startOptTime = performance.now();
for (let i = 0; i < 1000; i++) {
  testStrings.forEach(pair => optimizedCalculateSimilarity(pair[0], pair[1]));
}
const endOptTime = performance.now();
console.log(`执行1000次耗时: ${(endOptTime - startOptTime).toFixed(2)}ms`);
const similaritySpeedup = (endMockTime - startMockTime) / (endOptTime - startOptTime);
console.log(`相似度计算性能提升: ${(similaritySpeedup * 100 - 100).toFixed(1)}% (${similaritySpeedup.toFixed(2)}倍)`);

console.log('\n=== 测试完成 ===');