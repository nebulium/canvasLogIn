var canvas = document.getElementById('main');
var container = document.getElementById('container');
var width = container.offsetWidth;
var height = container.offsetHeight;
if(typeof canvas.getContext == 'function'){
	var context = canvas.getContext('2d');
}

canvas.setAttribute("width",width+"px");
canvas.setAttribute("height",height+"px");

//遮罩
// var img = document.getElementById('img');
// context.drawImage(img,0,0);
// var imgData = context.getImageData(0,0,width,height);
// var newImgData = gaussBlur(imgData);
// context.putImageData(newImgData,0,0);
img.onload = function(){
	context.drawImage(img,0,0);
	var imgData = context.getImageData(0,0,width,height);
	var newImgData = gaussBlur(imgData);
	context.putImageData(newImgData,0,0);
}//getImageData的跨域问题  图片存储在本地时，是默认没有域名的，用getImageData方法时，浏览器会判定为跨域而报错！


var x1 = y1 = x2 = y2 = 0;
var press = false;

context.strokeStyle = "rgba(0,0,0,1)";

//注意：监听canvas！
canvas.addEventListener('mousedown',handler,false);
canvas.addEventListener('mousemove',handler,false);
canvas.addEventListener('mouseup',handler,false);

function handler(ele){
	switch(ele.type){
		case 'mousedown':
		// x1 = ele.clientX - canvas.offsetLeft;
		// y1 = ele.clientY - canvas.offsetTop;
		// context.save();
		// context.beginPath();
		// context.arc(x1,y1,30,0,2*Math.PI);
		// context.clip();
		// context.clearRect(0,0,1000,615);
		// context.restore();
		// press = true;
		break;
		case 'mousemove':
		// if(press){
			x2 = ele.clientX - canvas.offsetLeft;
			y2 = ele.clientY - canvas.offsetTop;
			clear(x1,y1,x2,y2,context);
			x1 = x2;
			y1 = y2;
		// }
		break;
		case 'mouseup':
		// press = false;
		break;
	}
}

function clear(x1,y1,x2,y2,context){
	var r = 30;
	//line四个点的坐标值,顺时针排列
	var a1 = a4 = x1;
	var b1 = y1 - r;
	var b4 = y1 + r;
	var a2 = a3 = x2;
	var b2 = y2 - r;
	var b3 = y2 + r;
	context.save();
	context.beginPath();
	context.arc(x2,y2,r,0,2*Math.PI);
	context.clip();
	context.clearRect(0,0,1000,615);
	context.restore();

	context.save();
	context.beginPath();
	context.moveTo(a1,b1);
	context.lineTo(a2,b2);
	context.lineTo(a3,b3);
	context.lineTo(a4,b4);
	context.lineTo(a1,b1);
	context.clip();
	context.clearRect(0,0,1000,615);
	context.restore();
}

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