// CircleSegments
//
// 0.0.1
// from template of AnimCanvas 0.0.1
// Nov 2022
// Glyn Cannon

const Blissfuljs = require('blissfuljs');
const _ = require('lodash');
const Color = require('color');

window.inter_functions = {
    linear: (t, b, c, d) => {
        return (c - b) * t / d + b;
    },
    easeInQuad: (t, b, c, d) => {
        t /= d;
        return (c - b) * t * t + b;
    },
    easeOutQuad: (t, b, c, d) => {
        t /= d;
        return -(c - b) * t * (t - 2) + b;
    },
    easeInOutQuad: (t, b, c, d) => {
        t /= d / 2;
        if (t < 1) return (c - b) / 2 * t * t + b;
        t--;
        return -(c - b) / 2 * (t * (t - 2) - 1) + b;
    }
};

const DEFAULT_EASING = "easeInOutQuad"; // easing is global to your class
const GLOBAL_ANIMATION_SPEED = 10; // 0.3s ish

window.interpolate = ({ a, b, time, duration, easing = DEFAULT_EASING }) => {
    const getVal = inter_functions[easing];
    if (Array.isArray(a)) {
        return a.map((value, i) => {
            return getVal(time, a[i], b[i], duration);
        });
    } else if (isFinite(a)) {
        return getVal(time, a, b, duration);
    } else {
        return a;
    }
};

window.getInterpColor = ({a,b,time,duration}) => {
    const start = Color(a);
    return start.mix(Color(b),(time/duration));
};

// segment drawing

const inRads = (deg)=>deg*Math.PI / 180;

function circPoint(radius, deg) {
  // console.debug({radius,deg});
    return {
      x: radius * Math.cos(inRads(deg)),
      y: radius * Math.sin(inRads(deg))
    };
}

const explodedSeg = (ctx,{
  x = 0,
  y = 0,
  radius = 300,
  intRadius = 150,
  startDeg = 0,
  endDeg = 45,
  rounded = true,
  fillStyle = "gray",
  strokeStyle = "transparent",
  explode = 10,
  width = 0,
  corner = 6,
  cRadius = 18
})=>{
  if (!(ctx instanceof CanvasRenderingContext2D)) {
    throw "explodedSeg called without a canvas context";
  }
  const startRad = startDeg * Math.PI / 180;
  const endRad = endDeg * Math.PI / 180;
  const midAng = ((endDeg-startDeg) / 2) + startDeg;
  const offset = circPoint(explode,midAng);
  
  x += offset.x;
  y += offset.y;
  const v = (a)=>{return Object.values(a).map((v,i)=>v+[x,y][i])};
  
  const path = new Path2D();
  if (rounded) {
  path.arc(x,y,radius,inRads(endDeg - corner),inRads(startDeg + corner),true);
  path.arcTo(
    ...v(circPoint(radius,startDeg)),
    ...v(circPoint(radius-cRadius,startDeg)),
    cRadius
  );
  path.arcTo(
    ...v(circPoint(intRadius,startDeg)),
    ...v(circPoint(intRadius,startDeg+corner)),
    cRadius
  );
  path.arc(x,y,intRadius,inRads(startDeg + corner),inRads(endDeg - corner),false);
  path.arcTo(
    ...v(circPoint(intRadius,endDeg)),
    ...v(circPoint(intRadius+cRadius,endDeg)),
    cRadius
  );
  path.arcTo(
    ...v(circPoint(radius,endDeg)),
    ...v(circPoint(radius,endDeg-corner)),
    cRadius
  );
  }
  else {
    path.arc(x,y,radius,inRads(endDeg),inRads(startDeg),true);
    path.arc(x,y,intRadius,inRads(startDeg),inRads(endDeg),false);
  }
    
  path.closePath();
  
    ctx.lineWidth = width;
    ctx.fillStyle = fillStyle;
    ctx.strokeStyle = strokeStyle;
    ctx.fill(path);
    ctx.stroke(path);

  
};

const DEFAULTS = {
    startRadius : 300,
    startIntRadius : 200,
    startX : false,
    startY : false,
    easing : DEFAULT_EASING,
    canvasBackground : "white", // colour string if wanting to use a fill colour (for motion smoothing etc)
    canvasRes : 1000,
    canvasMBlur : true, // if true will use the canvasBackground colour set
    segmentNo : 5,
    rounded : true,
    startExplode : 5,
    activeColors : ["crimson"],
    recessColor : "lightgray",
    showRecesses : true,
    rotationStart : 0,
    segmentPortions : null, // if array of segment %s not provided, equal partition between 360 degrees
};
const CANVAS_RATIO = 1 / 1; // ratio for how much height canvas grabs (default is square)

class SceneItem {
    constructor(props = null) {
        if (_.isNull(props)) throw ("SceneItem requires properties, at least type and name");
        _.assign(this, {
            duration: 1,
            time: 1,
            type: "",
            content: ""
        }, props);
        this.start = {};
        this.end = {};
        if (!this.name) throw ("SceneItem needs a name");
        this.id = _.uniqueId();
    }

