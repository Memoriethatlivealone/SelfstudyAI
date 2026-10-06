// 主应用逻辑
class NavigationApp {
    constructor() {
        this.mapService = null;
        this.routeService = null;
        this.searchService = null;
        this.currentProfile = 'driving-car';
        this.pendingInputType = null; // 'start' 或 'end'
        this.locations = {
            start: null,
            end: null
        };

        this.init();
    }

    // 初始化应用
    init() {
        // 初始化服务
        this.mapService = new MapService('map', CONFIG);
        this.routeService = new RouteService(CONFIG);
        this.searchService = new SearchService(CONFIG);

        // 绑定事件
        this.bindEvents();

        // 检查 URL 参数
        this.loadFromURLParams();

        // 显示欢迎消息
        this.showMessage('欢迎使用智能导航系统！请输入起点和终点开始导航。', 'info');
    }

    // 从 URL 参数加载起点和终点
    loadFromURLParams() {
        const urlParams = new URLSearchParams(window.location.search);
        const start = urlParams.get('start');
        const end = urlParams.get('end');

        if (start) {
            document.getElementById('start').value = start;
            setTimeout(() => this.searchAndSetLocation('start', start), 500);
        }

        if (end) {
            document.getElementById('end').value = end;
            setTimeout(() => this.searchAndSetLocation('end', end), 1000);
        }

        // 如果同时有起点和终点，自动搜索路线
        if (start && end) {
            setTimeout(() => this.searchRoute(), 2000);
        }
    }

