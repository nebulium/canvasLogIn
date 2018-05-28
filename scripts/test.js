class Canvas {
	constructor(id, opt) {
		this.container = document.getElementById(id);
		this.options = opt;
		this.dots = [];
		this.imgData = null;
		this.container.innerHTML = this.render(opt.img);
		this.init();
	}
	render(src){
		const width = this.container.offsetWidth;
		const height = this.container.offsetHeight;
		return `
		<img src="${src}" style="display:none"/>
		<canvas width="${width}px" height="${height}px">
		`
	}
	init(){
		let canvas = this.container.querySelector('canvas');
		let img = this.container.querySelector('img');
		let dots = this.dots;
		let context = null;
		let width = canvas.width;
		let height = canvas.height;
		if(typeof canvas.getContext === 'function') {
			context = canvas.getContext('2d');
		}

		img.addEventListener('load',() => {
			context.drawImage(img, 0, 0);
			this.imgData = context.getImageData(0, 0, width, height);
			let newImgData = gaussBlur(this.imgData);
			context.putImageData(newImgData, 0, 0);
		},false); //箭头函数，绑定this

		canvas.addEventListener('mousemove', function(evt) {
			let x = evt.clientX - canvas.offsetLeft;
			let y = evt.clientY - canvas.offsetTop;
			let r = 50;
			dots.push(new Dots(x,y,r));
		}, false);

	}
	draw() {
		if(this.imgData === null) return;
		let canvas = this.container.querySelector('canvas');
		let context = null;
		let dots = this.dots;
		if(typeof canvas.getContext === 'function') {
			context = canvas.getContext('2d');
		}

		context.putImageData(this.imgData,0,0);

		for(let i = 0; i < dots.length; i++) {
			if(dots[i].r <= 40) {
				dots.splice(i,1);
			}
		}

		for(let i = 0; i < dots.length; i++) {
			this.drawDot(dots[i]);
		}
	}

	drawDot(dot){
		let canvas = this.container.querySelector('canvas');
		let context = null;
		let width = this.container.offsetWidth;
		let height = this.container.offsetHeight;
		if(typeof canvas.getContext === 'function') {
			context = canvas.getContext('2d');
		}
		let x = dot.x;
		let y = dot.y;
		let r = dot.r;
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

}

let canvas = new Canvas('test',{img:'bg.jpg'});

setInterval(() => {
	canvas.draw();
}, 16);





