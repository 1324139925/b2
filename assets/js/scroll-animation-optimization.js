// 滚动动画性能优化脚本

// 等待DOM加载完成
document.addEventListener('DOMContentLoaded', function() {
  // 获取所有滚动文字容器
  const marqueeContainers = document.querySelectorAll('.marquee-container');
  
  // 如果没有滚动文字容器，就不执行后续代码
  if (marqueeContainers.length === 0) return;
  
  // 创建IntersectionObserver实例来检测元素是否在视口中
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      // 获取滚动文字内容元素
      const marqueeContent = entry.target.querySelector('.marquee-content');
      if (!marqueeContent) return;
      
      // 根据元素是否在视口中来控制动画播放状态
      if (entry.isIntersecting) {
        // 元素进入视口，恢复动画
        marqueeContent.style.animationPlayState = 'running';
      } else {
        // 元素离开视口，暂停动画
        marqueeContent.style.animationPlayState = 'paused';
      }
    });
  }, {
    // 当元素有10%可见时触发回调
    threshold: 0.1,
    // 扩大观察区域，提前准备动画
    rootMargin: '50px 0px 50px 0px'
  });
  
  // 观察所有滚动文字容器
  marqueeContainers.forEach(container => {
    observer.observe(container);
  });
  
  // 清理函数
  window.addEventListener('beforeunload', function() {
    marqueeContainers.forEach(container => {
      observer.unobserve(container);
    });
  });
});