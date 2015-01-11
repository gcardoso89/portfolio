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
};

var gcardosoPortfolioApp = angular.module('gcardosoPortfolioApp', ['ngSanitize','ngAnimate'], function($interpolateProvider){
	$interpolateProvider.startSymbol('[[');
	$interpolateProvider.endSymbol(']]');
});

gcardosoPortfolioApp.config(['$controllerProvider', '$animateProvider', function($controllerProvider, $animateProvider) {
	//$controllerProvider.allowGlobals();
	$animateProvider.classNameFilter(/^(?:(?!ng-animate-disabled).)*$/);
}]);

gcardosoPortfolioApp.filter('reverse', function() {
	return function(items) {
		return items.slice().reverse();
	};
});

function Portfolio($scope){

	this.projects = {};
	this.scope = $scope;
	this.modal = false;

	for (var i = 0; i < _portfolioList.length; i++) {
		var o = _portfolioList[i];
		this.projects[o._id] = o;

		var newSliderImages = [];

		for (var n = 0; n < this.projects[o._id].images.length; n++) {
			var img = this.projects[o._id].images[n];
			if(n == 0) newSliderImages.push({ src : img, active : true });
			else newSliderImages.push({ src : img, active : false });
		}

		this.projects[o._id].images = newSliderImages;

	}

}

Portfolio.prototype.show = function(e, id){

	e.preventDefault();

	this.scope.current = this.projects[id];
	this.modal = true;

};

Portfolio.prototype.hide = function(){

	this.modal = false;

};

Portfolio.prototype.showDetailImage = function(images, item){

	for (var i = 0; i < images.length; i++) {
		images[i].active = (images[i] == item);
	}

};


function ScrollControler(){

	var that = this;

	this.scrollable = $('html, body');
	this.isAnim = !this.scrollable.hasClass('no-anim');
	this.scrollT = this.scrollable.scrollTop();
	this.win = $(window);
	this.winH = this.win.height();
	this.win.resize(function(e){ that.resizeHandler(); });

	this.objCon = $('section.contact');
	this.objCon.posTop = this.objCon.offset().top;
	this.objCon.hasAnimClass = false;
	this.objConLks = $('.network > a', this.objCon);

	this.win.scroll(function(e){ that.scrollHandler() });

	this.resizeHandler();

}

ScrollControler.prototype.scrollHandler = function(){

	this.scrollT = this.win.scrollTop();

	if ( ( this.scrollT + this.winH ) >= ( this.objCon.posTop + (this.winH/2) ) && !this.objCon.hasAnimClass && this.isAnim){
		this.objCon.addClass('anim');
		this.objCon.hasAnimClass = true;
	}

};

ScrollControler.prototype.refreshPositions = function(){
	this.objCon.posTop = this.objCon.offset().top;
};

ScrollControler.prototype.resizeHandler = function(){

	var _this = this;

	this.winH = this.win.height();
	this.winW = this.win.width();

	this.refreshPositions();

	if ( this.winW < 902 ){
		this.objConLks.css({marginLeft:-((902-this.winW)/2) } );
	}
	else {
		this.objConLks.css({marginLeft:0});
	}

	this.objCon.removeClass('anim');

	clearTimeout(this.timeOut);

	this.timeOut = setTimeout(function(){
		_this.objCon.hasAnimClass = false;
		_this.scrollHandler();
	},100);

};




function Navigation() {

	var that = this;
	this.body = $('body');
	this.menu = $('header');
	this.buttons = $('.second-nav a, header a, body > footer .bt-up, section.banner .bt-down');
	this.targetAttr = 'target';
	this.contAttr = 'content';
	this.scrollable = $('html, body');
	this.navItems = $('header nav a');
	this.buttons.bind('click.Navigation', function (e) {
		e.preventDefault();
		that.goToItem($(this));
	});
	this.totalH = this.body.height();
	this.win = $(window);
	this.win.bind('scroll.Navigation', function (e) {
		that.scrollHandler();
	});
	this.win.bind('resize.Navigation', function (e) {
		that.resizeHandler();
	});
	this.openMenu = $('section.banner');
	this.openMenuVal = 68;
	this.closeMenu = $('section.contact');
	this.closeMenuVal = this.closeMenu.height() - 100;

	this.sections = $('section').not(this.openMenu).not('.quote');
	this.secTops = [];

	this.resizeHandler();

	this.secTops.push(this.totalH);

}

