# canvasLogIn说明

## 待完成功能
- [x] 基于canvas的基本涂抹功能
- [x] 调整遮罩效果：高斯模糊 + 调节亮度（遮罩层暗一些）
- [ ] 涂抹功能完善：添加鼠标效果，鼠标滑过后恢复、鼠标停留过久恢复
- [ ] 登录界面：为了进行综合性质的练习，考虑读取已有信息、表单及验证、用户暂停输入的时候自动补全信息
- [ ] 整体预期效果如：<https://www.canva.com/>
- [ ] 考虑移动端
- [ ] 考虑ES6
- [ ] 考虑React
- [ ] 考虑做成插件
- [ ] 考虑兼容性问题
- [ ] 面向对象
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