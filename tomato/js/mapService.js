// 地图服务模块
class MapService {
    constructor(mapElementId, config) {
        this.config = config;
        this.map = null;
        this.markers = {
            start: null,
            end: null,
            current: null
        };
        this.routeLayer = null;
        this.clickCallback = null;

        this.initMap(mapElementId);
    }

    // 初始化地图
    initMap(elementId) {
        this.map = L.map(elementId).setView(
            this.config.defaultCenter,
            this.config.defaultZoom
        );

        // 添加瓦片层
        L.tileLayer(this.config.tileLayer.url, {
            attribution: this.config.tileLayer.attribution,
            maxZoom: 19
        }).addTo(this.map);

        // 地图点击事件
        this.map.on('click', (e) => {
            if (this.clickCallback) {
                this.clickCallback(e.latlng);
            }
        });
    }

    // 设置地图点击回调
    onMapClick(callback) {
        this.clickCallback = callback;
    }

    // 添加标记
    addMarker(type, latlng, popupText) {
        // 移除旧标记
        if (this.markers[type]) {
            this.map.removeLayer(this.markers[type]);
        }

        // 创建自定义图标
        const iconHtml = this.getMarkerIcon(type);
        const icon = L.divIcon({
            html: iconHtml,
            className: 'custom-marker',
            iconSize: [30, 30],
            iconAnchor: [15, 15],
            popupAnchor: [0, -15]
        });

        // 添加新标记
        this.markers[type] = L.marker(latlng, { icon })
            .addTo(this.map);

        if (popupText) {
            this.markers[type].bindPopup(popupText).openPopup();
        }

        return this.markers[type];
    }

    // 获取标记图标
    getMarkerIcon(type) {
        const icons = {
            start: '🏁',
            end: '🎯',
            current: '📍'
        };
        return icons[type] || '📍';
    }

    // 绘制路线
    drawRoute(coordinates, color = '#667eea') {
        // 移除旧路线
        this.clearRoute();

        // 转换坐标格式（OSRM返回的是 [lng, lat]）
        const latlngs = coordinates.map(coord => [coord[1], coord[0]]);

        // 绘制路线
        this.routeLayer = L.polyline(latlngs, {
            color: color,
            weight: 5,
            opacity: 0.7,
            smoothFactor: 1
        }).addTo(this.map);

        // 调整视图以适应路线
        this.map.fitBounds(this.routeLayer.getBounds(), {
            padding: [50, 50]
        });
    }

    // 清除路线
    clearRoute() {
        if (this.routeLayer) {
            this.map.removeLayer(this.routeLayer);
            this.routeLayer = null;
        }
    }

    // 清除标记
    clearMarker(type) {
        if (this.markers[type]) {
            this.map.removeLayer(this.markers[type]);
            this.markers[type] = null;
        }
    }

    // 清除所有标记
    clearAllMarkers() {
        Object.keys(this.markers).forEach(type => {
            this.clearMarker(type);
        });
    }

    // 移动到指定位置
    flyTo(latlng, zoom = 15) {
        this.map.flyTo(latlng, zoom, {
            duration: 1
        });
    }

    // 获取地图中心
    getCenter() {
        const center = this.map.getCenter();
        return [center.lat, center.lng];
    }

    // 调整视图以显示所有标记
    fitMarkersBounds() {
        const bounds = L.latLngBounds();
        let hasMarkers = false;

        Object.values(this.markers).forEach(marker => {
            if (marker) {
                bounds.extend(marker.getLatLng());
                hasMarkers = true;
            }
        });

        if (hasMarkers) {
            this.map.fitBounds(bounds, {
                padding: [50, 50],
                maxZoom: 15
            });
        }
    }

    // 获取标记位置
    getMarkerPosition(type) {
        if (this.markers[type]) {
            const latlng = this.markers[type].getLatLng();
            return [latlng.lat, latlng.lng];
        }
        return null;
    }

    // 禁用/启用地图交互
    setInteractive(enabled) {
        if (enabled) {
            this.map.dragging.enable();
            this.map.scrollWheelZoom.enable();
            this.map.doubleClickZoom.enable();
        } else {
            this.map.dragging.disable();
            this.map.scrollWheelZoom.disable();
            this.map.doubleClickZoom.disable();
        }
    }
}
