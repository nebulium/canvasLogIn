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
	context.beginPath();
	context.fillStyle = 'rgba(0,0,0,0.7)';
	context.fillRect(0,0,width,height);

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
			x1 = ele.clientX - canvas.offsetLeft;
			y1 = ele.clientY - canvas.offsetTop;
			context.save();
			context.beginPath();
			context.arc(x1,y1,30,0,2*Math.PI);
			context.clip();
			context.clearRect(0,0,1000,615);
			context.restore();
			press = true;
			break;
			case 'mousemove':
			if(press){
				x2 = ele.clientX - canvas.offsetLeft;
				y2 = ele.clientY - canvas.offsetTop;
				clear(x1,y1,x2,y2,context);
				x1 = x2;
				y1 = y2;
			}
			break;
			case 'mouseup':
			press = false;
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