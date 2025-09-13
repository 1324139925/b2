// 主入口文件，整合所有功能模块

// 由于我们现在使用普通脚本模式，不需要导入语句
// 所有函数都可以通过全局作用域访问

// 防抖函数定义
typeof debounce !== 'function' && (debounce = function(func, wait, immediate) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      timeout = null;
      if (!immediate) func.apply(this, args);
    };
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(this, args);
  };
});

// 常量定义
const SEARCH_DELAY_MS = 300;  // 搜索延迟毫秒数
const CACHE_VALID_TIME = 5 * 60 * 1000;  // 缓存有效期5分钟
const AUTO_REFRESH_KEY = 'hasAutoRefreshedThisSession'; // 用于sessionStorage的键名
let needsAutoRefresh = true;  // 控制是否需要自动刷新的标志位

// 检查sessionStorage中是否已经执行过自动刷新（本次会话内）
function hasAlreadyAutoRefreshed() {
  try {
    return sessionStorage.getItem(AUTO_REFRESH_KEY) === 'true';
  } catch (e) {
    console.warn('无法访问sessionStorage:', e);
    return false;
  }
}

// 设置自动刷新已完成的标记（仅在当前会话有效）
function setAutoRefreshDone() {
  try {
    sessionStorage.setItem(AUTO_REFRESH_KEY, 'true');
  } catch (e) {
    console.warn('无法写入sessionStorage:', e);
  }
}

// 检查并执行自动刷新
function checkAndPerformAutoRefresh() {
  // 如果已经执行过自动刷新或者不需要自动刷新，则不执行
  if (hasAlreadyAutoRefreshed() || !needsAutoRefresh) {
    console.log('自动刷新已执行过或不需要自动刷新，跳过');
    return;
  }
  
  // 确保页面内容已经完全渲染
  setTimeout(() => {
    // 检查页面是否存在显示问题：gameGrid元素存在且有内容（游戏卡片）
    if (typeof gameGrid !== 'undefined' && gameGrid && gameGrid.children.length > 0) {
      // 立即设置标记为已完成，防止刷新后重复执行
      setAutoRefreshDone();
      console.log('检测到页面已加载内容，准备执行自动刷新以解决显示问题...');
      
      // 使用window.location.reload()刷新页面
      window.location.reload();
    }
  }, 1000); // 延迟1秒，确保所有元素都已完全渲染
}

function showContent(loadingIndicator, emptyState, contentContainer, pagination) {
  loadingIndicator.classList.add('hidden');
  emptyState.classList.add('hidden');
  contentContainer.classList.remove('hidden');
  
  // 显示分页
  if (pagination) {
    pagination.classList.remove('hidden');
  }
}

