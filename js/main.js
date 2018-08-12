// 中心图片是否翻转
var isFlipped = false,
    // 动画是否结束
    isTransEnd = true;

function throttle(fn, delay) {
    var timer = null;
    return function() {
        var context = this,
            args = arguments;

        clearTimeout(timer);

        timer = setTimeout(function() {
            fn.apply(context, args);
        }, delay);
    }
}

// 3.通用函数
function g(selector) {
    var method = selector.substr(0, 1) == '.' ? 'getElementsByClassName' : 'getElementById';
    return document[method](selector.substr(1));
}

// 随机生成一个数，支持取值范围。random([min,max])
function random(range) {
    var max = Math.max(range[0], range[1]),
        min = Math.min(range[0], range[1]),
        diff = max - min,
        number = Math.floor(Math.random() * diff + min);
    return number;
}

// 4.输出所有海报
var data = data;

function addPhotos() {
    var template = '<div class="photo rotate-front" onClick="turn(this)" id="photo{{index}}">\
                        <div class="photo-wrap">\
                            <div class="side side-front">\
                                <p class="image"><img src="img/{{img}}" /></p>\
                                <p class="caption">{{caption}}</p>\
                            </div>\
                            <div class="side side-back">\
                                <div class="desc">{{desc}}</div>\
                            </div>\
                        </div>\
                    </div>';

    var html = [],
        nav = [];

    for (var s = 0; s < data.length; s++) {
        var _html = template.replace('{{index}}', s)
            .replace('{{img}}', data[s].img)
            .replace('{{caption}}', data[s].caption)
            .replace('{{desc}}', data[s].desc);

        html.push(_html);

        nav.push('<span id="nav' + s + '" onclick = "turn( g(\'#photo' + s + '\') )" class="i"></span>');
    }

    html.push('<div class="nav">' + nav.join('') + '</div>');

    g('#wrap').innerHTML = html.join('');

    setTimeout(function() {
        resort(random([0, data.length]));
    }, 1000)
}

addPhotos();

// 1.翻面控制
function turn(elem) {
    var cls = elem.className,
        n = elem.id.replace(/[^0-9]/ig, ''); // 慕课网方法 var n = elem.id.split("_")[1]

    if (!/photo-center/.test(cls)) {
        resort(n);
        return;
    }

    if (/rotate-front/.test(cls)) {
        cls = cls.replace(/rotate-front/, 'rotate-back');
        g('#nav' + n).className = g('#nav' + n).className.replace('i', 'i curr-back'); // g("#nav" + n).className += " curr-back";
        isFlipped = true;
    } else {
        cls = cls.replace(/rotate-back/, 'rotate-front');
        g('#nav' + n).className = g('#nav' + n).className.replace(/\s*curr-back\s*/, ' '); // g("#nav"+n).className = "i";
        isFlipped = false;
    }

    return elem.className = cls;

}

// 6.计算左右分区范围
function rangeSet() {
    var range = {
            left: {
                x: [],
                y: []
            },
            right: {
                x: [],
                y: []
            },
            top: {
                x: [],
                y: []
            },
            bottom: {
                x: [],
                y: []
            }
        },
        wrap = {
            w: g('#wrap').clientWidth,
            h: g('#wrap').clientHeight
        },
        photo = {
            w: g('.photo')[0].clientWidth,
            h: g('.photo')[0].clientHeight
        };

    // 图片四周留空距离
    var factor = 0.5,
        dis = photo.w * factor,
        dis2 = photo.h * factor;

    // range.left.x = [0, wrap.w / 2 - photo.w];
    // range.left.y = [0, wrap.h];
    range.left.x = [-photo.w - dis, -wrap.w / 2 - dis];
    range.left.y = [-wrap.h / 2, wrap.h / 2];

    // range.right.x = [wrap.w / 2 + photo.w, wrap.w];
    // range.right.y = [0, wrap.h];
    range.right.x = [photo.w + dis, wrap.w / 2 + dis];
    range.right.y = [-wrap.h / 2, wrap.h / 2];

    // 上下部分海报位置范围
    range.top.x = [-photo.w - dis, photo.w + dis];
    range.top.y = [-photo.h - dis2, -wrap.h / 2 - dis2];

    range.bottom.x = [-photo.w - dis, photo.w + dis];
    range.bottom.y = [photo.h + dis2, wrap.h / 2 + dis2];

    return range;
}

