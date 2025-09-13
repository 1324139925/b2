// 模态框处理相关函数模块

// 初始化使用说明模态框
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

// 初始化赞助模态框
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

// 在普通脚本模式下，不需要导出语句
// 所有函数将自动成为全局作用域的一部分