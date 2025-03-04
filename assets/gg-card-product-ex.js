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
    console.log('ProductCardEx initializing...'); 
    
    // 使用 this 而不是 document 来限制查找范围
    // if (!this.querySelector('.card-wrapper')) {
    //   console.log('Card wrapper not found'); 
    //   return;
    // }

    // 只在当前组件内查找元素
    this.mainImage = this.querySelector('[data-main-image]');
    this.colorSwatches = this.querySelectorAll('.color-swatch');
    
    console.log('Main image:', this.mainImage);
    console.log('Color swatches:', this.colorSwatches);

    if (!this.colorSwatches.length || !this.mainImage) {
      console.log('Required elements not found');
      return;
    }

    this.originalImage = {
      src: this.mainImage.src,
      srcset: this.mainImage.srcset
    };

    this.setupEventListeners();
  }

  setupEventListeners() {
    console.log('Setting up event listeners...'); // 调试日志
    
    this.colorSwatches.forEach(swatch => {

      // // 鼠标悬停事件
      // swatch.addEventListener('mouseenter', this.handleMouseEnter.bind(this));
      // swatch.addEventListener('mouseleave', this.handleMouseLeave.bind(this));

      // 只保留点击事件，移除鼠标移入移出事件
      swatch.addEventListener('click', this.handleClick.bind(this));
    });
  }

  handleClick(event) {
    event.preventDefault();
    event.stopPropagation();

    const swatch = event.currentTarget;
    
    // 移除其他色块的激活状态
    this.colorSwatches.forEach(s => {
      s.classList.remove('color-swatch--active');
    });
    
    // 为当前点击的色块添加激活状态
    swatch.classList.add('color-swatch--active');
    
    const variantImage = swatch.dataset.variantImage;
    if (!variantImage) return;
    
    // 获取基础URL和版本号
    const baseUrl = variantImage.split('?')[0];
    const version = variantImage.match(/\?v=\d+/)?.[0] || '';
    
    // 构建新的 srcset
    const widths = [165, 360, 533, 720, 940, 1066];
    const newSrcset = widths
      .map(width => `${baseUrl}${version}&width=${width} ${width}w`)
      .join(',');
    
    // 更新图片
    this.mainImage.srcset = newSrcset;
    this.mainImage.src = `${baseUrl}${version}&width=533`;
    this.mainImage.sizes = "(min-width: 1200px) 267px, (min-width: 990px) calc((100vw - 130px) / 4), (min-width: 750px) calc((100vw - 120px) / 3), calc((100vw - 35px) / 2)";
  }

  /* 注释掉这两个方法
  updateImage(imageUrl) {
    if (!this.mainImage || !imageUrl) return;
    console.log('Updating image to:', imageUrl);

    // 获取基础URL和版本号
    const baseUrl = imageUrl.split('?')[0];
    const version = imageUrl.match(/\?v=\d+/)?.[0] || '';

    console.log('baseUrl:', baseUrl);
    // 构建新的 srcset
    const widths = [165, 360, 533, 720, 940, 1066];
    const newSrcset = widths
    .map(width => `${baseUrl}${version}&width=${width} ${width}w`)
    .join(',');

    this.mainImage.srcset = newSrcset;
    this.mainImage.src = `${baseUrl}${version}&width=533`;
  }

  resetImage() {
    if (!this.mainImage) return;
    console.log('Resetting image');
    this.mainImage.src = this.originalImage.src;
    this.mainImage.srcset = this.originalImage.srcset;
  }
  */
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