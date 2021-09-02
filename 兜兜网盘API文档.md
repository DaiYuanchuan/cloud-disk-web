# 兜兜网盘api接口文档

**简介**: 网盘系统后端api接口文档

**host**: cloud.api.novelweb.cn

**basePath**: /

**服务Url**: https://cloud.api.novelweb.cn/

**邮箱**: novel-web@novelweb.cn

**Version**: 3.0

[TOC]

# 更新记录
## 2021 年 8 月 27 日
第一版api接口文档，提供用户登录、注册、邮件发送、文件管理等模块的功能接口

# 接口全局说明:

## 消息体字段中可选属性取值说明

| 属性 | 说明 | 描述 |
| -------- | -------- | ----- |
|M|必选|必选字段在请求中必须携带，如不携带则判定请求非法|
|O|任意可选|包含任意可选与条件可选，可以不携带，或不反回|
|C|条件可选||

## 接口基本消息参数

| 参数名称 | 说明 | 例子 |
| -------- | -------- | -------- |
|Cookie|携带用户鉴权信息(登陆时获取)<br/>格式：bjg_sid={token}|Cookie:bjg_sid=c57bcd5a-8aa8-4725-a244-4ac1f81fc869|

## 全局返回码说明

| code | 描述 |
| -------- | -------- |
|200|请求完成|
|500|系统异常，请联系管理人员|
|1|参数异常，校验失败|
|400|数据异常|
|401|授权异常|
|403|当前账号没有对应权限|
|405|不被支持的Http请求方式|
|406|数字格式异常|
|415|不支持的媒体类型|
|413|负载过大|
|416|方法参数类型不匹配|
|499|账号被限制登录|

# 登录注册模块

## 密码登录

**接口地址**:`/disk-user/cloud-disk-login`

**请求方式**:`POST`

**请求数据类型**:`application/x-www-form-urlencoded`

**响应数据类型**:`application/json;charset=UTF-8`

**接口描述**:
<br/>通过用户登录接口可以获取token，以及当前登录的用户信息<br/>
token是开发者的全局唯一接口调用凭据，开发者调用各接口时都需使用token。<br/>
token的有效期目前为5个小时，需定时刷新<br/>

**请求参数**:

| 参数名称 | 参数说明 | 约束 | 数据类型 |
| -------- | -------- | -------- | -------- |
|username|用户名、邮箱|M|string|
|password|密码|M|string|

**响应参数**:

| 参数名称 | 参数说明 | 类型 | 约束 |
| -------- | -------- | ----- |----- |
|code|状态码|string|M|
|data|数据对象|object|C|
|&emsp;&emsp;requestUrl|当前请求对象的Host|string|M|
|&emsp;&emsp;token|鉴权凭证|string|M|
|&emsp;&emsp;userBanTimeFormat|账号被封禁的时间(天)|string|C|
|&emsp;&emsp;userInfo|用户数据|object|C|
|&emsp;&emsp;&emsp;&emsp;available|当前账号是否可用|boolean|M|
|&emsp;&emsp;&emsp;&emsp;createTime|创建时间|string|M|
|&emsp;&emsp;&emsp;&emsp;updateTime|更新时间|string|M|
|&emsp;&emsp;&emsp;&emsp;userAvatar|用户头像|string|M|
|&emsp;&emsp;&emsp;&emsp;userBanTime|账号被封禁的时间(秒)<br/>-1:永久，0:正常|integer|M|
|&emsp;&emsp;&emsp;&emsp;userEmail|用户邮箱|string|M|
|&emsp;&emsp;&emsp;&emsp;userId|用户唯一标识|integer|M|
|&emsp;&emsp;&emsp;&emsp;userName|用户名|string|M|
|&emsp;&emsp;&emsp;&emsp;userPwd|用户密文密码|string|M|
|&emsp;&emsp;&emsp;&emsp;userReason|当前账号不可用原因|string|O|
|&emsp;&emsp;&emsp;&emsp;userTotalDiskCapacity|磁盘总容量(字节)|number|M|
|&emsp;&emsp;&emsp;&emsp;userUsedDiskCapacity|已用磁盘容量(字节)|number|M|
|&emsp;&emsp;&emsp;&emsp;userRemainingDiskCapacity|剩余磁盘容量(字节)|number|M|
|&emsp;&emsp;&emsp;&emsp;userTotalTraffic|总流量(字节)|number|M|
|&emsp;&emsp;&emsp;&emsp;userUsedTraffic|已用流量(字节)|number|M|
|&emsp;&emsp;&emsp;&emsp;userRemainingTraffic|剩余流量(字节)|number|M|
|&emsp;&emsp;&emsp;&emsp;userUnlockTime|账号解封时间|string|O|
|message|描述|string|M|

**响应示例**:

```json
{
  "code": "200",
  "data": {
    "requestUrl": "",
    "token": "",
    "userBanTimeFormat": "",
    "userInfo": {
      "available": true,
      "createTime": "",
      "updateTime": "",
      "userAvatar": "",
      "userBanTime": 0,
      "userEmail": "",
      "userId": 0,
      "userName": "",
      "userPwd": "",
      "userReason": "",
      "userTotalDiskCapacity": 0,
      "userUsedDiskCapacity": 0,
      "userRemainingDiskCapacity": 0,
      "userTotalTraffic": 0,
      "userUsedTraffic": 0,
      "userRemainingTraffic": 0,
      "userUnlockTime": ""
    }
  },
  "message": "请求成功"
}
```

