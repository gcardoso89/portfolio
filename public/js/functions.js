var _portfolio;
var _scrollControl;
var _navigationControl;
var _profileGallery;
var _contactForm;

window.mobilecheck = function () {
	var check = false;
	(function (a) {
		if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4)))check = true
	})(navigator.userAgent || navigator.vendor || window.opera);
	return check;
}

$(function () {
	_portfolio = new Portfolio();
	_scrollControl = new ScrollControler();
	_navigationControl = new Navigation();
	_profileGallery = new ProfileGallery();
	_contactForm = new ContactForm();
});

function Portfolio() {
	var that = this;
	this.cont = $('section.portfolio');
	this.items = $('article', this.cont);
	this.itemsW = this.items.width();
	this.itemsArr = this.fillItemsArray(this.items);
	this.structClass = {
		item_classname: 'item',
		image_classname: 'img',
		info_classname: 'info'
	};

	this.topExtra = parseInt(this.items.css('margin-top'), 10) + this.items.height() + 10;

	this.struct = {};

	this.win = $(window);
	this.win.bind('resize.Portfolio', function (e) {
		that.resizeHandler()
	});
	this.resizeHandler();

	this.createScrollbarStructure();
	this.createStructure();

	this.ci = { obj: null, ind: null };

	this.items._isAnimating = false;
	this.items.bind('click.Portfolio', function (e) {
		var obj = $(this);
		var ind = obj.index() - 1;
		that.itemClickHandler(obj, ind);

	});

}

Portfolio.prototype.createStructure = function () {

	var that = this;

	this.struct = $('<div class="' + this.structClass.item_classname + '"></div>');
	this.struct.append('<span></span>');
	this.struct.append('<div class="' + this.structClass.image_classname + '"><div><img src="" draggable="false" /></div></div>');
	this.struct.append('<div class="' + this.structClass.info_classname + '"></div>');
	this.structImage = $('.' + this.structClass.image_classname, this.struct);
	this.drag = $('div', this.structImage);
	this.structImg = $('img', this.structImage);
	this.structImg.bind('dragstart', function (e) {
		e.preventDefault();
	});
	this.structInfo = $('.' + this.structClass.info_classname, this.struct);
	this.struct.opened = false;
	this.struct.css({left: this.winW});
	this.struct.prependTo(this.cont);
	this.structW = this.structImg.width();

	var bod = $('body');
	var initX = 0;
	var posX = 0;
	this.dragMaxX = this.drag.width() - this.winW;

	function mouseDownHandler(e) {
		e.preventDefault();
		//if (!that.draggable) return true;
		initX = e.clientX;
		posX = that.drag.position().left;
		bod.bind('mousemove.Portfolio', mouseMoveHandler);
		bod.bind('mouseup.Portfolio', mouseUpHandler);
		bod.bind('mouseleave.Portfolio', mouseUpHandler);
	}

	function mouseMoveHandler(e) {
		var clientPosX = e.clientX;

		that.drag.stop(true, false);
		that.scrollbar.stop(true, false);
		that.drag.addClass('dragging');
		var valX = posX - (initX - e.clientX);
		that.drag.css({ left: valX });
		that.scrollbar.css({left: -(valX * that.itemsW / that.structW) });
	}

	function mouseUpHandler(e) {
		bod.unbind('mousemove.Portfolio', mouseMoveHandler);
		bod.unbind('mouseup.Portfolio', mouseUpHandler);
		bod.unbind('mouseleave.Portfolio', mouseUpHandler);
		var xVal = that.drag.position().left;
		that.drag.removeClass('dragging');

		that.checkFinalPosition(xVal, that.dragMaxX, that.drag, true);
		that.checkFinalPosition(that.scrollbar.position().left, that.maxBarX, that.scrollbar);

	}

	this.drag.bind('mousedown.Portfolio', mouseDownHandler);

};

Portfolio.prototype.createScrollbarStructure = function () {

	this.scrollbar = $('<div class="scrollbar"><div><span></span><span class="bar"></span><span></span></div></div>');
	this.bar = $('.bar', this.scrollbar);
	this.bar._hasEvent = false;

};

