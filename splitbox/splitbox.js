(function (root) {

    var splitters = document.getElementsByClassName("sbSplitter");

    var setDrag = function(item) {
        var element = item;
        var isDragging = false;
        var lastPos;
        var dim = {
            column: "height",
            row: "width"
        };
        var hasName = function (s, name) {
            return (s.search(new RegExp("\\b" + name + "\\b", "g")) != -1);
        };

        var hasClass = function (e, className) {
            if (e)
                return hasName(e.className, className);
        };
        
        var dir = hasClass(element, "sbHorizontal") ? "column" : "row";

        var getPos = function (evt) {
            return (dir == "column") ? evt.clientY : evt.clientX;
        };

        var drag = function (evt) {
            var prevPanel = element.previousElementSibling;
            var nextPanel = element.nextElementSibling;
            var sizeDiff = getPos(evt) - lastPos;
            
            var oldSizePrev = parseInt(getComputedStyle(prevPanel)[dim[dir]], 10);
            var oldSizeNext = parseInt(getComputedStyle(nextPanel)[dim[dir]], 10);
    
            var newSizePrev = oldSizePrev + sizeDiff;
            var newSizeNext = oldSizeNext - sizeDiff;
    
            if ((newSizePrev < 20) || (newSizeNext < 20))
                return;
    
            if (!isDragging) {
                isDragging = true;
    
                element.parentNode && element.parentNode.children && forEach
                    (
                        element.parentNode.children,
                        function (elem) {
                            if (!hasClass(elem, "sbSplitter"))
                                elem.sbStoredSize = parseInt(getComputedStyle(elem)[dim[dir]], 10);
                        }
                    );
    
                element.parentNode && element.parentNode.children && forEach
                    (
                        element.parentNode.children,
                        function (elem) {
                            if (!hasClass(elem, "sbSplitter"))
                                setFlex(elem, 0, 0, elem.sbStoredSize);
                        }
                    );
            }
    
            setFlex(prevPanel, 0, 0, newSizePrev);
            setFlex(nextPanel, 0, 0, newSizeNext);
    
            lastPos = getPos(evt);
        };

        var forEach = function (array, loopFun, breakable) {
            if (!array)
                return false;
    
            var i = 0, element;
            if (breakable) {
                while (element = array[i])
                    if (loopFun(element, i++))
                        return true;
            }
            else
                while (element = array[i])
                    loopFun(element, i++);
    
            return false;
        };

        var setFlex = function (elem, grow, shrink, basis) {
            if (!elem)
                return;

            elem.style.flex = "" + grow + " " + shrink + " " + basis + "px";
        };

        var enableGrow = function (rootElem) {
            if ((hasClass(rootElem, "sbTrack"))) {
                var dir = getComputedStyle(rootElem)["flex-direction"];

                var sizes = [];
                forEach
                    (
                        rootElem.children,
                        function (elem) {
                            if (!hasClass(elem, "sbSplitter"))
                                sizes.push(parseInt(getComputedStyle(elem)[dim[dir]], 10));
                        }
                    );

                var sum = sizes.reduce(function (a, b) { return a + b; });
                forEach
                    (
                        rootElem.children,
                        function (elem, i) {
                            if (!hasClass(elem, "sbSplitter")) {
                                setFlex(elem, sizes[i / 2] / sum, sizes[i / 2] / sum, 0);
                                enableGrow(elem);
                            }
                        }
                    );
            }
        };
    
        var endDrag = function () {
            isDragging = false;
    
            root.removeEventListener('mousemove', drag);
            root.removeEventListener('mouseup', endDrag);
    
            element.parentNode && enableGrow(element.parentNode);
        };

        element.addEventListener
        (
            'mousedown',
            function (evt) {
                evt.preventDefault();
                lastPos = getPos(evt);
                root.addEventListener('mousemove', drag);
                root.addEventListener('mouseup', endDrag);
            }
        );
    };

    for (let item of splitters) {
        setDrag(item);
    }
    
})(this);
