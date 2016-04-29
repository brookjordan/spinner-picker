import people from '../data/people.js';

const nameCards = [];
const desiredNameCount = getDesiredCount();
const spinSpeed = 10;
const friction  = 0.03;

const nameCount       = Math.min(desiredNameCount, Math.round(people.length / 2));
const spinnerMaxSpeed = Math.floor(people.length/2) * 100;
const spinnerElt      = document.createElement('div');
const cursorSpeeds    = [];
const body = document.body;
let spinnerRequest;
let spinnerSpeed      = 0;
let spinnerStartSpeed = 0;
let frict             = friction;
let prevClientY;
let clientY;
let lastY;
let spinnerPos        = 0;
let spinnerStartPos   = 0;
let frame;

body.appendChild(spinnerElt);
buildNames();
checkCursorSpeed();

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
  
  clientY      = getY(e);
  spinnerPos  += px2spd(clientY - lastY);
  lastY        = clientY;
  shiftNames();
}

function mouseSpeed(e) {
  e.preventDefault();

  clientY = getY(e);
}

function startSpinnerSpinning(e) {
  e.preventDefault();

  frame = 1;
  spinnerStartPos   = spinnerPos;
  spinnerStartSpeed = spinnerSpeed = px2spd(averageValue(...cursorSpeeds));

  const landingSpot = willLandAt({
    initialPosition: spinnerStartPos,
    initialVelocity: spinnerStartSpeed,
    friction:        friction,
  });
  const shouldLandAt = spinnerSpeed > 0 ?
    Math.ceil(landingSpot) : Math.floor(landingSpot);
  frict = frictionRequiredToLandAt({
    initialPosition: spinnerStartPos,
    initialVelocity: spinnerStartSpeed,
    finalLanding:    shouldLandAt,
  });

  disableTrackMouse(e);
  startSpinning();
}



function keepSpinning() {
  if (spinnerSpeed) {
    simulateSpin();
    spinnerRequest = requestAnimationFrame(keepSpinning);
  }
}

function startSpinning() {
  cancelAnimationFrame(spinnerRequest);
  keepSpinning();
}

function checkCursorSpeed() {
  addMousePositionToStack();
  requestAnimationFrame(checkCursorSpeed);
}

function shiftNames() {
  killNames();
  buildNames();
  renderNames();
}

function simulateSpin() {
  if (nameCards.length) {
    spinnerPos = willBeAt(frame, {
      initialPosition: spinnerStartPos,
      initialVelocity: spinnerStartSpeed,
      friction:        frict,
    });
    shiftNames();
    frame ++;
  }
}

function addName(_under) {
  const under = _under || false;
  
  const nameElt      = document.createElement('div');
  const nameTextElt  = document.createElement('p');
  const height       = 100 / nameCount;
  const text         = people.splice(Math.floor(Math.random()*people.length), 1)[0];
  const index        = nameCards.length === 0 ?
          0 :
            under ?
          maxIndex() + 1 : minIndex() - 1;

  nameElt.className              = 'name';
  nameElt.style.height           = `${height}vh`;
  nameElt.style.lineHeight       = `${height}vh`;
  nameElt.style.backgroundImage  = text ? `url(${text.image})` || 'none' : 'none';

  nameTextElt.innerHTML       = text ? text.name || '' : '';
  nameTextElt.className       = 'name__text';
  nameTextElt.style.fontSize  = `${Math.min(6, 40 / nameCount)}vmin`;

  nameElt.appendChild(nameTextElt);
  spinnerElt.appendChild(nameElt);

  nameCards.push({
    text,
    index,
    elt:   nameElt,
  });
}

function maxPos() {
  if (nameCards.length) {
    return Math.max(...nameCards.map(nameCard => cardPosition(nameCard)));
  }
}

function maxIndex() {
  if (nameCards.length) {
    return Math.max(...nameCards.map(nameCard => nameCard.index));
  }
}

function minPos() {
  if (nameCards.length) {
    return Math.min(...nameCards.map(nameCard => cardPosition(nameCard)));
  }
}

function minIndex() {
  if (nameCards.length) {
    return Math.min(...nameCards.map(nameCard => nameCard.index));
  }
}

function buildNames() {
  if (nameCards.length === 0) {
    addName(true);
  }
  while(minPos() > 0) {
    addName(false);
  }

  while(maxPos() < (nameCount - 1) / nameCount) {
    addName(true);
  }
  renderNames();
}

function killName(nameCard) {
  const nameCardIndex = nameCards.indexOf(nameCard);
  nameCards.splice(nameCardIndex, 1)[0];

  if (nameCard.elt.parentNode) {
    nameCard.elt.parentNode.removeChild(nameCard.elt);
  }
  
  if (typeof nameCard.text !== 'undefined') {
    people.push(nameCard.text);
  }
}

function killNames() {
  if(minPos() < -1 / nameCount || maxPos() > (1 / nameCount) * (nameCount - 1)) {
    nameCards.forEach((nameCard, index) => {
      const cardPos = cardPosition(nameCard);
      if(cardPos <= -1 / nameCount) {
        killName(nameCard);
      }
      if(cardPos >= 1) {
        killName(nameCard);
      }
    });
  }
}

function cardPosition(nameCard) {
  return (spinnerPos + nameCard.index) / nameCount;
}

function renderName(nameCard) {
  nameCard.elt.style.transform = `translateY(${(spinnerPos + nameCard.index) * 100}%)`;
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
  return ((px / innerHeight) * nameCount);
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

function willBeAt(frame, { initialPosition = 0, initialVelocity = 10, friction = 0.01 } = {}) {
  return initialPosition + initialVelocity * ( (1 - Math.pow(1 - friction, frame)) / friction );
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
