const Signature = (function (e) {
    "use strict";
    var t = function (e, t) {
        var n = this,
            r = t || {};
        this.velocityFilterWeight = r.velocityFilterWeight || 0.7;
        this.minWidth = r.minWidth || 0.5;
        this.maxWidth = r.maxWidth || 2.5;
        this.dotSize =
            r.dotSize ||
            function () {
                return (this.minWidth + this.maxWidth) / 2;
            };
        this.penColor = r.penColor || "black";
        this.backgroundColor = r.backgroundColor || "rgba(255,255,255,1)";
        this.onEnd = r.onEnd;
        this.onBegin = r.onBegin;
        this._canvas = e;
        this._ctx = e.getContext("2d");
        this.clear();
        this._handleMouseEvents();
        this._handleTouchEvents();
    };
    t.prototype.clear = function () {
        var e = this._ctx,
            t = this._canvas;
        e.fillStyle = this.backgroundColor;
        e.clearRect(0, 0, t.width, t.height);
        e.fillRect(0, 0, t.width, t.height);
        this._reset();
    };
    t.prototype.toDataURL = function (e, t) {
        var n = this._canvas;
        return n.toDataURL.apply(n, arguments);
    };
    t.prototype.fromDataURL = function (e) {
        var t = this,
            n = new Image();
        this._reset();
        n.src = e;
        n.onload = function () {
            t._ctx.drawImage(n, 0, 0, t._canvas.width, t._canvas.height);
        };
        this._isEmpty = false;
    };
    t.prototype._strokeUpdate = function (e) {
        var t = this._createPoint(e);
        this._addPoint(t);
    };
    t.prototype._strokeBegin = function (e) {
        this._reset();
        this._strokeUpdate(e);
        if (typeof this.onBegin === "function") {
            this.onBegin(e);
        }
    };
    t.prototype._strokeDraw = function (e) {
        var t = this._ctx,
            n = typeof this.dotSize === "function" ? this.dotSize() : this.dotSize;
        t.beginPath();
        this._drawPoint(e.x, e.y, n);
        t.closePath();
        t.fill();
    };
    t.prototype._strokeEnd = function (e) {
        var t = this.points.length > 2,
            n = this.points[0];
        if (!t && n) {
            this._strokeDraw(n);
        }
        if (typeof this.onEnd === "function") {
            this.onEnd(e);
        }
    };
    t.prototype._handleMouseEvents = function () {
        var t = this;
        this._mouseButtonDown = false;
        this._canvas.addEventListener("mousedown", function (e) {
            if (e.which === 1) {
                t._mouseButtonDown = true;
                t._strokeBegin(e);
            }
        });
        this._canvas.addEventListener("mousemove", function (e) {
            if (t._mouseButtonDown) {
                t._strokeUpdate(e);
            }
        });
        e.addEventListener("mouseup", function (e) {
            if (e.which === 1 && t._mouseButtonDown) {
                t._mouseButtonDown = false;
                t._strokeEnd(e);
            }
        });
    };
    t.prototype._handleTouchEvents = function () {
        var t = this;
        this._canvas.style.msTouchAction = "none";
        this._canvas.addEventListener("touchstart", function (e) {
            var n = e.changedTouches[0];
            t._strokeBegin(n);
        });
        this._canvas.addEventListener("touchmove", function (e) {
            e.preventDefault();
            var n = e.changedTouches[0];
            t._strokeUpdate(n);
        });
        e.addEventListener("touchend", function (e) {
            var n = e.target === t._canvas;
            if (n) {
                t._strokeEnd(e);
            }
        });
    };
    t.prototype.isEmpty = function () {
        return this._isEmpty;
    };
    t.prototype._reset = function () {
        this.points = [];
        this._lastVelocity = 0;
        this._lastWidth = (this.minWidth + this.maxWidth) / 2;
        this._isEmpty = true;
        this._ctx.fillStyle = this.penColor;
    };
    t.prototype._createPoint = function (e) {
        var t = this._canvas.getBoundingClientRect();
        return new n(e.clientX - t.left, e.clientY - t.top);
    };
    t.prototype._addPoint = function (e) {
        var t = this.points,
            n,
            i,
            s,
            o;
        t.push(e);
        if (t.length > 2) {
            if (t.length === 3) t.unshift(t[0]);
            o = this._calculateCurveControlPoints(t[0], t[1], t[2]);
            n = o.c2;
            o = this._calculateCurveControlPoints(t[1], t[2], t[3]);
            i = o.c1;
            s = new r(t[1], n, i, t[2]);
            this._addCurve(s);
            t.shift();
        }
    };
    t.prototype._calculateCurveControlPoints = function (e, t, r) {
        var i = e.x - t.x,
            s = e.y - t.y,
            o = t.x - r.x,
            u = t.y - r.y,
            a = {
                x: (e.x + t.x) / 2,
                y: (e.y + t.y) / 2,
            },
            f = {
                x: (t.x + r.x) / 2,
                y: (t.y + r.y) / 2,
            },
            l = Math.sqrt(i * i + s * s),
            c = Math.sqrt(o * o + u * u),
            h = a.x - f.x,
            p = a.y - f.y,
            d = c / (l + c),
            v = {
                x: f.x + h * d,
                y: f.y + p * d,
            },
            m = t.x - v.x,
            g = t.y - v.y;
        return {
            c1: new n(a.x + m, a.y + g),
            c2: new n(f.x + m, f.y + g),
        };
    };
    t.prototype._addCurve = function (e) {
        var t = e.startPoint,
            n = e.endPoint,
            r,
            i;
        r = n.velocityFrom(t);
        r = this.velocityFilterWeight * r + (1 - this.velocityFilterWeight) * this._lastVelocity;
        i = this._strokeWidth(r);
        this._drawCurve(e, this._lastWidth, i);
        this._lastVelocity = r;
        this._lastWidth = i;
    };
    t.prototype._drawPoint = function (e, t, n) {
        var r = this._ctx;
        r.moveTo(e, t);
        r.arc(e, t, n, 0, 2 * Math.PI, false);
        this._isEmpty = false;
    };
    t.prototype._drawCurve = function (e, t, n) {
        var r = this._ctx,
            i = n - t,
            s,
            o,
            u,
            a,
            f,
            l,
            c,
            h,
            p,
            d,
            v;
        s = Math.floor(e.length());
        r.beginPath();
        for (u = 0; u < s; u++) {
            a = u / s;
            f = a * a;
            l = f * a;
            c = 1 - a;
            h = c * c;
            p = h * c;
            d = p * e.startPoint.x;
            d += 3 * h * a * e.control1.x;
            d += 3 * c * f * e.control2.x;
            d += l * e.endPoint.x;
            v = p * e.startPoint.y;
            v += 3 * h * a * e.control1.y;
            v += 3 * c * f * e.control2.y;
            v += l * e.endPoint.y;
            o = t + l * i;
            this._drawPoint(d, v, o);
        }
        r.closePath();
        r.fill();
    };
    t.prototype._strokeWidth = function (e) {
        return Math.max(this.maxWidth / (e + 1), this.minWidth);
    };
    var n = function (e, t, n) {
        this.x = e;
        this.y = t;
        this.time = n || new Date().getTime();
    };
    n.prototype.velocityFrom = function (e) {
        return this.time !== e.time ? this.distanceTo(e) / (this.time - e.time) : 1;
    };
    n.prototype.distanceTo = function (e) {
        return Math.sqrt(Math.pow(this.x - e.x, 2) + Math.pow(this.y - e.y, 2));
    };
    var r = function (e, t, n, r) {
        this.startPoint = e;
        this.control1 = t;
        this.control2 = n;
        this.endPoint = r;
    };
    r.prototype.length = function () {
        var e = 10,
            t = 0,
            n,
            r,
            i,
            s,
            o,
            u,
            a,
            f;
        for (n = 0; n <= e; n++) {
            r = n / e;
            i = this._point(r, this.startPoint.x, this.control1.x, this.control2.x, this.endPoint.x);
            s = this._point(r, this.startPoint.y, this.control1.y, this.control2.y, this.endPoint.y);
            if (n > 0) {
                a = i - o;
                f = s - u;
                t += Math.sqrt(a * a + f * f);
            }
            o = i;
            u = s;
        }
        return t;
    };
    r.prototype._point = function (e, t, n, r, i) {
        return t * (1 - e) * (1 - e) * (1 - e) + 3 * n * (1 - e) * (1 - e) * e + 3 * r * (1 - e) * e * e + i * e * e * e;
    };
    return t;
})(document);
