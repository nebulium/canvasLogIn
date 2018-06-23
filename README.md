# canvasLogIn说明

## 待完成功能
- [x] 基于canvas的基本涂抹功能
- [x] 调整遮罩效果：高斯模糊 + 调节亮度（遮罩层暗一些）
- [x] 涂抹功能完善：添加鼠标效果，鼠标滑过后恢复、鼠标停留过久恢复
- [x] 涂抹效果完善：对边缘进行模糊处理，调整动画时间等，使得效果尽量接近预期 
- [ ] 登录界面：为了进行综合性质的练习，考虑读取已有信息、表单及验证、用户暂停输入的时候自动补全信息
- [ ] 整体效果如：<https://nebulium.github.io/canvasLogIn/index.html>
- [ ] 考虑移动端
- [x] 考虑ES6
- [ ] 考虑React
- [x] 考虑进行组件化
- [ ] 考虑兼容性问题
- [x] 面向对象
- [x] 跨域问题
- [ ] more

## 修改说明
### 基本涂抹功能1（4/21)
  实现类似刮刮乐的效果，用鼠标点击事件进行处理，鼠标滑动过快出现断续。
#### 遮罩
- 透明黑色遮罩
- canvas大小与外围元素的宽和高一致。注意如果通过canva.style进行设置，canvas会产生拉伸，需要进行换算；或者，使用setAttribute方法直接修改属性，就不需要考虑换算的问题了。

#### 涂抹效果
- 处理mousedown/mousemove/mouseup
- 基本原理(clip()的使用方法）。Thanks to <http://www.jb51.net/html5/324517.html>
```
ctx.save();
ctx.beginPath();
ctx.arc(x,y,30,0,Math.PI);
ctx.clip();
ctx.clearRect(...);
ctx.restore();
```
- 注意处理和优化clear(x,y,context)函数，解决鼠标滑动过快时候出现的问题。

### 基本涂抹功能2（4/22)
解决鼠标滑动过快出现断续的问题。

### 调整遮罩效果（4/23)
- 高斯模糊处理
- 调节亮度：各像素rgb值加上一个ligter参数
- 问题：  
img.onload中调用canvas的getImageData方法出现跨域问题，这是因为本地资源无默认域名，会被认为是跨域资源。  
暂时在firefox上进行调试，以后部署在服务器后可以解决此问题。

### 涂抹功能完善（4/25)
基本完成主要的涂抹功能：如果鼠标在某一位置停留，涂抹点会慢慢的消失；如果鼠标移动，划过位置的涂抹点会慢慢的消失
- 在之前的canvas清除效果上，利用动画进行实现

#### 动画功能的学习和理解
- 了解前端实现动画的方式。Thanks to <https://blog.csdn.net/ImagineCode/article/details/78589418>
- 选择setInterval(之后可以考虑对setTimeout和requestAnimateFrame结合使用，并作兼容性处理）
- 在进行动画的编写的时候，可以遵循这样的思想：可以将动画想象成许多“帧”（概念上的每一帧而已）的组合，这样重点就从考虑
大的动画细化成处理某一帧的状态。
- 按照上述思想，这里的每一帧需要考虑：鼠标滑过一段路线，路线上每一个点的x、y和处理半径。
- 选择将每一个点的x/y/半径r封装成对象，每个一段时间调用draw函数，对每一个点进行绘制。
- 每一个点对象push进数组以待处理。

#### canvas的处理
- draw函数被setInterval周期性调用，每次调用的时候绘制某一帧的画面。
- 首先恢复到原始状态（putImageData），整理点数组、不符合条件的清除，再调用drawDot绘制（实际上是清除）每一个点。
- drawDot函数绘制每一个点，基于之前的canvas清除方式实现，注意每次使得每个点对象的半径减1以实现动画效果。

### 涂抹功能完善（4/26）
- 鼠标滑过时进行清除，在此基础上，处理滑过的效果，使之产生“光晕”
- “光晕”即产生的圆形在不同的半径上产生不同的透明度，因此需要对图片像素进行处理
- 在drawDot函数中，获取清除后的图片数
- 确认每个像素点对应的data上的Alpha数据的位置，考虑处理半径从r-10到r。
```javascript
//确认当前需要处理的点的坐标,j为0到360度
var x1 = parseInt(x + curR * Math.cos(j * Math.PI / 180));
var y1 = parseInt(y + curR * Math.sin(j * Math.PI / 180));
if( x1 < 0 || y1 < 0 || x1 > width || y1 > height) continue;
var curPoint = (y1 * width + x1) * 4 + 3; //在data上的a对应索引
```
- 处理透明度即可
- 将获取到的数据用putImageData放回去

### 组件化、面向对象、ES6(5/26)
- 纯JS进行UI组件化设计，inspired by 360前端星
- API：render()/init()/draw()/drawDot()
- img.onload:
    - 为确保img.onload中的this为对象的this，使用箭头函数
    - 为确保img加载完毕之后进行draw，在draw首行进行简单的标识判断
- canvas.context:
    - 对于统一个canvas对象，不同地方产生的context（canvas.getContext('2d'))是相同的。用全等号进行判断的时候返回true;
- bugs
    - 当container为absolute或者relative，相当于父元素有偏移的时候，对于canvas的鼠标监听坐标不准确。
    - 解决：tool.js中的getOffset函数，进行兼容性处理，获得相对于视口的canvas偏移。
    - 当containerz-index为最小值时，无法直接监听canvas的鼠标时间。
    - 解决：监听document的即可。

### 页面仿写(5/30)
- 页面的其他部分按照参考页面进行仿写
- 页面结构
    - header包含标题和登录表单、footer包含一个多语言select列表、main部分包含注册表单和说明
    - @media(max-width < 815px)：header中登录表单只留下登录按钮、main部分说明隐藏
    - main部分内容区宽度一定，始终居中
- flex布局
- input/button
    - 宽和高用padding、margin等调节
- footer先直接用一个链接文字处理。
    - 考虑到美观性问题，将footer文字放在视口右下角。
- main部分
    - 原网站的logo字体竟然是用svg做的。原理很简单。稍后考虑。先用font-family代替


