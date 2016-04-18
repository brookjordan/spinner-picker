import people from '../data/people.js';
const nameCards = [];
const desiredNameCount = getDesiredCount();
const spinSpeed = 10;
const friction  = 0.01;

const nameCount       = Math.min(desiredNameCount, Math.round(people.length / 2));
const spinnerMaxSpeed = Math.floor(people.length/2) * 100;
const spinnerElt      = document.createElement('div');
const accuracy        = 10;
const cursorSpeeds    = [];
const body = document.body;
let spinnerSpeed      = 0;
let frict             = friction;
let prevClientY;
let clientY;
let lastY;

let spanFor;

body.appendChild(spinnerElt);
buildNames();
keepSpinning();

body.addEventListener('mousedown',     enableTrackMouse, false);
body.addEventListener('touchstart',    enableTrackMouse, false);
body.addEventListener('mouseup',       startSpinnerSpinning, false);
body.addEventListener('touchend',      startSpinnerSpinning, false);
body.addEventListener('touchcancel',   startSpinnerSpinning, false);
body.addEventListener('mousemove',     mouseSpeed, false);
body.addEventListener('touchmove',     mouseSpeed, false);

function enableTrackMouse(e) {
  e.preventDefault();
  resetCursorSpeed(e);
  
  body.classList && body.classList.add('grabbing');
  spinnerSpeed = 0;
  lastY = getY(e);
  body.addEventListener('mousemove', trackMouse, false);
  body.addEventListener('touchmove', trackMouse, false);
}

function disableTrackMouse(e) {
  e.preventDefault();
  
  body.classList && document.body.classList.remove('grabbing');
  lastY = undefined;
  body.removeEventListener('mousemove', trackMouse, false);
  body.removeEventListener('touchmove', trackMouse, false);
}

function trackMouse(e) {
  e.preventDefault();
  
  clientY = getY(e);
  shiftNames(px2spd(clientY - lastY));
  lastY = clientY;
}

function mouseSpeed(e) {
  e.preventDefault();
  clientY = getY(e);
}

function startSpinnerSpinning(e) {
  spanFor = minPos();
  spinnerSpeed = Math.floor(px2spd(averageValue(...cursorSpeeds)) * accuracy);
  const a = willLandAt({
    initialPosition: minPos(),
    initialVelocity: spinnerSpeed,
    friction:        friction,
  });
  const shouldLandAt = spinnerSpeed > 0 ?
    Math.ceil(a/(100*accuracy)) * (100*accuracy) : Math.floor(a/(100*accuracy)) * (100*accuracy);
  frict = frictionRequiredToLandAt({
    initialPosition: minPos(),
    initialVelocity: spinnerSpeed,
    finalLanding:    shouldLandAt,
  });
  e.preventDefault();
  disableTrackMouse(e);
}



function keepSpinning() {
  addMousePositionToStack();

  if (spinnerSpeed) {
    simulateSpin();
  }
  requestAnimationFrame(keepSpinning);
}

function shiftName(nameCard, by) {
  nameCard.pos += by;
  return nameCard.pos;
}

function shiftNames(by) {
  nameCards.forEach(nameCard => {
    shiftName(nameCard, by);
  });
  killNames();
  buildNames();
  renderNames();
}

function simulateSpin(by) {
  spinnerSpeed *= (1 - frict);
  
  //Click into place
  if (Math.abs(spinnerSpeed) <= 1.5) {
    let pos = Math.abs(minPos()) % 100;
    if (pos < 1) {
      spinnerSpeed = 0;
      shiftNames(pos);
      return;
    } else if (pos > 99) {
      spinnerSpeed = 0;
      shiftNames(-(100 - pos));
      return;
    }
  }
  
  //Don't let it stop it it hasn't clicked!
  if (Math.abs(spinnerSpeed) < 0.5) {
    spinnerSpeed *= 2;
  }

  if (nameCards.length) {
    shiftNames(spinnerSpeed / accuracy);
  }
}

