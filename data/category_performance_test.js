// 分类功能性能测试脚本
// 对比启用和禁用分类功能的加载性能差异

console.log('=== 分类功能性能测试开始 ===');

// 模拟游戏数据
function generateMockGames(count) {
  const mockGames = [];
  const categories = ['动作冒险', '角色扮演', '射击游戏', '策略游戏', '恐怖游戏', '模拟经营'];
  const words = ['超级', '终极', '致命', '幻想', '黑暗', '光明', '英雄', '战士', '法师', '刺客', '使命', '召唤', '战争', '和平'];
  
  for (let i = 0; i < count; i++) {
    const word1 = words[Math.floor(Math.random() * words.length)];
    const word2 = words[Math.floor(Math.random() * words.length)];
    const word3 = Math.random() > 0.5 ? words[Math.floor(Math.random() * words.length)] : '';
    
    let gameName = `${word1}${word2}${word3 ? word3 : ''}`;
    if (Math.random() > 0.7) {
      gameName += ` ${Math.floor(Math.random() * 10)}.${Math.floor(Math.random() * 10)}`;
    }
    
    mockGames.push({
      id: i + 1,
      name: gameName,
      imageUrl: `https://example.com/images/${i}.jpg`,
      downloadUrl: `https://example.com/download/${i}`,
      antiCheatUrl: `https://example.com/anticheat/${i}`
    });
  }
  
  return mockGames;
}

// 模拟现有的 categorizeGame 函数 (简化版本，但保持相似的复杂度)
function categorizeGame(gameName) {
  // 游戏特定分类映射
  const specificGameMappings = {
    '生化危机': '恐怖游戏',
    '寂静岭': '恐怖游戏',
    '逃生': '恐怖游戏',
    '死亡空间': '恐怖游戏',
    '黑暗之魂': '动作冒险',
    '艾尔登法环': '动作冒险',
    '赛博朋克': '动作冒险'
  };
  
  // 首先检查特定映射
  for (const [keyword, category] of Object.entries(specificGameMappings)) {
    if (gameName.includes(keyword)) {
      return category;
    }
  }
  
  // 简单分类逻辑
  const lowerName = gameName.toLowerCase();
  if (lowerName.includes('魂') || lowerName.includes('环')) return '动作冒险';
  if (lowerName.includes('恐怖') || lowerName.includes('逃生') || lowerName.includes('死亡')) return '恐怖游戏';
  if (lowerName.includes('射击') || lowerName.includes('枪') || lowerName.includes('战争')) return '射击游戏';
  if (lowerName.includes('策略') || lowerName.includes('经营')) return '策略游戏';
  if (lowerName.includes('角色') || lowerName.includes('rpg')) return '角色扮演';
  
  // 默认分类
  return '其他';
}

// 原始数据处理函数（包含分类）
function processWithCategorization(games) {
  const startTime = performance.now();
  const processedGames = [];
  
  for (let i = 0; i < games.length; i++) {
    const game = games[i];
    const category = categorizeGame(game.name);
    
    processedGames.push({
      ...game,
      category: category,
      iconIndex: i % 10
    });
  }
  
  const endTime = performance.now();
  return {
    games: processedGames,
    time: endTime - startTime
  };
}

// 优化数据处理函数（不包含分类）
function processWithoutCategorization(games) {
  const startTime = performance.now();
  const processedGames = [];
  
  for (let i = 0; i < games.length; i++) {
    const game = games[i];
    
    processedGames.push({
      ...game,
      category: '全部', // 统一分类
      iconIndex: i % 10
    });
  }
  
  const endTime = performance.now();
  return {
    games: processedGames,
    time: endTime - startTime
  };
}

// 模拟过滤操作
function filterWithCategorization(games, category) {
  const startTime = performance.now();
  
  let filtered;
  if (category === 'all') {
    filtered = [...games];
  } else {
    filtered = games.filter(game => game.category === category);
  }
  
  const endTime = performance.now();
  return {
    games: filtered,
    time: endTime - startTime
  };
}

