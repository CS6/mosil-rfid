const fs = require('fs');
const path = require('path');

// 要處理的路由文件
const routeFiles = [
  'src/routes/box.routes.ts',
  'src/routes/rfid.routes.ts',
  'src/routes/shipment.routes.ts',
  'src/routes/user.routes.ts',
  'src/routes/log.routes.ts'
];

// 統一格式修正函數
function fixApiFormat(content) {
  // 1. 修正成功回應的 message 格式 (只針對成功回應的 message)
  content = content.replace(
    /(\s+200|\s+201)\s*:\s*\{[\s\S]*?message:\s*\{\s*type:\s*'string'\s*\}/g,
    (match) => match.replace(/message:\s*\{\s*type:\s*'string'\s*\}/, "message: { type: 'string', enum: ['success'] }")
  );

  // 2. 移除 productCount (客戶不需要，用統計表處理)
  content = content.replace(
    /\s*productCount:\s*\{\s*type:\s*'number'\s*\},?\s*\n/g,
    ''
  );

  // 3. 統一錯誤回應為 $ref (修正400錯誤回應)
  content = content.replace(
    /400:\s*\{\s*type:\s*'object',\s*properties:\s*\{\s*message:\s*\{\s*type:\s*'string'[^}]*\},\s*errorCode:\s*\{\s*type:\s*'string'\s*\},\s*details:\s*\{\s*type:\s*'object',\s*nullable:\s*true\s*\}\s*\}\s*\}/g,
    "400: {\n          $ref: 'errorResponseSchema#'\n        }"
  );

  // 4. 添加 401/403 到缺少的端點 (如果400錯誤回應已經更新為 $ref)
  content = content.replace(
    /(400:\s*\{\s*\$ref:\s*'errorResponseSchema#'\s*\}\s*)([\s\n]*\}\s*\}\s*\},?)/g,
    "$1,\n        401: {\n          $ref: 'unauthorizedResponseSchema#'\n        },\n        403: {\n          $ref: 'forbiddenResponseSchema#'\n        }\n      $2"
  );

  return content;
}

// 處理每個路由文件
routeFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  
  if (fs.existsSync(filePath)) {
    console.log(`處理 ${file}...`);
    const content = fs.readFileSync(filePath, 'utf8');
    const fixedContent = fixApiFormat(content);
    
    if (content !== fixedContent) {
      fs.writeFileSync(filePath, fixedContent);
      console.log(`✅ ${file} 已更新`);
    } else {
      console.log(`⚪ ${file} 無需更新`);
    }
  } else {
    console.log(`❌ ${file} 檔案不存在`);
  }
});

console.log('🎉 API 格式統一完成！');