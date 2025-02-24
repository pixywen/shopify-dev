class ProductDetailTabs {
  constructor() {
    this.container = document.querySelector('.gg-product-detail__container');
    if (!this.container) return;

    // 初始化轮播数组
    this.carousels = [];

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
    this.initCarousels();
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

    // 暂停所有轮播
    this.carousels.forEach(carousel => {
      carousel.pause();
    });
    
    // 等待标签页切换动画完成后重启对应标签页的轮播
    setTimeout(() => {
      this.carousels.forEach(carousel => {
        const isVisible = carousel.container.closest('.gg-content-pane.active') !== null;
        if (isVisible) {
          carousel.resume();
        }
      });
    }, 300);
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

  initCarousels() {
    // 确保 carousels 数组存在
    if (this.carousels && this.carousels.length) {
      // 清理旧的轮播实例
      this.carousels.forEach(carousel => carousel.destroy());
      this.carousels = [];
    }
    
    const carousels = document.querySelectorAll('.product-carousel-section');
    carousels.forEach(container => {
      // 检查轮播是否在当前可见的标签页中
      const isVisible = container.closest('.gg-content-pane.active') !== null;
      const carousel = new ProductCarousel(container);
      // 如果在可见标签页中，立即开始动画
      if (isVisible) {
        carousel.startAnimation();
      }
      this.carousels.push(carousel);
    });
  }
}

class ProductCarousel {
  constructor(container) {
    this.container = container;
    this.track = container.querySelector('.carousel-track');
    this.items = container.querySelectorAll('.carousel-item');
    // 获取配置的速度值（2-10）
    const configSpeed = parseInt(container.dataset.autoplaySpeed);
    this.speed = configSpeed >= 2 && configSpeed <= 10 ? configSpeed : 3;
    
    this.isHovered = false;
    this.interval = null;
    this.position = 0;
    this.animationFrame = null;
    this.isPaused = false;
    
    this.animate = this.animate.bind(this);
    
    this.init();
  }

  init() {
    // 在前后都添加克隆元素，实现无缝循环
    const itemWidth = this.items[0].offsetWidth;
    const totalWidth = itemWidth * this.items.length;
    
    // 在开头添加末尾的克隆
    for (let i = this.items.length - 1; i >= 0; i--) {
      const clone = this.items[i].cloneNode(true);
      this.track.insertBefore(clone, this.track.firstChild);
    }
    
    // 在末尾添加开头的克隆
    this.items.forEach(item => {
      const clone = item.cloneNode(true);
      this.track.appendChild(clone);
    });
    
    // 初始位置设为原始元素的开始位置
    this.position = -totalWidth;
    this.track.style.transform = `translateX(${this.position}px)`;
    
    // 为每个图片项添加hover事件
    this.track.addEventListener('mouseover', (e) => {
      const item = e.target.closest('.carousel-item');
      if (item) {
        this.isHovered = true;
        // 移除其他项的hover状态
        this.track.querySelectorAll('.carousel-item').forEach(i => i.classList.remove('hovered'));
        // 添加当前项的hover状态
        item.classList.add('hovered');
      }
    });
    
    this.track.addEventListener('mouseout', (e) => {
      const item = e.target.closest('.carousel-item');
      const relatedItem = e.relatedTarget?.closest('.carousel-item');
      
      // 只有当鼠标真正离开carousel-item时才移除hover状态
      if (item && !relatedItem) {
        this.isHovered = false;
        item.classList.remove('hovered');
      }
    });
    
    // 开始动画
    this.startAnimation();
  }

  startAnimation() {
    // 清除可能存在的旧定时器
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
    
    this.animate();
  }

  animate() {
    if (!this.isHovered && !this.isPaused) {
      // 计算移动速度（像素/帧）
      // 速度范围：2=最快，10=最慢
      const baseSpeed = 0.3;
      // 将配置速度反转：2->8, 10->0，使得数值越大速度越慢
      const speedMultiplier = 10 - this.speed;
      const speed = baseSpeed * speedMultiplier;
      
      this.position -= speed;
      
      // 检查是否需要重置位置
      const itemWidth = this.items[0].offsetWidth;
      const totalWidth = itemWidth * this.items.length;
      
      // 当滚动到克隆区域时，瞬间重置到对应的原始位置
      if (Math.abs(this.position) >= totalWidth * 2) {
        this.position = -totalWidth;
      }
      
      this.track.style.transform = `translateX(${this.position}px)`;
    }
    
    this.animationFrame = requestAnimationFrame(this.animate);
  }

  pause() {
    this.isPaused = true;
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
  }

  resume() {
    this.isPaused = false;
    if (!this.animationFrame) {
      this.startAnimation();
    }
  }

  destroy() {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
    // 移除事件监听器
    this.track.removeEventListener('mouseover');
    this.track.removeEventListener('mouseout');
  }
}

// FAQ 组件
class FAQBlock {
  constructor() {
    this.init();
  }

  init() {
    document.querySelectorAll('.faq-toggle').forEach(toggle => {
      toggle.addEventListener('click', this.handleToggle.bind(this));
    });
  }

  handleToggle(event) {
    const toggle = event.currentTarget;
    const content = toggle.nextElementSibling;
    const isExpanded = toggle.getAttribute('aria-expanded') === 'true';

    // 更新 aria-expanded 状态
    toggle.setAttribute('aria-expanded', !isExpanded);

    // 设置内容高度
    if (!isExpanded) {
      content.style.height = content.scrollHeight + 'px';
    } else {
      content.style.height = '0';
    }
  }
}

// 初始化
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new ProductDetailTabs());
} else {
  new ProductDetailTabs();
}

// 初始化 FAQ 组件
document.addEventListener('DOMContentLoaded', () => {
  new FAQBlock();
}); 