class PhotoWall {
    constructor() {
        this.photos = [];
        this.currentPhotoIndex = -1;
        this.currentLayout = 'grid';
        this.carouselIndex = 0;
        this.init();
    }

    init() {
        this.loadPhotos();
        this.loadLayoutPreference();
        this.bindEvents();
        this.renderPhotos();
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
        const containers = ['photoGrid', 'photoMasonry', 'photoList', 'photoCarousel', 
                           'photoStar', 'photoKaleidoscope', 'photoSpiral', 'photoWave', 'photoCard3d'];
        const emptyHTML = `
            <div class="empty-state">
                <i class="fas fa-images"></i>
                <h3>还没有照片</h3>
                <p>点击上方按钮或拖拽照片到这里开始创建你的照片墙</p>
            </div>
        `;
        
        containers.forEach(containerId => {
            const container = document.getElementById(containerId);
            if (container) {
                container.innerHTML = emptyHTML;
            }
        });
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
        this.initDragAndDrop();
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
        this.initDragAndDrop();
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
        this.initDragAndDrop();
    }

    renderCarouselLayout() {
        const carouselTrack = document.getElementById('carouselTrack');
        const carouselIndicators = document.getElementById('carouselIndicators');
        
        if (this.photos.length === 0) return;

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
    }

    bindPhotoEvents() {
        // 绑定所有照片项的点击事件
        const photoSelectors = [
            '.photo-item', 
            '.star-item', 
            '.kaleidoscope-item', 
            '.spiral-item', 
            '.wave-item', 
            '.card3d-item'
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
            indicator.addEventListener('click', () => {
                this.carouselIndex = index;
                this.updateCarouselPosition();
            });
        });

        // 轮播项点击事件
        document.querySelectorAll('.carousel-item').forEach((item, index) => {
            item.addEventListener('click', () => {
                this.showPhotoModal(index);
            });
        });
    }

    switchLayout(layout) {
        if (this.currentLayout === layout) return;
        
        this.currentLayout = layout;
        this.saveLayoutPreference();
        
        // 添加切换动画
        const container = document.getElementById('photoContainer');
        container.classList.add('layout-transition');
        
        setTimeout(() => {
            this.hideAllLayouts();
            this.showCurrentLayout();
            this.renderPhotos();
            
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
        const radius = Math.min(containerWidth, containerHeight) * 0.3;
        
        starContainer.innerHTML = this.photos.map((photo, index) => {
            const angle = (index * 2 * Math.PI) / this.photos.length;
            const x = centerX + radius * Math.cos(angle) - 60;
            const y = centerY + radius * Math.sin(angle) - 60;
            
            return `
                <div class="star-item" data-index="${index}" style="left: ${x}px; top: ${y}px;">
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
        
        spiralContainer.innerHTML = this.photos.map((photo, index) => {
            const angle = index * 0.5;
            const radius = Math.min(50 + index * 15, maxRadius);
            const x = centerX + radius * Math.cos(angle) - 40;
            const y = centerY + radius * Math.sin(angle) - 40;
            
            return `
                <div class="spiral-item" data-index="${index}" style="left: ${x}px; top: ${y}px;">
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
        const spacing = Math.min(120, containerWidth / this.photos.length);
        
        waveContainer.innerHTML = this.photos.map((photo, index) => {
            const x = centerX + (index - this.photos.length / 2) * spacing;
            const y = centerY + Math.sin(index * 0.5) * 50;
            
            return `
                <div class="wave-item" data-index="${index}" style="left: ${x}px; top: ${y}px;">
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

    initDragAndDrop() {
        const photoItems = document.querySelectorAll('.photo-item');
        
        photoItems.forEach(item => {
            item.addEventListener('dragstart', (e) => {
                e.dataTransfer.effectAllowed = 'move';
                e.dataTransfer.setData('text/plain', item.dataset.index);
                item.classList.add('dragging');
            });

            item.addEventListener('dragend', () => {
                item.classList.remove('dragging');
            });

            item.addEventListener('dragover', (e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
            });

            item.addEventListener('dragenter', (e) => {
                e.preventDefault();
                item.classList.add('drag-over');
            });

            item.addEventListener('dragleave', () => {
                item.classList.remove('drag-over');
            });

            item.addEventListener('drop', (e) => {
                e.preventDefault();
                item.classList.remove('drag-over');
                
                const draggedIndex = parseInt(e.dataTransfer.getData('text/plain'));
                const targetIndex = parseInt(item.dataset.index);
                
                if (draggedIndex !== targetIndex) {
                    this.movePhoto(draggedIndex, targetIndex);
                }
            });
        });
    }

    movePhoto(fromIndex, toIndex) {
        const photo = this.photos.splice(fromIndex, 1)[0];
        this.photos.splice(toIndex, 0, photo);
        this.savePhotos();
        this.renderPhotos();
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

    savePhotos() {
        try {
            localStorage.setItem('photoWall', JSON.stringify(this.photos));
        } catch (error) {
            console.error('保存照片失败:', error);
            alert('保存照片失败，请检查浏览器存储空间！');
        }
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
});

// 导出到全局作用域，供HTML中的onclick使用
window.photoWall = photoWall;
