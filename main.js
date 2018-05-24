class Canvas {
	constructor(id,opts) {
		this.container = document.getElementById(id);
		this.options = opts;
		this.container.innerHTML = this.render(opts);
		this.dots = [];
		this.imgData = null;

		const canvas = this.container.querySelector('canvas');
		const img = this.container.querySelector('img');
		const width = this.container.offsetWidth;
		const height = this.container.offsetHeight;
		const context = canvas.getContext('2d');
		this.context = context;
		img.onload = function(){
			context.drawImage(img,0,0);
			this.imgData = context.getImageData(0,0,width,height);
			var newImgData = gaussBlur(this.imgData);
			context.putImageData(newImgData,0,0);
		}

		console.log(canvas);
		canvas.addEventListener('mousemove',function(ele){
			const x = ele.clientX - canvas.offsetLeft;
			const y = ele.clientY - canvas.offsetTop;
			const r = 50;
			dots.push(new Dots(x,y,r));
		},false);

	}
	render(opts) {
		const width = this.container.offsetWidth;
		const height = this.container.offsetHeight;

		return `<img src="${opts.img}"/><canvas width="${width}px" height="${height}px"></canvas>`;
	}
	draw() {
		const imgData = this.imgData;
		const context = this.context;
		context.putImageData(imgData,0,0);
		for(var i = 0; i < dots.length; i++) {
			if(dots[i].r <=40) {
				dots.splice(i,1);
			}
		}
		for(var i = 0; i < dots.length; i++) {
			drawDot(dots[i]);
		}
	}
}

var canvas = new Canvas('test',{img:'bg.jpg'})
setInterval(canvas.draw,16);
// function Dots(){}
// function gaussBlur(){}
// function DrawDots(){}


var imgData = null; //存储遮罩

//初始化：
var canvas = document.getElementById('main');
var container = document.getElementById('container');
var img = document.getElementById('img');
var width = container.offsetWidth;
var height = container.offsetHeight;
if(typeof canvas.getContext == 'function'){
	var context = canvas.getContext('2d');
}

canvas.setAttribute("width",width+"px");
canvas.setAttribute("height",height+"px");


//遮罩
img.onload = function(){
	context.drawImage(img,0,0);
	imgData = context.getImageData(0,0,width,height);
	var newImgData = gaussBlur(imgData);
	context.putImageData(newImgData,0,0);
}//getImageData的跨域问题  图片存储在本地时，是默认没有域名的，用getImageData方法时，浏览器会判定为跨域而报错！

//setInterval调用draw函数
//每一“帧”的时候，路线上存在n个点（dots对象），每一个对象有各自的x/y/r
//draw函数在每一帧绘制每个点（调用drawDot）
function Dots(x,y,r){
	this.x = x;
	this.y = y;
	this.r = r;
}
var dots = [];

//注意：监听canvas！
canvas.addEventListener('mousemove',function(ele){
	var x = ele.clientX - canvas.offsetLeft;
	var y = ele.clientY - canvas.offsetTop;
	var r = 50;
	dots.push(new Dots(x,y,r));
},false);

function draw(){
	context.putImageData(imgData,0,0);
	for(var i = 0; i < dots.length; i++){
		if(dots[i].r <= 40){
			dots.splice(i,1);
		}
	}
	for(var i = 0; i < dots.length; i++){
		drawDot(dots[i]);
	}
}

function drawDot(dot){
		var x = dot.x;
		var y = dot.y;
		var r = dot.r;
	    context.save();
	    context.beginPath();
	    context.arc(x,y,r,0,2*Math.PI);
	    context.clip();
	    context.clearRect(0,0,width,height);
	    context.restore();

	    // 进行边缘模糊处理:处理10px的圆环的值,即考虑半径为r-10到r的点的透明度
	    var tmpImageData = context.getImageData(0,0,width,height);
	    var data = tmpImageData.data;
	    for(var i = 0; i <= 30; i++){
	    	var curR = r - 10 + i;//当前圆环半径
	    	for(var j = 0; j <= 360; j++){
	    		//360度
	    		//确认当前需要处理的点的坐标
	    		var x1 = parseInt(x + curR * Math.cos(j * Math.PI / 180));
	    		var y1 = parseInt(y + curR * Math.sin(j * Math.PI / 180));
	    		if( x1 < 0 || y1 < 0 || x1 > width || y1 > height) continue;
	    		var curPoint = (y1 * width + x1) * 4 + 3; //在data上的a对应索引
	    		if(data[curPoint] == 0) continue;
	    		var tmpAlpha = 255 * (i * 0.033);
	    		if(tmpAlpha < data[curPoint]) data[curPoint] = tmpAlpha;
	    	}
	    }
	    context.putImageData(tmpImageData,0,0);
	    context.globalCompositeOperation="destination-out";

	    dot.r --;
}

setInterval(draw,16);


function gaussBlur(img){
	var pixes = img.data;
	var width = img.width;
	var height = img.height;
	var gaussMatrix = [];
	var gaussSum = 0;
	var radius = 10;//模糊半径
	var sigma = 5;//标准差，越小形状曲线越尖
	var lighter = -10; //调整亮度
	//获得高斯矩阵
	var a = 1/(Math.sqrt(2*Math.PI) * sigma);
	var b = - 1/(2*sigma*sigma);
	for(var i = 0,x = -radius; x <= radius; x++,i++){
		var g = a * Math.exp(b * x * x);//相对于中心点，平均值为0
		gaussMatrix[i] = g;
		gaussSum += g;
	}
	//归一化
	for(var i = 0; i < gaussMatrix.length; i++){
		gaussMatrix[i] /= gaussSum;
	}

	//x方向上处理,考虑矩阵在对应pixes矩阵上水平移动
	for(var y = 0; y < height; y++){
		for(var x = 0; x < width; x++){
			var r = g = b = a = 0;
			gaussSum = 0;
			for(var j = -radius; j <= radius; j++){
				var k = x + j; //
				if(k >= 0 && k < width){
					var i = (y * width + k) * 4;
					r += pixes[i] * gaussMatrix[j + radius]; //最终将每一个与权重的值相乘之和，赋给中心点
					g += pixes[i + 1] * gaussMatrix[j + radius]; //gaussMatrix counts from 0
					b += pixes[i + 2] * gaussMatrix[j + radius];
					// a += pixes[i + 3] * gaussMatrix[j + radius];
					gaussSum += gaussMatrix[j + radius];
				}
			}
			i = (y * width + x) * 4; //处理中心点
			pixes[i] = r / gaussSum + lighter; //除以gaussSum处理边缘像素
			pixes[i + 1] = g / gaussSum + lighter;
			pixes[i + 2] = b / gaussSum + lighter;
		}
	}

	//y方向上处理
	for(var x = 0; x < width; x++){
		for(var y = 0; y < height; y++){
			r = g = b = a = 0;
			gaussSum = 0;
			for(var j = -radius; j <= radius; j++){
				var k = y + j;
				if(k >= 0 && k < height){
					var i = (k * width + x) * 4;
					r += pixes[i] * gaussMatrix[j + radius]; 
					g += pixes[i + 1] * gaussMatrix[j + radius];
					b += pixes[i + 2] * gaussMatrix[j + radius];
					gaussSum += gaussMatrix[j + radius];
				}
			}
			i = (y * width + x) * 4;
			pixes[i] = r / gaussSum + lighter;
			pixes[i + 1] = g / gaussSum + lighter;
			pixes[i + 2] = b / gaussSum + lighter;
		}
	}
	return img;
}
