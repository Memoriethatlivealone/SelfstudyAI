// 配置文件
const CONFIG = {
    // 地图默认中心（北京天安门）
    defaultCenter: [39.9042, 116.4074],
    defaultZoom: 13,

    // OpenStreetMap 瓦片服务器
    tileLayer: {
        url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    },

    // Nominatim 搜索服务（地点搜索）
    nominatim: {
        url: 'https://nominatim.openstreetmap.org/search',
        reverseUrl: 'https://nominatim.openstreetmap.org/reverse',
        format: 'json',
        limit: 5,
        // 遵守使用政策，添加应用标识
        email: 'user@example.com' // 在实际使用中请替换为真实邮箱
    },

    // OSRM 路线服务（路线规划）
    osrm: {
        url: 'https://router.project-osrm.org/route/v1',
        timeout: 10000 // 10秒超时
    },

    // 备用：OpenRouteService（需要API密钥）
    // 如果需要使用 OpenRouteService，请在这里配置
    openRouteService: {
        url: 'https://api.openrouteservice.org/v2/directions',
        apiKey: '' // 从环境变量或用户输入获取
    },

    // 路线配置
    routeProfiles: {
        'driving-car': {
            name: '驾车',
            icon: '🚗',
            osrmMode: 'driving' // OSRM 使用的模式
        },
        'foot-walking': {
            name: '步行',
            icon: '🚶',
            osrmMode: 'foot'
        },
        'cycling-regular': {
            name: '骑行',
            icon: '🚴',
            osrmMode: 'cycling'
        }
    },

    // 请求超时设置
    timeout: {
        search: 8000,
        route: 10000,
        geocode: 8000
    },

    // 地图标记颜色
    markerColors: {
        start: '#28a745',
        end: '#dc3545',
        current: '#007bff'
    }
};

// 从环境变量读取配置（如果有）
if (typeof window !== 'undefined' && window.ENV_CONFIG) {
    Object.assign(CONFIG, window.ENV_CONFIG);
}
