class PhotoWall {
    constructor() {
        this.photos = [];
        this.currentPhotoIndex = -1;
        this.currentLayout = 'grid';
        this.carouselIndex = 0;
        
    // 交互控制相关属性
    this.isDragging = false;
    this.dragStart = { x: 0, y: 0 };
    this.dragOffset = { x: 0, y: 0 };
    this.zoomLevel = 1;
    this.minZoom = 0.3;
    this.maxZoom = 5;
        this.interactiveContainers = new Map();
        this.isImageDragging = false;
        this.imageDragStart = { x: 0, y: 0 };
        this.imageDragOffset = { x: 0, y: 0 };
        this.currentDraggedImage = null;
        this.carouselAutoPlay = null;
        this.carouselAutoPlayInterval = 5000; // 5秒自动播放
        
        // 可缩放布局列表
        this.ZOOMABLE_LAYOUTS = ['star', 'spiral', 'wave'];
        
        // 布局配置默认值
        this.defaultLayoutConfigs = {
            star: {
                radiusFactor: 0.3,      // 半径比例 0.1-0.5
                startAngle: 0,          // 起始角度 0-360
                direction: 1,           // 方向 1=顺时针 -1=逆时针
                itemSize: 120,          // 图片大小 60-200
                circles: 1              // 圈数 1-3
            },
            spiral: {
                angleIncrement: 0.5,    // 角度增量 0.3-1.0
                radiusGrowth: 15,       // 半径增长 10-30
                startRadius: 50,        // 起始半径 20-100
                direction: 1,           // 方向 1=顺时针 -1=逆时针
                itemSize: 80            // 图片大小 40-120
            },
            wave: {
                amplitude: 50,          // 振幅 20-100
                frequency: 0.5,         // 频率 0.2-1.0
                spacing: 120,           // 间距 80-200
                waveType: 'sine',       // 波形 sine/cosine
                itemSize: 100,          // 图片大小 60-150
                verticalOffset: 0       // 垂直偏移 -100-100
            }
        };
        
        // 当前布局配置
        this.layoutConfigs = {};
        
        this.init();
    }

    init() {
        this.loadPhotos();
        this.loadLayoutPreference();
        this.loadLayoutConfigs();
        this.bindEvents();
        this.renderPhotos();
        this.initInteractiveContainers();
        
        // 测试交互功能
        setTimeout(() => {
            this.testInteractiveFeatures();
        }, 500);
    }

