class ProductDetailTabs {
  constructor() {
    this.container = document.querySelector('.gg-product-detail__container');
    if (!this.container) return;

    // 初始化元素
    this.tabNav = this.container.querySelector('.gg-tab-nav');
    this.tabItems = this.container.querySelectorAll('.gg-tab-item');
    this.contentPanes = this.container.querySelectorAll('.gg-content-pane');

    // 绑定事件
    this.tabNav.addEventListener('click', this.handleTabClick.bind(this));

    // 监听 Shopify 编辑器事件
    document.addEventListener('shopify:section:load', () => this.init());
    document.addEventListener('shopify:block:select', (e) => {
      const targetTab = e.target.dataset.targetTab;
      if (targetTab) {
        const tabButton = this.container.querySelector(`.gg-tab-item[data-target="${targetTab}"]`);
        if (tabButton) this.switchTab(tabButton);
      }
    });

    // 监听评价标签切换
    document.addEventListener('shopify:section:load', () => this.initReviewWidget());

    this.init();
  }

  init() {
    // 确保至少有一个激活的标签
    const activeTab = this.container.querySelector('.gg-tab-item.active') || this.tabItems[0];
    if (activeTab) this.switchTab(activeTab);
  }

  handleTabClick(e) {
    const tabItem = e.target.closest('.gg-tab-item');
    if (tabItem) this.switchTab(tabItem);
  }

  switchTab(tabItem) {
    if (!tabItem || tabItem.classList.contains('active')) return;
    
    const targetId = tabItem.dataset.target;
    const targetPane = this.container.querySelector(`#${targetId}`);
    if (!targetPane) return;

    // 移除所有active类
    this.tabItems.forEach(tab => tab.classList.remove('active'));
    this.contentPanes.forEach(pane => pane.classList.remove('active'));
    
    // 添加active类
    tabItem.classList.add('active');
    targetPane.classList.add('active');

    // 如果切换到评价标签，初始化小组件
    if (targetId === 'reviews') {
      this.initReviewWidget();
    }
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

  // 初始化评价小组件
  initReviewWidget() {
    const reviewsPane = this.container.querySelector('#reviews');
    if (reviewsPane && reviewsPane.classList.contains('active')) {
      // 触发 Judge.me 小组件重新加载
      if (window.jdgm && typeof window.jdgm.widgetLoad === 'function') {
        window.jdgm.widgetLoad();
      }
    }
  }
}

// 初始化
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new ProductDetailTabs());
} else {
  new ProductDetailTabs();
} 