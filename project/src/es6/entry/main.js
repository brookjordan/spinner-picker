import people from '../data/people.js';
import spinner from '../method/spinner.js';

const body       = document.body;
const spinnerElt = document.createElement('div');

body.appendChild(spinnerElt);

spinner(spinnerElt, people, {
  desiredNameCount: getDesiredCount(),
  friction: 0.01,
});

function getDesiredCount(_message) {
  return 4;
  const message = _message || "How many people are going?";
  const desiredCount = parseInt(prompt(message, 4));
  if (isNaN(desiredCount)) {
    return getDesiredCount("That's not a number. How many people are going?");
  }
  return desiredCount;
}
