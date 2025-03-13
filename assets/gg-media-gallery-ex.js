class MediaGalleryEx extends HTMLElement {
  constructor() {
    super();
    this.mediaItems = this.querySelectorAll('.media-item');
    this.currentColor = this.dataset.currentColor;
    this.hasColorVariant = this.dataset.hasColorVariant === 'true';
    this.isMobile = window.innerWidth <= 990;

    // 为每个媒体项添加媒体类型标记
    this.mediaItems.forEach(item => {
      const mediaContainer = item.querySelector('.media-type-video, .media-type-external_video, .media-type-model, .media-type-image');
      if (mediaContainer) {
        const mediaType = mediaContainer.classList[1].split('-')[2];
        item.setAttribute('data-media-type', mediaType);
      }
    });

    // 优化视频和3D模型在移动端的显示
    this.optimizeNonImageMedia();

    // 只在有颜色变体时初始化颜色筛选
    if (this.hasColorVariant) {
      this.initColorFilter();
    } else {
      // 没有颜色变体时显示所有图片
      this.showAllMedia();
    }
    
    // 添加窗口大小变化监听
    window.addEventListener('resize', this.handleResize.bind(this));

    // 初始化移动端图片放大功能
    if (this.isMobile) {
      this.initMobileZoom();
    }
  }

  // 显示所有媒体项
  showAllMedia() {
    this.mediaItems.forEach(item => {
      item.style.display = 'block';
      item.classList.add('is-active');
    });
  }

  // 处理窗口大小变化
  handleResize() {
    const wasMobile = this.isMobile;
    this.isMobile = window.innerWidth <= 990;
    
    // 如果设备类型发生变化，重新应用布局
    if (wasMobile !== this.isMobile) {
      if (this.hasColorVariant) {
        this.filterMediaByColor(this.currentColor);
      }
      this.optimizeNonImageMedia();
      
      // 根据设备类型初始化或销毁放大功能
      if (this.isMobile) {
        this.initMobileZoom();
      } else {
        this.destroyMobileZoom();
      }
    }
  }

  // 优化视频和3D模型在移动端的显示
  optimizeNonImageMedia() {
    if (!this.isMobile) return;

    // 处理视频和3D模型
    const nonImageItems = Array.from(this.mediaItems).filter(item => 
      item.getAttribute('data-media-type') === 'video' || 
      item.getAttribute('data-media-type') === 'external_video' || 
      item.getAttribute('data-media-type') === 'model'
    );

    nonImageItems.forEach(item => {
      // 确保视频和3D模型的容器高度与图片一致
      const previewImage = item.querySelector('.product__media img');
      if (previewImage) {
        const aspectRatio = previewImage.naturalHeight / previewImage.naturalWidth;
        item.style.aspectRatio = `1 / ${aspectRatio}`;
      }
    });
  }

  initColorFilter() {
    // 改为监听标准的change事件
    document.addEventListener('change', (event) => {
      const radioInput = event.target.closest('input[type="radio"][name*="Color"], input[type="radio"][name*="Colour"], input[type="radio"][name*="颜色"]');
      if (radioInput && radioInput.checked) {
        const newColor = radioInput.value;
        this.filterMediaByColor(newColor);
      }
    });

    // 添加变体选择变化监听（兼容Shopify标准事件）
    document.addEventListener('variant:change', (event) => {
      if (!this.hasColorVariant) return;
      const newColor = event.detail.variant.option1;
      this.filterMediaByColor(newColor);
    });

    // 初始筛选
    if (this.currentColor) {
      this.filterMediaByColor(this.currentColor);
    }
  }

  filterMediaByColor(color) {
    if (!color || !this.hasColorVariant) return;
    this.currentColor = color;

    // 筛选主图
    let firstVisibleItem = null;
    this.mediaItems.forEach(item => {
      const itemColor = item.dataset.mediaColor;
      const isMatch = itemColor === color;
      
      // 移动端和桌面端使用不同的显示逻辑
      if (this.isMobile) {
        // 移动端：隐藏不匹配的项目，显示匹配的项目
        item.style.display = isMatch ? 'block' : 'none';
        item.classList.toggle('is-active', isMatch);
      } else {
        // 桌面端：保持原有逻辑
        item.style.display = isMatch ? 'block' : 'none';
        item.classList.toggle('is-active', isMatch);
      }
      
      if (isMatch && !firstVisibleItem) {
        firstVisibleItem = item;
      }
    });

    // 激活第一个匹配项
    if (firstVisibleItem) {
      this.mediaItems.forEach(i => i.classList.remove('is-active'));
      firstVisibleItem.classList.add('is-active');
      
      // 滚动到可见区域
      if (this.isMobile) {
        // 移动端使用水平滚动
        firstVisibleItem.scrollIntoView({
          behavior: 'smooth',
          inline: 'start'
        });
      } else {
        // 桌面端使用垂直滚动
        firstVisibleItem.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest'
        });
      }
    }

    // 优化视频和3D模型
    if (this.isMobile) {
      this.optimizeNonImageMedia();
    }
  }

  // 初始化移动端图片放大功能
  initMobileZoom() {
    // 创建放大查看层
    this.createZoomOverlay();
    
    // 为图片类型的媒体项添加点击事件
    this.mediaItems.forEach((item, index) => {
      if (item.getAttribute('data-media-type') === 'image') {
        const imageContainer = item.querySelector('[data-zoom-container]');
        if (imageContainer) {
          // 移除可能已存在的事件监听器
          imageContainer.removeEventListener('click', this.handleImageClick);
          
          // 添加点击事件，传递当前索引
          imageContainer.addEventListener('click', (e) => this.handleImageClick(e, index));
          
          // 添加视觉提示，表明图片可点击放大
          imageContainer.classList.add('mobile-zoomable');
        }
      }
    });
  }
  
  // 销毁移动端图片放大功能
  destroyMobileZoom() {
    // 移除点击事件
    this.mediaItems.forEach(item => {
      if (item.getAttribute('data-media-type') === 'image') {
        const imageContainer = item.querySelector('[data-zoom-container]');
        if (imageContainer) {
          imageContainer.removeEventListener('click', this.handleImageClick);
          imageContainer.classList.remove('mobile-zoomable');
        }
      }
    });
    
    // 移除放大查看层
    if (this.zoomOverlay) {
      document.body.removeChild(this.zoomOverlay);
      this.zoomOverlay = null;
    }
  }
  
  // 创建放大查看层
  createZoomOverlay() {
    // 如果已存在，则先移除
    if (this.zoomOverlay) {
      document.body.removeChild(this.zoomOverlay);
    }
    
    // 创建放大查看层
    this.zoomOverlay = document.createElement('div');
    this.zoomOverlay.className = 'mobile-zoom-overlay';
    this.zoomOverlay.style.display = 'none';
    
    // 创建返回按钮
    const backButton = document.createElement('button');
    backButton.className = 'mobile-zoom-back';
    backButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>';
    backButton.addEventListener('click', () => this.closeZoomOverlay());
    
    // 创建图片计数指示器
    this.zoomCounter = document.createElement('div');
    this.zoomCounter.className = 'mobile-zoom-counter';
    
    // 创建图片容器
    this.zoomSlider = document.createElement('div');
    this.zoomSlider.className = 'mobile-zoom-slider';
    
    // 添加到DOM
    this.zoomOverlay.appendChild(backButton);
    this.zoomOverlay.appendChild(this.zoomCounter);
    this.zoomOverlay.appendChild(this.zoomSlider);
    document.body.appendChild(this.zoomOverlay);
    
    // 初始化触摸滑动
    this.initTouchSwipe();
  }
  
  // 处理图片点击事件
  handleImageClick(event, index) {
    // 阻止事件冒泡
    event.preventDefault();
    event.stopPropagation();
    
    // 获取当前可见的图片项（根据颜色筛选）
    const visibleItems = Array.from(this.mediaItems).filter(item => 
      item.style.display !== 'none' && 
      item.getAttribute('data-media-type') === 'image'
    );
    
    // 清空滑动容器
    this.zoomSlider.innerHTML = '';
    
    // 为每个可见图片创建放大视图
    visibleItems.forEach((item, i) => {
      const img = item.querySelector('img');
      if (img) {
        const slide = document.createElement('div');
        slide.className = 'mobile-zoom-slide';
        slide.style.transform = `translateX(${i * 100}%)`;
        
        // 创建放大的图片元素
        const zoomImg = document.createElement('img');
        // 使用更高质量的图片源（如果可用）
        const highResSrc = img.getAttribute('data-high-res-src') || img.src;
        zoomImg.src = highResSrc;
        zoomImg.alt = img.alt;
        
        // 添加到滑动容器
        slide.appendChild(zoomImg);
        this.zoomSlider.appendChild(slide);
      }
    });
    
    // 显示放大层
    this.zoomOverlay.style.display = 'block';
    document.body.style.overflow = 'hidden'; // 防止背景滚动
    
    // 滚动到当前点击的图片
    const clickedItemIndex = visibleItems.findIndex(item => 
      item.dataset.mediaId === this.mediaItems[index].dataset.mediaId
    );
    
    if (clickedItemIndex !== -1) {
      this.currentSlideIndex = clickedItemIndex;
      
      // 立即设置位置，不使用动画
      this.showSlide(clickedItemIndex);
      // 更新计数指示器
      this.updateCounter(clickedItemIndex + 1, visibleItems.length);
    }
  }
  
  // 显示指定幻灯片
  showSlide(index) {
    const slides = this.zoomSlider.querySelectorAll('.mobile-zoom-slide');
    slides.forEach((slide, i) => {
      slide.style.transform = `translateX(${(i - index) * 100}%)`;
    });
  }
  
  // 更新计数指示器
  updateCounter(current, total) {
    if (this.zoomCounter) {
      this.zoomCounter.textContent = `${current}/${total}`;
    }
  }
  
  // 关闭放大查看层
  closeZoomOverlay() {
    if (this.zoomOverlay) {
      this.zoomOverlay.style.display = 'none';
      document.body.style.overflow = ''; // 恢复背景滚动
    }
  }
  
  // 初始化触摸滑动
  initTouchSwipe() {
    // 触摸相关变量
    let startX, startY, distX, distY;
    let threshold = 20; // 降低滑动阈值
    let restraint = 100; // 水平滑动限制
    let isSwiping = false; // 是否正在滑动中
    let isAnimating = false; // 是否正在动画中
    let currentTranslate = 0; // 当前偏移量
    
    // 触摸开始
    this.zoomSlider.addEventListener('touchstart', (e) => {
      // 如果正在动画中，不处理新的触摸事件
      if (isAnimating) return;
      
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      isSwiping = false;
      
      // 记录当前偏移量
      const slides = this.zoomSlider.querySelectorAll('.mobile-zoom-slide');
      if (slides.length > 0) {
        const transform = slides[0].style.transform;
        const match = transform.match(/translateX\(([-\d.]+)%\)/);
        if (match) {
          currentTranslate = parseFloat(match[1]);
        }
      }
    }, { passive: false });
    
    // 触摸移动
    this.zoomSlider.addEventListener('touchmove', (e) => {
      // 如果正在动画中，不处理移动事件
      if (isAnimating) return;
      
      const moveX = e.touches[0].clientX;
      const moveY = e.touches[0].clientY;
      const moveDistX = moveX - startX;
      const moveDistY = moveY - startY;
      
      // 如果水平移动距离足够大且大于垂直移动，则认为是有效的水平滑动
      if (Math.abs(moveDistX) >= threshold && Math.abs(moveDistX) > Math.abs(moveDistY)) {
        e.preventDefault(); // 阻止默认行为
        isSwiping = true;
        
        // 计算新的偏移量
        const slides = this.zoomSlider.querySelectorAll('.mobile-zoom-slide');
        const slideCount = slides.length;
        
        // 限制滑动范围
        if ((this.currentSlideIndex === 0 && moveDistX > 0) || 
            (this.currentSlideIndex === slideCount - 1 && moveDistX < 0)) {
          // 第一张向右滑或最后一张向左滑，减少滑动效果
          moveDistX = moveDistX * 0.2;
        }
        
        // 移除过渡效果，实现实时跟随
        slides.forEach(slide => {
          slide.style.transition = 'none';
        });
        
        // 应用临时偏移
        const percentMove = (moveDistX / this.zoomSlider.offsetWidth) * 100;
        slides.forEach((slide, i) => {
          const baseTranslate = (i - this.currentSlideIndex) * 100;
          slide.style.transform = `translateX(${baseTranslate + percentMove}%)`;
        });
      }
    }, { passive: false });
    
    // 触摸结束
    this.zoomSlider.addEventListener('touchend', (e) => {
      // 如果正在动画中，不处理触摸结束事件
      if (isAnimating) return;
      
      distX = e.changedTouches[0].clientX - startX;
      distY = e.changedTouches[0].clientY - startY;
      
      // 确认是水平滑动而非垂直滑动
      if (isSwiping && Math.abs(distX) >= threshold && Math.abs(distX) > Math.abs(distY)) {
        const slides = this.zoomSlider.querySelectorAll('.mobile-zoom-slide');
        const slideCount = slides.length;
        
        // 标记正在动画中
        isAnimating = true;
        
        // 恢复过渡效果
        slides.forEach(slide => {
          slide.style.transition = '';
        });
        
        // 计算滑动比例
        const slideWidth = this.zoomSlider.offsetWidth;
        const slideThreshold = slideWidth * 0.2; // 20%的宽度作为切换阈值
        
        // 向左滑动 -> 下一张
        if (distX < -slideThreshold && this.currentSlideIndex < slideCount - 1) {
          this.currentSlideIndex++;
        }
        // 向右滑动 -> 上一张
        else if (distX > slideThreshold && this.currentSlideIndex > 0) {
          this.currentSlideIndex--;
        }
        
        // 显示当前幻灯片
        this.showSlide(this.currentSlideIndex);
        
        // 更新计数指示器
        this.updateCounter(this.currentSlideIndex + 1, slideCount);
        
        // 动画完成后重置状态
        setTimeout(() => {
          isAnimating = false;
          isSwiping = false;
        }, 200); // 给足够的时间完成过渡动画
      } else {
        // 不是有效的滑动，恢复原位
        this.showSlide(this.currentSlideIndex);
        isSwiping = false;
      }
    }, { passive: false });
    
    // 移除滚动事件监听，因为我们不再使用滚动
    this.zoomSlider.removeEventListener('scroll', this.handleScroll);
  }

  // 滚动到指定幻灯片
  scrollToSlide(index, smooth = false) {
    // 直接使用showSlide方法
    this.showSlide(index);
  }
  
  // 自定义滚动动画，避免浏览器内置的回弹效果
  animateScroll(index) {
    // 直接使用showSlide方法
    this.showSlide(index);
  }
}

customElements.define('gg-media-gallery-ex', MediaGalleryEx); 