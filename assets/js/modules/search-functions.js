// 搜索功能相关函数模块

// 简化的汉字转拼音映射表（常用汉字）
const CHINESE_TO_PINYIN = {
  // 常用姓氏
  '张': 'zhang', '王': 'wang', '李': 'li', '赵': 'zhao', '刘': 'liu', '陈': 'chen',
  '杨': 'yang', '黄': 'huang', '周': 'zhou', '吴': 'wu', '徐': 'xu', '孙': 'sun',
  // 常用汉字
  '一': 'yi', '二': 'er', '三': 'san', '四': 'si', '五': 'wu', '六': 'liu', '七': 'qi', '八': 'ba', '九': 'jiu', '十': 'shi',
  '百': 'bai', '千': 'qian', '万': 'wan', '亿': 'yi',
  // 游戏相关词汇
  '游': 'you', '戏': 'xi', '游戏': 'youxi',
  '模': 'mo', '改': 'gai', '修改': 'xiugai', '修改器': 'xiugaiqi',
  '版': 'ban', '本': 'ben', '版本': 'banben',
  '大': 'da', '小': 'xiao', '中': 'zhong',
  '上': 'shang', '下': 'xia', '左': 'zuo', '右': 'you',
  '金': 'jin', '钱': 'qian', '币': 'bi',
  '无': 'wu', '限': 'xian', '无限': 'wuxian',
  '全': 'quan', '部': 'bu', '全部': 'quanbu',
  '功': 'gong', '能': 'neng', '功能': 'gongneng',
  '最': 'zui', '新': 'xin', '最新': 'zuixin',
  '免': 'mian', '费': 'fei', '免费': 'mianfei',
  '单': 'dan', '机': 'ji', '单机': 'danji',
  '在': 'zai', '线': 'xian', '在线': 'zaixian',
  '网': 'wang', '络': 'luo', '网络': 'wangluo',
  '多': 'duo', '人': 'ren', '多人': 'duoren',
  '角': 'jiao', '色': 'se', '角色': 'juese',
  '任': 'ren', '务': 'wu', '任务': 'renwu',
  '通': 'tong', '关': 'guan', '通关': 'tongguan',
  '难': 'nan', '度': 'du', '难度': 'nandu',
  '简': 'jian', '单': 'dan', '简单': 'jiandan',
  '困': 'kun', '难': 'nan', '困难': 'kunnan',
  '挑': 'tiao', '战': 'zhan', '挑战': 'tiaozhan',
  '模': 'mo', '式': 'shi', '模式': 'moshi',
  '地': 'di', '图': 'tu', '地图': 'ditu',
  '装': 'zhuang', '备': 'bei', '装备': 'zhuangbei',
  '武': 'wu', '器': 'qi', '武器': 'wuqi',
  '技': 'ji', '能': 'neng', '技能': 'jineng',
  '属': 'shu', '性': 'xing', '属性': 'shuxing',
  '经': 'jing', '验': 'yan', '经验': 'jingyan',
  '等': 'deng', '级': 'ji', '等级': 'dengji',
  '升': 'sheng', '级': 'ji', '升级': 'shengji',
  '资': 'zi', '源': 'yuan', '资源': 'ziyuan',
  '保': 'bao', '存': 'cun', '保存': 'baocun',
  '读': 'du', '取': 'qu', '读取': 'duqu',
  '存': 'cun', '档': 'dang', '存档': 'cundang',
  '读': 'du', '档': 'dang', '读档': 'dudang',
  '开': 'kai', '始': 'shi', '开始': 'kaishi',
  '结': 'jie', '束': 'shu', '结束': 'jieshu',
  '暂': 'zan', '停': 'ting', '暂停': 'zanting',
  '继': 'ji', '续': 'xu', '继续': 'jixu',
  '退': 'tui', '出': 'chu', '退出': 'tuichu',
  '设': 'she', '置': 'zhi', '设置': 'shezhi',
  '选': 'xuan', '项': 'xiang', '选项': 'xuanxiang',
  '帮': 'bang', '助': 'zhu', '帮助': 'bangzhu',
  '关': 'guan', '于': 'yu', '关于': 'guanyu',
  '信': 'xin', '息': 'xi', '信息': 'xinxi',
  '说': 'shuo', '明': 'ming', '说明': 'shuoming',
  '指': 'zhi', '南': 'nan', '指南': 'zhinan',
  '攻': 'gong', '略': 'lve', '攻略': 'gonglve',
  '秘': 'mi', '籍': 'ji', '秘籍': 'miji',
  '窍': 'qiao', '门': 'men', '窍门': 'qiaomen',
  '技': 'ji', '巧': 'qiao', '技巧': 'jiqiao',
  '玩': 'wan', '法': 'fa', '玩法': 'wanfa',
  '体': 'ti', '验': 'yan', '体验': 'tiyan',
  '乐': 'le', '趣': 'qu', '乐趣': 'lequ',
  '娱': 'yu', '乐': 'le', '娱乐': 'yule',
  '刺': 'ci', '激': 'ji', '刺激': 'ciji',
  '兴': 'xing', '奋': 'fen', '兴奋': 'xingfen',
  '紧': 'jin', '张': 'zhang', '紧张': 'jinzhang',
  '惊': 'jing', '险': 'xian', '惊险': 'jingxian',
  '爽': 'shuang', '快': 'kuai', '爽快': 'shuangkuai',
  '舒': 'shu', '适': 'shi', '舒适': 'shushi',
  '流': 'liu', '畅': 'chang', '流畅': 'liuchang',
  '稳': 'wen', '定': 'ding', '稳定': 'wending',
  '画': 'hua', '面': 'mian', '画面': 'huamian',
  '声': 'sheng', '音': 'yin', '声音': 'shengyin',
  '音': 'yin', '乐': 'yue', '音乐': 'yinle',
  '操': 'cao', '作': 'zuo', '操作': 'caozuo',
  '控': 'kong', '制': 'zhi', '控制': 'kongzhi',
  '简': 'jian', '洁': 'jie', '简洁': 'jianjie',
  '方': 'fang', '便': 'bian', '方便': 'fangbian',
  '实': 'shi', '用': 'yong', '实用': 'shiyong',
  '有': 'you', '趣': 'qu', '有趣': 'youqu',
  '精': 'jing', '彩': 'cai', '精彩': 'jingcai',
  '独': 'du', '特': 'te', '独特': 'dute',
  '创': 'chuang', '新': 'xin', '创新': 'chuangxin',
  '经': 'jing', '典': 'dian', '经典': 'jingdian',
  '传': 'chuan', '奇': 'qi', '传奇': 'chuanqi',
  '神': 'shen', '奇': 'qi', '神奇': 'shenqi',
  '壮': 'zhuang', '观': 'guan', '壮观': 'zhuangguan',
  '美': 'mei', '丽': 'li', '美丽': 'meili',
  '可': 'ke', '爱': 'ai', '可爱': 'keai',
  '酷': 'ku', '炫': 'xuan', '酷炫': 'kuxuan',
  '时': 'shi', '尚': 'shang', '时尚': 'shishang',
  '现': 'xian', '代': 'dai', '现代': 'xiandai',
  '未': 'wei', '来': 'lai', '未来': 'weilai',
  '科': 'ke', '技': 'ji', '科技': 'keji',
  '神': 'shen', '秘': 'mi', '神秘': 'shenmi',
  '恐': 'kong', '怖': 'bu', '恐怖': 'kongbu',
  '惊': 'jing', '悚': 'song', '惊悚': 'jingsong',
  '浪': 'lang', '漫': 'man', '浪漫': 'langman',
  '喜': 'xi', '欢': 'huan', '喜欢': 'xihuan',
  '爱': 'ai', '好': 'hao', '爱好': 'aihao',
  '迷': 'mi', '恋': 'lian', '迷恋': 'milian',
  '热': 're', '爱': 'ai', '热爱': 'reai',
  '玩': 'wan', '家': 'jia', '玩家': 'wanjia',
  '粉': 'fen', '丝': 'si', '粉丝': 'fensi',
  '追': 'zhui', '随': 'sui', '追随': 'zhuisui',
  '支': 'zhi', '持': 'chi', '支持': 'zhichi',
  '祝': 'zhu', '愿': 'yuan', '祝愿': 'zhuyuan',
  '希': 'xi', '望': 'wang', '希望': 'xiwang',
  '梦': 'meng', '想': 'xiang', '梦想': 'mengxiang',
  '目': 'mu', '标': 'biao', '目标': 'mubiao',
  '计': 'ji', '划': 'hua', '计划': 'jihua',
  '努': 'nu', '力': 'li', '努力': 'nuli',
  '坚': 'jian', '持': 'chi', '坚持': 'jianchi',
  '成': 'cheng', '功': 'gong', '成功': 'chenggong',
  '失': 'shi', '败': 'bai', '失败': 'shibai',
  '胜': 'sheng', '利': 'li', '胜利': 'shengli',
  '挑': 'tiao', '战': 'zhan', '挑战': 'tiaozhan',
  '机': 'ji', '会': 'hui', '机会': 'jihui',
  '幸': 'xing', '运': 'yun', '幸运': 'xingyun',
  '祝': 'zhu', '贺': 'he', '祝贺': 'zhuhe',
  '感': 'gan', '谢': 'xie', '感谢': 'ganxie',
  '理': 'li', '解': 'jie', '理解': 'lijie',
  '宽': 'kuan', '容': 'rong', '宽容': 'kuanrong',
  '友': 'you', '好': 'hao', '友好': 'youhao',
  '和': 'he', '平': 'ping', '和平': 'heping',
  '团': 'tuan', '结': 'jie', '团结': 'tuanjie',
  '合': 'he', '作': 'zuo', '合作': 'hezuo',
  '帮': 'bang', '助': 'zhu', '帮助': 'bangzhu',
  '关': 'guan', '心': 'xin', '关心': 'guanxin',
  '照': 'zhao', '顾': 'gu', '照顾': 'zhaogu',
  '爱': 'ai', '护': 'hu', '爱护': 'aihu',
  '尊': 'zun', '重': 'zhong', '尊重': 'zunzhong',
  '信': 'xin', '任': 'ren', '信任': 'xinren',
  '诚': 'cheng', '实': 'shi', '诚实': 'chengshi',
  '真': 'zhen', '诚': 'cheng', '真诚': 'zhencheng',
  '正': 'zheng', '直': 'zhi', '正直': 'zhengzhi',
  '勇': 'yong', '敢': 'gan', '勇敢': 'yonggan',
  '坚': 'jian', '强': 'qiang', '坚强': 'jianqiang',
  '智': 'zhi', '慧': 'hui', '智慧': 'zhihui',
  '聪': 'cong', '明': 'ming', '聪明': 'congming',
  '能': 'neng', '干': 'gan', '能干': 'nenggan',
  '勤': 'qin', '劳': 'lao', '勤劳': 'qinlao',
  '刻': 'ke', '苦': 'ku', '刻苦': 'kuku',
  '认': 'ren', '真': 'zhen', '认真': 'renzhen',
  '负': 'fu', '责': 'ze', '负责': 'fuze',
  '热': 're', '情': 'qing', '热情': 'reqing',
  '友': 'you', '情': 'qing', '友情': 'youqing',
  '爱': 'ai', '情': 'qing', '爱情': 'aiqing',
  '亲': 'qin', '情': 'qing', '亲情': 'qinqing',
  '快': 'kuai', '乐': 'le', '快乐': 'kuaile',
  '幸': 'xing', '福': 'fu', '幸福': 'xingfu',
  '健': 'jian', '康': 'kang', '健康': 'jiankang',
  '安': 'an', '全': 'quan', '安全': 'anquan',
  '平': 'ping', '安': 'an', '平安': 'pingan',
  '顺': 'shun', '利': 'li', '顺利': 'shunli',
  '吉': 'ji', '祥': 'xiang', '吉祥': 'jixiang',
  '如': 'ru', '意': 'yi', '如意': 'ruyi',
  '美': 'mei', '满': 'man', '美满': 'meiman',
  '圆': 'yuan', '满': 'man', '圆满': 'yuanman',
  '完': 'wan', '美': 'mei', '完美': 'wanmei'
};