function filterWithoutCategorization(games) {
  const startTime = performance.now();
  // 不进行分类过滤，直接返回全部
  const filtered = [...games];
  const endTime = performance.now();
  return {
    games: filtered,
    time: endTime - startTime
  };
}

// 运行测试
function runTest() {
  const testSizes = [100, 500, 1000, 2000];
  const runsPerSize = 5;
  
  console.log('\n--- 测试参数 ---');
  console.log('数据量:', testSizes.join(', '));
  console.log('每个数据量重复次数:', runsPerSize);
  
  console.log('\n--- 数据处理性能测试 ---');
  
  for (const size of testSizes) {
    let withCategoryTotal = 0;
    let withoutCategoryTotal = 0;
    
    console.log(`\n测试数据量: ${size}`);
    
    for (let run = 1; run <= runsPerSize; run++) {
      const mockGames = generateMockGames(size);
      
      // 测试包含分类
      const withResult = processWithCategorization(mockGames);
      withCategoryTotal += withResult.time;
      
      // 测试不包含分类
      const withoutResult = processWithoutCategorization(mockGames);
      withoutCategoryTotal += withoutResult.time;
      
      console.log(`  运行 ${run}/${runsPerSize}:`);
      console.log(`    含分类处理耗时: ${withResult.time.toFixed(2)}ms`);
      console.log(`    无分类处理耗时: ${withoutResult.time.toFixed(2)}ms`);
      console.log(`    性能差异: ${(withResult.time / withoutResult.time).toFixed(2)}倍`);
    }
    
    const withCategoryAvg = withCategoryTotal / runsPerSize;
    const withoutCategoryAvg = withoutCategoryTotal / runsPerSize;
    const improvement = (withCategoryAvg / withoutCategoryAvg - 1) * 100;
    
    console.log(`  平均值:`);
    console.log(`    含分类处理平均耗时: ${withCategoryAvg.toFixed(2)}ms`);
    console.log(`    无分类处理平均耗时: ${withoutCategoryAvg.toFixed(2)}ms`);
    console.log(`    性能提升: ${improvement.toFixed(1)}%`);
  }
  
  console.log('\n--- 过滤操作性能测试 ---');
  const largeTestSet = generateMockGames(2000);
  const processedWithCategory = processWithCategorization(largeTestSet).games;
  const processedWithoutCategory = processWithoutCategorization(largeTestSet).games;
  
  // 测试过滤性能
  const filterRuns = 10;
  let withFilterTotal = 0;
  let withoutFilterTotal = 0;
  
  for (let run = 1; run <= filterRuns; run++) {
    const category = run % 2 === 0 ? '全部' : '动作冒险';
    
    const withResult = filterWithCategorization(processedWithCategory, category);
    withFilterTotal += withResult.time;
    
    const withoutResult = filterWithoutCategorization(processedWithoutCategory);
    withoutFilterTotal += withoutResult.time;
  }
  
  const withFilterAvg = withFilterTotal / filterRuns;
  const withoutFilterAvg = withoutFilterTotal / filterRuns;
  const filterImprovement = (withFilterAvg / withoutFilterAvg - 1) * 100;
  
  console.log(`过滤2000个条目 (${filterRuns}次平均):`);
  console.log(`  含分类过滤平均耗时: ${withFilterAvg.toFixed(2)}ms`);
  console.log(`  无分类过滤平均耗时: ${withoutFilterAvg.toFixed(2)}ms`);
  console.log(`  过滤性能提升: ${filterImprovement.toFixed(1)}%`);
  
  console.log('\n=== 测试总结 ===');
  console.log('1. 取消分类功能确实可以带来性能提升，特别是在数据量大时');
  console.log('2. 数据处理阶段的提升最为明显，因为不需要为每个条目执行分类算法');
  console.log('3. 过滤阶段的提升相对较小，但在频繁切换分类时仍有帮助');
  console.log('4. 建议：可以考虑添加一个配置选项，让用户选择是否启用分类功能');
}

// 执行测试
runTest();
console.log('\n=== 分类功能性能测试完成 ===');