    get isAnimating() {
        return this.time < this.duration;
    }

    setProp(prop, payload, duration = null) {
        const self = this;
        if (!_.isString(prop) && !_.isObject(prop)) throw ("setProp needs a prop!");
        if (_.isObject(prop)) {
            _.toPairs(prop).forEach(pair => {
                self.setProp(pair[0], pair[1]);
            });
            return;
        }

        // optionally can set duration, to reset current animation, will set time to 0
        // otherwise will animate to end within current cycle 

        self.start[prop] = _.isUndefined(self.end[prop]) ? payload : self.end[prop];
        self.end[prop] = payload;
        if (!_.isNull(duration) && isFinite(duration)) _.assign(self, {
            duration,
            time: 0
        });
    }
}

// replace CircleSegments with whatever your thing is

class CircleSegments {

    constructor(options = {}){

        // add your stylesheet business here if you need it

        this.options = _.assign({}, DEFAULTS, options);
        const {
            target
        } = this.options; // target for the canvas is always required 

        // check target is valid
        this.targetEl = document.querySelector(target);
        if (!(this.targetEl instanceof HTMLElement)) throw ("CircleSegments requires valid target element");

        this.id = _.uniqueId();

        // set up container and canvas element (change to <figure> as necessary)

        this.container = Bliss.create('div',{
            className : 'ac-container',
            id: `cc-container-${this.id}`,
            style: {
                display: 'block',
                margin: "0",
                width: '100%' // fill containing element
            },
            contents : [                {
                tag: "canvas",
                id: `cc-canvas-${this.id}`,
                style: {
                    width: '100%',
                    'aspect-ratio': `${CANVAS_RATIO}`
                },
                width : this.canvWidth,
                height : this.canvHeight
            }]
        });

        this.targetEl.appendChild(this.container);

        // // set up canvas items
        this.scene = [];

        const { segmentNo, canvasBackground, segmentPortions } = this.options; 

        // set up segments and add them to Scene    
        if (_.isArray(segmentPortions)) {
            this.segmentPortions = segmentPortions;
            this.segmentNo = segmentPortions.length;
        }
        else {
            this.segmentPortions = _.range(segmentNo).map((v,i)=>1/segmentNo);
        }
        const addSegment = (i)=>{
            const segItem = new SceneItem({
                name : `segment${i}`,
                type : 'segment',
                index : i,
                active : false
            });
            segItem.setProp("startAngle",this.getSegmentPortions(i)[0]);
            segItem.setProp("endAngle",this.getSegmentPortions(i)[1]);
            segItem.setProp("explode",this.options.startExplode);
            segItem.setProp("radius",this.options.startRadius);
            segItem.setProp("intRadius",this.options.startIntRadius);
            // console.debug(JSON.stringify(segItem))
            this.scene.push(segItem);
        };
        _.times(this.segmentPortions.length,addSegment);

        // misc caching etc

        this.staggerings = [];

        // set a motion smoothing color string

        if (_.isString(canvasBackground)) {
            const mBlurCol = Color(canvasBackground);
            mBlurCol.alpha(0.5);
            this.mBlurCol = mBlurCol.string();
        }
        else {
            this.mBlurCol = null;
        }

    }

    getSegmentPortions(i){
        const prevPortion =_.sum(this.segmentPortions.slice(0,i)) * 360;
        const thisAngleWidth = this.segmentPortions[i] * 360;
        return [prevPortion, prevPortion + thisAngleWidth];
    }

    init(){
        // sep into init to stop testing breaking (hates canvases)
        // set canvas context and any global values
        this.canvas = Bliss("canvas",this.container);
        this.ctx = this.canvas.getContext("2d");
        this.updateAllSegments();
        // run update once
        // this.update();
    }

    loopStart() {
        if (this.loop_running !== true) {this.loop(); this.loop_running = true;} else return;
    }

    loop() {
        // console.count("loop");
        const self = this;
        // draw!
        this.wipeCanvas();
        // cycle scene
        this.scene.forEach(item=>{
            if (item.time < item.duration) { item.time = item.time + 1; }
            switch (item.type) {
                case "segment":
                    self.drawSegment(item);
                break;
                default:
                    _.noop();
                break;
            }
        });
        // check anything in scene still animating?
        if (!self.sceneIsStatic) {
            window.setTimeout(()=>{
                window.requestAnimationFrame(()=>{
                    self.loop.call(self);
                });
            },1000/60);
        }
        else {
            self.loop_running = false;
        }
    }

    drawSegment(item){
        const {ctx, canvHeight, canvWidth, x, y, options} = this;
        const {time,duration,start,end} = item;
        const startDeg = interpolate({a:start.startAngle,b:end.startAngle,time,duration}) + options.rotationStart;
        const endDeg = interpolate({a:end.endAngle,b:end.endAngle,time,duration}) + options.rotationStart;
        const explode = interpolate({a:start.explode,b:end.explode,time,duration})
        const radius = interpolate({a:start.radius,b:end.radius,time,duration})
        const intRadius = interpolate({a:start.intRadius,b:end.intRadius,time,duration})
        const fillStyle = getInterpColor({a:start.fillStyle,b:end.fillStyle,time,duration});
        explodedSeg(ctx,{
            x,
            y,
            startDeg,
            endDeg,
            fillStyle,
            explode,
            radius,
            intRadius,
            rounded: options.rounded 
        })
    };