function addName(_under) {
  const under = _under || false;
  
  const nameElt = document.createElement('div');
  const nameTextElt = document.createElement('p');
  const height = 100 / nameCount;
  const text = people.splice(Math.floor(Math.random()*people.length), 1)[0];
  const position = nameCards.length === 0 ?
          0 :
            under ?
          maxPos() + 100 : minPos() - 100;

  nameElt.className = 'name';
  nameElt.style.height = `${height}vh`;
  nameElt.style.lineHeight = `${height}vh`;
  nameElt.style.backgroundImage = text ? `url(${text.image})` || 'none' : 'none';

  nameTextElt.innerHTML = text ? text.name || '' : '';
  nameTextElt.className = 'name__text';
  nameTextElt.style.fontSize = `${Math.min(6, 40 / nameCount)}vmin`;

  nameElt.appendChild(nameTextElt);
  spinnerElt.appendChild(nameElt);

  nameCards.push({
    elt: nameElt,
    pos: position,
    txt: text,
  });
}

function maxPos() {
  if (nameCards.length) {
    return Math.max(...nameCards.map(nameCard => nameCard.pos));
  }
}

function minPos() {
  if (nameCards.length) {
    return Math.min(...nameCards.map(nameCard => nameCard.pos));
  }
}

function buildNames() {
  if (nameCards.length === 0) {
    addName(true);
  }
  while(minPos() > 0) {
    addName(false);
  }
  while(maxPos() < (nameCount - 1) * 100) {
    addName(true);
  }
  renderNames();
}

function killName(nameCardIndex) {
  const nameCard = nameCards.splice(nameCardIndex, 1)[0];
  nameCard.elt.parentNode.removeChild(nameCard.elt);
  if (typeof nameCard.txt !== 'undefined') {
    people.push(nameCard.txt);
  }
}

function killNames() {
  if(minPos() < -100 || maxPos() > nameCount * 100) {
    nameCards.forEach((nameCard, index) => {
      if(nameCard.pos < -100 || nameCard.pos > nameCount * 100) {
        if (nameCard.elt.parentNode) {
          killName(index);
        }
      }
    });
  }
}

function renderName(nameCard) {
  nameCard.elt.style.transform = `translateY(${nameCard.pos}%)`;
}

function renderNames() {
  nameCards.forEach(nameCard => {
    renderName(nameCard);
  });
}

function getDesiredCount(_message) {
  return 4;
  const message = _message || "How many people are going?";
  const desiredCount = parseInt(prompt(message, 4));
  if (isNaN(desiredCount)) {
    return getDesiredCount("That's not a number. How many people are going?");
  }
  return desiredCount;
}

function averageValue(...args) {
  if (args.length < 1) { return 0 }
  if (args.length < 2) { return args[0] }
  return args.reduce((a, b) => (a + b) / 2);
}

function px2spd(px) {
  return (px / innerHeight) * 100 * nameCount;
}

function getY(e) {
  let y;
  if (e.touches) {
    y = e.touches[0].pageY;
  } else {
    y = e.clientY;
  }
  return y;
}

function willLandAt(options) {
  var o = options || {};
  var initialPosition = setWithFallback(o.initialPosition, 0);
  var initialVelocity = setWithFallback(o.initialVelocity, 10);
  var friction        = setWithFallback(o.friction,        0.01);
  
  return initialPosition + initialVelocity / friction;
}

function frictionRequiredToLandAt(options) {
  var o = options || {};
  var initialPosition = setWithFallback(o.initialPosition, 0);
  var initialVelocity = setWithFallback(o.initialVelocity, 10);
  var finalLanding    = setWithFallback(o.finalLanding,    1000);

  return initialVelocity / (finalLanding - initialPosition);
}

function setWithFallback(value, fallback) {
  var options = options || {};
  var num = isNaN(value) ?
    fallback : value;

  return num;
}

function addMousePositionToStack() {
  if (typeof clientY === 'number') {
    typeof prevClientY === 'number' || (prevClientY = clientY);
    cursorSpeeds.push(clientY - prevClientY);
    if (cursorSpeeds.length > 5) {
      cursorSpeeds.unshift();
    }
    prevClientY = clientY;
  }
}

function resetCursorSpeed(e) {
  while (cursorSpeeds.length) {
    cursorSpeeds.pop();
  }
  clientY = prevClientY = getY(e);
}