**请求示例**:

```http request
POST /disk-user/cloud-disk-login?username=&password=
HTTP/1.1
Host: cloud.api.novelweb.cn
```

## 退出登陆

**接口地址**:`/disk-user/logout`

**请求方式**:`GET`

**请求数据类型**:`application/x-www-form-urlencoded`

**响应数据类型**:`application/json;charset=UTF-8`

**接口描述**:
<br/>手动退出登录的状态，删除对应的token

**请求参数**:

暂无

**响应参数**:

| 参数名称 | 参数说明 | 类型 | 约束 |
| -------- | -------- | ----- |----- |
|code|状态码|string|M|
|data|对象|string|C|
|message|描述|string|M|

**响应示例**:

```json
{
  "code": "200",
  "data": "已退出登录",
  "message": "请求成功"
}
```

**请求示例**:

```http request
GET /disk-user/logout
HTTP/1.1
Host: cloud.api.novelweb.cn
Cookie: bjg_sid=2d814ef-6d81-4560-ad07-6701c12c73
```

## 用户注册

**接口地址**:`/disk-user/register`

**请求方式**:`POST`

**请求数据类型**:`application/json`

**响应数据类型**:`application/json;charset=UTF-8`

**接口描述**:<p>注册新用户</p>

**请求参数**:

| 参数名称 | 参数说明 | 约束 | 数据类型 |
| -------- | -------- | -------- | -------- |
|&emsp;&emsp;securityCode|邮箱验证码|M|string|
|&emsp;&emsp;userAvatar|用户头像|M|string|
|&emsp;&emsp;userEmail|用户邮箱|M|string|
|&emsp;&emsp;userId|用户唯一标识(注册时写0)|M|integer|
|&emsp;&emsp;userName|用户名|M|string|
|&emsp;&emsp;userPwd|用户密码|M|string|

**响应参数**:

| 参数名称 | 参数说明 | 类型 | 约束 |
| -------- | -------- | ----- |----- |
|code|状态码|string|M|
|data|对象|string|C|
|message|描述|string|M|

**响应示例**:

```json
{
  "code": "200",
  "data": "注册成功",
  "message": "请求成功"
}
```

**请求示例**:

```http request
POST /disk-user/register
HTTP/1.1
Host: cloud.api.novelweb.cn
Content-Type: application/json

{
    "securityCode": "",
    "userAvatar": "",
    "userEmail": "",
    "userId": 0,
    "userName": "",
    "userPwd": ""
}
```

## 重置用户密码

**接口地址**:`/disk-user/reset-password`

**请求方式**:`POST`

**请求数据类型**:`application/json`

**响应数据类型**:`application/json;charset=UTF-8`

**接口描述**:<p>忘记密码时，可以使用此接口重置用户密码</p>

**请求参数**:

| 参数名称 | 参数说明 | 约束 | 数据类型 |
| -------- | -------- | -------- | -------- |
|&emsp;&emsp;securityCode|验证码|M|string|
|&emsp;&emsp;userEmail|用户邮箱|M|string|
|&emsp;&emsp;userPwd|用户密码|M|string|

**响应参数**:

| 参数名称 | 参数说明 | 类型 | 约束 |
| -------- | -------- | ----- |----- |
|code|状态码|string|M|
|data|对象|string|C|
|message|描述|string|M|

**响应示例**:

```json
{
  "code": "",
  "data": "",
  "message": ""
}
```

**请求示例**:

```http request
POST /disk-user/reset-password
HTTP/1.1
Host: cloud.api.novelweb.cn
Content-Type: application/json

{
    "securityCode": "",
    "userEmail": "",
    "userPwd": ""
}
```

## 发送邮箱验证码

**接口地址**:`/disk-user/send-security-code`

**请求方式**:`GET`

**请求数据类型**:`application/x-www-form-urlencoded`

**响应数据类型**:`application/json;charset=UTF-8`

**接口描述**:<p>指定邮箱，发送邮箱验证码</p>

**请求参数**:

| 参数名称 | 参数说明 | 约束 | 数据类型 |
| -------- | -------- | ----- | -------- |
|email|用户邮箱|M|string|
|exist|是否校验邮箱|O|boolean|

**响应参数**:

| 参数名称 | 参数说明 | 类型 | 约束 |
| -------- | -------- | ----- |----- |
|code|状态码|string|M|
|data|对象|string|C|
|message|描述|string|M|

**响应示例**:

```json
{
  "code": "200",
  "data": "验证码已发送",
  "message": "请求成功"
}
```

请求示例:

```http request
GET /disk-user/send-security-code?email=&exist=
HTTP/1.1
Host: cloud.api.novelweb.cn
```

## 校验邮箱验证码

**接口地址**:`/disk-user/verify-security-code`

**请求方式**:`GET`

**请求数据类型**:`application/x-www-form-urlencoded`

**响应数据类型**:`application/json;charset=UTF-8`

**接口描述**:<p>校验缓存中的邮箱验证码是否与请求中的邮箱验证码匹配</p>

**请求参数**:

| 参数名称 | 参数说明 | 约束 | 数据类型 |
| -------- | -------- | ----- | -------- |
|email|邮箱|M|string|
|code|验证码|M|string|

**响应参数**:

