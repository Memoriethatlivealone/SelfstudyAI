// 搜索服务模块
class SearchService {
    constructor(config) {
        this.config = config;
    }

    // 地点搜索（地名转坐标）
    async searchPlace(query) {
        if (!query || query.trim() === '') {
            throw new Error('搜索关键词不能为空');
        }

        const url = new URL(this.config.nominatim.url);
        url.searchParams.append('q', query);
        url.searchParams.append('format', this.config.nominatim.format);
        url.searchParams.append('limit', this.config.nominatim.limit);
        url.searchParams.append('addressdetails', '1');
        url.searchParams.append('accept-language', 'zh-CN');

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), this.config.timeout.search);

            const response = await fetch(url.toString(), {
                signal: controller.signal,
                headers: {
                    'User-Agent': `NavigationApp/${this.config.nominatim.email}`
                }
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`搜索失败: HTTP ${response.status}`);
            }

            const data = await response.json();

            if (!data || data.length === 0) {
                throw new Error('未找到相关地点，请尝试其他关键词');
            }

            return this.formatSearchResults(data);
        } catch (error) {
            if (error.name === 'AbortError') {
                throw new Error('搜索超时，请检查网络连接');
            }
            throw error;
        }
    }

    // 格式化搜索结果
    formatSearchResults(data) {
        return data.map(item => ({
            name: item.display_name.split(',')[0],
            address: item.display_name,
            lat: parseFloat(item.lat),
            lng: parseFloat(item.lon),
            type: item.type,
            importance: item.importance
        }));
    }

    // 反向地理编码（坐标转地址）
    async reverseGeocode(lat, lng) {
        const url = new URL(this.config.nominatim.reverseUrl);
        url.searchParams.append('lat', lat);
        url.searchParams.append('lon', lng);
        url.searchParams.append('format', this.config.nominatim.format);
        url.searchParams.append('addressdetails', '1');
        url.searchParams.append('accept-language', 'zh-CN');

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), this.config.timeout.geocode);

            const response = await fetch(url.toString(), {
                signal: controller.signal,
                headers: {
                    'User-Agent': `NavigationApp/${this.config.nominatim.email}`
                }
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`地理编码失败: HTTP ${response.status}`);
            }

            const data = await response.json();

            if (!data || data.error) {
                throw new Error('无法获取该位置的地址信息');
            }

            return {
                name: data.display_name.split(',')[0],
                address: data.display_name,
                lat: parseFloat(data.lat),
                lng: parseFloat(data.lon)
            };
        } catch (error) {
            if (error.name === 'AbortError') {
                throw new Error('地理编码超时，请检查网络连接');
            }
            throw error;
        }
    }

    // 获取当前位置（浏览器定位）
    async getCurrentLocation() {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('您的浏览器不支持定位功能'));
                return;
            }

            const options = {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            };

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    resolve({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                        accuracy: position.coords.accuracy
                    });
                },
                (error) => {
                    let message = '无法获取当前位置';
                    switch (error.code) {
                        case error.PERMISSION_DENIED:
                            message = '定位权限被拒绝，请在浏览器设置中允许定位';
                            break;
                        case error.POSITION_UNAVAILABLE:
                            message = '位置信息不可用';
                            break;
                        case error.TIMEOUT:
                            message = '定位请求超时';
                            break;
                    }
                    reject(new Error(message));
                },
                options
            );
        });
    }

    // 验证坐标
    isValidCoordinate(lat, lng) {
        return (
            typeof lat === 'number' &&
            typeof lng === 'number' &&
            lat >= -90 &&
            lat <= 90 &&
            lng >= -180 &&
            lng <= 180
        );
    }
}