    getSegmentColor(item){
        const { options } = this;
        if (!item.active) {
            return "transparent";
        }
        else if (_.isString(options.activeColors)) {
            return options.activeColors;
        }
        else if (_.isString(options.activeColors[item.index])) {
            return options.activeColors[item.index];
        }
        else {
            return options.activeColors[0];
        }
    }

    get segments(){
        return this.scene.filter(i=>i.type=="segment");
    }

    wipeCanvas(){
        const { ctx, canvHeight, canvWidth, options, mBlurCol } = this;
        if (!(ctx instanceof CanvasRenderingContext2D)) return;
        if (options.canvasMBlur === true) {
            ctx.fillStyle = mBlurCol || `rgb(255 255 255 / 0.5)`;
            ctx.fillRect(0,0,canvWidth,canvHeight);
        }
        else {
            ctx.clearRect(0,0,canvWidth,canvHeight);
        }
    }

    update() {
        // update resets durations, y, colors etc based on abstracts if necessary
        // - loop draws the actual frame 
        const self = this;
        self.loopStart();
    }

    getSegment(index) {
        return _.find(this.segments,{index});
    }

    updateSegment(index) {
        const self = this;
        const { getSegmentColor } = this;
        const {startIntRadius,startRadius,recessColor} = this.options;
        const item = this.getSegment(index);
        if (!item.active) {
            item.setProp("fillStyle",recessColor,GLOBAL_ANIMATION_SPEED);
            item.setProp("intRadius",startIntRadius,GLOBAL_ANIMATION_SPEED);
            item.setProp("radius",startRadius,GLOBAL_ANIMATION_SPEED);
        }
        else {
            const fill = getSegmentColor.call(self,item);
            item.setProp("fillStyle",fill,GLOBAL_ANIMATION_SPEED);
            item.setProp("intRadius",startIntRadius*.9,GLOBAL_ANIMATION_SPEED);
            item.setProp("radius",startRadius*1.1,GLOBAL_ANIMATION_SPEED);                    
        }
        this.update(); // run the loop
        return;
    }

    updateAllSegments() {
        const { updateSegment } = this;
        this.segments.forEach(({index})=>{updateSegment.call(this,index);});
    }

    get currentProgress(){
        // returns highest index of active segments
        // NB starts at 1 (0 means none active)
        const { segments } = this;
        return _.max(segments.filter(seg=>seg.active).map((v,i)=>i))+1;
    }

    setProgress(n,speed = 0){
        // light segments up to a number
        // if speed > 1 will stagger
        const { segments, currentProgress, staggerings } = this;
        staggerings.forEach(st=>window.clearTimeout(st));
        const update = (index)=>this.updateSegment(index);
        const goForwards = (currentProgress || 0) <= n;
        if (speed == 0) {
            segments.forEach((seg)=>{
                seg.active = seg.index+1 <= n;
            });
            this.updateAllSegments();
        }
        else {
            let stagger = 0;
            (goForwards ? segments : segments.reverse()).forEach((seg)=>{
                const active = seg.index+1 <= n;
                const activeNow = seg.active;
                staggerings.push(setTimeout(()=>{
                    seg.active = active;
                    update(seg.index);
                },(activeNow == goForwards) ? 0 : stagger));
                stagger += (activeNow == goForwards) ? 0 : speed;
            });
        }

    }

    setAll(props){
        // quickly set properties on all segments
        const { segments } = this;
        segments.forEach(seg=>{
            seg.setProp(props,GLOBAL_ANIMATION_SPEED);
        });
    }

    // drawDot(item) {
    //     const {ctx} = this;
    //     const [x1,y1] = [item.start.x,item.start.y];
    //     const [x2,y2] = [item.end.x,item.end.y];
    //     const {time,duration} = item;
    //     let x,y;
    //     x = interpolate({a : x1, b: x2, time, duration});
    //     y = interpolate({a : y1, b: y2, time, duration});
    //     ctx.fillStyle = "blue";
    //     ctx.beginPath();
    //     ctx.arc(x,y,25,0,2*Math.PI);
    //     ctx.fill();
    //     // increment time
    //     if (item.time < duration) { item.time = time + 1; }
    // }

    get canvWidth() {
        return this.options.canvasRes * devicePixelRatio;
    }

    get canvHeight() {
        return this.canvWidth / CANVAS_RATIO;
    }

    get x() {
        return this.options.startX || this.canvWidth/2; 
    }

    get y() {
        return this.options.startY || this.canvHeight/2; 
    }

    get sceneIsStatic() {
        return this.scene.every(item=>item.time >= item.duration);
    }

    get standardRate() {
        // can add jitter here
        return 15 + _.random(0,10); // around half a second? too fast?  
    }

}
    
window.CircleSegments = CircleSegments;

module.exports = {
    CircleSegments,
    SceneItem
};