Portfolio.prototype.fillItemsArray = function (listItems) {

	var arr = [];

	for (var i = 0; i < listItems.length; i++) {
		var parent = listItems.eq(i);
		var imageObj = $('> figure img', parent);
		imageObj.bind('dragstart', function (e) {
			e.preventDefault();
		});
		var src = imageObj.attr('src');
		var bigSrc = imageObj.attr('data-big-image');
		var info = $('> ul', parent);
		arr.push({src: src, info: info, fullImg: null, fullImgSrc: bigSrc });
	}
	;

	return arr;
};

Portfolio.prototype.itemClickHandler = function (clickedObject, objectIndex) {

	if (this.items._isAnimating) return true;

	if (this.ci.obj == null && this.ci.ind == null) {
		this.items._isAnimating = true;
		clickedObject.addClass('active');
		this.items.addClass('opened');
		this.createScrollbar(clickedObject);
		this.openItem(clickedObject, objectIndex); //Only opens the clicked item

	}
	else if (objectIndex == this.ci.ind) {
		return false;
		//this.closeItem(obj, id, false); //Only closes the clicked item which was open
	}
	else {
		this.items._isAnimating = true;
		this.items.addClass('opened');
		this.ci.obj.removeClass('active');
		clickedObject.addClass('active');
		this.createScrollbar(clickedObject);
		this.closeItem(clickedObject, objectIndex, true); //Closes the item which was open and opens the clicked one
	}

};


Portfolio.prototype.closeItem = function (objectToOpen, objectIndex, openItemBoolean) {

	var that = this;
	var obj = objectToOpen;
	var ind = objectIndex;
	var openItem = openItemBoolean;

	this.struct.animate({height: 0, opacity: 0}, 350, 'easeOutQuad');
	this.ci.obj.animate({marginBottom: 0}, 400, 'easeOutQuad', function (e) {

		if (openItem) {
			that.openItem(obj, ind);
		}
		else {
			_scrollControl.refreshPositions();
		}
	});
	if (!openItem) {
		that.ci.obj = null;
		that.ci.ind = null;
	}
};

Portfolio.prototype.openItem = function (objectToOpen, objectIndex) {

	var that = this;
	var obj = objectToOpen;
	var ind = objectIndex;
	var objProp = this.itemsArr[ind];


	if (objProp.fullImg == null) {
		that.structImg.attr('src', objProp.src);
	}
	else {
		this.structImg.attr('src', objProp.fullImg);
	}

	this.structInfo.html(objProp.info);
	this.struct.css({left: that.winW, height: 'auto', display: 'block', opacity: 1});
	var structH = this.struct.height();
	var mBot = structH + ( ( ind == (this.items.length - 1) ) ? 0 : 40 );

	obj.animate({ marginBottom: mBot }, 600, 'easeOutBounce', function () {
		that.struct.opened = true;
		var top = obj.position().top + that.topExtra;
		that.drag.css({left: 0});
		that.struct.css({top: top});
		_scrollControl.refreshPositions();
		//_scrollControl.scrollable.animate({scrollTop : (obj.offset().top - (_scrollControl.winH/2 - (structH+114)/2 )) - 61/2 }, 400, 'easeOutQuad');
		_scrollControl.scrollable.animate({scrollTop: obj.offset().top - (_scrollControl.winH / 2 - (structH + 114) / 2 + 25 )}, 400, 'easeOutQuad');
		that.struct.delay(200).animate({left: 0}, 400, 'easeOutQuad', function () {
			that.items._isAnimating = false;
			if (objProp.fullImg == null) {
				that.optimizeImage(objProp, that.structImg);
			}
		});
	});

	this.ci.obj = obj;
	this.ci.ind = ind;

};

Portfolio.prototype.resizeHandler = function () {

	this.winW = this.win.width();
	if (!(typeof(this.drag) === "undefined")) {
		this.dragMaxX = this.drag.width() - this.winW;
		this.drag.trigger('mousedown');
		this.drag.trigger('mouseup');
		this.resizeScrollbar();
	}
	if (this.struct.opened == false) this.struct.css({left: this.winW});

};

