class ProductCardEx extends HTMLElement {
  constructor() {
    super();
    // 等待 DOM 完全加载
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.init());
    } else {
      this.init();
    }
  }

  init() {
    console.log('ProductCardEx initializing...'); // 添加调试日志
    
    // 使用 document 查找元素，因为组件可能还未挂载
    const cardWrapper = document.querySelector('.card-wrapper');
    if (!cardWrapper) {
      console.log('Card wrapper not found'); // 调试日志
      return;
    }

    this.mainImage = cardWrapper.querySelector('[data-main-image]');
    this.colorSwatches = cardWrapper.querySelectorAll('.color-swatch');
    
    console.log('Main image:', this.mainImage); // 调试日志
    console.log('Color swatches:', this.colorSwatches); // 调试日志

    if (!this.colorSwatches.length || !this.mainImage) {
      console.log('Required elements not found'); // 调试日志
      return;
    }

    // 保存初始状态
    this.originalImage = {
      src: this.mainImage.src,
      srcset: this.mainImage.srcset
    };

    this.setupEventListeners();
  }

  setupEventListeners() {
    console.log('Setting up event listeners...'); // 调试日志
    
    this.colorSwatches.forEach(swatch => {
      // 鼠标悬停事件
      swatch.addEventListener('mouseenter', this.handleMouseEnter.bind(this));
      swatch.addEventListener('mouseleave', this.handleMouseLeave.bind(this));
      swatch.addEventListener('click', this.handleClick.bind(this));
    });
  }

  handleMouseEnter(event) {
    const swatch = event.currentTarget;
    const newImage = swatch.dataset.variantImage;
    console.log('Mouse enter:', newImage); // 调试日志

    if (!newImage || !this.mainImage) return;
    this.updateImage(newImage);
  }

  handleMouseLeave(event) {
    console.log('Mouse leave'); // 调试日志
    if (!this.mainImage) return;
    this.resetImage();
  }

  handleClick(event) {
    event.preventDefault();
    event.stopPropagation();

    const swatch = event.currentTarget;
    console.log('Click:', swatch.dataset.variantImage); // 调试日志
    
    const newImage = swatch.dataset.variantImage;
    if (newImage && this.mainImage) {
      this.updateImage(newImage);
    }
  }

  updateImage(imageUrl) {
    if (!this.mainImage || !imageUrl) return;
    console.log('Updating image to:', imageUrl); // 调试日志

    // 构建新的 srcset
    const widths = [165, 360, 533, 720, 940, 1066];
    const newSrcset = widths
      .map(width => {
        const url = imageUrl.replace(/(_\d+x)?\.([^.]+)$/, `_${width}x.$2`);
        return `${url} ${width}w`;
      })
      .join(', ');

    this.mainImage.src = imageUrl;
    this.mainImage.srcset = newSrcset;
  }

  resetImage() {
    if (!this.mainImage) return;
    console.log('Resetting image'); // 调试日志
    this.mainImage.src = this.originalImage.src;
    this.mainImage.srcset = this.originalImage.srcset;
  }
}

// 确保在 DOM 加载完成后再注册组件
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    if (!customElements.get('product-card-ex')) {
      customElements.define('product-card-ex', ProductCardEx);
    }
  });
} else {
  if (!customElements.get('product-card-ex')) {
    customElements.define('product-card-ex', ProductCardEx);
  }
} 