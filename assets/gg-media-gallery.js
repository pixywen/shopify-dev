if (!customElements.get('media-gallery')) {
    customElements.define(
      'gg-media-gallery',
      class MediaGallery extends HTMLElement {
        constructor() {
          super();
          this.elements = {
            liveRegion: this.querySelector('[id^="GalleryStatus"]'),
            viewer: this.querySelector('[id^="GalleryViewer"]'),
            thumbnails: this.querySelector('[id^="GalleryThumbnails"]'),
          };
          this.mql = window.matchMedia('(min-width: 750px)');
          
          // 获取第一个颜色选项
          const firstColorInput = document.querySelector('input[type="radio"][name*="颜色"]');
          if (firstColorInput) {
            this.currentColor = firstColorInput.value;
            console.log('Initial color set to:', this.currentColor);
            // 立即进行筛选
            this.filterMediaByColor(this.currentColor);
          }
          
          this.initVariantSelector();
          
          if (!this.elements.thumbnails) return;
  
          this.elements.viewer.addEventListener('slideChanged', debounce(this.onSlideChanged.bind(this), 500));
          this.elements.thumbnails.querySelectorAll('[data-target]').forEach((mediaToSwitch) => {
            mediaToSwitch
              .querySelector('button')
              .addEventListener('click', this.setActiveMedia.bind(this, mediaToSwitch.dataset.target, false));
          });
          if (this.dataset.desktopLayout.includes('thumbnail') && this.mql.matches) this.removeListSemantic();
        }
  
        initVariantSelector() {
          console.log('Initializing variant selector');
          
          // 使用 MutationObserver 来监听变体选择器的变化
          const observer = new MutationObserver((mutations) => {
            // 只关注变体选择器内的变化
            mutations.forEach(mutation => {
              // 检查变化是否来自颜色选择器
              if (mutation.target.closest('variant-selects') && 
                  mutation.attributeName === 'checked' && 
                  mutation.target.name?.includes('颜色')) {
                const selectedInput = mutation.target;
                if (selectedInput && selectedInput.checked) {
                  const selectedColor = selectedInput.value;
                  console.log('Color changed to:', selectedColor);
                  this.filterMediaByColor(selectedColor);
                }
              }
            });
          });
  
          // 只监听变体选择器区域
          const variantSelects = document.querySelector('variant-selects');
          if (variantSelects) {
            observer.observe(variantSelects, {
              subtree: true,
              attributes: true,
              attributeFilter: ['checked']
            });
          }
  
          // 监听颜色选择器的点击事件
          document.addEventListener('click', (event) => {
            const radioInput = event.target.closest('input[type="radio"]');
            if (radioInput && radioInput.name?.includes('颜色')) {
              console.log('Color radio clicked:', radioInput.value);
              this.filterMediaByColor(radioInput.value);
            }
          });
  
          // 监听表单变化
          const form = document.querySelector('form[action="/cart/add"]');
          if (form) {
            form.addEventListener('change', (event) => {
              if (event.target.type === 'radio' && event.target.name?.includes('颜色')) {
                console.log('Form color changed:', event.target.value);
                this.filterMediaByColor(event.target.value);
              }
            });
          }
  
          // 初始化时也检查一次当前选中的颜色
          const initialInput = document.querySelector('input[type="radio"][name*="颜色"]:checked');
          if (initialInput) {
            console.log('Initial color:', initialInput.value);
            this.filterMediaByColor(initialInput.value);
          }
        }
  
        onSlideChanged(event) {
          const thumbnail = this.elements.thumbnails.querySelector(
            `[data-target="${event.detail.currentElement.dataset.mediaId}"]`
          );
          this.setActiveThumbnail(thumbnail);
        }
  
        setActiveMedia(mediaId, prepend) {
          const activeMedia =
            this.elements.viewer.querySelector(`[data-media-id="${mediaId}"]`) ||
            this.elements.viewer.querySelector('[data-media-id]');
          if (!activeMedia) {
            return;
          }
          this.elements.viewer.querySelectorAll('[data-media-id]').forEach((element) => {
            element.classList.remove('is-active');
          });
          activeMedia?.classList?.add('is-active');
  
          if (prepend) {
            activeMedia.parentElement.firstChild !== activeMedia && activeMedia.parentElement.prepend(activeMedia);
  
            if (this.elements.thumbnails) {
              const activeThumbnail = this.elements.thumbnails.querySelector(`[data-target="${mediaId}"]`);
              activeThumbnail.parentElement.firstChild !== activeThumbnail && activeThumbnail.parentElement.prepend(activeThumbnail);
            }
  
            if (this.elements.viewer.slider) this.elements.viewer.resetPages();
          }
  
          this.preventStickyHeader();
          window.setTimeout(() => {
            if (!this.mql.matches || this.elements.thumbnails) {
              activeMedia.parentElement.scrollTo({ left: activeMedia.offsetLeft });
            }
            const activeMediaRect = activeMedia.getBoundingClientRect();
            // Don't scroll if the image is already in view
            if (activeMediaRect.top > -0.5) return;
            const top = activeMediaRect.top + window.scrollY;
            window.scrollTo({ top: top, behavior: 'smooth' });
          });
          this.playActiveMedia(activeMedia);
  
          if (!this.elements.thumbnails) return;
          const activeThumbnail = this.elements.thumbnails.querySelector(`[data-target="${mediaId}"]`);
          this.setActiveThumbnail(activeThumbnail);
          this.announceLiveRegion(activeMedia, activeThumbnail.dataset.mediaPosition);
        }
  
        setActiveThumbnail(thumbnail) {
          if (!this.elements.thumbnails || !thumbnail) return;
  
          this.elements.thumbnails
            .querySelectorAll('button')
            .forEach((element) => element.removeAttribute('aria-current'));
          thumbnail.querySelector('button').setAttribute('aria-current', true);
          if (this.elements.thumbnails.isSlideVisible(thumbnail, 10)) return;
  
          this.elements.thumbnails.slider.scrollTo({ left: thumbnail.offsetLeft });
        }
  
        announceLiveRegion(activeItem, position) {
          const image = activeItem.querySelector('.product__modal-opener--image img');
          if (!image) return;
          image.onload = () => {
            this.elements.liveRegion.setAttribute('aria-hidden', false);
            this.elements.liveRegion.innerHTML = window.accessibilityStrings.imageAvailable.replace('[index]', position);
            setTimeout(() => {
              this.elements.liveRegion.setAttribute('aria-hidden', true);
            }, 2000);
          };
          image.src = image.src;
        }
  
        playActiveMedia(activeItem) {
          window.pauseAllMedia();
          const deferredMedia = activeItem.querySelector('.deferred-media');
          if (deferredMedia) deferredMedia.loadContent(false);
        }
  
        preventStickyHeader() {
          this.stickyHeader = this.stickyHeader || document.querySelector('sticky-header');
          if (!this.stickyHeader) return;
          this.stickyHeader.dispatchEvent(new Event('preventHeaderReveal'));
        }
  
        removeListSemantic() {
          if (!this.elements.viewer.slider) return;
          this.elements.viewer.slider.setAttribute('role', 'presentation');
          this.elements.viewer.sliderItems.forEach((slide) => slide.setAttribute('role', 'presentation'));
        }
  
        filterMediaByColor(color) {
          if(!color) return;
          
          const allMediaItems = this.elements.viewer.querySelectorAll('.product__media-item');
          let firstMatchFound = false;
          
          allMediaItems.forEach(item => {
            const image = item.querySelector('img');
            if(!image) return;
            
            const altText = image.alt || '';
            const mediaColor = altText.split('|')[0]; // 获取颜色部分
            
            if(mediaColor === color) {
              item.style.display = '';
              if(!firstMatchFound) {
                allMediaItems.forEach(i => i.classList.remove('is-active')); // 先移除所有活动状态
                item.classList.add('is-active');
                firstMatchFound = true;
              }
            } else {
              item.style.display = 'none';
              item.classList.remove('is-active');
            }
          });
  
          // 筛选缩略图
          if(this.elements.thumbnails) {
            const allThumbnails = this.elements.thumbnails.querySelectorAll('.thumbnail-list__item');
            allThumbnails.forEach(thumb => {
              const thumbImage = thumb.querySelector('img');
              if(!thumbImage) return;
              
              const thumbAltText = thumbImage.alt || '';
              const thumbColor = thumbAltText.split('|')[0];
              
              thumb.style.display = thumbColor === color ? '' : 'none';
            });
          }
  
          this.updateSlideCounter();
          
          // 触发滑块更新
          if(this.elements.viewer.slider) {
            // 检查 slider 实例和方法是否存在
            const sliderComponent = this.elements.viewer.querySelector('slider-component');
            if(sliderComponent) {
              // 尝试重置滑块
              try {
                if(typeof sliderComponent.resetPages === 'function') {
                  sliderComponent.resetPages();
                } else if(sliderComponent.slider && typeof sliderComponent.slider.resetPages === 'function') {
                  sliderComponent.slider.resetPages();
                } else {
                  // 如果没有 resetPages 方法，尝试其他方式重置滑块
                  const firstSlide = this.elements.viewer.querySelector('.product__media-item[style="display: "]');
                  if(firstSlide) {
                    firstSlide.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
                  }
                }
              } catch(e) {
                console.warn('Failed to reset slider:', e);
              }
            }
          }
        }
  
        updateSlideCounter() {
          const counter = this.elements.viewer.querySelector('.slider-counter');
          if(!counter) return;
          
          const visibleSlides = Array.from(this.elements.viewer.querySelectorAll('.product__media-item')).filter(
            item => item.style.display !== 'none'
          ).length;
          
          const total = counter.querySelector('.slider-counter--total');
          if(total) {
            total.textContent = visibleSlides;
          }
          
          // 更新当前计数
          const current = counter.querySelector('.slider-counter--current');
          if(current) {
            const activeSlide = this.elements.viewer.querySelector('.product__media-item.is-active');
            if(activeSlide) {
              const visibleSlides = Array.from(this.elements.viewer.querySelectorAll('.product__media-item'))
                .filter(item => item.style.display !== 'none');
              const activeIndex = visibleSlides.indexOf(activeSlide) + 1;
              current.textContent = activeIndex;
            }
          }
        }
      }
    );
  }
  