Portfolio.prototype.optimizeImage = function (objectArray, object) {

	var obj = objectArray;
	var objImg = object;
	var img = new Image();

	img.src = obj.fullImgSrc;
	img.onload = loadedImage;

	function loadedImage() {
		obj.fullImg = img.src;
		objImg.attr('src', obj.fullImg);
	}

};

Portfolio.prototype.createScrollbar = function (object) {

	var that = this;
	var obj = object;

	this.scrollbar.css({left: 0});
	this.scrollbar.appendTo(obj)
	this.resizeScrollbar();

	var bod = $('body');
	var initX = 0;
	var posX = 0;

	if (!this.bar._hasEvent) {
		this.bar.bind('mousedown.Portfolio', mouseDownHandler);
		this.bar._hasEvent = true;
	}

	function mouseDownHandler(e) {
		e.preventDefault();

		//if (!that.draggable) return true;
		initX = e.clientX;
		posX = that.scrollbar.position().left;
		bod.bind('mousemove.Portfolio', mouseMoveHandler);
		bod.bind('mouseup.Portfolio', mouseUpHandler);
		bod.bind('mouseleave.Portfolio', mouseUpHandler);
	}

	function mouseMoveHandler(e) {
		that.scrollbar.stop(true, false);
		that.drag.stop(true, false);
		that.bar.addClass('dragging');
		var clientPosX = e.clientX;
		var valX = posX - (initX - e.clientX);
		if (valX <= -that.barW || valX >= that.itemsW) {
			mouseUpHandler();
			return true;
		}
		else {
			that.scrollbar.css({ left: valX });
			that.drag.css({left: -(valX * that.structW / that.itemsW) });
		}
	}

	function mouseUpHandler(e) {
		bod.unbind('mousemove.Portfolio', mouseMoveHandler);
		bod.unbind('mouseup.Portfolio', mouseUpHandler);
		bod.unbind('mouseleave.Portfolio', mouseUpHandler);
		that.bar.removeClass('dragging');
		var xVal = that.scrollbar.position().left;

		that.checkFinalPosition(xVal, that.maxBarX, that.scrollbar);
		that.checkFinalPosition(that.drag.position().left, that.dragMaxX, that.drag, true);
	}


};

Portfolio.prototype.checkFinalPosition = function (leftValue, maxLeftValue, objectToAnimate, invertedDirection) {

	var obj = objectToAnimate;
	var maxVal = maxLeftValue;
	var val = leftValue;
	var inv = (typeof(invertedDirection) === "undefined") ? false : invertedDirection;
	obj.stop(true, false);
	obj.removeClass('dragging');

	if (inv) {
		if (val >= 0) {
			obj.animate({ left: 0 }, 700);
		}
		else if (Math.abs(val) >= maxVal) {
			obj.animate({ left: -maxVal }, 700);
		}
	}
	else {
		if (val <= 0) {
			obj.animate({ left: 0 }, 700);
		}
		else if (val >= maxVal) {
			obj.animate({ left: maxVal }, 700);
		}
	}

};

Portfolio.prototype.resizeScrollbar = function () {

	this.barW = (this.winW * this.itemsW) / this.structW - 3;
	this.bar.css({left: 0, width: this.barW });
	this.maxBarX = this.itemsW - this.bar.width() - 6;

};

function ScrollControler() {

	var that = this;

	this.scrollable = $('html, body');
	this.isAnim = !this.scrollable.hasClass('no-anim');
	this.scrollT = this.scrollable.scrollTop();
	this.win = $(window);
	this.winH = this.win.height();
	this.win.resize(function (e) {
		that.resizeHandler();
	});

	this.objCon = $('section.contact');
	this.objCon.posTop = this.objCon.offset().top;
	this.objCon.hasAnimClass = false;

	this.win.scroll(function (e) {
		that.scrollHandler()
	});

};

ScrollControler.prototype.scrollHandler = function () {

	this.scrollT = this.win.scrollTop();

	if (( this.scrollT + this.winH ) >= ( this.objCon.posTop + (this.objCon.height() / 3) ) && !this.objCon.hasAnimClass && this.isAnim) {
		this.objCon.addClass('anim');
		this.objCon.hasAnimClass = true;
	}
	;

};

ScrollControler.prototype.refreshPositions = function () {
	this.objCon.posTop = this.objCon.offset().top;
};

