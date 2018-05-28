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

function Dots(x,y,r){
	this.x = x;
	this.y = y;
	this.r = r;
}