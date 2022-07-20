# An Employee managemnt app with Python Flask, React and SQLite.

![](./screenshot.png)

## 目录
#### &sect; [技术栈](#features)
#### &sect; [快速开始](#getting-started)
  * [安装](#installation)
  * [启动](#start)

#### &sect; [项目架构](#architecture)
  * [目录结构](#tree)
  
#### &sect; [测试](#testing)  
#### &sect; [部署](#deployment)
#### &sect; [参考](#reference)

****

## <a name="features">&sect; 技术栈</a>

* React 18.2.0 前端开发框架
* React Bootstrap UI库
* React Router 响应式路由
* React Hook Form 表单验证库
* React Token Auth 登录验证库(Token)

## <a name="getting-started">&sect; 快速开始</a>

### <a name="installation">⊙ 安装</a>

后端依赖：在项目根目录下：`pip install -r requirements.txt`  
前端依赖：在`frontend`目录下： `npm install`

### <a name="start">⊙ 启动</a>
后端启动：在`backend/src`目录下：`python app.py`  
前端启动：在`frontend`目录下： `npm start`  
如无意外，默认浏览器就会自动打开 `localhost:3000`，若浏览器没有自动弹出，则请自行手动访问  

***

## <a name="architecture">&sect; 项目架构</a>
### <a name="tree">⊙ 目录结构</a>
```
.
│  package-lock.json
│  README.md
│  screenshot.png
│  
├─backend 
│  │─src
│      │  app.py
│      │  init_db.py
│      │  models.py
│      │  myweb.db
│      │  settings.py
│              
├─frontend
│  │─node_modules 
│  │─public  
│  │─src
│      │   App.css
│      │   App.js
│      │   App.test.js
│      │   auth.js
│      │   index.css
│      │   index.js
│      │   logo.svg
│      │
│      │-components
│           │   About.js
│           │   Employee.js
│           │   Login.js
│           │   Navbar.js
│           │   SignUp.js
│  │   .env
│  │   .gitignore
│  │   package-lock.json
│  │   package.json
│  │   README.md
```
## <a name="testing">&sect; 测试</a>
* To be updated  

***

## <a name="deployment">&sect; 部署</a>
* To be updated  

***

## <a name="reference">&sect; 参考</a>
* To be updated
