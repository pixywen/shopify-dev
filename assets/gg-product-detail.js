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
    const configSpeed = parseInt(container.dataset.autoplaySpeed);
    this.speed = configSpeed >= 2 && configSpeed <= 10 ? configSpeed : 3;
    
    this.isHovered = false;
    this.interval = null;
    this.position = 0;
    this.animationFrame = null;
    this.isPaused = false;
    
    // 检测是否为触屏设备
    this.isTouchDevice = this.checkTouchDevice();
    
    // 拖拽相关变量
    this.isDragging = false;
    this.startX = 0;
    this.startPosition = 0;
    this.currentTranslate = 0;
    this.prevTranslate = 0;
    this.dragDistance = 0;
    
    this.animate = this.animate.bind(this);
    this.handleDragStart = this.handleDragStart.bind(this);
    this.handleDragMove = this.handleDragMove.bind(this);
    this.handleDragEnd = this.handleDragEnd.bind(this);
    
    this.init();
  }

  // 检测触屏设备的方法
  checkTouchDevice() {
    // 方法1: 检查是否支持触摸事件
    const hasTouchEvent = 'ontouchstart' in window || 
                         navigator.maxTouchPoints > 0 ||
                         navigator.msMaxTouchPoints > 0;
    
    // 方法2: 检查是否为移动设备的浏览器
    const isMobileBrowser = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    // 方法3: 检查是否支持指针事件，且为触摸类型
    const hasCoarsePointer = window.matchMedia('(pointer: coarse)').matches;
    
    return hasTouchEvent || isMobileBrowser || hasCoarsePointer;
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
    
    // 只在非触屏设备上添加hover事件
    if (!this.isTouchDevice) {
      this.track.addEventListener('mouseover', (e) => {
        // 如果正在拖拽，不触发hover效果
        if (this.isDragging) return;
        
        const item = e.target.closest('.carousel-item');
        if (item) {
          this.isHovered = true;
          this.track.querySelectorAll('.carousel-item').forEach(i => i.classList.remove('hovered'));
          item.classList.add('hovered');
        }
      });
      
      this.track.addEventListener('mouseout', (e) => {
        // 如果正在拖拽，不触发hover效果
        if (this.isDragging) return;
        
        const item = e.target.closest('.carousel-item');
        const relatedItem = e.relatedTarget?.closest('.carousel-item');
        
        if (item && !relatedItem) {
          this.isHovered = false;
          item.classList.remove('hovered');
        }
      });
    }
    
    // 添加拖拽事件监听
    this.addDragListeners();
    
    this.startAnimation();
  }

  // 添加拖拽事件监听
  addDragListeners() {
    // 触摸事件
    this.track.addEventListener('touchstart', this.handleDragStart, { passive: false });
    this.track.addEventListener('touchmove', this.handleDragMove, { passive: false });
    this.track.addEventListener('touchend', this.handleDragEnd);
    
    // 鼠标事件 - 对所有设备都添加，但在触屏设备上会被触摸事件覆盖
    this.track.addEventListener('mousedown', this.handleDragStart);
    window.addEventListener('mousemove', this.handleDragMove);
    window.addEventListener('mouseup', this.handleDragEnd);
    // 添加鼠标离开窗口事件，防止拖拽未完成就离开窗口
    window.addEventListener('mouseleave', this.handleDragEnd);
  }

  // 拖拽开始
  handleDragStart(e) {
    // 只处理鼠标左键点击或触摸事件
    if (e.type === 'mousedown' && e.button !== 0) return;
    
    this.isPaused = true;
    this.isDragging = true;
    
    // 记录开始位置
    this.startX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
    this.startPosition = this.position;
    
    // 添加拖拽中的样式
    this.track.style.cursor = 'grabbing';
    this.track.style.transition = 'none';
    
    // 移除所有hover效果
    this.track.querySelectorAll('.carousel-item').forEach(item => {
      item.classList.remove('hovered');
    });
    
    // 阻止默认行为，防止页面滚动和文本选择
    e.preventDefault();
    
    // 阻止事件冒泡，防止触发其他事件
    e.stopPropagation();
  }

  // 拖拽移动
  handleDragMove(e) {
    if (!this.isDragging) return;
    
    // 计算移动距离
    const currentX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
    this.dragDistance = currentX - this.startX;
    
    // 添加阻尼效果，使拖拽超出边界时有阻力感
    const itemWidth = this.items[0].offsetWidth;
    const totalWidth = itemWidth * this.items.length;
    const maxDistance = totalWidth / 2;
    
    // 如果拖拽距离超过最大距离，添加阻尼效果
    if (Math.abs(this.dragDistance) > maxDistance) {
      const overDistance = Math.abs(this.dragDistance) - maxDistance;
      const damping = 0.3; // 阻尼系数
      const direction = this.dragDistance > 0 ? 1 : -1;
      this.dragDistance = direction * (maxDistance + overDistance * damping);
    }
    
    // 更新位置
    this.position = this.startPosition + this.dragDistance;
    this.track.style.transform = `translateX(${this.position}px)`;
    
    // 阻止默认行为，防止页面滚动
    e.preventDefault();
  }

  // 拖拽结束
  handleDragEnd() {
    if (!this.isDragging) return;
    
    this.isDragging = false;
    
    // 恢复样式
    this.track.style.cursor = '';
    this.track.style.transition = 'transform 0.3s ease';
    
    // 如果拖拽距离足够大，切换到下一个/上一个
    const itemWidth = this.items[0].offsetWidth;
    const moveThreshold = itemWidth / 4; // 需要拖动至少1/4宽度才触发切换
    
    if (Math.abs(this.dragDistance) > moveThreshold) {
      // 向左拖动，显示下一个
      if (this.dragDistance < 0) {
        this.position = this.startPosition - itemWidth;
      } 
      // 向右拖动，显示上一个
      else {
        this.position = this.startPosition + itemWidth;
      }
    } else {
      // 拖动距离不够，回到原位
      this.position = this.startPosition;
    }
    
    // 应用最终位置
    this.track.style.transform = `translateX(${this.position}px)`;
    
    // 检查是否需要重置位置（无缝循环）
    const totalWidth = itemWidth * this.items.length;
    setTimeout(() => {
      this.track.style.transition = 'none';
      if (Math.abs(this.position) >= totalWidth * 2) {
        this.position = -totalWidth;
      } else if (Math.abs(this.position) < totalWidth) {
        this.position = -totalWidth * 2 + Math.abs(totalWidth - Math.abs(this.position));
      }
      this.track.style.transform = `translateX(${this.position}px)`;
      
      // 恢复过渡效果
      setTimeout(() => {
        this.track.style.transition = 'transform 0.3s ease';
        // 拖拽结束后延迟恢复自动滚动
        this.isPaused = false;
      }, 50);
    }, 300);
    
    // 重置拖拽距离
    this.dragDistance = 0;
  }

  startAnimation() {
    // 清除可能存在的旧定时器
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
    
    this.animate();
  }

  animate() {
    // 在触屏设备上忽略hover状态，但在拖拽时暂停动画
    if ((!this.isDragging) && ((!this.isTouchDevice && !this.isHovered) || (this.isTouchDevice && !this.isPaused))) {
      const baseSpeed = 0.3;
      const speedMultiplier = 10 - this.speed;
      const speed = baseSpeed * speedMultiplier;
      
      this.position -= speed;
      
      const itemWidth = this.items[0].offsetWidth;
      const totalWidth = itemWidth * this.items.length;
      
      // 无缝循环逻辑
      if (Math.abs(this.position) >= totalWidth * 2) {
        // 避免过渡动画
        this.track.style.transition = 'none';
        this.position = -totalWidth;
        
        // 强制重绘以应用无过渡的变换
        this.track.offsetHeight;
        
        // 恢复过渡效果
        setTimeout(() => {
          this.track.style.transition = 'transform 0.3s ease';
        }, 20);
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
    if (!this.isTouchDevice) {
      this.track.removeEventListener('mouseover');
      this.track.removeEventListener('mouseout');
    }
    
    // 移除拖拽事件监听器
    this.track.removeEventListener('touchstart', this.handleDragStart);
    this.track.removeEventListener('touchmove', this.handleDragMove);
    this.track.removeEventListener('touchend', this.handleDragEnd);
    this.track.removeEventListener('mousedown', this.handleDragStart);
    window.removeEventListener('mousemove', this.handleDragMove);
    window.removeEventListener('mouseup', this.handleDragEnd);
    window.removeEventListener('mouseleave', this.handleDragEnd);
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