    bindEvents() {
        // 文件上传相关事件
        const fileInput = document.getElementById('fileInput');
        const uploadArea = document.getElementById('uploadArea');
        const uploadBtn = document.getElementById('uploadBtn');

        // 点击上传按钮
        uploadBtn.addEventListener('click', () => {
            fileInput.click();
        });

        // 点击上传区域
        uploadArea.addEventListener('click', () => {
            fileInput.click();
        });

        // 文件选择
        fileInput.addEventListener('change', (e) => {
            this.handleFiles(e.target.files);
        });

        // 拖拽上传
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('dragover');
        });

        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('dragover');
        });

        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
            this.handleFiles(e.dataTransfer.files);
        });

        // 清空按钮
        document.getElementById('clearBtn').addEventListener('click', () => {
            this.clearAllPhotos();
        });

        // 布局切换按钮
        document.querySelectorAll('.layout-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const layout = e.currentTarget.dataset.layout;
                this.switchLayout(layout);
            });
        });

        // 轮播控制
        document.getElementById('carouselPrev').addEventListener('click', () => {
            this.carouselPrevious();
        });

        document.getElementById('carouselNext').addEventListener('click', () => {
            this.carouselNext();
        });

        // 布局市场
        document.getElementById('layoutMarketBtn').addEventListener('click', () => {
            this.showLayoutMarket();
        });

        document.getElementById('closeMarketModal').addEventListener('click', () => {
            document.getElementById('layoutMarketModal').style.display = 'none';
        });

        // 布局市场模态框点击外部关闭
        document.getElementById('layoutMarketModal').addEventListener('click', (e) => {
            if (e.target === document.getElementById('layoutMarketModal')) {
                document.getElementById('layoutMarketModal').style.display = 'none';
            }
        });

        // 布局市场标签切换
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchMarketTab(e.target.dataset.tab);
            });
        });

        // 布局导入
        document.getElementById('importZone').addEventListener('click', () => {
            document.getElementById('layoutFileInput').click();
        });

        document.getElementById('layoutFileInput').addEventListener('change', (e) => {
            this.importLayout(e.target.files[0]);
        });

        // 布局导出
        document.getElementById('exportCurrentLayout').addEventListener('click', () => {
            this.exportCurrentLayout();
        });

        // 布局配置
        document.getElementById('layoutConfigBtn').addEventListener('click', () => {
            this.showLayoutConfigPanel();
        });

        document.getElementById('closeConfigModal').addEventListener('click', () => {
            document.getElementById('layoutConfigModal').style.display = 'none';
        });

        // 布局配置模态框点击外部关闭
        document.getElementById('layoutConfigModal').addEventListener('click', (e) => {
            if (e.target === document.getElementById('layoutConfigModal')) {
                document.getElementById('layoutConfigModal').style.display = 'none';
            }
        });

        document.getElementById('applyConfig').addEventListener('click', () => {
            document.getElementById('layoutConfigModal').style.display = 'none';
        });

        document.getElementById('resetConfig').addEventListener('click', () => {
            this.resetLayoutConfig(this.currentLayout);
        });

        // 视图控制
        document.getElementById('zoomInBtn').addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.zoomIn();
        });

        document.getElementById('zoomOutBtn').addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.zoomOut();
        });

        document.getElementById('resetViewBtn').addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.resetView();
        });

        // 模态框相关事件
        const modal = document.getElementById('photoModal');
        const closeModal = document.getElementById('closeModal');
        const deletePhoto = document.getElementById('deletePhoto');
        const downloadPhoto = document.getElementById('downloadPhoto');

        closeModal.addEventListener('click', () => {
            modal.style.display = 'none';
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });

        deletePhoto.addEventListener('click', () => {
            this.deleteCurrentPhoto();
        });

        downloadPhoto.addEventListener('click', () => {
            this.downloadCurrentPhoto();
        });

        // 键盘事件
        document.addEventListener('keydown', (e) => {
            if (modal.style.display === 'block') {
                if (e.key === 'Escape') {
                    modal.style.display = 'none';
                } else if (e.key === 'ArrowLeft') {
                    this.showPreviousPhoto();
                } else if (e.key === 'ArrowRight') {
                    this.showNextPhoto();
                }
            } else if (this.currentLayout === 'carousel') {
                // 轮播布局的键盘导航
                if (e.key === 'ArrowLeft') {
                    this.carouselPrevious();
                } else if (e.key === 'ArrowRight') {
                    this.carouselNext();
                }
            }
        });

        // 窗口大小变化时重新渲染布局
        window.addEventListener('resize', () => {
            if (['star', 'spiral', 'wave'].includes(this.currentLayout)) {
                setTimeout(() => {
                    this.renderPhotos();
                }, 100);
            }
        });
    }

    handleFiles(files) {
        const imageFiles = Array.from(files).filter(file => 
            file.type.startsWith('image/')
        );

        if (imageFiles.length === 0) {
            alert('请选择图片文件！');
            return;
        }

        this.showLoading(true);

        let processedCount = 0;
        const totalFiles = imageFiles.length;

        imageFiles.forEach((file, index) => {
            this.processImageFile(file, () => {
                processedCount++;
                if (processedCount === totalFiles) {
                    this.showLoading(false);
                    this.savePhotos();
                    this.renderPhotos();
                }
            });
        });
    }

    processImageFile(file, callback) {
        const reader = new FileReader();
        
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                // 创建缩略图
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                // 计算缩略图尺寸（最大300x300）
                const maxSize = 300;
                let { width, height } = img;
                
                if (width > height) {
                    if (width > maxSize) {
                        height = (height * maxSize) / width;
                        width = maxSize;
                    }
                } else {
                    if (height > maxSize) {
                        width = (width * maxSize) / height;
                        height = maxSize;
                    }
                }
                
                canvas.width = width;
                canvas.height = height;
                
                // 绘制缩略图
                ctx.drawImage(img, 0, 0, width, height);
                const thumbnailDataUrl = canvas.toDataURL('image/jpeg', 0.8);
                
                // 保存原始图片数据
                const photo = {
                    id: Date.now() + Math.random(),
                    name: file.name,
                    size: file.size,
                    type: file.type,
                    dataUrl: e.target.result,
                    thumbnail: thumbnailDataUrl,
                    uploadTime: new Date().toISOString()
                };
                
                this.photos.push(photo);
                callback();
            };
            
            img.src = e.target.result;
        };
        
        reader.readAsDataURL(file);
    }

    renderPhotos() {
        if (this.photos.length === 0) {
            this.renderEmptyState();
            return;
        }

        // 根据当前布局渲染
        switch (this.currentLayout) {
            case 'grid':
                this.renderGridLayout();
                break;
            case 'masonry':
                this.renderMasonryLayout();
                break;
            case 'list':
                this.renderListLayout();
                break;
            case 'carousel':
                this.renderCarouselLayout();
                break;
            case 'star':
                this.renderStarLayout();
                break;
            case 'kaleidoscope':
                this.renderKaleidoscopeLayout();
                break;
            case 'spiral':
                this.renderSpiralLayout();
                break;
            case 'wave':
                this.renderWaveLayout();
                break;
            case 'card3d':
                this.renderCard3dLayout();
                break;
        }

        this.updateLayoutButtons();
    }

    renderEmptyState() {
        const emptyHTML = `
            <div class="empty-state">
                <i class="fas fa-images"></i>
                <h3>还没有照片</h3>
                <p>点击上方按钮或拖拽照片到这里开始创建你的照片墙</p>
            </div>
        `;
        
        // 为普通容器设置空状态
        const containers = ['photoGrid', 'photoMasonry', 'photoList', 
                           'photoStar', 'photoKaleidoscope', 'photoSpiral', 'photoWave', 'photoCard3d'];
        
        containers.forEach(containerId => {
            const container = document.getElementById(containerId);
            if (container) {
                container.innerHTML = emptyHTML;
            }
        });
        
        // 轮播布局特殊处理 - 只更新轮播轨道，不破坏整体结构
        const carouselTrack = document.getElementById('carouselTrack');
        const carouselIndicators = document.getElementById('carouselIndicators');
        
        if (carouselTrack) {
            carouselTrack.innerHTML = `
                <div class="carousel-item">
                    ${emptyHTML}
                </div>
            `;
        }
        
        if (carouselIndicators) {
            carouselIndicators.innerHTML = '';
        }
    }

    renderGridLayout() {
        const photoGrid = document.getElementById('photoGrid');
        photoGrid.innerHTML = this.photos.map((photo, index) => `
            <div class="photo-item" data-index="${index}" draggable="true">
                <img src="${photo.thumbnail}" alt="${photo.name}" loading="lazy">
                <button class="delete-btn" onclick="photoWall.deletePhoto(${index})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `).join('');

        this.bindPhotoEvents();
    }

    renderMasonryLayout() {
        const photoMasonry = document.getElementById('photoMasonry');
        photoMasonry.innerHTML = this.photos.map((photo, index) => `
            <div class="photo-item" data-index="${index}" draggable="true">
                <img src="${photo.dataUrl}" alt="${photo.name}" loading="lazy">
                <button class="delete-btn" onclick="photoWall.deletePhoto(${index})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `).join('');

        this.bindPhotoEvents();
    }

    renderListLayout() {
        const photoList = document.getElementById('photoList');
        photoList.innerHTML = this.photos.map((photo, index) => `
            <div class="photo-item" data-index="${index}" draggable="true">
                <img src="${photo.thumbnail}" alt="${photo.name}" loading="lazy">
                <div class="photo-info">
                    <div class="photo-name">${photo.name}</div>
                    <div class="photo-meta">
                        ${this.formatFileSize(photo.size)} • ${this.formatDate(photo.uploadTime)}
                    </div>
                </div>
                <button class="delete-btn" onclick="photoWall.deletePhoto(${index})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `).join('');

        this.bindPhotoEvents();
    }

    renderCarouselLayout() {
        console.log('renderCarouselLayout called, photos count:', this.photos.length);
        
        const carouselTrack = document.getElementById('carouselTrack');
        const carouselIndicators = document.getElementById('carouselIndicators');
        const carouselContainer = document.querySelector('.carousel-container');
        
        console.log('Carousel elements:', {
            track: carouselTrack,
            indicators: carouselIndicators,
            container: carouselContainer
        });
        
        // 检查必需的元素是否存在
        if (!carouselTrack || !carouselIndicators) {
            console.error('Carousel elements not found! Track:', carouselTrack, 'Indicators:', carouselIndicators);
            console.error('Please refresh the page (Ctrl+F5 or Cmd+Shift+R) to clear cache');
            alert('轮播模式元素未找到，请按 Ctrl+F5 (Windows) 或 Cmd+Shift+R (Mac) 强制刷新页面清除缓存');
            return;
        }
        
        if (this.photos.length === 0) {
            console.log('No photos to display');
            return;
        }

        carouselTrack.innerHTML = this.photos.map((photo, index) => `
            <div class="carousel-item" data-index="${index}">
                <img src="${photo.dataUrl}" alt="${photo.name}">
            </div>
        `).join('');

        carouselIndicators.innerHTML = this.photos.map((_, index) => `
            <div class="carousel-indicator ${index === 0 ? 'active' : ''}" data-index="${index}"></div>
        `).join('');

        this.updateCarouselPosition();
        this.bindCarouselEvents();
        
        // 添加鼠标悬停暂停自动播放
        if (carouselContainer) {
            carouselContainer.addEventListener('mouseenter', () => {
                this.stopCarouselAutoPlay();
            });
            
            carouselContainer.addEventListener('mouseleave', () => {
                this.startCarouselAutoPlay();
            });
        }
        
        // 添加触摸滑动支持
        this.addCarouselTouchSupport();
        
        // 开始自动播放
        this.startCarouselAutoPlay();
    }

    bindPhotoEvents() {
        // 绑定所有照片项的点击事件
        const photoSelectors = [
            '.photo-item', 
            '.star-item', 
            '.kaleidoscope-item', 
            '.spiral-item', 
            '.wave-item', 
            '.card3d-item',
            '.carousel-item'
        ];
        
        photoSelectors.forEach(selector => {
            document.querySelectorAll(selector).forEach((item, index) => {
                // 移除之前的事件监听器（如果有的话）
                item.removeEventListener('click', item._photoClickHandler);
                
                // 创建新的事件处理函数
                item._photoClickHandler = (e) => {
                    if (!e.target.classList.contains('delete-btn') && 
                        !e.target.closest('.delete-btn') &&
                        !e.target.closest('.card-back')) {
                        const photoIndex = parseInt(item.dataset.index);
                        this.showPhotoModal(photoIndex);
                    }
                };
                
                // 添加事件监听器
                item.addEventListener('click', item._photoClickHandler);
            });
        });
    }

    bindCarouselEvents() {
        // 指示器点击事件
        document.querySelectorAll('.carousel-indicator').forEach((indicator, index) => {
            // 清除之前的事件监听器
            indicator.removeEventListener('click', indicator._carouselIndicatorHandler);
            
            // 创建新的事件处理函数
            indicator._carouselIndicatorHandler = () => {
                this.carouselIndex = index;
                this.updateCarouselPosition();
            };
            
            // 添加事件监听器
            indicator.addEventListener('click', indicator._carouselIndicatorHandler);
        });

        // 轮播项点击事件 - 这里不需要单独绑定，因为已经在 bindPhotoEvents 中处理了
        // 但是需要确保轮播项可以正确显示模态框
        document.querySelectorAll('.carousel-item').forEach((item, index) => {
            // 确保轮播项有正确的 data-index 属性
            item.setAttribute('data-index', index);
        });
    }

    switchLayout(layout) {
        if (this.currentLayout === layout) return;
        
        // 停止当前布局的自动播放
        if (this.currentLayout === 'carousel') {
            this.stopCarouselAutoPlay();
        }
        
        this.currentLayout = layout;
        this.saveLayoutPreference();
        
        // 控制配置按钮显示/隐藏
        const configBtn = document.getElementById('layoutConfigBtn');
        if (this.isZoomableLayout(layout)) {
            configBtn.style.display = 'inline-flex';
        } else {
            configBtn.style.display = 'none';
        }
        
        // 重置交互状态
        this.resetView();
        
        // 添加切换动画
        const container = document.getElementById('photoContainer');
        container.classList.add('layout-transition');
        
        setTimeout(() => {
            this.hideAllLayouts();
            this.showCurrentLayout();
            this.renderPhotos();
            this.initInteractiveContainers();
            
            // 移除动画类
            setTimeout(() => {
                container.classList.remove('layout-transition');
                container.classList.add('show');
            }, 50);
        }, 250);
    }

    hideAllLayouts() {
        const layouts = ['photoGrid', 'photoMasonry', 'photoList', 'photoCarousel', 
                        'photoStar', 'photoKaleidoscope', 'photoSpiral', 'photoWave', 'photoCard3d'];
        layouts.forEach(layoutId => {
            const element = document.getElementById(layoutId);
            if (element) {
                element.style.display = 'none';
            }
        });
    }

    showCurrentLayout() {
        const layoutMap = {
            'grid': 'photoGrid',
            'masonry': 'photoMasonry',
            'list': 'photoList',
            'carousel': 'photoCarousel',
            'star': 'photoStar',
            'kaleidoscope': 'photoKaleidoscope',
            'spiral': 'photoSpiral',
            'wave': 'photoWave',
            'card3d': 'photoCard3d'
        };
        
        const currentLayoutElement = document.getElementById(layoutMap[this.currentLayout]);
        if (currentLayoutElement) {
            currentLayoutElement.style.display = 'block';
        }
    }

    updateLayoutButtons() {
        document.querySelectorAll('.layout-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.layout === this.currentLayout) {
                btn.classList.add('active');
            }
        });
    }

    carouselNext() {
        if (this.photos.length === 0) return;
        this.carouselIndex = (this.carouselIndex + 1) % this.photos.length;
        this.updateCarouselPosition();
    }

    carouselPrevious() {
        if (this.photos.length === 0) return;
        this.carouselIndex = (this.carouselIndex - 1 + this.photos.length) % this.photos.length;
        this.updateCarouselPosition();
    }

    updateCarouselPosition() {
        const track = document.getElementById('carouselTrack');
        const indicators = document.querySelectorAll('.carousel-indicator');
        
        if (track) {
            track.style.transform = `translateX(-${this.carouselIndex * 100}%)`;
        }
        
        indicators.forEach((indicator, index) => {
            indicator.classList.toggle('active', index === this.carouselIndex);
        });
    }

    startCarouselAutoPlay() {
        this.stopCarouselAutoPlay();
        if (this.photos.length > 1) {
            this.carouselAutoPlay = setInterval(() => {
                this.carouselNext();
            }, this.carouselAutoPlayInterval);
        }
    }

    stopCarouselAutoPlay() {
        if (this.carouselAutoPlay) {
            clearInterval(this.carouselAutoPlay);
            this.carouselAutoPlay = null;
        }
    }

    addCarouselTouchSupport() {
        const carouselContainer = document.querySelector('.carousel-container');
        if (!carouselContainer) return;

        let startX = 0;
        let startY = 0;
        let isDragging = false;

        carouselContainer.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
            isDragging = true;
            this.stopCarouselAutoPlay();
        });

        carouselContainer.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            e.preventDefault();
        });

        carouselContainer.addEventListener('touchend', (e) => {
            if (!isDragging) return;
            
            const endX = e.changedTouches[0].clientX;
            const endY = e.changedTouches[0].clientY;
            const diffX = startX - endX;
            const diffY = startY - endY;
            
            // 只有水平滑动距离大于垂直滑动距离时才处理
            if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
                if (diffX > 0) {
                    // 向左滑动，显示下一张
                    this.carouselNext();
                } else {
                    // 向右滑动，显示上一张
                    this.carouselPrevious();
                }
            }
            
            isDragging = false;
            // 延迟重新开始自动播放
            setTimeout(() => {
                this.startCarouselAutoPlay();
            }, 1000);
        });
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('zh-CN');
    }

    saveLayoutPreference() {
        localStorage.setItem('photoWallLayout', this.currentLayout);
    }

    loadLayoutPreference() {
        const saved = localStorage.getItem('photoWallLayout');
        if (saved && ['grid', 'masonry', 'list', 'carousel', 'star', 'kaleidoscope', 'spiral', 'wave', 'card3d'].includes(saved)) {
            this.currentLayout = saved;
        }
    }

    // 星空布局
    renderStarLayout() {
        const starContainer = document.getElementById('photoStar');
        const containerWidth = starContainer.offsetWidth || 600;
        const containerHeight = starContainer.offsetHeight || 500;
        const centerX = containerWidth / 2;
        const centerY = containerHeight / 2;
        
        // 使用配置参数
        const config = this.getLayoutConfig('star');
        const radius = Math.min(containerWidth, containerHeight) * config.radiusFactor;
        const itemsPerCircle = Math.ceil(this.photos.length / config.circles);
        
        starContainer.innerHTML = this.photos.map((photo, index) => {
            // 计算当前照片所在圈数和圈内位置
            const circleIndex = Math.floor(index / itemsPerCircle);
            const indexInCircle = index % itemsPerCircle;
            const itemsInThisCircle = Math.min(itemsPerCircle, this.photos.length - circleIndex * itemsPerCircle);
            
            // 根据圈数调整半径（外圈到内圈递减）
            const currentRadius = radius * (1 - circleIndex * 0.3);
            
            // 计算角度
            const angle = (config.startAngle * Math.PI / 180) + 
                         (indexInCircle * 2 * Math.PI / itemsInThisCircle) * config.direction;
            
            const x = centerX + currentRadius * Math.cos(angle) - config.itemSize / 2;
            const y = centerY + currentRadius * Math.sin(angle) - config.itemSize / 2;
            
            return `
                <div class="star-item" data-index="${index}" 
                     style="left: ${x}px; top: ${y}px; width: ${config.itemSize}px; height: ${config.itemSize}px;">
                    <img src="${photo.thumbnail}" alt="${photo.name}" loading="lazy">
                    <button class="delete-btn" onclick="photoWall.deletePhoto(${index})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
        }).join('');

        this.bindPhotoEvents();
    }

    // 万花筒布局
    renderKaleidoscopeLayout() {
        const kaleidoscopeContainer = document.getElementById('photoKaleidoscope');
        kaleidoscopeContainer.innerHTML = this.photos.map((photo, index) => `
            <div class="kaleidoscope-item" data-index="${index}">
                <img src="${photo.thumbnail}" alt="${photo.name}" loading="lazy">
                <button class="delete-btn" onclick="photoWall.deletePhoto(${index})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `).join('');

        this.bindPhotoEvents();
    }

    // 螺旋布局
    renderSpiralLayout() {
        const spiralContainer = document.getElementById('photoSpiral');
        const containerWidth = spiralContainer.offsetWidth || 600;
        const containerHeight = spiralContainer.offsetHeight || 500;
        const centerX = containerWidth / 2;
        const centerY = containerHeight / 2;
        const maxRadius = Math.min(containerWidth, containerHeight) * 0.4;
        
        // 使用配置参数
        const config = this.getLayoutConfig('spiral');
        
        spiralContainer.innerHTML = this.photos.map((photo, index) => {
            const angle = index * config.angleIncrement * config.direction;
            const radius = Math.min(config.startRadius + index * config.radiusGrowth, maxRadius);
            const x = centerX + radius * Math.cos(angle) - config.itemSize / 2;
            const y = centerY + radius * Math.sin(angle) - config.itemSize / 2;
            
            return `
                <div class="spiral-item" data-index="${index}" 
                     style="left: ${x}px; top: ${y}px; width: ${config.itemSize}px; height: ${config.itemSize}px;">
                    <img src="${photo.thumbnail}" alt="${photo.name}" loading="lazy">
                    <button class="delete-btn" onclick="photoWall.deletePhoto(${index})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
        }).join('');

        this.bindPhotoEvents();
    }

    // 波浪布局
    renderWaveLayout() {
        const waveContainer = document.getElementById('photoWave');
        const containerWidth = waveContainer.offsetWidth || 800;
        const containerHeight = waveContainer.offsetHeight || 300;
        const centerX = containerWidth / 2;
        const centerY = containerHeight / 2;
        
        // 使用配置参数
        const config = this.getLayoutConfig('wave');
        const spacing = Math.min(config.spacing, containerWidth / this.photos.length);
        
        waveContainer.innerHTML = this.photos.map((photo, index) => {
            const x = centerX + (index - this.photos.length / 2) * spacing;
            
            // 根据波形类型计算y坐标
            let y;
            if (config.waveType === 'cosine') {
                y = centerY + Math.cos(index * config.frequency) * config.amplitude + config.verticalOffset;
            } else {
                y = centerY + Math.sin(index * config.frequency) * config.amplitude + config.verticalOffset;
            }
            
            return `
                <div class="wave-item" data-index="${index}" 
                     style="left: ${x}px; top: ${y}px; width: ${config.itemSize}px; height: ${config.itemSize}px;">
                    <img src="${photo.thumbnail}" alt="${photo.name}" loading="lazy">
                    <button class="delete-btn" onclick="photoWall.deletePhoto(${index})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
        }).join('');

        this.bindPhotoEvents();
    }

    // 3D卡片布局
    renderCard3dLayout() {
        const card3dContainer = document.getElementById('photoCard3d');
        card3dContainer.innerHTML = this.photos.map((photo, index) => `
            <div class="card3d-item" data-index="${index}">
                <div class="card-face card-front">
                    <img src="${photo.thumbnail}" alt="${photo.name}" loading="lazy">
                </div>
                <div class="card-face card-back">
                    <i class="fas fa-image"></i>
                </div>
                <button class="delete-btn" onclick="photoWall.deletePhoto(${index})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `).join('');

        this.bindPhotoEvents();
    }

    // 布局市场相关方法
    showLayoutMarket() {
        document.getElementById('layoutMarketModal').style.display = 'block';
    }

    switchMarketTab(tabName) {
        // 隐藏所有标签内容
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        
        // 移除所有标签按钮的激活状态
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // 显示选中的标签内容
        document.getElementById(tabName + 'Tab').classList.add('active');
        
        // 激活选中的标签按钮
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    }

    importLayout(file) {
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const layoutData = JSON.parse(e.target.result);
                this.applyImportedLayout(layoutData);
                alert('布局导入成功！');
            } catch (error) {
                alert('布局文件格式错误！');
                console.error('Layout import error:', error);
            }
        };
        reader.readAsText(file);
    }

    applyImportedLayout(layoutData) {
        // 这里可以实现布局数据的应用逻辑
        console.log('Applying layout:', layoutData);
        // 可以根据布局数据调整样式或配置
    }

    exportCurrentLayout() {
        const layoutData = {
            name: this.currentLayout,
            timestamp: new Date().toISOString(),
            photos: this.photos.length,
            settings: {
                layout: this.currentLayout,
                // 可以添加更多布局设置
            }
        };
        
        const dataStr = JSON.stringify(layoutData, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `photo-wall-layout-${this.currentLayout}-${Date.now()}.json`;
        link.click();
    }

    // 交互控制方法
    initInteractiveContainers() {
        // 轮播布局不显示视图控制
        if (this.currentLayout === 'carousel') {
            this.hideViewControls();
            return;
        }
        
        // 只对可缩放布局显示视图控制和设置交互
        if (this.isZoomableLayout(this.currentLayout)) {
            this.showViewControls();
            setTimeout(() => {
                this.setupInteractiveContainer();
            }, 100);
        } else {
            this.hideViewControls();
        }
        
        // 所有布局都设置拖拽交换
        setTimeout(() => {
            this.enhanceDragAndDrop();
        }, 100);
    }

    showViewControls() {
        document.getElementById('viewControls').style.display = 'flex';
    }

    hideViewControls() {
        document.getElementById('viewControls').style.display = 'none';
    }

    setupInteractiveContainer() {
        // 只对可缩放布局设置交互容器
        if (!this.isZoomableLayout(this.currentLayout)) {
            return;
        }
        
        const containerId = this.getInteractiveContainerId();
        const container = document.getElementById(containerId);
        
        console.log('Setting up interactive container:', containerId, container);
        
        if (!container) {
            console.error('Interactive container not found:', containerId);
            return;
        }

        // 清除之前的事件监听器
        this.clearInteractiveEvents(container);

        // 添加拖拽功能
        this.addDragEvents(container);
        
        // 添加缩放功能
        this.addZoomEvents(container);
        
        // 添加触摸支持
        this.addTouchEvents(container);
        
        console.log('Interactive container setup complete');
    }

    getInteractiveContainerId() {
        const containerMap = {
            'grid': 'photoGrid',
            'masonry': 'photoMasonry',
            'list': 'photoList',
            'carousel': 'photoCarousel',
            'star': 'starInteractiveContainer',
            'kaleidoscope': 'photoKaleidoscope',
            'spiral': 'spiralInteractiveContainer',
            'wave': 'waveInteractiveContainer',
            'card3d': 'photoCard3d'
        };
        return containerMap[this.currentLayout];
    }

    clearInteractiveEvents(container) {
        // 移除所有事件监听器
        container.removeEventListener('mousedown', container._mouseDownHandler);
        container.removeEventListener('mousemove', container._mouseMoveHandler);
        container.removeEventListener('mouseup', container._mouseUpHandler);
        container.removeEventListener('wheel', container._wheelHandler);
        container.removeEventListener('touchstart', container._touchStartHandler);
        container.removeEventListener('touchmove', container._touchMoveHandler);
        container.removeEventListener('touchend', container._touchEndHandler);
    }

    addDragEvents(container) {
        container._mouseDownHandler = (e) => {
            if (e.target.closest('.delete-btn')) return;
            if (e.target.closest('.star-item, .spiral-item, .wave-item')) return;
            
            this.isDragging = true;
            this.dragStart = { x: e.clientX, y: e.clientY };
            container.classList.add('dragging');
            
            e.preventDefault();
            e.stopPropagation();
        };

        container._mouseMoveHandler = (e) => {
            if (!this.isDragging) return;
            
            e.preventDefault();
            e.stopPropagation();
            
            const deltaX = e.clientX - this.dragStart.x;
            const deltaY = e.clientY - this.dragStart.y;
            
            this.dragOffset.x += deltaX;
            this.dragOffset.y += deltaY;
            
            this.updateContainerTransform(container);
            
            this.dragStart = { x: e.clientX, y: e.clientY };
        };

        container._mouseUpHandler = (e) => {
            this.isDragging = false;
            container.classList.remove('dragging');
        };

        container.addEventListener('mousedown', container._mouseDownHandler);
        document.addEventListener('mousemove', container._mouseMoveHandler);
        document.addEventListener('mouseup', container._mouseUpHandler);
    }

    addZoomEvents(container) {
        container._wheelHandler = (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            const delta = e.deltaY > 0 ? -0.1 : 0.1;
            // 使用鼠标位置作为缩放中心
            this.zoomAtPoint(container, delta, e.clientX, e.clientY);
        };

        container.addEventListener('wheel', container._wheelHandler, { passive: false });
    }

    addTouchEvents(container) {
        let lastTouchDistance = 0;
        let lastTouchCenter = { x: 0, y: 0 };

        container._touchStartHandler = (e) => {
            if (e.touches.length === 1) {
                // 单指拖拽
                const touch = e.touches[0];
                this.isDragging = true;
                this.dragStart = { x: touch.clientX, y: touch.clientY };
                container.classList.add('dragging');
            } else if (e.touches.length === 2) {
                // 双指缩放
                const touch1 = e.touches[0];
                const touch2 = e.touches[1];
                lastTouchDistance = Math.sqrt(
                    Math.pow(touch2.clientX - touch1.clientX, 2) + 
                    Math.pow(touch2.clientY - touch1.clientY, 2)
                );
                lastTouchCenter = {
                    x: (touch1.clientX + touch2.clientX) / 2,
                    y: (touch1.clientY + touch2.clientY) / 2
                };
            }
        };

        container._touchMoveHandler = (e) => {
            e.preventDefault();
            
            if (e.touches.length === 1 && this.isDragging) {
                // 单指拖拽
                const touch = e.touches[0];
                const deltaX = touch.clientX - this.dragStart.x;
                const deltaY = touch.clientY - this.dragStart.y;
                
                this.dragOffset.x += deltaX;
                this.dragOffset.y += deltaY;
                
                this.updateContainerTransform(container);
                
                this.dragStart = { x: touch.clientX, y: touch.clientY };
            } else if (e.touches.length === 2) {
                // 双指缩放
                const touch1 = e.touches[0];
                const touch2 = e.touches[1];
                const currentDistance = Math.sqrt(
                    Math.pow(touch2.clientX - touch1.clientX, 2) + 
                    Math.pow(touch2.clientY - touch1.clientY, 2)
                );
                
                if (lastTouchDistance > 0) {
                    const scale = currentDistance / lastTouchDistance;
                    this.zoomLevel = Math.max(this.minZoom, Math.min(this.maxZoom, this.zoomLevel * scale));
                    
                    this.updateContainerTransform(container);
                    this.updateZoomDisplay();
                }
                
                lastTouchDistance = currentDistance;
            }
        };

        container._touchEndHandler = () => {
            this.isDragging = false;
            container.classList.remove('dragging');
            lastTouchDistance = 0;
        };

        container.addEventListener('touchstart', container._touchStartHandler);
        container.addEventListener('touchmove', container._touchMoveHandler);
        container.addEventListener('touchend', container._touchEndHandler);
    }

    updateContainerTransform(container) {
        const innerContainer = container.querySelector('.star-container, .spiral-container, .wave-container');
        const target = innerContainer || container;
        
        target.style.transform = `translate(${this.dragOffset.x}px, ${this.dragOffset.y}px) scale(${this.zoomLevel})`;
        target.style.transformOrigin = '0 0';  // 使用左上角作为原点，配合鼠标位置缩放
    }

    // 增强拖拽交换功能 - 支持所有布局
    enhanceDragAndDrop() {
        const selectors = [
            '.photo-item',
            '.star-item',
            '.kaleidoscope-item',
            '.spiral-item',
            '.wave-item',
            '.card3d-item'
        ];
        
        const allItems = [];
        selectors.forEach(selector => {
            const items = document.querySelectorAll(selector);
            allItems.push(...items);
        });
        
        allItems.forEach(item => {
            // 设置可拖拽
            item.draggable = true;
            
            // 拖拽开始
            item.addEventListener('dragstart', (e) => {
                // 如果点击的是删除按钮，不启动拖拽
                if (e.target.closest('.delete-btn')) {
                    e.preventDefault();
                    return;
                }
                
                e.dataTransfer.effectAllowed = 'move';
                e.dataTransfer.setData('text/plain', item.dataset.index);
                item.classList.add('dragging');
                
                // 创建拖拽预览
                const preview = item.cloneNode(true);
                preview.style.opacity = '0.5';
                preview.style.position = 'absolute';
                preview.style.top = '-1000px';
                document.body.appendChild(preview);
                e.dataTransfer.setDragImage(preview, 50, 50);
                setTimeout(() => preview.remove(), 0);
            });
            
            // 拖拽结束
            item.addEventListener('dragend', () => {
                item.classList.remove('dragging');
                // 清除所有 drag-over 类
                allItems.forEach(i => i.classList.remove('drag-over'));
            });
            
            // 拖拽进入
            item.addEventListener('dragenter', (e) => {
                e.preventDefault();
                if (!item.classList.contains('dragging')) {
                    item.classList.add('drag-over');
                }
            });
            
            // 拖拽经过
            item.addEventListener('dragover', (e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
            });
            
            // 拖拽离开
            item.addEventListener('dragleave', (e) => {
                // 只有当离开当前元素时才移除样式
                if (e.target === item) {
                    item.classList.remove('drag-over');
                }
            });
            
            // 放置
            item.addEventListener('drop', (e) => {
                e.preventDefault();
                item.classList.remove('drag-over');
                
                const draggedIndex = parseInt(e.dataTransfer.getData('text/plain'));
                const targetIndex = parseInt(item.dataset.index);
                
                if (draggedIndex !== targetIndex && !isNaN(draggedIndex) && !isNaN(targetIndex)) {
                    this.handlePhotoSwap(draggedIndex, targetIndex);
                }
            });
        });
    }

    handlePhotoSwap(fromIndex, toIndex) {
        // 交换数组中的照片
        const temp = this.photos[fromIndex];
        this.photos[fromIndex] = this.photos[toIndex];
        this.photos[toIndex] = temp;
        
        // 尝试保存，但不阻塞渲染
        const saved = this.savePhotos();
        
        // 无论保存是否成功，都重新渲染（内存中的更改已生效）
        this.renderPhotos();
        
        // 重新初始化交互
        setTimeout(() => {
            this.initInteractiveContainers();
        }, 100);
        
        // 如果保存失败，在第一次失败时显示警告
        if (!saved && !this._swapWarningShown) {
            this._swapWarningShown = true;
            this.showStorageWarning('存储空间不足，照片顺序已更改但无法保存。刷新页面后将恢复原顺序。');
        }
    }

    updateZoomDisplay() {
        document.getElementById('zoomLevel').textContent = Math.round(this.zoomLevel * 100) + '%';
    }

    // 判断布局是否可缩放
    isZoomableLayout(layout) {
        return this.ZOOMABLE_LAYOUTS.includes(layout);
    }

    // 以鼠标位置为中心点缩放
    zoomAtPoint(container, delta, mouseX, mouseY) {
        const oldZoom = this.zoomLevel;
        this.zoomLevel = Math.max(this.minZoom, Math.min(this.maxZoom, this.zoomLevel + delta));
        
        if (oldZoom === this.zoomLevel) return;
        
        // 获取容器位置
        const rect = container.getBoundingClientRect();
        const containerX = mouseX - rect.left;
        const containerY = mouseY - rect.top;
        
        // 计算内容坐标（缩放前鼠标指向的点）
        const contentX = (containerX - this.dragOffset.x) / oldZoom;
        const contentY = (containerY - this.dragOffset.y) / oldZoom;
        
        // 调整偏移量，使该内容点仍在鼠标位置下
        this.dragOffset.x = containerX - contentX * this.zoomLevel;
        this.dragOffset.y = containerY - contentY * this.zoomLevel;
        
        this.updateContainerTransform(container);
        this.updateZoomDisplay();
    }

    zoomIn() {
        const containerId = this.getInteractiveContainerId();
        const container = document.getElementById(containerId);
        if (!container) return;
        
        // 使用容器中心点作为缩放中心
        const rect = container.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        this.zoomAtPoint(container, 0.2, centerX, centerY);
        console.log('Zoom in:', this.zoomLevel);
    }

    zoomOut() {
        const containerId = this.getInteractiveContainerId();
        const container = document.getElementById(containerId);
        if (!container) return;
        
        // 使用容器中心点作为缩放中心
        const rect = container.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        this.zoomAtPoint(container, -0.2, centerX, centerY);
        console.log('Zoom out:', this.zoomLevel);
    }

    resetView() {
        this.zoomLevel = 1;
        this.dragOffset = { x: 0, y: 0 };
        this.imageDragOffset = { x: 0, y: 0 };
        this.isImageDragging = false;
        this.currentDraggedImage = null;
        
        // 重置所有图片的变换
        const container = document.getElementById(this.getInteractiveContainerId());
        if (container) {
            const photoItems = container.querySelectorAll('.photo-item, .star-item, .kaleidoscope-item, .spiral-item, .wave-item, .card3d-item, .carousel-item');
            photoItems.forEach(item => {
                item.style.transform = '';
                item.style.zIndex = '';
                item.classList.remove('image-dragging');
                
                // 移除拖拽指示器
                const indicator = item.querySelector('.image-drag-indicator');
                if (indicator) {
                    indicator.remove();
                }
            });
        }
        
        console.log('Reset view');
        this.updateInteractiveContainer();
    }

    updateInteractiveContainer() {
        const containerId = this.getInteractiveContainerId();
        const container = document.getElementById(containerId);
        
        console.log('Updating interactive container:', containerId, container);
        
        if (container) {
            this.updateContainerTransform(container);
            this.updateZoomDisplay();
        } else {
            console.error('Container not found for update:', containerId);
        }
    }

    // 测试方法
    testInteractiveFeatures() {
        console.log('Testing interactive features...');
        console.log('Current layout:', this.currentLayout);
        console.log('Interactive layouts:', ['star', 'spiral', 'wave']);
        console.log('View controls element:', document.getElementById('viewControls'));
        console.log('Zoom level element:', document.getElementById('zoomLevel'));
    }

    showPhotoModal(index) {
        this.currentPhotoIndex = index;
        const photo = this.photos[index];
        const modal = document.getElementById('photoModal');
        const modalImage = document.getElementById('modalImage');
        
        modalImage.src = photo.dataUrl;
        modalImage.alt = photo.name;
        modal.style.display = 'block';
    }

    showPreviousPhoto() {
        if (this.currentPhotoIndex > 0) {
            this.currentPhotoIndex--;
            this.showPhotoModal(this.currentPhotoIndex);
        }
    }

    showNextPhoto() {
        if (this.currentPhotoIndex < this.photos.length - 1) {
            this.currentPhotoIndex++;
            this.showPhotoModal(this.currentPhotoIndex);
        }
    }

    deletePhoto(index) {
        if (confirm('确定要删除这张照片吗？')) {
            this.photos.splice(index, 1);
            this.savePhotos();
            this.renderPhotos();
        }
    }

    deleteCurrentPhoto() {
        if (this.currentPhotoIndex >= 0) {
            this.deletePhoto(this.currentPhotoIndex);
            const modal = document.getElementById('photoModal');
            modal.style.display = 'none';
        }
    }

    downloadCurrentPhoto() {
        if (this.currentPhotoIndex >= 0) {
            const photo = this.photos[this.currentPhotoIndex];
            const link = document.createElement('a');
            link.href = photo.dataUrl;
            link.download = photo.name;
            link.click();
        }
    }

    clearAllPhotos() {
        if (this.photos.length === 0) {
            alert('照片墙已经是空的！');
            return;
        }
        
        if (confirm('确定要清空所有照片吗？此操作不可恢复！')) {
            this.photos = [];
            this.savePhotos();
            this.renderPhotos();
        }
    }

    showLoading(show) {
        const loading = document.getElementById('loading');
        loading.style.display = show ? 'block' : 'none';
    }

    savePhotos(silent = false) {
        try {
            localStorage.setItem('photoWall', JSON.stringify(this.photos));
            return true;
        } catch (error) {
            console.error('保存照片失败:', error);
            
            // 检查是否是存储空间不足错误
            const isQuotaError = error.name === 'QuotaExceededError' || 
                                error.code === 22 || 
                                error.code === 1014;
            
            if (!silent) {
                if (isQuotaError) {
                    // 显示更友好的提示
                    this.showStorageWarning('存储空间不足，照片更改已在本次会话中生效，但无法持久化保存。建议清理部分照片或浏览器数据。');
                } else {
                    this.showStorageWarning('保存照片失败，请检查浏览器设置！');
                }
            }
            return false;
        }
    }
    
    showStorageWarning(message) {
        // 创建或更新警告提示条
        let warning = document.getElementById('storageWarning');
        if (!warning) {
            warning = document.createElement('div');
            warning.id = 'storageWarning';
            warning.className = 'storage-warning';
            document.body.appendChild(warning);
        }
        
        warning.innerHTML = `
            <i class="fas fa-exclamation-triangle"></i>
            <span>${message}</span>
            <button onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;
        warning.style.display = 'flex';
        
        // 10秒后自动隐藏
        setTimeout(() => {
            if (warning && warning.parentElement) {
                warning.style.opacity = '0';
                setTimeout(() => {
                    if (warning && warning.parentElement) {
                        warning.remove();
                    }
                }, 300);
            }
        }, 10000);
    }

    loadPhotos() {
        try {
            const saved = localStorage.getItem('photoWall');
            if (saved) {
                this.photos = JSON.parse(saved);
            }
        } catch (error) {
            console.error('加载照片失败:', error);
            this.photos = [];
        }
    }

    // 布局配置管理方法
    loadLayoutConfigs() {
        try {
            const saved = localStorage.getItem('photoWallLayoutConfigs');
            if (saved) {
                this.layoutConfigs = JSON.parse(saved);
            } else {
                this.layoutConfigs = JSON.parse(JSON.stringify(this.defaultLayoutConfigs));
            }
        } catch (error) {
            console.error('加载布局配置失败:', error);
            this.layoutConfigs = JSON.parse(JSON.stringify(this.defaultLayoutConfigs));
        }
    }

    saveLayoutConfigs() {
        try {
            localStorage.setItem('photoWallLayoutConfigs', JSON.stringify(this.layoutConfigs));
        } catch (error) {
            console.error('保存布局配置失败:', error);
        }
    }

    getLayoutConfig(layoutName) {
        if (!this.layoutConfigs[layoutName]) {
            this.layoutConfigs[layoutName] = JSON.parse(JSON.stringify(this.defaultLayoutConfigs[layoutName]));
        }
        return this.layoutConfigs[layoutName];
    }

    setLayoutConfig(layoutName, config) {
        this.layoutConfigs[layoutName] = config;
        this.saveLayoutConfigs();
    }

    resetLayoutConfig(layoutName) {
        this.layoutConfigs[layoutName] = JSON.parse(JSON.stringify(this.defaultLayoutConfigs[layoutName]));
        this.saveLayoutConfigs();
        this.populateConfigPanel(layoutName);
        this.renderPhotos();
    }

    showLayoutConfigPanel() {
        if (!this.isZoomableLayout(this.currentLayout)) {
            return;
        }
        
        const modal = document.getElementById('layoutConfigModal');
        modal.style.display = 'block';
        this.populateConfigPanel(this.currentLayout);
    }

    populateConfigPanel(layoutName) {
        const config = this.getLayoutConfig(layoutName);
        const configForm = document.getElementById('configForm');
        
        // 根据布局类型动态生成配置项
        configForm.innerHTML = this.generateConfigFormHTML(layoutName, config);
        this.bindConfigInputs(layoutName);
    }

    generateConfigFormHTML(layoutName, config) {
        let html = '';
        
        if (layoutName === 'star') {
            html = `
                <div class="config-form-group">
                    <label>半径大小：</label>
                    <div class="config-slider-group">
                        <input type="range" class="config-slider" id="radiusFactor" 
                               min="0.1" max="0.5" step="0.05" value="${config.radiusFactor}">
                        <span class="config-value" id="radiusFactorValue">${config.radiusFactor}</span>
                    </div>
                </div>
                <div class="config-form-group">
                    <label>起始角度（度）：</label>
                    <div class="config-slider-group">
                        <input type="range" class="config-slider" id="startAngle" 
                               min="0" max="360" step="15" value="${config.startAngle}">
                        <span class="config-value" id="startAngleValue">${config.startAngle}°</span>
                    </div>
                </div>
                <div class="config-form-group">
                    <label>旋转方向：</label>
                    <select id="direction" class="config-select">
                        <option value="1" ${config.direction === 1 ? 'selected' : ''}>顺时针</option>
                        <option value="-1" ${config.direction === -1 ? 'selected' : ''}>逆时针</option>
                    </select>
                </div>
                <div class="config-form-group">
                    <label>图片大小（px）：</label>
                    <div class="config-slider-group">
                        <input type="range" class="config-slider" id="itemSize" 
                               min="60" max="200" step="10" value="${config.itemSize}">
                        <span class="config-value" id="itemSizeValue">${config.itemSize}px</span>
                    </div>
                </div>
                <div class="config-form-group">
                    <label>圈数：</label>
                    <select id="circles" class="config-select">
                        <option value="1" ${config.circles === 1 ? 'selected' : ''}>单圈</option>
                        <option value="2" ${config.circles === 2 ? 'selected' : ''}>双圈</option>
                        <option value="3" ${config.circles === 3 ? 'selected' : ''}>三圈</option>
                    </select>
                </div>
            `;
        } else if (layoutName === 'spiral') {
            html = `
                <div class="config-form-group">
                    <label>螺旋紧密度：</label>
                    <div class="config-slider-group">
                        <input type="range" class="config-slider" id="angleIncrement" 
                               min="0.3" max="1.0" step="0.05" value="${config.angleIncrement}">
                        <span class="config-value" id="angleIncrementValue">${config.angleIncrement}</span>
                    </div>
                </div>
                <div class="config-form-group">
                    <label>半径增长速度：</label>
                    <div class="config-slider-group">
                        <input type="range" class="config-slider" id="radiusGrowth" 
                               min="10" max="30" step="1" value="${config.radiusGrowth}">
                        <span class="config-value" id="radiusGrowthValue">${config.radiusGrowth}</span>
                    </div>
                </div>
                <div class="config-form-group">
                    <label>起始半径：</label>
                    <div class="config-slider-group">
                        <input type="range" class="config-slider" id="startRadius" 
                               min="20" max="100" step="5" value="${config.startRadius}">
                        <span class="config-value" id="startRadiusValue">${config.startRadius}px</span>
                    </div>
                </div>
                <div class="config-form-group">
                    <label>旋转方向：</label>
                    <select id="direction" class="config-select">
                        <option value="1" ${config.direction === 1 ? 'selected' : ''}>顺时针</option>
                        <option value="-1" ${config.direction === -1 ? 'selected' : ''}>逆时针</option>
                    </select>
                </div>
                <div class="config-form-group">
                    <label>图片大小（px）：</label>
                    <div class="config-slider-group">
                        <input type="range" class="config-slider" id="itemSize" 
                               min="40" max="120" step="5" value="${config.itemSize}">
                        <span class="config-value" id="itemSizeValue">${config.itemSize}px</span>
                    </div>
                </div>
            `;
        } else if (layoutName === 'wave') {
            html = `
                <div class="config-form-group">
                    <label>波浪振幅：</label>
                    <div class="config-slider-group">
                        <input type="range" class="config-slider" id="amplitude" 
                               min="20" max="100" step="5" value="${config.amplitude}">
                        <span class="config-value" id="amplitudeValue">${config.amplitude}px</span>
                    </div>
                </div>
                <div class="config-form-group">
                    <label>波浪频率：</label>
                    <div class="config-slider-group">
                        <input type="range" class="config-slider" id="frequency" 
                               min="0.2" max="1.0" step="0.05" value="${config.frequency}">
                        <span class="config-value" id="frequencyValue">${config.frequency}</span>
                    </div>
                </div>
                <div class="config-form-group">
                    <label>水平间距：</label>
                    <div class="config-slider-group">
                        <input type="range" class="config-slider" id="spacing" 
                               min="80" max="200" step="10" value="${config.spacing}">
                        <span class="config-value" id="spacingValue">${config.spacing}px</span>
                    </div>
                </div>
                <div class="config-form-group">
                    <label>波形类型：</label>
                    <select id="waveType" class="config-select">
                        <option value="sine" ${config.waveType === 'sine' ? 'selected' : ''}>正弦波</option>
                        <option value="cosine" ${config.waveType === 'cosine' ? 'selected' : ''}>余弦波</option>
                    </select>
                </div>
                <div class="config-form-group">
                    <label>图片大小（px）：</label>
                    <div class="config-slider-group">
                        <input type="range" class="config-slider" id="itemSize" 
                               min="60" max="150" step="5" value="${config.itemSize}">
                        <span class="config-value" id="itemSizeValue">${config.itemSize}px</span>
                    </div>
                </div>
                <div class="config-form-group">
                    <label>垂直偏移：</label>
                    <div class="config-slider-group">
                        <input type="range" class="config-slider" id="verticalOffset" 
                               min="-100" max="100" step="10" value="${config.verticalOffset}">
                        <span class="config-value" id="verticalOffsetValue">${config.verticalOffset}px</span>
                    </div>
                </div>
            `;
        }
        
        return html;
    }

    bindConfigInputs(layoutName) {
        const sliders = document.querySelectorAll('.config-slider');
        const selects = document.querySelectorAll('.config-select');
        
        let debounceTimer;
        
        // 实时预览，使用 debounce
        const updatePreview = () => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                this.applyLayoutConfig();
            }, 300);
        };
        
        // 绑定滑块事件
        sliders.forEach(slider => {
            slider.addEventListener('input', (e) => {
                const id = e.target.id;
                const value = parseFloat(e.target.value);
                const valueDisplay = document.getElementById(id + 'Value');
                
                // 更新显示值
                if (id === 'startAngle') {
                    valueDisplay.textContent = value + '°';
                } else if (id.includes('Size') || id.includes('Radius') || id === 'amplitude' || id === 'spacing' || id === 'verticalOffset') {
                    valueDisplay.textContent = value + 'px';
                } else {
                    valueDisplay.textContent = value;
                }
                
                // 更新配置
                const config = this.getLayoutConfig(layoutName);
                config[id] = value;
                this.setLayoutConfig(layoutName, config);
                
                updatePreview();
            });
        });
        
        // 绑定下拉框事件
        selects.forEach(select => {
            select.addEventListener('change', (e) => {
                const id = e.target.id;
                const value = e.target.value;
                
                // 更新配置
                const config = this.getLayoutConfig(layoutName);
                if (id === 'direction' || id === 'circles') {
                    config[id] = parseInt(value);
                } else {
                    config[id] = value;
                }
                this.setLayoutConfig(layoutName, config);
                
                updatePreview();
            });
        });
    }

    applyLayoutConfig() {
        this.renderPhotos();
    }

    // 获取存储使用情况
    getStorageInfo() {
        const used = JSON.stringify(this.photos).length;
        const total = 5 * 1024 * 1024; // 5MB 限制
        return {
            used: used,
            total: total,
            percentage: (used / total) * 100
        };
    }
}

// 初始化应用
let photoWall;
document.addEventListener('DOMContentLoaded', () => {
    photoWall = new PhotoWall();
    
    // 显示存储信息（可选）
    const storageInfo = photoWall.getStorageInfo();
    if (storageInfo.percentage > 80) {
        console.warn('存储空间使用率较高:', storageInfo.percentage.toFixed(1) + '%');
    }
    
    // 添加全局测试函数
    window.testPhotoWall = () => {
        console.log('=== PhotoWall 测试 ===');
        console.log('当前布局:', photoWall.currentLayout);
        console.log('照片数量:', photoWall.photos.length);
        console.log('交互容器:', document.getElementById('starInteractiveContainer'));
        console.log('视图控制:', document.getElementById('viewControls'));
        console.log('缩放级别:', photoWall.zoomLevel);
        console.log('拖拽偏移:', photoWall.dragOffset);
        
        // 测试切换到星空布局
        if (photoWall.currentLayout !== 'star') {
            console.log('切换到星空布局进行测试...');
            photoWall.switchLayout('star');
        }
    };
});

// 导出到全局作用域，供HTML中的onclick使用
window.photoWall = photoWall;
