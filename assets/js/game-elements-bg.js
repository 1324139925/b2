// 游戏元素背景生成脚本

// 等待DOM加载完成
document.addEventListener('DOMContentLoaded', function() {
  // 防抖函数定义
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

  // 创建背景容器
  const bgContainer = document.createElement('div');
  bgContainer.className = 'game-elements-bg';
  document.body.appendChild(bgContainer);

  // 生成抽象游戏元素
  generateGameElements(bgContainer);

  // 更新现有元素的位置和大小函数
  function updateGameElements() {
    const container = document.querySelector('.game-elements-bg');
    if (!container) return;
    
    const elements = container.querySelectorAll('div');
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    
    // 批量更新元素位置，减少重排次数
    elements.forEach(element => {
      // 重新计算随机位置以适应新窗口大小
      const x = Math.random() * (windowWidth - 100);
      const y = Math.random() * (windowHeight - 100);
      element.style.left = x + 'px';
      element.style.top = y + 'px';
    });
  }

  // 窗口大小改变时更新现有元素，而不是重新生成
  // 使用防抖函数减少频繁调整的性能消耗
  const debouncedUpdateGameElements = debounce(updateGameElements, 100);
  window.addEventListener('resize', debouncedUpdateGameElements);

  // 在页面卸载前清理事件监听器
  window.addEventListener('beforeunload', () => {
    window.removeEventListener('resize', debouncedUpdateGameElements);
  });

// 生成游戏元素函数
function generateGameElements(container) {
  // 默认元素数量为18，根据设备性能可能会调整
  let totalElements = 18;
  
  // 简单的设备性能检测
  // 如果是移动设备或屏幕较小，减少元素数量
  if (window.innerWidth < 768 || /Mobi|Android/i.test(navigator.userAgent)) {
    totalElements = 12;
  }
  
  // 尝试通过Performance API检测设备性能
  if ('performance' in window && 'getEntriesByType' in performance) {
    try {
      const measures = performance.getEntriesByType('measure');
      if (measures.length > 0) {
        const avgTime = measures.reduce((sum, measure) => sum + measure.duration, 0) / measures.length;
        // 如果平均测量时间较长，表明设备性能较低
        if (avgTime > 100) {
          totalElements = Math.max(8, Math.floor(totalElements * 0.6));
        }
      }
    } catch (e) {
      // 忽略性能API错误
    }
  }
  
  const elementTypes = ['pixel-block', 'controller-button', 'directional-pad', 'pixel-star'];
  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;
  
  // 创建文档片段来批量添加元素，减少重排和重绘
  const fragment = document.createDocumentFragment();

  // 随机生成不同类型的游戏元素
  for (let i = 0; i < totalElements; i++) {
    // 随机选择元素类型
    const randomType = elementTypes[Math.floor(Math.random() * elementTypes.length)];
    const element = document.createElement('div');
    element.className = randomType;

    // 随机位置
    const x = Math.random() * (windowWidth - 100);
    const y = Math.random() * (windowHeight - 100);
    element.style.left = x + 'px';
    element.style.top = y + 'px';

    // 根据元素类型设置不同的尺寸和样式
    if (randomType === 'pixel-block') {
      // 像素方块：随机大小和旋转
      const size = 10 + Math.random() * 20;
      element.style.width = size + 'px';
      element.style.height = size + 'px';
      // 为像素方块添加额外的旋转，确保它能被看到
      const rotation = 45 + Math.random() * 15;
      element.style.transform = `rotate(${rotation}deg)`;
    } else if (randomType === 'controller-button') {
      // 控制器按钮：圆形
      const size = 15 + Math.random() * 15;
      element.style.width = size + 'px';
      element.style.height = size + 'px';
      // 增加控制器按钮的显示效果
      element.style.boxShadow = '0 0 5px rgba(16, 185, 129, 0.3)';
    } else if (randomType === 'directional-pad') {
      // 方向键：固定大小但随机旋转
      const rotation = Math.random() * 360;
      element.style.transform = `rotate(${rotation}deg)`;
    } else if (randomType === 'pixel-star') {
      // 像素星星：随机大小和旋转
      const size = 10 + Math.random() * 10;
      const rotation = Math.random() * 360;
      element.style.width = size + 'px';
      element.style.height = size + 'px';
      element.style.transform = `rotate(${rotation}deg)`;
      // 为星星增加发光效果
      element.style.boxShadow = '0 0 5px rgba(251, 191, 36, 0.5)';
    }

    // 保留CSS中设置的透明度，不再通过JS覆盖
    // 如需调整透明度，请直接修改CSS文件中的相关样式规则

    // 添加到文档片段，而不是直接添加到DOM
    fragment.appendChild(element);
  }
  
  // 一次性将所有元素添加到DOM，减少重排和重绘
  container.appendChild(fragment);
}
});