export const swaggerConfig = {
  swagger: {
    info: {
      title: 'RFID 系統 API',
      description: 'RFID 商品標籤管理系統 - 使用 Fastify, Prisma 和 DDD 架構',
      version: '1.0.0'
    },
    externalDocs: {
      url: 'https://github.com/your-repo/rfid-system',
      description: '更多資訊請參考 GitHub'
    },
    schemes: ['http'],
    consumes: ['application/json'],
    produces: ['application/json'],
    tags: [
      { name: 'RFID', description: 'RFID 標籤管理相關 API' },
      { name: 'Box', description: '箱子管理相關 API' },
      { name: 'Shipment', description: '出貨單管理相關 API' }
    ],
  }
};
