class MediaGalleryEx extends HTMLElement {
  constructor() {
    super();
    this.mediaItems = this.querySelectorAll('.media-item');
    this.currentColor = this.dataset.currentColor;

    this.initColorFilter();
  }

  initColorFilter() {
    // 改为监听标准的change事件
    document.addEventListener('change', (event) => {
      const radioInput = event.target.closest('input[type="radio"][name*="颜色"]');
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

    // 筛选主图
    let firstVisibleItem = null;
    this.mediaItems.forEach(item => {
      const itemColor = item.dataset.mediaColor;
      const isMatch = itemColor === color;
      
      item.style.display = isMatch ? 'block' : 'none';
      item.classList.toggle('is-active', isMatch);
      
      if (isMatch && !firstVisibleItem) {
        firstVisibleItem = item;
      }
    });

    // 激活第一个匹配项
    if (firstVisibleItem) {
      this.mediaItems.forEach(i => i.classList.remove('is-active'));
      firstVisibleItem.classList.add('is-active');
      
      // 滚动到可见区域
      firstVisibleItem.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest'
      });
    }
  }
}

customElements.define('gg-media-gallery-ex', MediaGalleryEx); 