Navigation.prototype.goToItem = function (obj) {

	this.scrollable.stop(true, false);
	var that = this;
	var href = obj.attr('href');
	var tar = obj.attr('data-' + this.targetAttr);
	var goTo = $('[data-' + this.contAttr + '="' + tar + '"]').eq(0);
	var posGoTo;

	ga('send', 'pageview', '/' + obj.text().toLowerCase());

	if (goTo.attr('data-center') == "true") posGoTo = goTo.offset().top - (_scrollControl.winH / 2 - goTo.outerHeight() / 2);
	else posGoTo = goTo.offset().top;

	//history.pushState({}, "gcardoso - Front End Developer" , href)
	this.scrollable.animate({ scrollTop: posGoTo - 48 }, 1800, 'easeInOutQuint');

};

Navigation.prototype.scrollHandler = function () {

	var _this = this;
	var current = -1;
	var valTop = this.win.scrollTop();
	if (valTop >= this.openMenuVal)
		this.body.addClass('opened');
	else
		this.body.removeClass('opened');

	this.secTops = [];

	for (var z = 0; z < this.sections.length; z++) {
		this.secTops.push(this.sections.eq(z).offset().top);
	}

	for (var i = 0; i < this.secTops.length; i++) {
		var obj = this.secTops[i];
		if ( valTop >= obj-(_this.winH/2) && valTop < this.secTops[i+1]-(_this.winH/2)  ) current = i;
	}

	this.navItems.removeClass('act');
	if(current != -1) this.navItems.eq(current).addClass('act');
};

Navigation.prototype.resizeHandler = function(){
	this.winW = this.win.width();
	this.winH = this.win.height();
	this.openMenuVal = (this.winW > 900) ? 68 : 0;
	this.scrollHandler();
};

function ProfileGallery() {

	this.cont = $('section.profile');
	this.imgList = $('figure img', this.cont);
	this.lgth = this.imgList.length;
	this.ci = 0;
	this.timer = null;
	this.startTimeout();
}

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
	else cur++;

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
				message: {
					required: true
				}
			},
			messages: {
				required: 'Please, fill this required field.',
				email: 'Please, insert a valid email.'
			}
		}

	});

	this.submitBtn = $('input[type=submit]', this.cont);
	this.submitBtn.bind('click.ContactForm', function (e) {
		e.preventDefault();
		if (!that.cont.valid()) return;
		that.sendEmail();
	});

}

ContactForm.prototype.sendEmail = function () {

	var _this = this;

	this.cont.addClass('sending');


	$.ajax({
		type: "POST",
		url: "/sendEmail",
		data: this.cont.serialize(),
		success: function (data) {
			if(data.success) _this.successSendingEmail();
			else _this.errorSendingEmail();
		},
		error : function(){
			_this.errorSendingEmail();
		}
	});

};

ContactForm.prototype.successSendingEmail = function(){

	this.cont.addClass('success');
	this.cont.removeClass('sending');

};

ContactForm.prototype.errorSendingEmail = function(){

	this.cont.removeClass('sending');
	this.cont.removeClass('success');

};


function TwitterWall($scope, $timeout){

	this.list = [];
	this.scope = $scope;
	this.timeOut = $timeout;

	this.socket = null;

	this.positions = [

		{
			current : null
		},
		{
			current : null,
			out : 8,
			hidden : false
		},
		{
			current : null,
			out : 7,
			hidden : false
		},
		{
			current : null,
			out : 10,
			hidden : false
		},
		{
			current : null,
			out : 6,
			hidden : null
		},
		{
			current : null,
			out : 14,
			hidden : false
		},
		{
			current : null,
			out : 13,
			hidden : false
		},
		{
			current : null,
			out: 9,
			hidden: false
		},
		{
			current : null,
			out: 12,
			hidden : false
		},
		{
			current : null,
			out : 11,
			hidden : false
		},
		{
			current : null,
			hidden : true
		},
		{
			current : null,
			hidden : true
		},
		{
			current : null,
			hidden : true
		},
		{
			current : null,
			hidden : true
		}

	];

	this.connectFirst();

}