// 汉字转拼音函数（简化版）
function convertToPinyin(text) {
  if (!text || typeof text !== 'string') {
    return '';
  }
  
  let pinyin = '';
  let i = 0;
  
  while (i < text.length) {
    // 尝试匹配双字词语
    if (i + 1 < text.length) {
      const twoChars = text.substring(i, i + 2);
      if (CHINESE_TO_PINYIN[twoChars]) {
        pinyin += CHINESE_TO_PINYIN[twoChars] + ' ';
        i += 2;
        continue;
      }
    }
    
    // 匹配单字
    const char = text[i];
    if (CHINESE_TO_PINYIN[char]) {
      pinyin += CHINESE_TO_PINYIN[char] + ' ';
    } else {
      // 保留非汉字字符
      pinyin += char;
    }
    i++;
  }
  
  // 清理多余空格
  return pinyin.trim();
}

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

// 搜索过滤函数 - 优化版本：提高匹配精度，减少不相关结果
function filterGamesBySearch(searchTerm, gamesData) {
  // 预处理搜索词
  const processedSearchTerm = preprocessSearchTerm(searchTerm);
  
  // 如果搜索词为空，返回所有游戏
  if (!processedSearchTerm) {
    return [...gamesData];
  }
  
  // 分词处理搜索词
  const searchWords = processedSearchTerm.split(/\s+/).filter(word => word.length > 0);
  
  // 生成搜索词的拼音版本
  const pinyinSearchTerm = convertToPinyin(processedSearchTerm);
  const pinyinSearchWords = pinyinSearchTerm.split(/\s+/).filter(word => word.length > 0);
  
  // 搜索结果和相关性评分
  const scoredGames = [];
  
  // 计算每个游戏的相关性评分
  gamesData.forEach(game => {
    const gameName = preprocessSearchTerm(game.name.toLowerCase());
    
    // 生成游戏名称的拼音版本
    const gameNamePinyin = convertToPinyin(gameName);
    
    // 初始化相关性分数
    let relevanceScore = 0;
    
    // 策略1: 完全匹配 - 最高优先级
    if (gameName === processedSearchTerm) {
      relevanceScore = 100;
    }
    // 策略2: 包含关系检查 - 所有搜索词都包含在游戏名中
    else if (searchWords.every(word => gameName.includes(word))) {
      relevanceScore = 90;
    }
    // 策略3: 拼音完全匹配
    else if (gameNamePinyin.includes(pinyinSearchTerm) && 
             pinyinSearchTerm.length > 1) { // 至少两个字符才考虑拼音包含
      relevanceScore = 85;
    }
    // 策略4: 拼音包含关系检查 - 搜索词的拼音包含在游戏名的拼音中
    else if (pinyinSearchWords.every(word => gameNamePinyin.includes(word))) {
      relevanceScore = 80;
    }
    // 策略5: 首字母匹配（例如：wzry匹配王者荣耀）
    else if (searchWords.length === 1 && 
             processedSearchTerm.length > 1 && 
             processedSearchTerm.length < 6) {
      const firstLetters = extractFirstLetters(gameName);
      // 精确匹配首字母，而不是包含关系
      if (firstLetters === processedSearchTerm) {
        relevanceScore = 75;
      } else if (firstLetters.startsWith(processedSearchTerm)) {
        relevanceScore = 70;
      }
    }
    // 策略6: 分词匹配 - 提高阈值到0.8
    else {
      const tokenMatch = tokenBasedSearch(processedSearchTerm, gameName);
      const pinyinTokenMatch = tokenBasedSearch(pinyinSearchTerm, gameNamePinyin);
      const maxTokenMatch = Math.max(tokenMatch, pinyinTokenMatch);
      
      // 策略7: 模糊相似度匹配 - 提高阈值到0.75
      const similarity = calculateSimilarity(processedSearchTerm, gameName);
      const pinyinSimilarity = calculateSimilarity(pinyinSearchTerm, gameNamePinyin);
      const maxSimilarity = Math.max(similarity, pinyinSimilarity);
      
      // 策略8: 最长公共子序列匹配 - 提高阈值到0.75
      const lcsLength = longestCommonSubsequence(processedSearchTerm, gameName);
      const lcsRatio = lcsLength / Math.min(processedSearchTerm.length, gameName.length);
      
      // 综合评分：只考虑较高的匹配度，忽略低匹配度
      if (maxTokenMatch >= 0.8) {
        relevanceScore = 60 + (maxTokenMatch - 0.8) * 40;
      } else if (maxSimilarity >= 0.75) {
        relevanceScore = 50 + (maxSimilarity - 0.75) * 50;
      } else if (lcsRatio > 0.75 && processedSearchTerm.length > 2) {
        // 对于较长的搜索词，LCS才有意义
        relevanceScore = 40 + (lcsRatio - 0.75) * 40;
      }
    }
    
    // 只有相关性足够高的游戏才加入结果列表
    if (relevanceScore >= 40) {
      scoredGames.push({
        game,
        score: relevanceScore
      });
    }
  });
  
  // 按相关性分数排序
  scoredGames.sort((a, b) => {
    // 优先按相关性分数排序
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    
    // 分数相同时，按游戏名称字母顺序排序
    const aName = preprocessSearchTerm(a.game.name.toLowerCase());
    const bName = preprocessSearchTerm(b.game.name.toLowerCase());
    return aName.localeCompare(bName);
  });
  
  // 提取排序后的游戏
  const filteredGames = scoredGames.map(item => item.game);
  
  return filteredGames;
}

// 提取汉字的首字母函数
function extractFirstLetters(text) {
  if (!text || typeof text !== 'string') {
    return '';
  }
  
  let firstLetters = '';
  
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    
    // 尝试匹配双字词语
    if (i + 1 < text.length) {
      const twoChars = text.substring(i, i + 2);
      if (CHINESE_TO_PINYIN[twoChars]) {
        firstLetters += CHINESE_TO_PINYIN[twoChars][0];
        i += 1;
        continue;
      }
    }
    
    // 匹配单字
    if (CHINESE_TO_PINYIN[char]) {
      firstLetters += CHINESE_TO_PINYIN[char][0];
    } else {
      // 保留非汉字字符的首字母（如果是字母）或者整个字符
      firstLetters += /^[a-zA-Z]$/.test(char) ? char : char;
    }
  }
  
  return firstLetters.toLowerCase();
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