class ProductDetailTabs {
  constructor() {
    console.log('初始化产品详情组件');
    this.container = document.querySelector('.gg-product-detail__container');
    console.log('容器元素:', this.container);
    
    this.tabItems = this.container?.querySelectorAll('.gg-tab-nav .gg-tab-item') || [];
    console.log('找到标签数量:', this.tabItems.length);
    
    this.contentPanes = this.container?.querySelectorAll('.gg-tab-content .gg-content-pane') || [];
    console.log('找到内容面板数量:', this.contentPanes.length);
    
    // 简化事件监听
    this.container.querySelector('.gg-tab-nav').addEventListener('click', (e) => {
      const tabItem = e.target.closest('.gg-tab-item');
      if (tabItem) {
        this.switchTab(tabItem);
      }
    });

    this.init();
    this.setupContentObserver();
  }

  init() {
    // 确保默认激活第一个标签
    const initialTab = this.tabItems[0];
    if (initialTab) {
      initialTab.classList.add('active');
      const targetId = initialTab.dataset.target;
      document.getElementById(targetId)?.classList.add('active');
    }

    // 简化滚动检测
    this.setupIntersectionObserver();
  }

  switchTab(tabItem) {
    if (tabItem.classList.contains('active')) return;
    
    const targetId = tabItem.dataset.target;
    const targetPane = document.getElementById(targetId);
    
    if (!targetPane) return;

    // 移除所有active类
    this.tabItems.forEach(tab => tab.classList.remove('active'));
    this.contentPanes.forEach(pane => pane.classList.remove('active'));
    
    // 添加active类
    tabItem.classList.add('active');
    targetPane.classList.add('active');
  }

  activateTab(targetId) {
    if (!targetId) {
      console.error('无效的targetId:', targetId);
      return;
    }

    // 移除所有active类
    this.tabItems.forEach(tab => tab.classList.remove('active'));
    this.contentPanes.forEach(pane => pane.classList.remove('active'));

    // 激活当前标签和内容
    const activeTab = this.container.querySelector(`[data-target="${targetId}"]`);
    const activePane = this.container.querySelector(`#${targetId}`);
    
    [activeTab, activePane].forEach(el => el?.classList.add('active'));

    console.log('当前激活目标:', targetId, '激活标签:', activeTab, '激活面板:', activePane);
  }

  scrollToPane(targetId) {
    const targetPane = document.getElementById(targetId);
    if (targetPane) {
      const offsetTop = targetPane.offsetTop - 80; // 减去header高度
      window.scrollTo({
        top: offsetTop,
        behavior: 'smooth'
      });
    }
  }

  setupIntersectionObserver() {
    const observerOptions = {
      rootMargin: '-50px 0px -50% 0px',
      threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.activateTab(entry.target.id);
        }
      });
    }, observerOptions);

    this.contentPanes.forEach(pane => observer.observe(pane));
  }

  // 添加MutationObserver监听内容变化
  setupContentObserver() {
    const observer = new MutationObserver(() => {
      this.contentPanes = this.container.querySelectorAll('.gg-tab-content .gg-content-pane');
    });
    observer.observe(this.container, { childList: true, subtree: true });
  }
}

// 初始化
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new ProductDetailTabs());
} else {
  new ProductDetailTabs();
} 