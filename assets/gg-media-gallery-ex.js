class MediaGalleryEx extends HTMLElement {
  constructor() {
    super();
    this.mediaItems = this.querySelectorAll('.media-item');
    this.currentColor = this.dataset.currentColor;
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

    this.initColorFilter();
    
    // 添加窗口大小变化监听
    window.addEventListener('resize', this.handleResize.bind(this));
  }

  // 处理窗口大小变化
  handleResize() {
    const wasMobile = this.isMobile;
    this.isMobile = window.innerWidth <= 990;
    
    // 如果设备类型发生变化，重新应用颜色筛选和优化
    if (wasMobile !== this.isMobile) {
      this.filterMediaByColor(this.currentColor);
      this.optimizeNonImageMedia();
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
      const newColor = event.detail.variant.option1;
      this.filterMediaByColor(newColor);
    });

    // 初始筛选
    this.filterMediaByColor(this.currentColor);
  }

  filterMediaByColor(color) {
    if (!color) return;
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
}

customElements.define('gg-media-gallery-ex', MediaGalleryEx); 