| 参数名称 | 参数说明 | 类型 | 约束 |
| -------- | -------- | ----- |----- |
|code|状态码|string|M|
|data|对象|boolean|C|
|message|描述|string|M|

**响应示例**:

```json
{
  "code": "200",
  "data": true,
  "message": "请求成功"
}
```

请求示例:

```http request
GET /disk-user/verify-security-code?email=&code=
HTTP/1.1
Host: cloud.api.novelweb.cn
```

# 用户模块

## 修改用户信息

**接口地址**:`/disk-user/update-user`

**请求方式**:`POST`

**请求数据类型**:`application/x-www-form-urlencoded`

**响应数据类型**:`application/json;charset=UTF-8`

**接口描述**:<p>修改用户基础信息</p>

**请求参数**:

| 参数名称 | 参数说明 | 约束 | 数据类型 |
| -------- | -------- | ----- | -------- |
|securityCode|邮箱验证码(修改邮箱时必填)|C|string|
|sourcePassword|原始密码(修改密码时必填)|C|string|
|userAvatar|用户头像|M|string|
|userEmail|用户邮箱|M|string|
|userId|用户唯一标识|M|number|
|userName|用户名|M|string|
|userPwd|用户新密码(修改密码时必填)|C|string|

**响应参数**:

| 参数名称 | 参数说明 | 类型 | 约束 |
| -------- | -------- | ----- |----- |
|code|状态码|string|M|
|data|对象|string|C|
|message|描述|string|M|

**响应示例**:

```json
{
  "code": "200",
  "data": "修改成功",
  "message": "请求成功"
}
```

请求示例:

```http request
GET /disk-user/update-user?userAvatar=&userEmail=&userId=&userName=
HTTP/1.1
Host: cloud.api.novelweb.cn
Cookie: bjg_sid=2d814ef-6d81-4560-ad07-6701c12c73
```

## 获取当前登录的用户信息

**接口地址**:`/disk-user/user-info`

**请求方式**:`GET`

**请求数据类型**:`application/x-www-form-urlencoded`

**响应数据类型**:`application/json;charset=UTF-8`

**接口描述**:<p>根据登录token，获取当前有效的用户对象信息</p>

**请求参数**:

暂无

**响应参数**:

| 参数名称 | 参数说明 | 类型 | 约束 |
| -------- | -------- | ----- |----- |
|code|状态码|string|M|
|data|数据对象|object|C|
|&emsp;&emsp;token|鉴权凭证|string|M|
|&emsp;&emsp;userInfo|用户数据|object|C|
|&emsp;&emsp;&emsp;&emsp;available|当前账号是否可用|boolean|M|
|&emsp;&emsp;&emsp;&emsp;createTime|创建时间|string|M|
|&emsp;&emsp;&emsp;&emsp;updateTime|更新时间|string|M|
|&emsp;&emsp;&emsp;&emsp;userAvatar|用户头像|string|M|
|&emsp;&emsp;&emsp;&emsp;userBanTime|账号被封禁的时间(秒)<br/>-1:永久，0:正常|integer|M|
|&emsp;&emsp;&emsp;&emsp;userEmail|用户邮箱|string|M|
|&emsp;&emsp;&emsp;&emsp;userId|用户唯一标识|integer|M|
|&emsp;&emsp;&emsp;&emsp;userName|用户名|string|M|
|&emsp;&emsp;&emsp;&emsp;userPwd|用户密文密码|string|M|
|&emsp;&emsp;&emsp;&emsp;userReason|当前账号不可用原因|string|O|
|&emsp;&emsp;&emsp;&emsp;userTotalDiskCapacity|磁盘总容量(字节)|number|M|
|&emsp;&emsp;&emsp;&emsp;userUsedDiskCapacity|已用磁盘容量(字节)|number|M|
|&emsp;&emsp;&emsp;&emsp;userRemainingDiskCapacity|剩余磁盘容量(字节)|number|M|
|&emsp;&emsp;&emsp;&emsp;userTotalTraffic|总流量(字节)|number|M|
|&emsp;&emsp;&emsp;&emsp;userUsedTraffic|已用流量(字节)|number|M|
|&emsp;&emsp;&emsp;&emsp;userRemainingTraffic|剩余流量(字节)|number|M|
|&emsp;&emsp;&emsp;&emsp;userUnlockTime|账号解封时间|string|O|
|message|描述|string|M|

**响应示例**:

```json
{
  "code": "200",
  "data": {
    "requestUrl": "",
    "token": "",
    "userInfo": {
      "available": true,
      "createTime": "",
      "updateTime": "",
      "userAvatar": "",
      "userBanTime": 0,
      "userEmail": "",
      "userId": 0,
      "userName": "",
      "userPwd": "",
      "userReason": "",
      "userTotalDiskCapacity": 0,
      "userUsedDiskCapacity": 0,
      "userRemainingDiskCapacity": 0,
      "userTotalTraffic": 0,
      "userUsedTraffic": 0,
      "userRemainingTraffic": 0,
      "userUnlockTime": ""
    }
  },
  "message": "请求成功"
}
```

请求示例:

```http request
GET /disk-user/user-info
HTTP/1.1
Host: cloud.api.novelweb.cn
Cookie: bjg_sid=2d814ef-6d81-4560-ad07-6701c12c73
```

## 修改用户头像

**接口地址**:`/uploader/uploader-avatar`