ScrollControler.prototype.resizeHandler = function () {
	this.winH = this.win.height();
};


function Navigation() {

	var that = this;
	this.body = $('body');
	this.menu = $('header');
	this.buttons = $('.second-nav a, header a, body > footer .bt-up, section.banner .bt-down');
	this.targetAttr = 'target';
	this.contAttr = 'content';
	this.scrollable = $('html, body');
	this.buttons.bind('click.Navigation', function (e) {
		e.preventDefault();
		that.goToItem($(this))
	});
	this.totalH = $('body').height();
	this.win = $(window);
	this.win.bind('scroll.Navigation', function (e) {
		that.scrollHandler()
	});
	this.openMenu = $('section.banner');
	this.openMenuVal = 68;
	this.closeMenu = $('section.contact');
	this.closeMenuVal = this.closeMenu.height() - 100;
};

Navigation.prototype.goToItem = function (object) {

	this.scrollable.stop(true, false);
	var that = this;
	var obj = object;
	var href = obj.attr('href');
	var tar = obj.attr('data-' + this.targetAttr);
	var goTo = $('[data-' + this.contAttr + '="' + tar + '"]').eq(0);
	var posGoTo;

	if (goTo.attr('data-center') == "true") posGoTo = goTo.offset().top - (_scrollControl.winH / 2 - goTo.outerHeight() / 2);
	else posGoTo = goTo.offset().top;

	//history.pushState({}, "gcardoso - Front End Developer" , href)
	this.scrollable.animate({ scrollTop: posGoTo - 48 }, 1800, 'easeInOutQuint');

};

Navigation.prototype.scrollHandler = function () {

	var valTop = this.win.scrollTop();
	if (valTop >= this.openMenuVal /*&& valTop <= (_scrollControl.objCon.posTop + this.closeMenuVal)*/)
		this.body.addClass('opened');
	else
		this.body.removeClass('opened');

};

function ProfileGallery() {

	this.cont = $('section.profile');
	this.imgList = $('figure img', this.cont);
	this.lgth = this.imgList.length;
	this.ci = 0;
	this.timer = null;
	this.startTimeout();
};

ProfileGallery.prototype.startTimeout = function () {

	var that = this;
	this.timer = setTimeout(function () {
		that.changeImage()
	}, 4000);

};

ProfileGallery.prototype.changeImage = function () {

	this.stopTimeout();

	var cur = this.ci;

	this.imgList.eq(cur).fadeOut(1700);

	if (cur + 1 >= this.lgth) cur = 0;
	else cur++

	this.imgList.eq(cur).fadeIn(1700);

	this.ci = cur;
	this.startTimeout();

};

ProfileGallery.prototype.stopTimeout = function () {
	clearTimeout(this.timer);
};

function ContactForm() {
	var that = this;
	this.cont = $('form');

	new FormBuilder({

		form_selector: '.contact form',
		parent_line_selector: '.ln',
		error_selector: '.err',
		submit_selector: 'input[type="submit"]',
		validation: {
			rules: {
				name: {
					required: true
				},
				email: {
					required: true,
					email: true
				},
				subject: {
					required: true
				},
				message: {
					required: true
				}
			},
			messages: {
				required: 'Please, fill this required field.',
				email: 'Please, insert a valid email'
			}
		}

	})

	this.submitBtn = $('input[type=submit]', this.cont);
	this.submitBtn.bind('click.ContactForm', function (e) {
		e.preventDefault();
		if (!that.cont.valid()) return;
		that.sendEmail();
	});

}

ContactForm.prototype.sendEmail = function () {

	var _name = $('input[name="name"]', this.cont).val();
	var _company = $('input[name="company"]', this.cont).val();
	var _email = $('input[name="email"]', this.cont).val();
	var _message = $('textarea[name="message"]', this.cont).val();
	var _subject = $('input[name="subject"]', this.cont).val();

	var dataString = 'name=' + _name + '&company=' + _company + '&email=' + _email + '&message=' + _message + '&subject=' + _subject;


	$.ajax({
		type: "POST",
		url: "/sendEmail",
		data: dataString,
		success: function (data) {
			if(data.success) alert("Email enviado");
		}
	});

};