TwitterWall.prototype.processTweetData = function(data){

	var _this = this;

	for (var i = 0; i < data.length; i++) {
		var obj = data[i];
		this.showTweet(this.createTweet(obj));
	}

	this.scope.$digest();

};

TwitterWall.prototype.connectFirst = function(){

	var _this = this;

	$.ajax({

		url : '/getFirstTweets',

		type : 'POST',

		dataType : 'json',

		data : { token : $('#tweetToken').val() },

		success : function(res){

			if (res.success){

				_this.processTweetData(res.tweets);

				_this.socket = io.connect(window.location.hostname);
				_this.socket.on('data', function(data) {
					_this.processTweetData(data);
				});

			}

		}

	})

};

TwitterWall.prototype.createTweet = function(data){

	var hashRegex = new RegExp('#([^\\s]*)','g');
	var retweetRegex = new RegExp('RT @([^\\s]*):', 'g');
	var linksRegex = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;

	return {

		name : data.user.name,

		username : "@" + data.user.screen_name,

		//image : data.user.profile_image_url.replace("_normal", ""),
		image : data.user.profile_image_url.replace("_normal", "_bigger"),

		text : data.text.replace(hashRegex, "<em>#$1</em>").replace(retweetRegex, '<strong>RT @$1: </strong>').replace(linksRegex, '<a href="$1" target="_blank">$1</a>'),

		imageVisible : true,

		created_at : new Date(data.created_at).getTime(),

		date : data.created_at,

		tweeturl : 'http://www.twitter.com/' + data.user.screen_name + '/status/' + data.id_str,

		classname : 'tweet' + ((this.list.length % 5)+1).toString()

	};

};

TwitterWall.prototype.showTweet = function(tweet){

	var _this = this;

	this.checkPosition(tweet);

	this.list.push(tweet);

};

TwitterWall.prototype.checkPosition = function(tweet){

	if ( this.list.length > 0 ){

		var curr = (this.list.length-1)%4 + 1;
		var currPos = this.positions[curr];

		if ( currPos.current != null ){

			var nextOut1 = this.positions[currPos.out-1];

			if ( nextOut1.current != null ){

				var nextOut2 = this.positions[nextOut1.out-1];

				if ( nextOut2.current != null && typeof(nextOut2.out) !== "undefined" ){

					var nextOut3 = this.positions[nextOut2.out-1];
					nextOut2.current.position = "pos" + nextOut2.out.toString();
					nextOut3.current = nextOut2.current;

				}

				nextOut1.current.position = "pos" + nextOut1.out.toString();
				nextOut2.current = nextOut1.current;

			}

			currPos.current.position = "pos" + currPos.out.toString();
			nextOut1.current = currPos.current;

		}

		this.positions[0].current.position = "pos" + (curr+1).toString();
		currPos.current = this.positions[0].current;

	}

	this.positions[0].current = tweet;
	this.positions[0].current.position = "pos1";

};

TwitterWall.prototype.tweetThis = function(e){

	e.preventDefault();

	var width  = 575,
		height = 400,
		left   = ($(window).width() - width)  / 2,
		top    = ($(window).height() - height) / 2,
		url    = e.currentTarget.href + "?text=" + encodeURIComponent("Check out the new @goncalocardo_o’s portfolio, developed using #mongoDB, #AngularJS and #nodejs. #gcardoso"),
		opts   = 'status=1' +
			',width='  + width  +
			',height=' + height +
			',top='    + top    +
			',left='   + left;

	window.open(url, 'twitter', opts);

	return false;

};


$.fn.smallMenu = function(){

	var menu = $(this);

	menu.bind('click.smallMenu', function(){
		if (menu.hasClass('active')) menu.removeClass('active');
		else menu.addClass('active');
	});

};