**请求方式**:`POST`

**请求数据类型**:`multipart/form-data`

**响应数据类型**:`application/json;charset=UTF-8`

**接口描述**:<p>修改用户头像信息</p>

**请求参数**:

| 参数名称 | 参数说明 | 约束 | 数据类型 |
| -------- | -------- | ----- | -------- |
|file|文件对象|M|file|

**响应参数**:

| 参数名称 | 参数说明 | 类型 | schema |
| -------- | -------- | ----- |----- |
|code|状态码|string|M|
|data|用户头像地址|string|C|
|message|描述|string|M|

**响应示例**:

```json
{
  "code": "",
  "data": "",
  "message": ""
}
```

**请求示例**

```http request
GET /uploader/uploader-avatar
HTTP/1.1
Host: cloud.api.novelweb.cn
Cookie: bjg_sid=2d814ef-6d81-4560-ad07-6701c12c73
Content-Type: multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW

----WebKitFormBoundary7MA4YWxkTrZu0gW
Content-Disposition: form-data; name="file"; filename="/20210730131952.jpg"
Content-Type: image/jpeg

(data)
----WebKitFormBoundary7MA4YWxkTrZu0gW
```

# 网盘文件模块

## 获取文件上传token

**接口地址**:`/uploader/token`

**请求方式**:`POST`

**请求数据类型**:`application/json`

**响应数据类型**:`application/json;charset=UTF-8`

**接口描述**:
<p>获取文件上传所需token，是前端请求七牛云上传必传项</p>
<p>也是根据此接口进行文件的创建操作</p>
<p>最大可上传20GB的文件</p>

**请求参数**:

| 参数名称 | 参数说明 | 约束 | 数据类型 |
| -------- | -------- | ----- | -------- |
|&emsp;&emsp;ossFileEtag|资源的唯一标识，秒传的判断<br/>[七牛etag算法示例](https://github.com/qiniu/qetag)|M|string|
|&emsp;&emsp;ossFileSize|文件大小(字节)|M|integer|
|&emsp;&emsp;userFileName|文件名|M|string|
|&emsp;&emsp;userFileParentId|文件父级标识|M|integer|

**响应参数**:

| 参数名称 | 参数说明 | 类型 | 约束 |
| -------- | -------- | ----- |----- |
|code|状态码|string|M|
|data|数据对象|object|C|
|&emsp;&emsp;diskUserFile|用户文件信息，秒传时返回|object|C|
|&emsp;&emsp;&emsp;&emsp;createTime|创建时间|string|M|
|&emsp;&emsp;&emsp;&emsp;fileFolder|是否为文件夹|boolean|M|
|&emsp;&emsp;&emsp;&emsp;forbidden|当前文件是否被禁止访问|boolean|M|
|&emsp;&emsp;&emsp;&emsp;ossFileEtag|资源的唯一标识|string|M|
|&emsp;&emsp;&emsp;&emsp;ossFileMimeType|文件的mime类型|string|M|
|&emsp;&emsp;&emsp;&emsp;ossFileSize|文件大小(字节)|integer|M|
|&emsp;&emsp;&emsp;&emsp;updateTime|更新时间|string|M|
|&emsp;&emsp;&emsp;&emsp;userDynamicDownloadUrl|文件的动态下载链接|string|C|
|&emsp;&emsp;&emsp;&emsp;userDynamicPreviewUrl|文件的动态预览链接|string|C|
|&emsp;&emsp;&emsp;&emsp;userFileId|文件标识|integer|M|
|&emsp;&emsp;&emsp;&emsp;userFileName|文件名|string|M|
|&emsp;&emsp;&emsp;&emsp;userFileParentId|文件的父级标识|integer|M|
|&emsp;&emsp;&emsp;&emsp;userId|文件关联的用户标识|integer|M|
|&emsp;&emsp;key|云端预存储的key值|string|C|
|&emsp;&emsp;token|文件上传的token|string|C|
|message|描述|string||

**响应示例**:

```json
{
  "code": "",
  "data": {
    "diskUserFile": {
      "createTime": "",
      "fileFolder": true,
      "forbidden": true,
      "ossFileEtag": "",
      "ossFileMimeType": "",
      "ossFileSize": 0,
      "updateTime": "",
      "userDynamicDownloadUrl": "",
      "userDynamicPreviewUrl": "",
      "userFileId": 0,
      "userFileName": "",
      "userFileParentId": 0,
      "userId": 0
    },
    "key": "",
    "token": ""
  },
  "message": ""
}
```

**请求示例**:

```http request
POST /uploader/token
HTTP/1.1
Host: cloud.api.novelweb.cn
Content-Type: application/json
Cookie: bjg_sid=2d814ef-6d81-4560-ad07-6701c12c73

{
    "ossFileEtag": "",
    "ossFileSize": "",
    "userFileName": "",
    "userFileParentId": ""
}
```

## 新建文件夹

**接口地址**:`/disk-file/insert-file-folder`

**请求方式**:`POST`

**请求数据类型**:`application/json`

**响应数据类型**:`application/json;charset=UTF-8`

**接口描述**:
<p>用于创建一个空的文件夹</p>

**请求参数**:

| 参数名称 | 参数说明 | 约束 | 数据类型 |
| -------- | -------- | ----- | ------ |
|&emsp;&emsp;userFileId|文件夹标识(创建时写0)|M|integer|
|&emsp;&emsp;userFileName|文件夹名称|M|string|
|&emsp;&emsp;userFileParentId|文件夹父级标识(0为根目录)|M|integer|

**响应参数**:

| 参数名称 | 参数说明 | 类型 | 约束 |
| -------- | -------- | ----- |----- |
|code|状态码|string|M|
|data|数据对象|object|C|
|&emsp;&emsp;createTime|创建时间|string|M|
|&emsp;&emsp;fileFolder|是否为文件夹|boolean|M|
|&emsp;&emsp;forbidden|是否被禁止访问|boolean|M|
|&emsp;&emsp;ossFileEtag|资源的唯一标识|string|M|
|&emsp;&emsp;ossFileMimeType|文件的mime类型|string|M|
|&emsp;&emsp;ossFileSize|文件大小(字节)|integer|M|
|&emsp;&emsp;updateTime|更新时间|string|M|
|&emsp;&emsp;userDynamicDownloadUrl|文件的动态下载链接|string|O|
|&emsp;&emsp;userDynamicPreviewUrl|文件的动态预览链接|string|O|
|&emsp;&emsp;userFileId|文件标识|integer|M|
|&emsp;&emsp;userFileName|文件名称|string|M|
|&emsp;&emsp;userFileParentId|文件的父级标识|integer|M|
|&emsp;&emsp;userId|用户标识|integer|M|
|message|描述|string|M|

**响应示例**:

```json
{
  "code": "",
  "data": {
    "createTime": "",
    "fileFolder": true,
    "forbidden": true,
    "ossFileEtag": "",
    "ossFileMimeType": "",
    "ossFileSize": 0,
    "updateTime": "",
    "userDynamicDownloadUrl": "",
    "userDynamicPreviewUrl": "",
    "userFileId": 0,
    "userFileName": "",
    "userFileParentId": 0,
    "userId": 0
  },
  "message": ""
}
```

**请求示例**:

```http request
POST /disk-file/insert-file-folder
HTTP/1.1
Host: cloud.api.novelweb.cn
Content-Type: application/json
Cookie: bjg_sid=2d814ef-6d81-4560-ad07-6701c12c73

{
    "userFileId": "",
    "userFileName": "",
    "userFileParentId": ""
}
```

## 重命名文件

**接口地址**:`/disk-file/rename-file`

**请求方式**:`POST`

**请求数据类型**:`application/x-www-form-urlencoded`

**响应数据类型**:`application/json;charset=UTF-8`

**接口描述**:
<p>更改 文件、文件夹 的名称</p>

**请求参数**:

| 参数名称 | 参数说明 | 约束 | 数据类型 |
| -------- | -------- | ----- | ------ |
|newUserFileName|新文件名|M|string|
|userFileId|文件标识|M|integer|

**响应参数**:

| 参数名称 | 参数说明 | 类型 | 约束 |
| -------- | -------- | ----- |----- |
|code|状态码|string|M|
|data|对象|object|C|
|&emsp;&emsp;createTime|创建时间|string|M|
|&emsp;&emsp;fileFolder|是否为文件夹|boolean|M|
|&emsp;&emsp;forbidden|当前文件是否被禁止访问|boolean|M|
|&emsp;&emsp;ossFileEtag|资源的唯一标识|string|M|
|&emsp;&emsp;ossFileMimeType|文件的mime类型|string|M|
|&emsp;&emsp;ossFileSize|文件大小(字节)|integer|M|
|&emsp;&emsp;updateTime|更新时间|string|M|
|&emsp;&emsp;userDynamicDownloadUrl|文件的动态下载链接|string|C|
|&emsp;&emsp;userDynamicPreviewUrl|文件的动态预览链接|string|C|
|&emsp;&emsp;userFileId|文件标识|integer|M|
|&emsp;&emsp;userFileName|文件名称|string|M|
|&emsp;&emsp;userFileParentId|文件的父级标识|integer|M|
|&emsp;&emsp;userId|用户标识|integer|M|
|message|描述|string|M|

**响应示例**:

```json
{
  "code": "",
  "data": {
    "createTime": "",
    "fileFolder": true,
    "forbidden": true,
    "ossFileEtag": "",
    "ossFileMimeType": "",
    "ossFileSize": 0,
    "updateTime": "",
    "userDynamicDownloadUrl": "",
    "userDynamicPreviewUrl": "",
    "userFileId": 0,
    "userFileName": "",
    "userFileParentId": 0,
    "userId": 0
  },
  "message": ""
}
```

**请求示例**:

```http request
POST /disk-file/rename-file?newUserFileName=&userFileId=
HTTP/1.1
Host: cloud.api.novelweb.cn
Cookie: bjg_sid=2d814ef-6d81-4560-ad07-6701c12c73
```

## 资源文件下载

**接口地址**:`/disk-file/resource/download`

**请求方式**:`GET`

**请求数据类型**:`application/x-www-form-urlencoded`

**响应数据类型**:`application/json;charset=UTF-8`

**接口描述**:
<p>获取文件的临时访问Url，最多可以生成有效时长为12小时的动态链接</p>
<p>需要注意的是，此接口如果响应成功，会进行302跳转，跳转的地址为动态生成的资源访问地址</p>
<p>资源访问地址有效时长默认为6小时</p>

**请求参数**:

| 参数名称 | 参数说明 | 约束 | 数据类型 |
| -------- | -------- | ----- | ------ |
|code|提取码|O|string|
|fileId|文件唯一标识|M|integer|
|preview|是否获取用于预览的链接|O|boolean|
|shareKey|文件的key值(分享下载时使用)|C|string|
|shareShort|短链(分享下载时使用)|C|string|
|time|过期时间，大于10，小于43200(秒)|O|integer|

**响应状态**:

| 状态码 | 说明 |
| -------- | -------- |
|302|OK|

**请求示例**:

```http request
GET /disk-file/resource/download?fileId=&preview=false
HTTP/1.1
Host: cloud.api.novelweb.cn
Cookie: bjg_sid=ab318bdb-4871-4fa8-a736-2e894ee3f507
```

## 查询文件列表

**接口地址**:`/disk-file/search`

**请求方式**:`GET`

**请求数据类型**:`application/x-www-form-urlencoded`

**响应数据类型**:`application/json;charset=UTF-8`

**接口描述**:
<p>用于获取文件列表信息</p>

**请求参数**:

| 参数名称 | 参数说明 | 约束 | 数据类型 |
| -------- | -------- | ----- | ------ |
|page|页码|M|integer|
|pageSize|每页大小|M|integer|
|startTime|起始时间(yyyy-MM-dd)|O|string|
|endTime|结束时间(yyyy-MM-dd)|O|string|
|fileFolder|是否为文件夹|O|boolean|
|forbidden|当前文件是否被禁止访问|O|boolean|
|ossFileEtag|资源的唯一标识|O|string|
|ossFileMimeType|文件的mime类型|O|string|
|ossFileSize|文件大小(字节)|O|integer|
|userDynamicExpireIn|下载凭证过期时间(秒)|O|integer|
|userDynamicToken|文件的动态下载凭证|O|string|
|userFileId|文件标识|O|integer|
|userFileName|文件名|O|string|
|userFileParentId|文件的父级标识|O|integer|
|userId|用户标识|O|integer|

**响应参数**:

| 参数名称 | 参数说明 | 类型 | 约束 |
| -------- | -------- | ----- |----- |
|code|状态码|string|M|
|data|对象|object|C|
|&emsp;&emsp;diskUserFile|文件模块|array|M|
|&emsp;&emsp;&emsp;&emsp;createTime|创建时间|string|M|
|&emsp;&emsp;&emsp;&emsp;fileFolder|是否为文件夹|boolean|M|
|&emsp;&emsp;&emsp;&emsp;forbidden|当前文件是否被禁止访问|boolean|M|
|&emsp;&emsp;&emsp;&emsp;ossFileEtag|资源的唯一标识|string|M|
|&emsp;&emsp;&emsp;&emsp;ossFileMimeType|文件的mime类型|string|M|
|&emsp;&emsp;&emsp;&emsp;ossFileSize|文件大小(字节)|integer|M|
|&emsp;&emsp;&emsp;&emsp;updateTime|更新时间|string|M|
|&emsp;&emsp;&emsp;&emsp;userDynamicDownloadUrl|文件的动态下载链接|string|C|
|&emsp;&emsp;&emsp;&emsp;userDynamicPreviewUrl|文件的动态预览链接|string|C|
|&emsp;&emsp;&emsp;&emsp;userFileId|文件标识|integer|M|
|&emsp;&emsp;&emsp;&emsp;userFileName|文件名称|string|M|
|&emsp;&emsp;&emsp;&emsp;userFileParentId|父级标识(0为根目录)|integer|M|
|&emsp;&emsp;&emsp;&emsp;userId|用户标识|integer|M|
|&emsp;&emsp;toTal|总数|integer|M|
|message|描述|string|M|

**响应示例**:

```json
{
  "code": "200",
  "data": {
    "diskUserFile": [
      {
        "createTime": "",
        "fileFolder": true,
        "forbidden": true,
        "ossFileEtag": "",
        "ossFileMimeType": "",
        "ossFileSize": 0,
        "updateTime": "",
        "userDynamicDownloadUrl": "",
        "userDynamicPreviewUrl": "",
        "userFileId": 0,
        "userFileName": "",
        "userFileParentId": 0,
        "userId": 0
      }
    ],
    "toTal": 0
  },
  "message": "请求成功"
}
```

**请求示例**:

```http request
GET /disk-file/search?page=1&pageSize=100&userFileParentId=0
HTTP/1.1
Host: cloud.api.novelweb.cn
Cookie: bjg_sid=ab318bdb-4871-4fa8-a736-2e894ee3f507
```

## 批量复制文件

**接口地址**:`/disk-file/copy-batch-file`

**请求方式**:`POST`

**请求数据类型**:`application/json`

**响应数据类型**:`application/json;charset=UTF-8`

**接口描述**:
<p>进行文件的批量复制操作，最多支持50个文件的复制</p>
<p>注:目前只支持对文件的复制，如果请求不包含文件，则会抛出异常提示</p>


**请求参数**:

| 参数名称 | 参数说明 | 约束 | 数据类型 |
| -------- | -------- | ----- | ------ |
|shareShort|短链|O|string|
|code|短链提取码|C|string|
|targetFileId|目标文件夹标识(必须是文件夹)|M|integer|
|copyFileInfo|批量复制的参数|M|array|
|&emsp;&emsp;shareKey|文件的key值|O|string|
|&emsp;&emsp;fromFileId|源文件标识|M|integer|

**响应参数**:

| 参数名称 | 参数说明 | 类型 | 约束 |
| -------- | -------- | ----- |----- |
|code|状态码|string|M|
|data|对象|object|C|
|&emsp;&emsp;fromUserFileList|进行复制的源文件信息|array|C|
|&emsp;&emsp;&emsp;&emsp;createTime|创建时间|string|M|
|&emsp;&emsp;&emsp;&emsp;fileFolder|是否为文件夹|boolean|M|
|&emsp;&emsp;&emsp;&emsp;forbidden|当前文件是否被禁止访问|boolean|M|
|&emsp;&emsp;&emsp;&emsp;ossFileEtag|资源的唯一标识|string|M|
|&emsp;&emsp;&emsp;&emsp;ossFileMimeType|文件的mime类型|string|M|
|&emsp;&emsp;&emsp;&emsp;ossFileSize|文件大小(字节)|integer|M|
|&emsp;&emsp;&emsp;&emsp;updateTime|更新时间|string|M|
|&emsp;&emsp;&emsp;&emsp;userDynamicDownloadUrl|文件的动态下载链接|string|C|
|&emsp;&emsp;&emsp;&emsp;userDynamicPreviewUrl|文件的动态预览链接|string|C|
|&emsp;&emsp;&emsp;&emsp;userFileId|文件标识|integer|M|
|&emsp;&emsp;&emsp;&emsp;userFileName|文件名|string|M|
|&emsp;&emsp;&emsp;&emsp;userFileParentId|文件的父级标识|integer|M|
|&emsp;&emsp;&emsp;&emsp;userId|用户标识|integer|M|
|&emsp;&emsp;userInfo|当前用户的缓存信息|object|C|
|&emsp;&emsp;&emsp;&emsp;available|当前账号是否可用|boolean|M|
|&emsp;&emsp;&emsp;&emsp;createTime|创建时间|string|M|
|&emsp;&emsp;&emsp;&emsp;updateTime|更新时间|string|M|
|&emsp;&emsp;&emsp;&emsp;userAvatar|用户头像|string|M|
|&emsp;&emsp;&emsp;&emsp;userBanTime|账号被封禁的时间(秒)<br/>-1:永久，0:正常|integer|M|
|&emsp;&emsp;&emsp;&emsp;userEmail|用户邮箱|string|M|
|&emsp;&emsp;&emsp;&emsp;userId|用户唯一标识|integer|M|
|&emsp;&emsp;&emsp;&emsp;userName|用户名|string|M|
|&emsp;&emsp;&emsp;&emsp;userPwd|用户密文密码|string|M|
|&emsp;&emsp;&emsp;&emsp;userReason|当前账号不可用原因|string|O|
|&emsp;&emsp;&emsp;&emsp;userTotalDiskCapacity|磁盘总容量(字节)|number|M|
|&emsp;&emsp;&emsp;&emsp;userUsedDiskCapacity|已用磁盘容量(字节)|number|M|
|&emsp;&emsp;&emsp;&emsp;userRemainingDiskCapacity|剩余磁盘容量(字节)|number|M|
|&emsp;&emsp;&emsp;&emsp;userTotalTraffic|总流量(字节)|number|M|
|&emsp;&emsp;&emsp;&emsp;userUsedTraffic|已用流量(字节)|number|M|
|&emsp;&emsp;&emsp;&emsp;userRemainingTraffic|剩余流量(字节)|number|M|
|&emsp;&emsp;&emsp;&emsp;userUnlockTime|账号解封时间|string|O|
|message|描述|string|M|

**响应示例**:

```json
{
  "code": "200",
  "data": {
    "fromUserFileList": [
      {
        "createTime": "",
        "fileFolder": true,
        "forbidden": true,
        "ossFileEtag": "",
        "ossFileMimeType": "",
        "ossFileSize": 0,
        "updateTime": "",
        "userDynamicDownloadUrl": "",
        "userDynamicPreviewUrl": "",
        "userFileId": 0,
        "userFileName": "",
        "userFileParentId": 0,
        "userId": 0
      }
    ],
    "userInfo": {
      "available": true,
      "createTime": "",
      "updateTime": "",
      "userAvatar": "",
      "userBanTime": 0,
      "userEmail": "",
      "userId": 0,
      "userName": "",
      "userPwd": "",
      "userReason": "",
      "userTotalDiskCapacity": 0,
      "userUsedDiskCapacity": 0,
      "userRemainingDiskCapacity": 0,
      "userTotalTraffic": 0,
      "userUsedTraffic": 0,
      "userRemainingTraffic": 0,
      "userUnlockTime": ""
    }
  },
  "message": "请求成功"
}
```

**请求示例**:

```http request
POST /disk-file/copy-batch-file
HTTP/1.1
Host: cloud.api.novelweb.cn
Content-Type: application/json
Cookie: bjg_sid=2d814ef-6d81-4560-ad07-6701c12c73

{
	"targetFileId": 0,
	"copyFileInfo": [{
		"fromFileId": 0
	}]
}
```

## 批量移动文件

**接口地址**:`/disk-file/move-batch-file`

**请求方式**:`POST`

**请求数据类型**:`application/json`

**响应数据类型**:`application/json;charset=UTF-8`

**接口描述**:
<p>进行文件、文件夹的批量移动的操作，最多支持50个文件、文件夹的移动</p>


**请求参数**:

| 参数名称 | 参数说明 | 约束 | 数据类型 |
| -------- | -------- | ----- | ------ |
|&emsp;&emsp;moveFileInfo|文件移动参数|M|array|
|&emsp;&emsp;&emsp;&emsp;fromFileId|源文件标识|M|integer|
|&emsp;&emsp;targetFileId|目标文件夹标识(只能是文件夹)|M|integer|

**响应参数**:

| 参数名称 | 参数说明 | 类型 | 约束 |
| -------- | -------- | ----- |----- |
|code|状态码|string|M|
|data|对象|array|C|
|&emsp;&emsp;createTime|创建时间|string|M|
|&emsp;&emsp;fileFolder|是否为文件夹|boolean|M|
|&emsp;&emsp;forbidden|是否被禁止访问|boolean|M|
|&emsp;&emsp;ossFileEtag|资源的唯一标识|string|M|
|&emsp;&emsp;ossFileMimeType|文件的mime类型|string|M|
|&emsp;&emsp;ossFileSize|文件大小(字节)|integer|M|
|&emsp;&emsp;updateTime|更新时间|string|M|
|&emsp;&emsp;userDynamicDownloadUrl|文件的动态下载链接|string|C|
|&emsp;&emsp;userDynamicPreviewUrl|文件的动态预览链接|string|C|
|&emsp;&emsp;userFileId|文件标识|integer|M|
|&emsp;&emsp;userFileName|文件名称|string|M|
|&emsp;&emsp;userFileParentId|文件的父级标识|integer|M|
|&emsp;&emsp;userId|用户标识|integer|M|
|message|描述|string|M|

**响应示例**:

```json
{
  "code": "",
  "data": [
    {
      "createTime": "",
      "fileFolder": true,
      "forbidden": true,
      "ossFileEtag": "",
      "ossFileMimeType": "",
      "ossFileSize": 0,
      "updateTime": "",
      "userDynamicDownloadUrl": "",
      "userDynamicPreviewUrl": "",
      "userFileId": 0,
      "userFileName": "",
      "userFileParentId": 0,
      "userId": 0
    }
  ],
  "message": ""
}
```

**请求示例**:

```http request
POST /disk-file/move-batch-file
HTTP/1.1
Host: cloud.api.novelweb.cn
Content-Type: application/json
Cookie: bjg_sid=2d814ef-6d81-4560-ad07-6701c12c73

{
	"moveFileInfo": [
		{
			"fromFileId": 0
		}
	],
	"targetFileId": 0
}
```

## 批量删除文件

**接口地址**:`/disk-file/delete-batch-file`

**请求方式**:`POST`

**请求数据类型**:`application/json`

**响应数据类型**:`application/json;charset=UTF-8`

**接口描述**:
<p>进行文件、文件夹的批量删除的操作，最多支持50个文件、文件夹的删除</p>


**请求参数**:

| 参数名称 | 参数说明 | 约束 | 数据类型 |
| -------- | -------- | ----- | ------ |
|list|文件标识数据集合|M|array|

**响应参数**:

| 参数名称 | 参数说明 | 类型 | 约束 |
| -------- | -------- | ----- |----- |
|code|状态码|string|M|
|data|对象|用户模块|C|
|&emsp;&emsp;available|当前账号是否可用|boolean|M|
|&emsp;&emsp;createTime|创建时间|string|M|
|&emsp;&emsp;updateTime|更新时间|string|M|
|&emsp;&emsp;userAvatar|用户头像|string|M|
|&emsp;&emsp;userBanTime|账号被封禁的时间(秒)<br/>-1:永久，0:正常|integer|M|
|&emsp;&emsp;userEmail|用户邮箱|string|M|
|&emsp;&emsp;userId|用户唯一标识|integer|M|
|&emsp;&emsp;userName|用户名|string|M|
|&emsp;&emsp;userPwd|用户密文密码|string|M|
|&emsp;&emsp;userReason|当前账号不可用原因|string|O|
|&emsp;&emsp;userTotalDiskCapacity|磁盘总容量(字节)|number|M|
|&emsp;&emsp;userUsedDiskCapacity|已用磁盘容量(字节)|number|M|
|&emsp;&emsp;userRemainingDiskCapacity|剩余磁盘容量(字节)|number|M|
|&emsp;&emsp;userTotalTraffic|总流量(字节)|number|M|
|&emsp;&emsp;userUsedTraffic|已用流量(字节)|number|M|
|&emsp;&emsp;userRemainingTraffic|剩余流量(字节)|number|M|
|&emsp;&emsp;userUnlockTime|账号解封时间|string|O|
|message|描述|string|M|

**响应示例**:

```json
{
  "code": "",
  "data": {
    "available": true,
    "createTime": "",
    "updateTime": "",
    "userAvatar": "",
    "userBanTime": 0,
    "userEmail": "",
    "userId": 0,
    "userName": "",
    "userPwd": "",
    "userReason": "",
    "userTotalDiskCapacity": 0,
    "userUsedDiskCapacity": 0,
    "userRemainingDiskCapacity": 0,
    "userTotalTraffic": 0,
    "userUsedTraffic": 0,
    "userRemainingTraffic": 0,
    "userUnlockTime": ""
  },
  "message": ""
}
```