// 5.海报排序
function resort(n) {

    var photoArr = g('.photo'),
        photos = [],
        // 控制按钮数组
        navArr = g('.i');

    var transEndFn = function() {

        isFlipped = false;

        if (g('.photo-center')[0]) {
            g('.photo-center')[0].removeEventListener('transitionend', transEndFn);
        }

        for (var s = 0; s < photoArr.length; s++) {
            photoArr[s].className = photoArr[s].className.replace(/\s*photo-center\s*/, ' ');
            photoArr[s].className = photoArr[s].className.replace(/\s*rotate-front\s*/, ' ');
            photoArr[s].className = photoArr[s].className.replace(/\s*rotate-back\s*/, ' ');

            photoArr[s].style['transform'] = 'translate(0,0) rotate(0deg) scale(1)';

            photoArr[s].className += ' rotate-front';
            photos.push(photoArr[s]);
        }

        var photoCenter = g('#photo' + n);
        photoCenter.className += ' photo-center';

        photoCenter = photos.splice(n, 1)[0];

        // 分离上下部分图片
        var photosTop = photos.splice(random([0, photos.length]), Math.ceil(photos.length / 8)),
            photosBottom = photos.splice(random([0, photos.length]), Math.ceil(photos.length / 8));

        // 把海报分为左右两部分
        var photosLeft = photos.splice(0, Math.ceil(photos.length / 2)),
            photosRight = photos;

        var ranges = rangeSet();
        // 左右
        for (s in photosLeft) {
            var photo = photosLeft[s];
            photo.style['transform'] = 'translate(' + random(rangeSet().left.x) + 'px,' +
                random(rangeSet().left.y) + 'px) rotate(' + random([-30, 30]) + 'deg)';
            // photo.style['transform'] = 'rotate(' + random([-60, 60]) + 'deg) scale(.8) translate(-600px)'; // 环形排列
        }
        for (s in photosRight) {
            var photo = photosRight[s];
            photo.style['transform'] = 'translate(' + random(rangeSet().right.x) + 'px,' +
                random(rangeSet().right.y) + 'px) rotate(' + random([-30, 30]) + 'deg)';
            // photo.style['transform'] = 'rotate(' + random([-60, 60]) + 'deg) scale(.8) translate(600px)'; // 环形排列
        }
        // 上下
        for (s in photosTop) {
            var photo = photosTop[s];
            photo.style['transform'] = 'translate(' + random(rangeSet().top.x) + 'px,' +
                random(rangeSet().top.y) + 'px) rotate(' + random([-30, 30]) + 'deg)';
        }

        for (s in photosBottom) {
            var photo = photosBottom[s];
            photo.style['transform'] = 'translate(' + random(rangeSet().bottom.x) + 'px,' +
                random(rangeSet().bottom.y) + 'px) rotate(' + random([-30, 30]) + 'deg)';
        }

        // 重置控制按钮
        for (var s = 0; s < navArr.length; s++) {
            navArr[s].className = navArr[s].className.replace(/\s*current\s*/, '');
            navArr[s].className = navArr[s].className.replace(/\s*curr-back\s*/, '');
        }

        g('#nav' + n).className += ' current';

        isTransEnd = true;

    }

    if (isFlipped) {
        g('.photo-center')[0].className = g('.photo-center')[0].className.replace(/rotate-back/, 'rotate-front');
        g('.current')[0].className = g('.current')[0].className.replace(/\s*curr-back\s*/, ' ');

        if (!isTransEnd) {
            return;
        }

        g('.photo-center')[0].addEventListener('transitionend', transEndFn);

        isTransEnd = false;

    } else {
        transEndFn();
    }

}

window.onresize = throttle(function() {
    resort(random([0, data.length]))
}, 500);