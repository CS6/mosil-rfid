export const swaggerConfig = {
  swagger: {
    info: {
      title: 'RFID 系統 API',
      description: 'RFID 商品標籤管理系統 - 使用 Fastify, Prisma 和 DDD 架構\n\n**基礎路徑:** https://api.calerdo.com/api/v1\n\n**認證方式:** Bearer Token (JWT)\n\n**回應格式規範:**\n- 成功回應: `{"message": "success", "data": {...}}`\n- 錯誤回應: `{"message": "錯誤描述", "errorCode": "ERROR_CODE", "details": {...}}`',
      version: '1.0.0'
    },
    host: process.env.NODE_ENV === 'production' ? 'api.calerdo.com' : '127.0.0.1:3001',
    basePath: '/api/v1',
    externalDocs: {
      url: 'https://github.com/your-repo/rfid-system',
      description: '更多資訊請參考 GitHub'
    },
    schemes: process.env.NODE_ENV === 'production' ? ['https'] : ['http'],
    consumes: ['application/json'],
    produces: ['application/json'],
    securityDefinitions: {
      bearerAuth: {
        type: 'apiKey' as const,
        name: 'Authorization',
        in: 'header' as const,
        description: 'JWT Authorization header using the Bearer scheme. Example: "Authorization: Bearer {token}"'
      }
    },
    security: [
      { bearerAuth: [] }
    ],
    tags: [
      { name: 'RFID', description: 'RFID 標籤管理相關 API' },
      { name: 'Box', description: '箱子管理相關 API' },
      { name: 'Shipment', description: '出貨單管理相關 API' }
    ],
  }
};
