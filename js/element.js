import { vwTOpx, pxTOvw, posTotime } from '/js/converter.js';
import { results } from '/js/demo.js';

function dragElement(elmnt, key) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    let xlim = [0, $('#waveform').width()];
    elmnt.children[0].onmousedown = dragMouseDown;

    function dragMouseDown(e) {
        e = e || window.event;
        e.preventDefault();
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        document.onmousemove = ElementDrag.horizontal;
    }

    function closeDragElement() {
        document.onmouseup = null;
        document.onmousemove = null;
    }

    const ElementDrag = {
        'both': function (e) {
            e = e || window.event;
            e.preventDefault();
            pos1 = pos3 - e.clientX;
            pos2 = pos4 - e.clientY;
            pos3 = e.clientX;
            pos4 = e.clientY;
            elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
            elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
        },
        'horizontal': function (e) {
            e = e || window.event;
            e.preventDefault();
            pos1 = pos3 - e.clientX;
            pos3 = e.clientX;

            let elmnt_width = vwTOpx(parseFloat(elmnt.style.width)),
                pos_left = elmnt.offsetLeft - pos1,
                pos_right = pos_left + elmnt_width;
            if (pos_left < xlim[0]) { pos_left = 0 };
            if (pos_right > xlim[1]) {
                pos_left = xlim[1] - elmnt_width;
            }
            elmnt.style.left = pxTOvw(pos_left) + "vw";
            updateElementPosition(elmnt, key);
        }
    }
}

function resizeElement(elmnt, key) {
    let startX, startY, startWidth, startHeight;
    let right = document.createElement("div");
    right.className = "resizer-right";
    elmnt.appendChild(right);
    right.onmousedown = initDrag;

    function initDrag(e) {
        startX = e.clientX;
        startY = e.clientY;
        startWidth = parseFloat(elmnt.style.width);
        startHeight = parseInt(elmnt.style.height, 10);
        document.documentElement.onmouseup = stopDrag;
        document.documentElement.onmousemove = doDrag.horizontal;
    }

    const doDrag = {
        'both': function (e) {
            elmnt.style.width = startWidth + e.clientX - startX + "px";
            elmnt.style.height = startHeight + e.clientY - startY + "px";
        },
        'horizontal': function (e) {
            elmnt.style.width = startWidth + pxTOvw(e.clientX - startX)+ "vw";
            updateElementPosition(elmnt, key);
        }
    }

    function stopDrag() {
        document.documentElement.onmouseup = null;
        document.documentElement.onmousemove = null;
    }
}

function updateElementPosition(elmnt, key) {
    let idx = elmnt.id.split("-")[1];
    let onset = posTotime(elmnt.style.left, results[key].duration),
        width = posTotime(elmnt.style.width, results[key].duration);
    results[key].timestamp[idx].onset = onset;
    results[key].timestamp[idx].offset = onset + width;
}

export {
    dragElement,
    resizeElement,
};