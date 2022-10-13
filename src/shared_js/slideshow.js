const BlissfulJs = require('blissfuljs'); // module adds Bliss to window object for us, use Bliss. and Bliss.$. for $ and $$
const { debounce, uniqueId, range, clamp } = require('lodash');
const debug = require('debug')('thisco:slideshow.js');

module.exports = function(){

    const bruteScroll = (el)=>{
        // had written a fudge to deal with vert jump, but this is better
        // const [x,y] = [window.scrollX,window.scrollY];
        el.scrollIntoView({inline:"nearest",block:"nearest"});
        // el.scrollIntoView(false);
        // window.scrollTo(x,y);
        return;
    };

    Bliss.$('.Skin .thisco-slideshow, .thisco-survey .thisco-slideshow').forEach(el=>{
        const id = `thisco_slideshow_${uniqueId()}`;
        const itemNo = el.children.length;
        const handleFlip = (evt)=>{
            const container = Bliss(`.thisco-slideshow#${id}`);
            if (!container) return;
            evt.stopPropagation();
            let currentPage = parseInt(container.dataset.page)-1;
            const dirRight = evt.currentTarget.classList.contains('thisco-slideshow-right');
            currentPage = dirRight ? clamp(currentPage+1,0,itemNo-1) : clamp(currentPage-1,0,itemNo-1);
            // set new page
            container._.set({'data-page' : currentPage+1});
            const page = Bliss(`.thisco-slideshow-item-wrapper[data-page-no="${currentPage+1}"]`);
            bruteScroll(page); // native scrollIntoView
            // set buttons
            if (currentPage == 0) {
                Bliss("button.thisco-slideshow-left").classList.add("hidden");
            } else {
                Bliss("button.thisco-slideshow-left").classList.remove("hidden");
            }
            if ((currentPage+1) == itemNo) {
                Bliss("button.thisco-slideshow-right").classList.add("hidden");
            } else {
                Bliss("button.thisco-slideshow-right").classList.remove("hidden");
            }
        };
        // create slideshow box, and extract from p element
        const slideshow = Bliss.create("div",{
            className : 'thisco-slideshow',
            id,
            contents : [{
                tag:'button',
                className : 'thisco-slideshow-button thisco-slideshow-left hidden',
                contents : "Left",
                events : {click:handleFlip}
            },{
                tag :'div',
                className : 'thisco-slideshow-content'
            },{
                tag:'button',
                className : 'thisco-slideshow-button thisco-slideshow-right',
                contents : "Right",
                events : {click:handleFlip}

            },{
                tag :'div',
                className : 'thisco-slideshow-follow-bar'
            }],
            'data-page' : 1
        });
        el.classList.remove('thisco-slideshow');
        el.insertAdjacentElement('afterend',slideshow);
        Bliss.$(el.children).forEach((child,i)=>Bliss('.thisco-slideshow-content',slideshow).appendChild(Bliss.create("div",{
            className : 'thisco-slideshow-item-wrapper',
            contents : child,
            'data-page-no' : i+1
        })));

        // add following scroll bar
        const follow = Bliss(".thisco-slideshow-follow-bar",slideshow);
        const target = Bliss(".thisco-slideshow-content",slideshow);

        if (target instanceof HTMLElement) {
          const scrollItems = target.children;
          debug({scrollItems});
          Bliss.$(scrollItems).forEach((el) => {
            const follower = Bliss.create("div", { className: "follower" });
            follow.appendChild(follower);
            const callback = (entries) => {
              window.requestAnimationFrame(() => {
                Bliss(follower)._.style({
                  width: `${50 * entries[0].intersectionRatio + 0}px`
                });
              });
            };
            follow._.style({width:`${(17*scrollItems.length)+48}px`});
            // const threshold = Array.from(Array(1000)).map((v,i)=>(i+1)/1000);
            const threshold = range(1000).map(v=>v/1000);
            let options = {
              root: target,
              rootMargin: "0px",
              threshold
            };
            let observer = new IntersectionObserver(callback, options);
            observer.observe(el);
          });
        }

        const pageOne = Bliss("[data-page-no='1']");
        if (pageOne) bruteScroll(pageOne);

    });
}