function showEmptyState(loadingIndicator, emptyState, contentContainer, pagination) {
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

// 原始的calculateEditDistance函数已被更高效的算法替代
// 保留此函数以保持兼容性，但不推荐使用
function calculateEditDistance(str1, str2) {
  console.warn('calculateEditDistance is deprecated. Use the new optimized similarity function instead.');
  
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

// 搜索功能相关函数已在search-functions.js中实现，无需重复定义

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
let searchTimeout;



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

// 搜索功能相关函数 - 从search-functions.js导入



// 相似度计算缓存 - 避免重复计算
const similarityCache = new Map();

// 简单快速的字符串相似度计算（替代编辑距离）
function calculateSimilarity(str1, str2) {
  // 如果有一个为空，直接返回0
  if (!str1 || !str2) return 0;
  
  // 完全匹配直接返回1
  if (str1 === str2) return 1;
  
  // 首先检查缓存
  const cacheKey = `${str1}|${str2}`;
  if (similarityCache.has(cacheKey)) {
    return similarityCache.get(cacheKey);
  }
  
  // 使用更快速的相似度算法替代编辑距离
  // 1. 检查包含关系
  if (str1.includes(str2) || str2.includes(str1)) {
    const similarity = Math.min(str1.length, str2.length) / Math.max(str1.length, str2.length);
    similarityCache.set(cacheKey, similarity);
    return similarity;
  }
  
  // 2. 计算交集字符数
  const set1 = new Set(str1);
  const intersection = new Set([...str1].filter(char => set1.has(char)));
  const similarity = intersection.size / Math.max(str1.length, str2.length);
  
  // 存储到缓存
  similarityCache.set(cacheKey, similarity);
  
  return similarity;
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

// 渲染单个游戏卡片 - 抽取为独立函数，供虚拟滚动和传统分页共用
function renderGameCard(game) {
  // 图标颜色数组 - 提高对比度的颜色
  const iconColors = ['text-primary', 'text-secondary', 'text-red-500', 'text-purple-500', 'text-amber-500'];
  const iconClasses = [
    'fa-gamepad', 'fa-rocket', 'fa-diamond', 'fa-star', 'fa-trophy',
    'fa-shield', 'fa-sword', 'fa-car', 'fa-plane', 'fa-space-shuttle'
  ];
  
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
  
  // 创建卡片元素
  const cardElement = document.createElement('div');
  cardElement.className = 'bg-white rounded-lg shadow-md p-5 card-hover transition-all duration-300 flex flex-col items-center text-center border border-neutral-100 w-full max-w-[320px] min-h-[320px]';
  cardElement.innerHTML = imageHtml + 
    `<h3 class="font-bold text-lg text-neutral-800 mb-4 w-full text-wrap break-words">${game.name}</h3>` + 
    buttonContainerHtml;
  
  // 为没有下载URL的按钮添加事件监听
  const noDownloadButton = cardElement.querySelector('.no-download-btn');
  if (noDownloadButton) {
    noDownloadButton.addEventListener('click', () => {
      alert(`查看游戏：${game.name} 的修改器`);
    });
  }
  
  return cardElement;
}

// 游戏网格渲染相关函数
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
        <a href="WeMod平台页面.html" class="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-bold rounded-lg shadow-lg hover:bg-blue-700 transition-all duration-300 transform hover:scale-105">
          <i class="fa fa-external-link mr-2"></i> 前往Wemod平台
        </a>
      `;
      gameGrid.appendChild(noResults);
      return;
    }
    
    // 传统分页模式
    console.log('使用传统分页渲染游戏列表');
    
    // 计算当前页显示的游戏
    const startIndex = (currentPage - 1) * gamesPerPage;
    const endIndex = Math.min(startIndex + gamesPerPage, filteredGames.length);
    const currentGames = filteredGames.slice(startIndex, endIndex);
    
    // 预创建所有卡片的HTML字符串，减少DOM操作
    let cardsHtml = '';
    
    // 构建所有卡片的HTML
    for (let i = 0; i < currentGames.length; i++) {
      const game = currentGames[i];
      const cardElement = renderGameCard(game);
      // 使用outerHTML获取元素的HTML字符串
      cardsHtml += cardElement.outerHTML;
    }
    
    // 一次性将所有卡片添加到DOM，减少重排和重绘
    gameGrid.innerHTML = cardsHtml;
    
    // 初始化图片懒加载
    initLazyLoad();
  });
}

// 初始化图片懒加载 - 增强版（支持占位符、错误处理、性能优化）
function initLazyLoad() {
  const lazyImages = document.querySelectorAll('.lazy');
  const defaultIconPath = '/资源/images/default-game-icon.svg';
  let failedAttempts = {}; // 跟踪每个图片的加载失败次数
  
  // 防止重复初始化
  if (!lazyImages.length) return;
  
  // 添加CSS动画样式到页面
  if (!document.getElementById('lazy-load-styles')) {
    const styleSheet = document.createElement('style');
    styleSheet.id = 'lazy-load-styles';
    styleSheet.textContent = `
      @keyframes placeholder-loading {
        0% { background-position: 0 0; }
        100% { background-position: 40px 40px; }
      }
      @keyframes fade-in {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      .lazy {
        opacity: 0;
        transition: opacity 0.3s ease-in-out;
      }
      .lazy-loaded {
        opacity: 1;
        animation: fade-in 0.3s ease-in-out;
      }
    `;
    document.head.appendChild(styleSheet);
  }
  
  // 预定义占位图片样式
  const placeholderStyle = `
    background-color: #f5f5f5;
    background-image: linear-gradient(45deg, #f9f9f9 25%, transparent 25%, transparent 50%, #f9f9f9 50%, #f9f9f9 75%, transparent 75%, transparent);
    background-size: 20px 20px;
    animation: placeholder-loading 1.5s infinite;
    min-height: 80px;
    display: block;
  `;
  
  // 为所有懒加载图片添加占位符样式和属性
  lazyImages.forEach(image => {
    // 存储原始的alt文本（如果有）
    if (image.alt && image.alt.trim()) {
      image.dataset.originalAlt = image.alt;
    } else {
      image.alt = '游戏图标加载中...';
    }
    
    // 应用占位符样式
    if (!image.style.backgroundColor) {
      image.style.cssText += placeholderStyle;
    }
    
    // 确保图片有明确的尺寸，避免布局偏移
    if (!image.width && image.dataset.width) {
      image.width = image.dataset.width;
    }
    if (!image.height && image.dataset.height) {
      image.height = image.dataset.height;
    }
  });
  
  // 处理图片加载
  const handleImageLoad = (image) => {
    // 图片加载完成后移除占位符样式和lazy类
    image.style.animation = 'none';
    image.style.background = 'none';
    image.classList.remove('lazy');
    image.classList.add('lazy-loaded');
    
    // 恢复原始alt文本
    if (image.dataset.originalAlt) {
      image.alt = image.dataset.originalAlt;
    }
    
    // 设置加载成功的标志
    image.dataset.loaded = 'true';
    image.dataset.loadStatus = 'success';
  };
  
  // 处理图片加载失败
  const handleImageError = (image) => {
    const src = image.dataset.src;
    
    // 增加失败计数
    if (!failedAttempts[src]) {
      failedAttempts[src] = 0;
    }
    failedAttempts[src]++;
    
    console.warn(`图片加载失败 (尝试 ${failedAttempts[src]}):`, src);
    
    // 尝试重新加载，但限制重试次数
    if (failedAttempts[src] <= 2) {
      // 延迟重试，避免立即重试导致的服务器压力
      setTimeout(() => {
        console.log(`重试加载图片:`, src);
        image.src = ''; // 清空src以允许重新加载
        image.src = src;
      }, 1000 * failedAttempts[src]); // 递增延迟时间
      return;
    }
    
    // 多次尝试失败后使用默认图标
    console.error(`图片多次加载失败，使用默认图标:`, src);
    
    // 保存原始src以便将来可能的重试
    if (!image.dataset.fallbackSrc) {
      image.dataset.fallbackSrc = image.dataset.src;
    }
    
    // 使用默认图标替代加载失败的图片
    image.src = defaultIconPath;
    image.alt = '游戏图标（默认）';
    image.dataset.loadStatus = 'fallback';
    
    // 添加视觉指示，表明这是一个替代图标
    image.classList.add('image-fallback');
    
    // 触发加载完成处理
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
  
  // 强制使用传统分页功能，禁用虚拟滚动
  useVirtualScroll = false;
  console.log('强制使用传统分页功能');
  
  // 确保分页控件可见
  if (pagination) {
    pagination.classList.remove('hidden');
  }
  
  // 获取刷新按钮
  const refreshButton = document.getElementById('refreshButton');
  
  // 搜索输入事件监听
  if (searchInput) {
    console.log('搜索输入框已找到，绑定搜索事件');
    searchInput.addEventListener('input', debounce(() => {
      console.log('搜索事件触发，搜索词:', searchInput.value);
      handleSearch(searchInput);
    }, 300));
  } else {
    console.log('搜索输入框未找到，跳过搜索功能初始化');
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
        if (gameGrid) renderGameGrid(gameGrid, filteredGames, currentPage, gamesPerPage);
        if (pageNumbers && currentPageNum && totalPagesNum && prevPageBtn && nextPageBtn) {
          renderPagination(pageNumbers, currentPageNum, totalPagesNum, prevPageBtn, nextPageBtn, filteredGames, gamesPerPage, currentPage);
        }
      }
    });
  }
  
  if (nextPageBtn) {
    nextPageBtn.addEventListener('click', () => {
      const totalPages = Math.ceil(filteredGames.length / gamesPerPage);
      if (currentPage < totalPages) {
        currentPage++;
        if (gameGrid) renderGameGrid(gameGrid, filteredGames, currentPage, gamesPerPage);
        if (pageNumbers && currentPageNum && totalPagesNum && prevPageBtn && nextPageBtn) {
          renderPagination(pageNumbers, currentPageNum, totalPagesNum, prevPageBtn, nextPageBtn, filteredGames, gamesPerPage, currentPage);
        }
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
          if (gameGrid) renderGameGrid(gameGrid, filteredGames, currentPage, gamesPerPage);
          if (pageNumbers && currentPageNum && totalPagesNum && prevPageBtn && nextPageBtn) {
            renderPagination(pageNumbers, currentPageNum, totalPagesNum, prevPageBtn, nextPageBtn, filteredGames, gamesPerPage, currentPage);
          }
        }
      }
    });
  }
  
  // 初始化模态框
  initUsageGuideModal();
  initSponsorModal();
  
  // 加载更新信息 - 只在有需要的页面加载
  if (document.getElementById('updateInfoContainer')) {
    loadUpdateInfo();
  } else {
    console.log('更新信息容器未找到，跳过更新信息加载');
  }
  
  // 加载游戏数据 - 只在游戏列表页面加载
  if (gameGrid && loadingIndicator && emptyState && pagination) {
    loadGameData();
  } else {
    console.log('必要的游戏列表DOM元素不完整，跳过游戏数据加载');
  }
}

// 加载更新信息
function loadUpdateInfo() {
  const updateContainer = document.getElementById('updateInfoContainer');
  if (!updateContainer) {
    console.log('更新信息容器未找到，跳过更新信息加载');
    return;
  }
  
  try {
    // 添加时间戳防止缓存
    const timestamp = Date.now();
    fetch(`数据/修改器近期更新.txt?t=${timestamp}`)
    .then(response => {
      if (!response.ok) {
        throw new Error(`无法加载更新信息文件`);
      }
      return response.text();
    })
    .then(text => {
      console.log('加载更新信息成功');
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
      if (updateContainer) {
        updateContainer.innerHTML = '<div class="text-neutral-600">暂无更新信息</div>';
      }
    });
  } catch (err) {
    console.error('加载更新信息时发生异常:', err);
  }
}

// 加载游戏数据 - 优先使用缓存，后台更新 - 优化版
function loadGameData() {
  console.log('开始加载游戏数据...');
  
  // 检查DOM元素是否都存在
  if (!loadingIndicator || !emptyState || !gameGrid || !pagination) {
    console.log('必要的游戏列表DOM元素不完整，跳过游戏数据加载');
    return;
  }
  
  // 添加加载进度指示器
  if (loadingIndicator) {
    loadingIndicator.innerHTML = `
      <div class="text-center py-12">
        <div class="text-5xl text-primary mb-6">
          <i class="fa fa-circle-o-notch fa-spin"></i>
        </div>
        <h3 class="text-xl font-semibold text-neutral-800 mb-4">正在加载游戏数据</h3>
        <div class="w-4/5 max-w-md mx-auto bg-gray-200 rounded-full h-2.5 mb-2">
          <div id="loadingProgressBar" class="bg-primary h-2.5 rounded-full" style="width: 0%"></div>
        </div>
        <p id="loadingStatusText" class="text-neutral-500 text-sm">准备加载数据...</p>
      </div>
    `;
  }
  
  // 首先尝试使用本地缓存数据
  const cachedData = localStorage.getItem('gameModifiersData');
  const cacheTimestamp = localStorage.getItem('gameModifiersCacheTimestamp');
  
  const now = Date.now();
  
  // 如果缓存存在且未过期，立即使用缓存数据
  if (cachedData && cacheTimestamp && (now - parseInt(cacheTimestamp) < CACHE_VALID_TIME)) {
    try {
      const parsedData = JSON.parse(cachedData);
      console.log('使用缓存数据显示游戏列表，共', parsedData.length, '条记录');
      
      // 立即渲染缓存数据
      requestAnimationFrame(() => {
        // 注意：parsedData已经是处理过的数据，不需要再次处理
        gamesData = parsedData;
        filteredGames = [...gamesData];
        
        showContent(loadingIndicator, emptyState, gameGrid, pagination);
        
        // 渲染游戏网格和分页控件
        renderGameGrid(gameGrid, filteredGames, currentPage, gamesPerPage);
        renderPagination(pageNumbers, currentPageNum, totalPagesNum, prevPageBtn, nextPageBtn, filteredGames, gamesPerPage, currentPage);
        
        // 检查是否需要自动刷新
        checkAndPerformAutoRefresh();
      });
      
      // 然后在后台异步更新缓存数据，不阻塞用户界面
      setTimeout(updateCacheData, 1000);
      return;
    } catch (cacheError) {
      console.error('缓存数据解析失败:', cacheError);
      localStorage.removeItem('gameModifiersData');
      localStorage.removeItem('gameModifiersCacheTimestamp');
    }
  }
  
  // 缓存不存在或已过期，使用优化的数据加载器加载新数据
  console.log('使用高性能数据加载器加载数据');
  
  // 创建或获取数据加载器实例
  if (!window.DataLoader) {
    console.error('数据加载器模块未加载，回退到原始加载方式');
    loadFreshData();
    return;
  }
  
  // 使用数据加载器加载数据
  window.DataLoader
    .updateConfig({
      batchSize: 300, // 每次加载的数据量
      batchDelay: 50, // 批次之间的延迟(ms)
      enableWebWorker: true // 启用Web Worker处理
    })
    .onProgress((progress) => {
      // 更新加载进度UI
      const progressBar = document.getElementById('loadingProgressBar');
      const statusText = document.getElementById('loadingStatusText');
      
      if (progressBar) {
        progressBar.style.width = `${progress}%`;
      }
      
      if (statusText) {
        if (progress < 10) {
          statusText.textContent = '正在准备数据...';
        } else if (progress < 50) {
          statusText.textContent = `正在加载数据(${Math.round(progress)}%)...`;
        } else {
          statusText.textContent = `正在处理数据(${Math.round(progress)}%)...`;
        }
      }
    })
    .onComplete((processedData, error) => {
      if (error) {
        console.error('数据加载器加载失败:', error);
        handleLoadFailure(error);
        return;
      }
      
      if (processedData) {
        console.log('数据加载器加载完成，共', processedData.length, '条记录');
        
        // 更新缓存，但限制缓存大小
        try {
          // 注意：这里缓存处理后的数据而不是原始数据，减少下次加载时的处理时间
          const dataStr = JSON.stringify(processedData);
          const dataSize = new Blob([dataStr]).size;
          const storageAvailable = checkLocalStorageQuota(dataSize);
          
          if (storageAvailable) {
            localStorage.setItem('gameModifiersData', dataStr);
            localStorage.setItem('gameModifiersCacheTimestamp', Date.now().toString());
            console.log('处理后的数据成功缓存到本地存储');
          } else {
            console.warn('本地存储空间不足，无法缓存数据');
          }
        } catch (e) {
          console.warn('无法缓存数据到本地存储:', e);
        }
        
        // 更新UI
        gamesData = processedData;
        filteredGames = [...gamesData];
        
        showContent(loadingIndicator, emptyState, gameGrid, pagination);
        
        // 渲染游戏网格和分页控件
        renderGameGridOptimized(gameGrid, filteredGames, currentPage, gamesPerPage);
        renderPagination(pageNumbers, currentPageNum, totalPagesNum, prevPageBtn, nextPageBtn, filteredGames, gamesPerPage, currentPage);
        
        console.log(`成功导入 ${gamesData.length} 个游戏条目`);
        
        // 检查是否需要自动刷新
        checkAndPerformAutoRefresh();
      }
    })
    .loadData('数据/modifiers_data.json');
  
  // 在后台更新缓存数据的函数
  function updateCacheData() {
    console.log('后台更新缓存数据...');
    if (window.DataLoader) {
      window.DataLoader.loadData('数据/modifiers_data.json');
    } else {
      loadFreshData(true); // true表示这是后台更新
    }
  }
  
  // 回退的原始加载函数（当数据加载器不可用时）
  function loadFreshData(isBackgroundUpdate = false, retryCount = 0) {
    // 使用原始版本的JSON文件
    const jsonDataPath = '数据/modifiers_data.json';
    console.log(`${isBackgroundUpdate ? '后台' : '前台'}加载JSON数据文件:`, jsonDataPath, `(尝试 ${retryCount + 1}/3)`);
    
    // 设置fetch请求选项，优化缓存策略
    const fetchOptions = {
      cache: isBackgroundUpdate ? 'reload' : 'default', // 后台更新强制重载，前台使用默认缓存
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json',
        // 添加自定义请求头，便于服务器优化
        'X-Client-Request': 'game-modifiers-load',
        // 优先使用HTTP/2
        'Accept-Encoding': 'gzip, deflate, br'
      },
      // 设置超时时间为15秒
      signal: AbortSignal.timeout(15000)
    };
    
    fetch(jsonDataPath, fetchOptions)
      .then(response => {
        console.log('JSON文件请求响应状态:', response.status, response.statusText);
        
        if (!response.ok) {
          throw new Error(`JSON文件加载失败: ${response.status} ${response.statusText}`);
        }
        
        return response.json();
      })
      .then(jsonData => {
        console.log('JSON文件加载成功，共', jsonData.length, '条记录');
        
        // 更新缓存，但限制缓存大小
        try {
          const dataStr = JSON.stringify(jsonData);
          const dataSize = new Blob([dataStr]).size;
          const storageAvailable = checkLocalStorageQuota(dataSize);
          
          if (storageAvailable) {
            localStorage.setItem('gameModifiersData', dataStr);
            localStorage.setItem('gameModifiersCacheTimestamp', Date.now().toString());
            console.log('数据成功缓存到本地存储');
          } else {
            console.warn('本地存储空间不足，无法缓存数据');
          }
        } catch (e) {
          console.warn('无法缓存数据到本地存储:', e);
        }
        
        // 如果是前台加载，立即更新UI
        if (!isBackgroundUpdate) {
          processAndRenderData(jsonData);
        } else {
          console.log('后台缓存更新完成');
        }
      })
      .catch(error => {
        console.error('数据加载失败:', error);
        
        // 如果是前台加载且缓存失败，显示错误
        if (!isBackgroundUpdate) {
          // 实现自动重试机制，最多重试2次（总共3次尝试）
          if (retryCount < 2) {
            console.log(`加载失败，${retryCount < 1 ? '立即' : '延迟1秒后'}重试...`);
            
            // 第一次重试立即进行，后续重试增加延迟
            const retryDelay = retryCount === 0 ? 0 : 1000;
            
            setTimeout(() => {
              loadFreshData(false, retryCount + 1);
            }, retryDelay);
          } else {
            console.error('达到最大重试次数，显示加载失败界面');
            handleLoadFailure(error);
          }
        } else if (retryCount < 2) {
          // 后台加载也进行重试，但只重试1次
          setTimeout(() => {
            loadFreshData(true, retryCount + 1);
          }, 500);
        }
      });
  }
  
  // 处理加载失败逻辑 - 增强版
  function handleLoadFailure(error) {
    console.error('加载失败详情:', {
      errorType: error.name,
      errorMessage: error.message
    });
    
    // 显示空状态和错误信息
    loadingIndicator.classList.add('hidden');
    gameGrid.classList.add('hidden');
    pagination.classList.add('hidden');
    
    // 根据不同错误类型显示不同的错误信息
    const errorType = error.name === 'AbortError' ? '加载超时' : '数据加载失败';
    const errorMessage = error.name === 'AbortError' 
      ? '网络连接超时，请检查您的网络状况或稍后再试' 
      : '无法加载修改器数据，请检查网络连接或稍后再试';
    
    // 添加离线备选方案提示
    const offlineOption = navigator.onLine 
      ? '' 
      : '<p class="text-neutral-500 text-sm mt-4">您似乎处于离线状态，请连接到互联网后重试</p>';
    
    emptyState.innerHTML = `
      <div class="text-center py-12">
        <div class="text-6xl text-red-400 mb-4">
          <i class="fa fa-exclamation-circle"></i>
        </div>
        <h3 class="text-xl font-semibold text-neutral-800 mb-2">${errorType}</h3>
        <p class="text-neutral-600 mb-6">${errorMessage}</p>
        <button id="retryButton" class="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
          重新加载
        </button>
        ${offlineOption}
        
        <!-- 添加加载速度慢的提示和备选方案 -->
        <div class="mt-8 pt-6 border-t border-neutral-200">
          <p class="text-neutral-500 text-sm mb-3">加载速度慢？试试这些方法：</p>
          <ul class="text-neutral-600 text-sm text-left max-w-md mx-auto">
            <li class="mb-2"><i class="fa fa-check-circle text-green-500 mr-2"></i>刷新页面后等待3-5秒</li>
            <li class="mb-2"><i class="fa fa-check-circle text-green-500 mr-2"></i>尝试使用不同的浏览器</li>
            <li class="mb-2"><i class="fa fa-check-circle text-green-500 mr-2"></i>清除浏览器缓存后重试</li>
          </ul>
        </div>
      </div>
    `;
    
    emptyState.classList.remove('hidden');
    
    // 为重试按钮添加点击事件，防止重复绑定
    const retryButton = document.getElementById('retryButton');
    if (retryButton) {
      // 移除可能存在的旧事件监听器
      const newRetryButton = retryButton.cloneNode(true);
      retryButton.parentNode.replaceChild(newRetryButton, retryButton);
      // 添加新的事件监听器
      newRetryButton.addEventListener('click', loadGameData);
    }
  }
  
  // 处理并渲染数据的函数 - 优化版
  function processAndRenderData(jsonData) {
    // 通过requestAnimationFrame优化UI更新，减少卡顿
    requestAnimationFrame(() => {
      try {
        // 处理游戏数据
        gamesData = processGameData(jsonData);
        
        // 更新UI
        filteredGames = [...gamesData];
        
        showContent(loadingIndicator, emptyState, gameGrid, pagination);
        
        // 使用优化的渲染方式
        renderGameGridOptimized(gameGrid, filteredGames, currentPage, gamesPerPage);
        
        // 显示分页控件
        renderPagination(pageNumbers, currentPageNum, totalPagesNum, prevPageBtn, nextPageBtn, filteredGames, gamesPerPage, currentPage);
        
        console.log(`成功导入 ${gamesData.length} 个游戏条目`);
      } catch (error) {
        console.error('数据处理或渲染错误:', error);
        handleLoadFailure(new Error('数据处理失败，请刷新页面重试'));
      }
    });
  }
  
  // 检查localStorage是否有足够空间
  function checkLocalStorageQuota(dataSize) {
    try {
      // 尝试写入一个小数据来检查是否有空间
      const testKey = '__storage_test__';
      const testData = 'x';
      localStorage.setItem(testKey, testData);
      localStorage.removeItem(testKey);
      
      // 估算剩余空间（localStorage通常限制为5MB）
      const usedSpace = new Blob(Object.values(localStorage)).size;
      const estimatedQuota = 5 * 1024 * 1024; // 5MB
      
      return (usedSpace + dataSize) < estimatedQuota * 0.9; // 预留10%空间
    } catch (e) {
      return false;
    }
  }
  
  // 优化版游戏网格渲染函数
  function renderGameGridOptimized(gameGrid, filteredGames, currentPage, gamesPerPage) {
    // 使用文档片段减少DOM重排重绘
    const fragment = document.createDocumentFragment();
    
    // 执行分页计算
    const startIndex = (currentPage - 1) * gamesPerPage;
    const endIndex = Math.min(startIndex + gamesPerPage, filteredGames.length);
    const currentGames = filteredGames.slice(startIndex, endIndex);
    
    // 清空游戏网格容器
    gameGrid.innerHTML = '';
    
    // 批量创建游戏卡片元素
    currentGames.forEach(game => {
      const gameCard = createGameCard(game);
      fragment.appendChild(gameCard);
    });
    
    // 一次性将所有卡片添加到DOM中
    gameGrid.appendChild(fragment);
  }
  
  // 创建游戏卡片的辅助函数
  function createGameCard(game) {
    const gameCard = document.createElement('div');
    gameCard.className = 'game-card';
    
    // 使用模板字符串构建卡片内容
    gameCard.innerHTML = `
      <div class="game-card-inner">
        <div class="game-image-container">
          <img src="${game.imageUrl || 'images/default-game.jpg'}" alt="${game.name}" class="game-image">
          ${game.antiCheatUrl ? '<span class="anti-cheat-badge">有反作弊文件</span>' : ''}
        </div>
        <div class="game-info">
          <h3 class="game-name">${game.name}</h3>
          <div class="game-actions">
            <a href="${game.downloadUrl}" class="download-button" target="_blank" rel="noopener noreferrer">
              <i class="fa fa-download mr-1"></i>下载修改器
            </a>
            ${game.antiCheatUrl ? `
            <a href="${game.antiCheatUrl}" class="anti-cheat-button" target="_blank" rel="noopener noreferrer">
              <i class="fa fa-shield mr-1"></i>反作弊文件
            </a>
            ` : ''}
          </div>
        </div>
      </div>
    `;
    
    return gameCard;
  }
}


// 处理游戏数据 - 超级优化版
function processGameData(jsonData) {
  // 性能监控
  const startTime = performance.now();
  
  // 清空现有数据
  const processedGames = [];
  
  // 使用更高效的方式处理游戏数据
  const len = jsonData.length;
  
  // 预定义正则表达式以避免重复创建
  const versionPattern = /(?:v?\d+\.\d+(?:\.\d+)?)/i;
  const antiCheatMarkerPattern = /\s*\(有反作弊文件\)\s*/;
  
  // 预分配数组空间以提高性能
  processedGames.length = len;
  
  // 预编译常用正则表达式
  const digitPattern = /\d/;
  
  // 处理每个游戏条目 - 使用for循环而不是forEach以提高性能
  for (let index = 0; index < len; index++) {
    const item = jsonData[index];
    
    // 支持短键名的超级优化版本和原始中文键名版本
    let gameName, imageUrl, downloadUrl, antiCheatUrl;
    
    // 检查是否是短键名版本
    if (item.n !== undefined) {
      // 使用短键名版本
      gameName = item.n || '未知游戏';
      imageUrl = item.i || '';
      downloadUrl = item.d || '';
      antiCheatUrl = item.a || '';
    } else {
      // 兼容原始中文键名版本
      gameName = item["游戏名字"] || '未知游戏';
      imageUrl = item["图片地址"] || '';
      downloadUrl = item["下载地址"] || '';
      antiCheatUrl = item["反作弊文件下载"] || '';
    }
    
    // 快速转换为字符串并修剪（避免多次trim调用）
    gameName = gameName.toString().trim();
    
    // 快速路径：如果游戏名很短，直接跳过复杂处理
    if (gameName.length > 2) {
      // 尝试从游戏名称中提取版本信息并移除
      const versionMatch = gameName.match(versionPattern);
      if (versionMatch) {
        gameName = gameName.replace(versionMatch[0], '').trim();
      }
      
      // 从游戏名称中移除"(有反作弊文件)"标记
      if (antiCheatMarkerPattern.test(gameName)) {
        gameName = gameName.replace(antiCheatMarkerPattern, '').trim();
      }
    }
    
    // 确保其他数据是字符串类型
    imageUrl = imageUrl.toString().trim();
    downloadUrl = downloadUrl.toString().trim();
    antiCheatUrl = antiCheatUrl.toString().trim();
    
    // 直接赋值而不是push，进一步提高性能
    processedGames[index] = {
      id: index + 1,
      name: gameName,
      imageUrl: imageUrl,
      downloadUrl: downloadUrl,
      antiCheatUrl: antiCheatUrl,
      // 使用更高效的方式生成随机图标索引
      iconIndex: index % 10 // 使用索引取模代替随机数生成
    };
  }
  
  // 性能统计
  const endTime = performance.now();
  console.log(`处理 ${processedGames.length} 个游戏条目耗时: ${(endTime - startTime).toFixed(2)}ms`);
  
  return processedGames;
}

// 处理搜索
function handleSearch(searchInput) {
  currentPage = 1;
  const searchTerm = searchInput.value.trim().toLowerCase();
  
  // 显示加载指示器
  showLoading(loadingIndicator, emptyState, gameGrid, pagination);
  
  // 延迟执行搜索，避免频繁搜索
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    // 使用增强的搜索功能
    filteredGames = filterGamesBySearch(searchTerm, gamesData);
    
    currentPage = 1;
    
    // 批量渲染UI，减少DOM操作
    renderGameGrid(gameGrid, filteredGames, currentPage, gamesPerPage);
    
    // 无论使用哪种渲染方式，都显示分页控件
    renderPagination(pageNumbers, currentPageNum, totalPagesNum, prevPageBtn, nextPageBtn, filteredGames, gamesPerPage, currentPage);
    
    // 智能状态管理
    if (filteredGames.length === 0) {
      showEmptyState(loadingIndicator, emptyState, gameGrid, pagination);
    } else {
      showContent(loadingIndicator, emptyState, gameGrid, pagination);
    }
  }, SEARCH_DELAY_MS);
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
      
      // 重新渲染
      if (games && games.length > 0) {
        renderGameGrid(gameGrid, games, currentPage, gamesPerPage);
        renderPagination(pageNumbers, currentPageNum, totalPagesNum, prevPageBtn, nextPageBtn, games, gamesPerPage, currentPage);
      }
    }
  }, 300));
});