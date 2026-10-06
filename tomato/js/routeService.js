// 路线规划服务模块
class RouteService {
    constructor(config) {
        this.config = config;
    }

    // 计算路线（使用 OSRM）
    async calculateRoute(startCoord, endCoord, profile = 'driving-car') {
        if (!this.validateCoordinates(startCoord, endCoord)) {
            throw new Error('无效的起点或终点坐标');
        }

        // 获取 OSRM 模式
        const osrmMode = this.config.routeProfiles[profile]?.osrmMode || 'driving';

        // 构建 OSRM URL
        const url = `${this.config.osrm.url}/${osrmMode}/${startCoord.lng},${startCoord.lat};${endCoord.lng},${endCoord.lat}`;
        const params = new URLSearchParams({
            overview: 'full',
            geometries: 'geojson',
            steps: 'true',
            annotations: 'true'
        });

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), this.config.osrm.timeout);

            const response = await fetch(`${url}?${params.toString()}`, {
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`路线规划失败: HTTP ${response.status}`);
            }

            const data = await response.json();

            if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) {
                throw new Error('未找到有效路线，请检查起点和终点是否可达');
            }

            return this.formatRouteResult(data.routes[0], profile);
        } catch (error) {
            if (error.name === 'AbortError') {
                throw new Error('路线规划超时，请检查网络连接或稍后重试');
            }
            throw error;
        }
    }

    // 格式化路线结果
    formatRouteResult(route, profile) {
        const distance = route.distance; // 单位：米
        const duration = route.duration; // 单位：秒
        const geometry = route.geometry.coordinates; // GeoJSON 坐标数组

        return {
            distance: this.formatDistance(distance),
            distanceValue: distance,
            duration: this.formatDuration(duration),
            durationValue: duration,
            profile: this.config.routeProfiles[profile]?.name || profile,
            profileIcon: this.config.routeProfiles[profile]?.icon || '🚗',
            coordinates: geometry,
            bounds: this.calculateBounds(geometry)
        };
    }

    // 格式化距离
    formatDistance(meters) {
        if (meters < 1000) {
            return `${Math.round(meters)} 米`;
        } else {
            return `${(meters / 1000).toFixed(2)} 公里`;
        }
    }

    // 格式化时间
    formatDuration(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);

        if (hours > 0) {
            return `${hours} 小时 ${minutes} 分钟`;
        } else if (minutes > 0) {
            return `${minutes} 分钟`;
        } else {
            return '少于 1 分钟';
        }
    }

    // 计算边界
    calculateBounds(coordinates) {
        let minLat = Infinity, maxLat = -Infinity;
        let minLng = Infinity, maxLng = -Infinity;

        coordinates.forEach(coord => {
            const [lng, lat] = coord;
            minLat = Math.min(minLat, lat);
            maxLat = Math.max(maxLat, lat);
            minLng = Math.min(minLng, lng);
            maxLng = Math.max(maxLng, lng);
        });

        return {
            southwest: [minLat, minLng],
            northeast: [maxLat, maxLng]
        };
    }

    // 验证坐标
    validateCoordinates(start, end) {
        const isValid = (coord) => {
            return (
                coord &&
                typeof coord.lat === 'number' &&
                typeof coord.lng === 'number' &&
                coord.lat >= -90 &&
                coord.lat <= 90 &&
                coord.lng >= -180 &&
                coord.lng <= 180
            );
        };

        return isValid(start) && isValid(end);
    }

    // 计算两点间的直线距离（单位：米）
    calculateDistance(coord1, coord2) {
        const R = 6371e3; // 地球半径（米）
        const φ1 = coord1.lat * Math.PI / 180;
        const φ2 = coord2.lat * Math.PI / 180;
        const Δφ = (coord2.lat - coord1.lat) * Math.PI / 180;
        const Δλ = (coord2.lng - coord1.lng) * Math.PI / 180;

        const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c;
    }

    // 备用：使用 OpenRouteService（需要 API 密钥）
    async calculateRouteWithORS(startCoord, endCoord, profile = 'driving-car') {
        if (!this.config.openRouteService.apiKey) {
            throw new Error('OpenRouteService API 密钥未配置');
        }

        const url = `${this.config.openRouteService.url}/${profile}/geojson`;

        const body = {
            coordinates: [
                [startCoord.lng, startCoord.lat],
                [endCoord.lng, endCoord.lat]
            ],
            instructions: false,
            preference: 'recommended'
        };

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), this.config.timeout.route);

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': this.config.openRouteService.apiKey
                },
                body: JSON.stringify(body),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`OpenRouteService 路线规划失败: HTTP ${response.status}`);
            }

            const data = await response.json();

            if (!data.features || data.features.length === 0) {
                throw new Error('未找到有效路线');
            }

            const feature = data.features[0];
            const properties = feature.properties.segments[0];

            return {
                distance: this.formatDistance(properties.distance),
                distanceValue: properties.distance,
                duration: this.formatDuration(properties.duration),
                durationValue: properties.duration,
                profile: this.config.routeProfiles[profile]?.name || profile,
                profileIcon: this.config.routeProfiles[profile]?.icon || '🚗',
                coordinates: feature.geometry.coordinates
            };
        } catch (error) {
            if (error.name === 'AbortError') {
                throw new Error('路线规划超时');
            }
            throw error;
        }
    }
}