    // 绑定事件
    bindEvents() {
        // 路线类型按钮
        document.querySelectorAll('.route-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.route-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentProfile = e.target.dataset.profile;
            });
        });

        // 搜索路线按钮
        document.getElementById('search-route').addEventListener('click', () => {
            this.searchRoute();
        });

        // 清空按钮
        document.getElementById('clear-route').addEventListener('click', () => {
            this.clearAll();
        });

        // 使用当前位置按钮
        document.getElementById('use-current-location').addEventListener('click', () => {
            this.useCurrentLocation();
        });

        // 输入框事件
        const startInput = document.getElementById('start');
        const endInput = document.getElementById('end');

        // 输入框获得焦点时，启用地图点击
        startInput.addEventListener('focus', () => {
            this.pendingInputType = 'start';
            this.showMessage('您可以在地图上点击选择起点，或直接输入地址', 'info');
        });

        endInput.addEventListener('focus', () => {
            this.pendingInputType = 'end';
            this.showMessage('您可以在地图上点击选择终点，或直接输入地址', 'info');
        });

        // 输入框失去焦点时，清除待定类型
        startInput.addEventListener('blur', () => {
            setTimeout(() => {
                if (this.pendingInputType === 'start') {
                    this.pendingInputType = null;
                }
            }, 200);
        });

        endInput.addEventListener('blur', () => {
            setTimeout(() => {
                if (this.pendingInputType === 'end') {
                    this.pendingInputType = null;
                }
            }, 200);
        });

        // 输入框回车键搜索
        startInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.searchAndSetLocation('start', startInput.value);
            }
        });

        endInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.searchAndSetLocation('end', endInput.value);
            }
        });

        // 地图点击事件
        this.mapService.onMapClick((latlng) => {
            if (this.pendingInputType) {
                this.setLocationFromMap(this.pendingInputType, latlng);
            }
        });
    }

    // 搜索并设置位置
    async searchAndSetLocation(type, query) {
        if (!query || query.trim() === '') {
            this.showMessage('请输入有效的地址', 'warning');
            return;
        }

        this.showLoading(true);

        try {
            const results = await this.searchService.searchPlace(query);

            if (results.length === 0) {
                this.showMessage('未找到相关地点，请尝试其他关键词', 'warning');
                return;
            }

            // 使用第一个结果
            const location = results[0];
            this.setLocation(type, location);
            this.showMessage(`已设置${type === 'start' ? '起点' : '终点'}：${location.name}`, 'success');

        } catch (error) {
            console.error('搜索失败:', error);
            this.showMessage(error.message || '搜索失败，请稍后重试', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    // 从地图点击设置位置
    async setLocationFromMap(type, latlng) {
        this.showLoading(true);

        try {
            const location = await this.searchService.reverseGeocode(latlng.lat, latlng.lng);
            this.setLocation(type, location);
            this.showMessage(`已从地图选择${type === 'start' ? '起点' : '终点'}：${location.name}`, 'success');
        } catch (error) {
            console.error('地理编码失败:', error);
            // 即使地理编码失败，也使用坐标
            const location = {
                name: `位置 (${latlng.lat.toFixed(6)}, ${latlng.lng.toFixed(6)})`,
                address: `经纬度: ${latlng.lat.toFixed(6)}, ${latlng.lng.toFixed(6)}`,
                lat: latlng.lat,
                lng: latlng.lng
            };
            this.setLocation(type, location);
            this.showMessage(`已设置${type === 'start' ? '起点' : '终点'}坐标`, 'success');
        } finally {
            this.showLoading(false);
            this.pendingInputType = null;
        }
    }

    // 设置位置
    setLocation(type, location) {
        this.locations[type] = {
            lat: location.lat,
            lng: location.lng,
            name: location.name,
            address: location.address
        };

        // 更新输入框
        const input = document.getElementById(type);
        input.value = location.name;

        // 添加地图标记
        this.mapService.addMarker(
            type,
            [location.lat, location.lng],
            `<strong>${type === 'start' ? '起点' : '终点'}</strong><br>${location.address}`
        );

        // 如果有两个点，调整视图
        if (this.locations.start && this.locations.end) {
            this.mapService.fitMarkersBounds();
        } else {
            this.mapService.flyTo([location.lat, location.lng], 15);
        }
    }

    // 使用当前位置
    async useCurrentLocation() {
        this.showLoading(true);
        this.showMessage('正在获取您的位置...', 'info');

        try {
            const position = await this.searchService.getCurrentLocation();
            const location = await this.searchService.reverseGeocode(position.lat, position.lng);

            this.setLocation('start', location);
            this.showMessage(`已获取当前位置：${location.name}`, 'success');

            // 添加当前位置标记
            this.mapService.addMarker(
                'current',
                [position.lat, position.lng],
                `<strong>当前位置</strong><br>${location.address}<br>精度: ±${Math.round(position.accuracy)}米`
            );

        } catch (error) {
            console.error('定位失败:', error);
            this.showMessage(error.message || '无法获取当前位置', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    // 搜索路线
    async searchRoute() {
        if (!this.locations.start) {
            this.showMessage('请先设置起点', 'warning');
            document.getElementById('start').focus();
            return;
        }

        if (!this.locations.end) {
            this.showMessage('请先设置终点', 'warning');
            document.getElementById('end').focus();
            return;
        }

        this.showLoading(true);
        this.showMessage('正在规划路线...', 'info');

        try {
            const route = await this.routeService.calculateRoute(
                this.locations.start,
                this.locations.end,
                this.currentProfile
            );

            // 绘制路线
            this.mapService.drawRoute(route.coordinates);

            // 显示路线信息
            this.displayRouteInfo(route);

            this.showMessage('路线规划成功！', 'success');

        } catch (error) {
            console.error('路线规划失败:', error);
            this.showMessage(error.message || '路线规划失败，请检查起点和终点是否可达', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    // 显示路线信息
    displayRouteInfo(route) {
        const routeInfo = document.getElementById('route-info');
        const distance = document.getElementById('distance');
        const duration = document.getElementById('duration');
        const routeType = document.getElementById('route-type');

        distance.textContent = route.distance;
        duration.textContent = route.duration;
        routeType.textContent = `${route.profileIcon} ${route.profile}`;

        routeInfo.style.display = 'block';
    }

    // 清空所有
    clearAll() {
        // 清空输入
        document.getElementById('start').value = '';
        document.getElementById('end').value = '';

        // 清空位置
        this.locations.start = null;
        this.locations.end = null;

        // 清空地图
        this.mapService.clearRoute();
        this.mapService.clearAllMarkers();

        // 隐藏路线信息
        document.getElementById('route-info').style.display = 'none';

        // 重置地图视图
        this.mapService.flyTo(CONFIG.defaultCenter, CONFIG.defaultZoom);

        this.showMessage('已清空所有内容', 'info');
    }

    // 显示消息
    showMessage(message, type = 'info') {
        const statusMessage = document.getElementById('status-message');
        statusMessage.textContent = message;
        statusMessage.className = `status-message ${type} show`;

        // 3秒后自动隐藏（除了错误消息）
        setTimeout(() => {
            if (type !== 'error') {
                statusMessage.classList.remove('show');
            }
        }, 3000);
    }

    // 显示/隐藏加载动画
    showLoading(show) {
        const loadingOverlay = document.getElementById('loading-overlay');
        if (show) {
            loadingOverlay.classList.add('show');
        } else {
            loadingOverlay.classList.remove('show');
        }
    }
}

// 应用启动
document.addEventListener('DOMContentLoaded', () => {
    const app = new NavigationApp();

    // 全局错误处理
    window.addEventListener('error', (e) => {
        console.error('全局错误:', e.error);
    });

    window.addEventListener('unhandledrejection', (e) => {
        console.error('未处理的 Promise 拒绝:', e.reason);
    });
});
